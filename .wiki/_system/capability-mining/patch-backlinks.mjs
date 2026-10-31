#!/usr/bin/env node
// patch-backlinks.mjs — 写后补链：给两个能力页的「参考资料」各加一条指向 capability-边栏面板与表单 的链接
// 3.7 要求能力页入链 ≥2；补链后 边栏面板与表单 的入链从 1 升到 3。
import { readFileSync, writeFileSync } from 'node:fs'

const root = 'D:/dsh-knj/dsh-knj-scheduler'
const patches = [
  {
    file: `${root}/.wiki/projects/capability-触发计划与下次执行.md`,
    anchor: '- [[capability-任务定义与持久化]] — `syncOne` 的上游：创建/编辑/删除任务时何时重排',
    add: '- [[capability-边栏面板与表单]] — 表单里的实时预览与「校验」按钮（本页预览链路的前端）',
  },
  {
    file: `${root}/.wiki/projects/capability-执行历史与状态流转.md`,
    anchor: '- [[tasks-json-原子写入与加载白名单]] — 为什么历史回填没有沿用 tmp+rename',
    add: '- [[capability-边栏面板与表单]] — 执行记录页签、分页条与 HistoryRow 的前端实现',
  },
]

for (const p of patches) {
  const text = readFileSync(p.file, 'utf8')
  if (text.includes(p.add)) { console.log(`SKIP 已存在: ${p.file}`); continue }
  if (!text.includes(p.anchor)) { console.error(`✗ 锚点未找到: ${p.file}`); process.exit(1) }
  writeFileSync(p.file, text.replace(p.anchor, `${p.anchor}\n${p.add}`), 'utf8')
  console.log(`OK 补链: ${p.file.split('/').pop()}`)
}
