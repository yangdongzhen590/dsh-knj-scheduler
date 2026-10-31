#!/usr/bin/env node
// extract-body.mjs — 从已组装的知识页中抽出「正文」（不含 frontmatter），写为 final body 文件
//
// 用途：wiki_ingest 的 body 入参必须不含 frontmatter，且必须与候选页正文逐字节一致，
// 否则入库会把已核好的 Sources/```sources 块冲掉。此脚本是唯一抽取口径。
//
// 用法: node extract-body.mjs --project <root> --page projects/capability-x.md --out <body.md>

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join, resolve, dirname } from 'node:path'

const args = process.argv.slice(2)
const argOf = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined }
const projectRoot = resolve(argOf('--project') ?? '.')
const pageRel = argOf('--page')
const outRel = argOf('--out')
if (!pageRel || !outRel) { console.error('用法: --project <root> --page <vault相对路径> --out <bodyfile>'); process.exit(1) }

const text = readFileSync(join(projectRoot, '.wiki', pageRel), 'utf8')
const m = /^---\n[\s\S]*?\n---\n\n?([\s\S]*)$/.exec(text)
if (!m) { console.error(`✗ 无法解析 frontmatter: ${pageRel}`); process.exit(1) }
const body = m[1].trimEnd()
const out = resolve(projectRoot, outRel)
mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, body + '\n', 'utf8')
const hash = createHash('sha256').update(body).digest('hex')
console.log(`${pageRel}|${out.replace(/\\/g, '/')}|sha256:${hash}|${body.split('\n').length} lines`)
