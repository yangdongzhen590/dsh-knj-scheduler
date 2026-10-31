// Regression guard: a scheduled session must actually MOUNT the deployment preset.
//
// DSH composes an agent's tool plane from an agent preset (tools, prompt sections,
// skill catalog/loader). The host's own session controller attaches one by:
//
//   1. resolving the id with  `agentPresets.resolve(presetId)`  BEFORE creating;
//   2. recording it in the session header with  `meta.agentPreset`;
//   3. mounting the composition inside the create `setup` callback with
//      `agentPresets.mount(agentCtx, resolvedId)`.
//
// A top-level `agentPreset` option on `agents.create` is NOT part of the host's
// create contract and is silently ignored — the session then runs with only
// host-plane plugin tools: no `skill`, no `read`/`write`/`pwsh`/`grep`, no `todo`.
// That is exactly how scheduled prompt sessions behaved on DSH 0.2.1-rc.2
// (verified: their session headers recorded `agentPreset: null` and the model saw
// only list_agents/working_directory/wiki_* tools).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function readSource(rel) {
  return readFileSync(join(root, rel), 'utf8')
}

test('the executor resolves the preset and mounts it in the create setup', () => {
  const text = readSource('src/executor.ts')

  assert.match(
    text,
    /\.resolve\(/,
    'the preset id must be resolved through the host registry before creating the session',
  )
  assert.match(
    text,
    /\.mount\(agentCtx/,
    'the resolved preset must be mounted onto the new agent context inside `setup`',
  )
  assert.match(
    text,
    /meta:\s*\{[\s\S]{0,240}agentPreset/,
    'the resolved preset id must be recorded in the session metadata (`meta.agentPreset`)',
  )
})

test('the built executor resolves and mounts the preset too', { skip: !existsSync(join(root, 'lib/executor.js')) }, () => {
  const text = readSource('lib/executor.js')

  assert.match(text, /\.resolve\(/, 'built lib/executor.js must resolve the preset id')
  assert.match(text, /\.mount\(agentCtx/, 'built lib/executor.js must mount the preset in setup')
  assert.match(
    text,
    /meta:\s*\{[\s\S]{0,240}agentPreset/,
    'built lib/executor.js must record the preset id in the session metadata',
  )
})

// Behavioural checks: run when the host runtime is resolvable (CI installs the
// devDependencies; a bare worktree may not).
let executeTask
try {
  ;({ executeTask } = await import('../lib/executor.js'))
} catch {
  executeTask = undefined
}

const behaviouralSkip =
  executeTask === undefined ? 'lib/executor.js or its host dependencies are unavailable' : false

/**
 * Build a ctx whose `agents.create` captures its options. `mounts` collects every
 * `presets.mount(agentCtx, id)` call so the test can drive the setup callback;
 * `invokeSetup` makes the fake create run `setup` and surface its rejection.
 */
function makeContext(registry, options = {}) {
  const captured = {}
  const mounts = []
  const ctx = {
    get(key) {
      if (key === 'agents') {
        return {
          async create(createOptions) {
            captured.options = createOptions
            if (options.invokeSetup === true && typeof createOptions.setup === 'function') {
              await createOptions.setup({ kind: 'fake-agent-ctx' })
            }
            return { agent: { id: 'session-1', followup() {} } }
          },
        }
      }
      if (key === 'agentPresets') return registry
      if (key === 'agentDefaultModel' && options.defaultModel === true) {
        return { currentSelection: () => ({ provider: 'deepseek-account', model: 'deepseek-flash' }) }
      }
      return undefined
    },
  }
  return { ctx, captured, mounts }
}

/** A registry that behaves like the host preset service (`dsh-agent-presets` / `dsh-agent-preset-registry`). */
function mountableRegistry(overrides = {}) {
  return {
    defaultId: 'standard',
    config: { default: 'standard', selectedDefault: { get: () => undefined } },
    async resolve(id) {
      return { id: id ?? 'standard' }
    },
    async mount() {},
    ...overrides,
  }
}

test('a mountable registry records the preset id and mounts it in setup', { skip: behaviouralSkip }, async () => {
  const { ctx, captured, mounts } = makeContext(
    mountableRegistry({
      async mount(agentCtx, id) {
        mounts.push([agentCtx, id])
      },
    }),
  )

  const result = await executeTask(ctx, { id: 'task-1', executionKind: 'prompt-session', prompt: 'hello' })

  assert.equal(result.status, 'created')
  assert.equal(captured.options.meta?.agentPreset, 'standard', 'the resolved id must reach `meta.agentPreset`')
  assert.equal(
    captured.options.agentPreset,
    undefined,
    'a top-level `agentPreset` is not part of the host create contract; do not rely on it',
  )
  assert.equal(typeof captured.options.setup, 'function', 'mounting needs a create-time setup callback')

  const agentCtx = { kind: 'fake-agent-ctx' }
  await captured.options.setup(agentCtx)
  assert.deepEqual(mounts, [[agentCtx, 'standard']], 'setup must mount the resolved preset on the agent context')
})

test('the mounted preset is the user-picked deployment default', { skip: behaviouralSkip }, async () => {
  const seen = []
  const { ctx, captured } = makeContext(
    mountableRegistry({
      defaultId: undefined,
      config: { default: 'standard', selectedDefault: { get: () => 'liangshen' } },
      async resolve(id) {
        seen.push(id)
        return { id: id ?? 'standard' }
      },
    }),
  )

  await executeTask(ctx, { id: 'task-2', executionKind: 'prompt-session', prompt: 'hello' })

  assert.deepEqual(seen, ['liangshen'], 'the volatile settings ref must be unwrapped into the preset id')
  assert.equal(captured.options.meta?.agentPreset, 'liangshen')
})

test('the model selection is still installed alongside the mounted preset', { skip: behaviouralSkip }, async () => {
  const { ctx, captured } = makeContext(mountableRegistry(), { defaultModel: true })

  const result = await executeTask(ctx, { id: 'task-3', executionKind: 'prompt-session', prompt: 'hello' })

  assert.equal(result.status, 'created')
  assert.equal(captured.options.meta?.agentPreset, 'standard')
  assert.equal(typeof captured.options.setup, 'function', 'the mounted preset must not replace the model selection')
})

test('an unresolvable preset fails the run instead of creating a toolless session', { skip: behaviouralSkip }, async () => {
  const { ctx, captured } = makeContext(
    mountableRegistry({
      async resolve() {
        throw new Error('agent-presets: preset "ghost" not found')
      },
    }),
  )

  const result = await executeTask(ctx, { id: 'task-4', executionKind: 'prompt-session', prompt: 'hello' })

  assert.equal(result.status, 'failed')
  assert.match(result.error ?? '', /ghost|preset/i, 'the failure must name the broken preset')
  assert.equal(captured.options, undefined, 'no session may be created without its preset composition')
})

test('a host without the preset service fails with an actionable error', { skip: behaviouralSkip }, async () => {
  const { ctx, captured } = makeContext(undefined)

  const result = await executeTask(ctx, { id: 'task-5', executionKind: 'prompt-session', prompt: 'hello' })

  assert.equal(result.status, 'failed')
  assert.match(result.error ?? '', /agentPresets|preset/i, 'the failure must point at the missing preset service')
  assert.equal(captured.options, undefined)
})

test('a mount failure fails the run instead of leaving a silently toolless session', { skip: behaviouralSkip }, async () => {
  const { ctx } = makeContext(
    mountableRegistry({
      async mount() {
        throw new Error('preset "standard" failed to mount: persona plugin threw')
      },
    }),
    { invokeSetup: true },
  )

  const result = await executeTask(ctx, { id: 'task-6', executionKind: 'prompt-session', prompt: 'hello' })

  assert.equal(result.status, 'failed')
  assert.match(result.error ?? '', /mount|preset/i)
})
