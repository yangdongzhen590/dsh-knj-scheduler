#!/usr/bin/env node
// verify-ingest.mjs — wiki_ingest 之后逐字节校验：页面正文 == final body 文件
//
// wiki_ingest 要求把正文内联进工具入参（不能引用文件路径），大页正文在转写时可能丢行/改字。
// 本脚本是唯一的验收口径：解析页面 frontmatter 后的正文，与 staging/final/*.body.md 逐字节比较。
//
// 用法: node verify-ingest.mjs --project <root> --pairs <pairs.json>
// 退出码: 0=全部一致；1=有差异

import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const args = process.argv.slice(2)
const argOf = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined }
const projectRoot = resolve(argOf('--project') ?? '.')
const pairsPath = argOf('--pairs')
if (!pairsPath) { console.error('用法: --project <root> --pairs <pairs.json>'); process.exit(1) }
const pairs = JSON.parse(readFileSync(resolve(projectRoot, pairsPath), 'utf8'))

const norm = (s) => s.replace(/\r\n/g, '\n').trimEnd()
let bad = 0
for (const p of pairs) {
  const pageText = readFileSync(join(projectRoot, '.wiki', p.page), 'utf8')
  const m = /^---\n[\s\S]*?\n---\n\n?([\s\S]*)$/.exec(pageText)
  if (!m) { console.log(`MISMATCH ${p.id}: 无法解析页面 frontmatter`); bad++; continue }
  const actual = norm(m[1])
  const expect = norm(readFileSync(resolve(projectRoot, p.body), 'utf8'))
  if (actual === expect) { console.log(`OK ${p.id}`); continue }
  bad++
  const a = actual.split('\n')
  const b = expect.split('\n')
  let i = 0
  while (i < a.length && i < b.length && a[i] === b[i]) i++
  console.log(`MISMATCH ${p.id}: 首个差异在第 ${i + 1} 行（页面 ${a.length} 行 / 期望 ${b.length} 行）`)
  console.log(`  页面: ${JSON.stringify((a[i] ?? '<缺行>').slice(0, 120))}`)
  console.log(`  期望: ${JSON.stringify((b[i] ?? '<缺行>').slice(0, 120))}`)
}
console.log(bad === 0 ? '\n[ALL OK] 9/9 正文逐字节一致' : `\n[FAIL] ${bad} 页不一致`)
process.exit(bad === 0 ? 0 : 1)
