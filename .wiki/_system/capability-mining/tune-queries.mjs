#!/usr/bin/env node
// tune-queries.mjs — 在「草稿 vault 副本」里试跑候选问答句的检索名次，用于修 I3
// 用法: node tune-queries.mjs --project <scratchRoot> --page projects/x.md --old "<当前行>" --candidates "a||b||c"
import { readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, resolve } from 'node:path'

const args = process.argv.slice(2)
const argOf = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined }
const projectRoot = resolve(argOf('--project') ?? '.')
const pageRel = argOf('--page')
const oldLine = argOf('--old')
const candidates = (argOf('--candidates') ?? '').split('||').map((s) => s.trim()).filter(Boolean)
const checker = argOf('--checker')
if (!pageRel || !oldLine || candidates.length === 0 || !checker) {
  console.error('需要 --project/--page/--old/--candidates/--checker'); process.exit(1)
}
const pageFile = join(projectRoot, '.wiki', pageRel)
const original = readFileSync(pageFile, 'utf8')
if (!original.includes(oldLine)) { console.error(`✗ 页面里找不到 old 行: ${oldLine}`); process.exit(1) }

for (const cand of candidates) {
  writeFileSync(pageFile, original.replace(oldLine, cand), 'utf8')
  let out = ''
  try {
    out = execFileSync(process.execPath, [checker, '--project', projectRoot, '--page', pageRel, '--pretty'], { encoding: 'utf8' })
  } catch (e) {
    out = (e.stdout ?? '').toString()
  }
  let rank = 'parse-error'
  try {
    const j = JSON.parse(out)
    const qa = j[0].I3.qa.find((x) => x.q === cand)
    rank = qa ? qa.rank : '?'
  } catch { /* keep parse-error */ }
  console.log(`rank=${rank}  ${cand}`)
}
writeFileSync(pageFile, original, 'utf8')
