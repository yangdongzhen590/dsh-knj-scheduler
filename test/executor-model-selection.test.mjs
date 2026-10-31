// Regression guard: a scheduled session must always end up with a model selection.
//
// The host's `{{model}}` prompt variable is filled by the assembly waterfall that
// `installModelSelection` installs. `agents.create` installs no selection on its
// own — not even when it composes an agent preset, because the standard presets
// only contribute persona, tools and packaging — so a scheduled turn created
// without one fails prompt assembly with:
//
//   prompt variable "{{model}}" has no value for this assembly
//   (section "deployment:persona-prefix")
//
// A second trap sits next to it: the preset registry exposes the user's choice as
// a settings-backed volatile ref (`z.string().volatile()`), read through `.get()`.
// Reading `config.selectedDefault` as a string yields a truthy object, which made
// every run think a preset was configured and skip the model-selection install.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function readSource(rel) {
  return readFileSync(join(root, rel), 'utf8')
}

/** `undefined` compiles to `void 0` in some emit modes; accept both. */
const UNDEFINED = '(?:undefined|void 0)'

test('the model selection is installed regardless of the agent preset', () => {
  const text = readSource('src/executor.ts')

  assert.doesNotMatch(
    text,
    new RegExp(`agentPreset\\s*===\\s*${UNDEFINED}\\s*&&\\s*defaultModel`),
    'installing the model selection must not be gated on the preset: a preset composes no selection',
  )
  assert.match(
    text,
    /setup:\s*async \(agentCtx: Context\)/,
    '`setup` must always be passed so the preset is mounted and the selection installed',
  )
  assert.match(
    text,
    /installModelSelection\(agentCtx/,
    '`setup` must install the model selection so `{{model}}` resolves',
  )
})

test('the agent preset is resolved to an id, not the volatile settings ref', () => {
  const text = readSource('src/executor.ts')

  assert.doesNotMatch(
    text,
    /config\?\.selectedDefault\s*\?\?\s*config\?\.default/,
    '`selectedDefault` is a volatile ref, not a string; reading it raw passes an object as the preset',
  )
  assert.match(text, /defaultId/, 'the registry public getter `defaultId` must be preferred')
  assert.match(text, /\.get\(\)/, 'the volatile ref must be unwrapped through `get()`')
})

test('the built executor carries the same two fixes', { skip: !existsSync(join(root, 'lib/executor.js')) }, () => {
  const text = readSource('lib/executor.js')

  assert.doesNotMatch(
    text,
    new RegExp(`agentPreset\\s*===\\s*${UNDEFINED}\\s*&&\\s*defaultModel`),
    'built lib/executor.js must not gate the model selection on the preset',
  )
  assert.match(text, /installModelSelection/, 'built lib/executor.js must install the model selection')
  assert.match(text, /defaultId/, 'built lib/executor.js must resolve the preset through `defaultId`')
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

/** Build a ctx whose `agents.create` captures its options. */
function makeContext(registry) {
  const captured = {}
  const ctx = {
    get(key) {
      if (key === 'agents') {
        return {
          async create(options) {
            captured.options = options
            return { agent: { id: 'session-1', followup() {} } }
          },
        }
      }
      if (key === 'agentPresets') return registry
      if (key === 'agentDefaultModel') {
        return { currentSelection: () => ({ provider: 'deepseek-account', model: 'deepseek-flash' }) }
      }
      return undefined
    },
  }
  return { ctx, captured }
}

test('a preset-bearing scheduled run still installs a model selection', { skip: behaviouralSkip }, async () => {
  // The real registry exposes the choice as `defaultId`, keeps the raw
  // settings ref under `config.selectedDefault` (a `z.string().volatile()` ref),
  // and mounts the composition through `resolve`/`mount`.
  const { ctx, captured } = makeContext({
    defaultId: 'standard',
    config: { default: 'standard', selectedDefault: { get: () => undefined } },
    async resolve(id) {
      return { id: id ?? 'standard' }
    },
    async mount() {},
  })

  const result = await executeTask(ctx, {
    id: 'task-1',
    executionKind: 'prompt-session',
    prompt: 'hello',
  })

  assert.equal(result.status, 'created')
  assert.equal(captured.options.meta?.agentPreset, 'standard', 'the preset must be a preset id')
  assert.equal(
    typeof captured.options.setup,
    'function',
    'the run must install the model selection even though a preset is composed',
  )
})

test('a legacy registry without `defaultId` still yields a preset id', { skip: behaviouralSkip }, async () => {
  // Registries that predate the getter only offer the volatile ref; reading it
  // raw used to hand a truthy object to the host.
  const { ctx, captured } = makeContext({
    config: { default: 'standard', selectedDefault: { get: () => 'liangshen' } },
    async resolve(id) {
      return { id: id ?? 'standard' }
    },
    async mount() {},
  })

  await executeTask(ctx, { id: 'task-2', executionKind: 'prompt-session', prompt: 'hello' })

  assert.equal(captured.options.meta?.agentPreset, 'liangshen', 'the user-picked preset must win')
  assert.equal(typeof captured.options.setup, 'function')
})
