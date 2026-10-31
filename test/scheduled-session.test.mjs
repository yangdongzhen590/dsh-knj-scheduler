// Guard: scheduled sessions must run like a real session, not a bare agent.
//
// Two host facts drive these assertions:
//  1. The low-level `agents.create` path composes no agent preset, so a session
//     created without `agentPreset` only gets globally registered plugin tools:
//     no `skill`, no `read`/`write`/`pwsh`/`grep`, no `todo`. The task prompt
//     then cannot reach any skill.
//  2. Session titles come from human messages. A prompt carrying the host's
//     `schedule` producer kind is projected as injected context, so the title
//     generator sees no input and the session stays 「未命名」.
//
// The executor therefore passes the deployment's default preset and delivers
// the prompt as the user message it actually is.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function readSource(rel) {
  return readFileSync(join(root, rel), 'utf8')
}

test('the executor mounts the deployment default agent preset', () => {
  const text = readSource('src/executor.ts')
  assert.ok(
    /agentPresets/.test(text),
    'src/executor.ts must read the host agentPresets registry',
  )
  assert.ok(
    /\.resolve\(/.test(text),
    'src/executor.ts must resolve the preset id before creating the session',
  )
  assert.ok(
    /\.mount\(agentCtx/.test(text),
    'src/executor.ts must mount the preset onto the new agent context inside `setup`',
  )
  assert.ok(
    /meta:\s*\{[\s\S]{0,240}agentPreset/.test(text),
    'src/executor.ts must record the preset id in `meta.agentPreset`',
  )
})

test('the scheduled prompt is delivered as a user message', () => {
  const text = readSource('src/executor.ts')
  assert.ok(
    /source:\s*\{\s*kind:\s*'user'\s*\}/.test(text),
    "src/executor.ts must deliver the prompt with source { kind: 'user' } so the host titles the session",
  )
  assert.ok(
    !/kind:\s*'schedule'/.test(text),
    "the retired 'schedule' source kind leaves the session untitled",
  )
})

test('the built host executor carries both fixes', () => {
  const rel = 'lib/executor.js'
  if (!existsSync(join(root, rel))) return
  const text = readSource(rel)
  assert.ok(/\.resolve\(/.test(text), 'built lib/executor.js must resolve the preset id')
  assert.ok(/\.mount\(agentCtx/.test(text), 'built lib/executor.js must mount the preset in setup')
  assert.ok(
    /kind:\s*"user"|kind:\s*'user'/.test(text),
    'built lib/executor.js must deliver the prompt as a user message',
  )
})
