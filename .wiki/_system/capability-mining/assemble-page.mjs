#!/usr/bin/env node
// assemble-page.mjs — 从「正文暂存文件 + 元数据」组装候选知识页（供 wiki-capability 手工流程用）
//
// 为什么需要它：技能要求先落页、跑 check-anchors/check-capability，再 wiki_ingest 入库。
// 手工拼 frontmatter 容易漏字段，故用脚本确定性组装；正文与元数据分离，改正文不用重写 frontmatter。
//
// 用法:
//   node assemble-page.mjs --id capability-x --title "X" --category projects \
//     --source capability-mining:X --tags "concept" --tier core --confidence inferred \
//     --summary "一句话" --body .wiki/_system/capability-mining/staging/x.body.md
//
// 行为: 写 <project>/.wiki/<category>/<id>.md；已有页保留原 created；打印 PAGE/HASH。

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { createHash } from 'node:crypto'

const args = process.argv.slice(2)
const argOf = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined }
const projectRoot = resolve(argOf('--project') ?? process.cwd())
const id = argOf('--id')
const title = argOf('--title')
const category = argOf('--category') ?? 'projects'
const source = argOf('--source')
const tags = (argOf('--tags') ?? 'concept').split(',').map((s) => s.trim()).filter(Boolean)
const tier = argOf('--tier') ?? 'supporting'
const confidence = argOf('--confidence') ?? 'inferred'
const summary = argOf('--summary') ?? ''
const bodyPath = argOf('--body')
if (!id || !title || !bodyPath) {
  console.error('用法: node assemble-page.mjs --id <id> --title <title> --body <body.md> [--category projects] [--source s] [--tags concept] [--tier core] [--confidence inferred] [--summary ...]')
  process.exit(1)
}
const safe = /^[a-z0-9\u4e00-\u9fff][a-z0-9\u4e00-\u9fff-]*$/
if (!safe.test(id)) { console.error(`id 不合法: ${id}`); process.exit(1) }

const body = readFileSync(resolve(projectRoot, bodyPath), 'utf8').replace(/\r\n/g, '\n').trimEnd()
const dir = join(projectRoot, '.wiki', category)
mkdirSync(dir, { recursive: true })
const file = join(dir, `${id}.md`)

// 保留旧页 created
let created = new Date().toISOString()
if (existsSync(file)) {
  const old = readFileSync(file, 'utf8')
  const m = /^created:\s*(\S+)$/m.exec(old)
  if (m) created = m[1]
}
const now = new Date().toISOString()
const fm = [
  '---',
  `id: ${id}`,
  `title: ${title}`,
  `category: ${category}`,
  `tags: [${tags.join(', ')}]`,
  ...(summary.trim() ? [`summary: ${summary.trim()}`] : []),
  `tier: ${tier}`,
  `source: ${source ?? `capability-mining:${title}`}`,
  `confidence: ${confidence}`,
  `created: ${created}`,
  `updated: ${now}`,
  '---',
].join('\n')
const text = `${fm}\n\n${body}\n`
writeFileSync(file, text, 'utf8')

const bodyHash = createHash('sha256').update(body).digest('hex')
console.log(`PAGE=${file.replace(/\\/g, '/')}`)
console.log(`BODY_SHA256=${bodyHash}`)
console.log(`BYTES=${Buffer.byteLength(text, 'utf8')} BODY_LINES=${body.split('\n').length}`)
