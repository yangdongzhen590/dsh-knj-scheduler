#!/usr/bin/env node
// compute-sources.mjs — 把页面的 ```sources 块替换为「真实 sha256:前16位」指纹
//
// 用法:
//   node compute-sources.mjs --project <root> --page projects/capability-x.md --spec <spec.json>
//
// spec.json 形态: [{"path":"src/routes.ts","symbols":["validateTask","store.create"]}, ...]
// 算法与 check-anchors.mjs --hashes 完全一致（sha256 → 前 16 位十六进制），
// 写完后再跑一次 check-anchors --hashes 可逐字节对照。

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join, resolve } from 'node:path'

const args = process.argv.slice(2)
const argOf = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined }
const projectRoot = resolve(argOf('--project') ?? '.')
const pageRel = argOf('--page')
const specPath = argOf('--spec')
if (!pageRel || !specPath) { console.error('用法: --project <root> --page <vault相对路径> --spec <spec.json>'); process.exit(1) }

const pageFile = resolve(join(projectRoot, '.wiki'), pageRel)
if (!existsSync(pageFile)) { console.error(`找不到 ${pageFile}`); process.exit(1) }
const spec = JSON.parse(readFileSync(resolve(projectRoot, specPath), 'utf8'))
const out = []
for (const s of spec) {
  const abs = join(projectRoot, s.path)
  if (!existsSync(abs)) { console.error(`✗ 源文件不存在: ${s.path}`); process.exit(1) }
  const hash = 'sha256:' + createHash('sha256').update(readFileSync(abs)).digest('hex').slice(0, 16)
  out.push({ path: s.path, hash, symbols: s.symbols ?? [] })
}
const text = readFileSync(pageFile, 'utf8')
const blockRe = /```sources\n[\s\S]*?```/
if (!blockRe.test(text)) { console.error('页面缺少 ```sources 块'); process.exit(1) }
const next = text.replace(blockRe, '```sources\n' + JSON.stringify(out, null, 2) + '\n```')
writeFileSync(pageFile, next, 'utf8')
console.log(`[OK] ${pageRel} → ${out.length} 个源已写入真实 hash`)
for (const o of out) console.log(`  ${o.path}  ${o.hash}  symbols=${o.symbols.join(',')}`)
