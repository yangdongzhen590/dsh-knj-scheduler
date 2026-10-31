// Guard: the client must navigate through the 0.2.x `uiWorkspace` service.
//
// DSH 0.2 removed session selection from the client `ISessions` contract
// (`list/retain/create/fork/...` only, no `open`). The replacement is
// `ctx.uiWorkspace.openSession(target)` from @deepseek-ai/dsh-client-ui-workspace.
//
// The old call sat inside a try/catch, so on 0.2.x it degraded into a
// misleading "session not found" message instead of navigating. These
// assertions fail if the 0.1.x call site (or a missing `uiWorkspace` inject)
// is reintroduced.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const CLIENT_SOURCES = ['index.ts', 'SchedulerEntry.tsx', 'SchedulerPanel.tsx']
const SESSIONS_OPEN = /sessions\s*\??\.\s*open\s*\(/g
const UI_WORKSPACE_OPEN = /uiWorkspace\s*\??\.\s*openSession\s*\(/

function readClientSource(name) {
  return readFileSync(join(root, 'src', 'client', name), 'utf8')
}

test('no client source calls the removed sessions.open()', () => {
  const offenders = []
  for (const name of CLIENT_SOURCES) {
    const text = readClientSource(name)
    for (const m of text.matchAll(SESSIONS_OPEN)) {
      const line = text.slice(0, m.index).split('\n').length
      offenders.push(`${name}:${line}`)
    }
  }
  assert.ok(offenders.length === 0, `client must navigate via uiWorkspace.openSession, found sessions.open at: ${offenders.join(', ')}`)
})

test('client injects uiWorkspace', () => {
  const text = readClientSource('index.ts')
  const injectLine = text.split('\n').find((line) => line.startsWith('export const inject'))
  assert.ok(injectLine !== undefined, 'src/client/index.ts must declare `export const inject`')
  assert.ok(
    /['"]uiWorkspace['"]/.test(injectLine),
    `client inject must include "uiWorkspace", got: ${injectLine}`,
  )
})

test('the panel navigates through uiWorkspace.openSession', () => {
  const text = readClientSource('SchedulerPanel.tsx')
  assert.ok(
    UI_WORKSPACE_OPEN.test(text),
    'SchedulerPanel must call uiWorkspace.openSession(sessionId)',
  )
  assert.ok(
    text.includes('UiWorkspaceService'),
    'SchedulerPanel must take the UiWorkspaceService prop',
  )
})

test('the sidebar entry forwards uiWorkspace to the panel', () => {
  const text = readClientSource('SchedulerEntry.tsx')
  // Non-greedy through the closing `/>`: props include `=>` arrows, so a
  // `[^>]*` scan would stop inside the first callback.
  const panelTag = text.match(/<SchedulerPanel[\s\S]*?\/>/)
  assert.ok(panelTag !== null, 'SchedulerEntry must render <SchedulerPanel … />')
  assert.ok(
    /uiWorkspace\s*=/.test(panelTag[0]),
    `SchedulerEntry must pass uiWorkspace into SchedulerPanel, got: ${panelTag[0]}`,
  )
})

// The bundle is the shipped artifact; the check only applies once it is built.
test('built client bundle ships the uiWorkspace call and no sessions.open()', () => {
  const bundle = join(root, 'client', 'client.js')
  if (!existsSync(bundle)) return
  const text = readFileSync(bundle, 'utf8')
  assert.ok(
    !new RegExp(SESSIONS_OPEN.source).test(text),
    'built client/client.js must not call the removed sessions.open()',
  )
  assert.ok(
    /openSession\s*\(/.test(text),
    'built client/client.js must call openSession()',
  )
  assert.ok(
    /['"]uiWorkspace['"]/.test(text),
    'built client/client.js must declare uiWorkspace in its inject list',
  )
})
