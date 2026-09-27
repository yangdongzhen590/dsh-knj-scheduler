/**
 * Scheduler-owned attachment storage.
 *
 * Why the scheduler needs its own store instead of reusing the workflow
 * plugin's upload staging: the workflow plugin's staging area is a
 * **disposable** hand-off (it discards the staged file the moment the run
 * materializes it, and prunes anything older than 24h). A scheduled task
 * fires repeatedly, so a file that survives exactly one fire is useless — the
 * second fire would abort with "附件暂存已失效".
 *
 * Layout: `<dataDir>/attachments/<id>/<name>` lives as long as the task does;
 * nothing here expires on a timer, and a task edit that replaces its
 * attachment set deletes the entries it no longer references.
 *
 * Nothing in this module depends on dsh-knj-workflow internals: it only hands
 * `{ uploadId, name }` references to the workflow service, which stages them
 * into its own area at fire time.
 */
import { copyFile, mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'

/** One attachment reference persisted on a scheduled task. */
export interface WorkflowAttachmentRef {
  /** Directory name under `<dataDir>/attachments/` that holds the stored file. */
  uploadId: string
  /** Display name of the stored file (already reduced to a safe basename). */
  name: string
  /** Byte size, for the UI. */
  size?: number
}

/** Per-file cap, mirroring the workflow plugin's MAX_UPLOAD_BYTES. */
export const MAX_ATTACHMENT_BYTES = 32 * 1024 * 1024
/** Attachment count cap, mirroring the workflow plugin's MAX_ATTACHMENTS. */
export const MAX_ATTACHMENTS = 20
/** Request-body cap for the upload route (base64 inflation + JSON wrapper). */
export const ATTACHMENT_BODY_BYTES = Math.ceil(MAX_ATTACHMENT_BYTES * 4 / 3) + 1024 * 1024

const ID_RE = /^att-[a-z0-9]+-[a-z0-9]{8}$/
const ILLEGAL_CHARS = /[<>:"|?*\u0000-\u001f\u007f]/g
const MAX_NAME_LEN = 120

/**
 * Reduce an arbitrary upload name to a safe basename (or '' when unusable).
 * Kept local so the scheduler does not import the workflow plugin; the rules
 * match its `sanitizeFileName` so both halves behave identically.
 */
export function sanitizeAttachmentName(raw: unknown): string {
  let name = String(raw ?? '')
  name = name.split(/[\\/]/).pop() || ''
  name = name.replace(ILLEGAL_CHARS, '')
  name = name.replace(/^[\s.]+/, '').replace(/[\s.]+$/, '')
  if (!name) return ''
  if (/^\.+$/.test(name)) return ''
  if (name.length > MAX_NAME_LEN) {
    const dot = name.lastIndexOf('.')
    const ext = dot > 0 && name.length - dot <= 12 ? name.slice(dot) : ''
    name = name.slice(0, Math.max(1, MAX_NAME_LEN - ext.length)) + ext
  }
  return name
}

/** Normalize a persisted/task-input attachment list; `undefined` when empty. */
export function normalizeWorkflowAttachments(value: unknown): WorkflowAttachmentRef[] | undefined {
  if (!Array.isArray(value)) return undefined
  const out: WorkflowAttachmentRef[] = []
  for (const item of value) {
    if (item === null || typeof item !== 'object' || Array.isArray(item)) continue
    const raw = item as { uploadId?: unknown; name?: unknown; size?: unknown }
    const uploadId = typeof raw.uploadId === 'string' ? raw.uploadId.trim() : ''
    const name = sanitizeAttachmentName(raw.name)
    if (!uploadId || !name) continue
    const size = typeof raw.size === 'number' && Number.isFinite(raw.size) && raw.size >= 0 ? raw.size : undefined
    out.push({ uploadId, name, ...(size === undefined ? {} : { size }) })
  }
  return out.length === 0 ? undefined : out
}

/** Why an attachment list is unusable, or null when it is fine (shape-only). */
export function describeWorkflowAttachmentsError(value: unknown, kind: string): string | null {
  if (value === undefined || value === null) return null
  if (!Array.isArray(value)) {
    return '附件必须是数组 / workflowAttachments must be an array'
  }
  if (value.length > MAX_ATTACHMENTS) {
    return `附件最多 ${MAX_ATTACHMENTS} 个 / at most ${MAX_ATTACHMENTS} attachments`
  }
  for (const [i, item] of value.entries()) {
    if (item === null || typeof item !== 'object' || Array.isArray(item)) {
      return `附件第 ${i + 1} 项必须是对象 / attachment #${i + 1} must be an object`
    }
    const raw = item as { uploadId?: unknown; name?: unknown }
    if (typeof raw.uploadId !== 'string' || raw.uploadId.trim() === '') {
      return `附件第 ${i + 1} 项缺少 uploadId / attachment #${i + 1} has no uploadId`
    }
    if (sanitizeAttachmentName(raw.name) === '') {
      return `附件第 ${i + 1} 项的文件名不可用 / attachment #${i + 1} has an unusable name`
    }
  }
  if (kind !== 'knj-workflow') {
    return '附件只适用于「KNJ 工作流」类型的任务 / attachments only apply to knj-workflow tasks'
  }
  return null
}

/** Persisted attachments of one task (stored file bytes, independent of staging). */
export class AttachmentStore {
  constructor(private readonly root: string) {}

  dirFor(uploadId: string): string {
    return join(this.root, uploadId)
  }

  /** Absolute path of a stored attachment, or null when missing/unsafe. */
  async resolve(uploadId: string): Promise<{ uploadId: string; name: string; path: string } | null> {
    if (typeof uploadId !== 'string' || !ID_RE.test(uploadId)) return null
    let entries: string[] = []
    try { entries = await readdir(this.dirFor(uploadId)) } catch { return null }
    const name = entries.find((e) => !e.startsWith('.')) ?? entries[0]
    if (name === undefined) return null
    const path = join(this.dirFor(uploadId), name)
    try {
      const info = await stat(path)
      if (!info.isFile()) return null
    } catch { return null }
    return { uploadId, name, path }
  }

  /**
   * Store one uploaded attachment from base64 (the browser hands over content).
   * Throws with a user-facing message when the payload is unusable.
   */
  async put(input: { name?: unknown; dataBase64?: unknown }): Promise<WorkflowAttachmentRef> {
    const name = sanitizeAttachmentName(input.name)
    if (name === '') throw new Error(`文件名不可用 / unusable file name: ${String(input.name ?? '')}`)
    const dataBase64 = input.dataBase64
    if (typeof dataBase64 !== 'string' || !/^[A-Za-z0-9+/\s]*={0,2}$/.test(dataBase64)) {
      throw new Error('文件内容不是合法的 base64 / payload is not valid base64')
    }
    const buf = Buffer.from(dataBase64.replace(/\s+/g, ''), 'base64')
    if (buf.length === 0) throw new Error('文件内容为空 / empty file')
    if (buf.length > MAX_ATTACHMENT_BYTES) {
      throw new Error(`文件过大 / file too large: ${buf.length} > ${MAX_ATTACHMENT_BYTES}`)
    }
    const uploadId = `att-${Date.now().toString(36)}-${randomUUID().replace(/-/g, '').slice(0, 8)}`
    await mkdir(this.dirFor(uploadId), { recursive: true })
    await writeFile(join(this.dirFor(uploadId), name), buf)
    return { uploadId, name, size: buf.length }
  }

  /** Copy a stored attachment into `destDir`, returning the written path. */
  async materialize(uploadId: string, destDir: string): Promise<{ name: string; path: string } | null> {
    const found = await this.resolve(uploadId)
    if (found === null) return null
    await mkdir(destDir, { recursive: true })
    const dest = join(destDir, found.name)
    await copyFile(found.path, dest)
    return { name: found.name, path: dest }
  }

  /** Drop one stored attachment; safe to call for unknown ids. */
  async discard(uploadId: string): Promise<boolean> {
    if (typeof uploadId !== 'string' || !ID_RE.test(uploadId)) return false
    try {
      await stat(this.dirFor(uploadId))
    } catch {
      return false
    }
    await rm(this.dirFor(uploadId), { recursive: true, force: true })
    return true
  }

  /** Drop attachment entries no longer referenced by any task. */
  async discardUnreferenced(keep: Iterable<string>): Promise<number> {
    const keepSet = new Set(keep)
    let entries: string[] = []
    try { entries = await readdir(this.root) } catch { return 0 }
    let removed = 0
    for (const name of entries) {
      if (!ID_RE.test(name) || keepSet.has(name)) continue
      await rm(this.dirFor(name), { recursive: true, force: true }).then(() => { removed += 1 }).catch(() => { /* 占用中：下次再试 */ })
    }
    return removed
  }
}
