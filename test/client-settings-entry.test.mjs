/**
 * The scheduler entry lives in the Settings dialog (settings.section), not in
 * the dsh-knj-menu sidebar item, so the plugin no longer depends on knj-menu.
 * These assertions are static: they pin the registration shape and the
 * embedded rendering branch of the panel.
 */
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (relative) => readFileSync(join(root, relative), 'utf8')

test('the scheduler is registered as a Settings section, not a sidebar item', () => {
  const src = read('src/client/index.ts')
  assert.match(src, /settings\.section/)
  assert.doesNotMatch(src, /knj\.menu\.item/)
  assert.doesNotMatch(src, /SchedulerEntry/)
  assert.equal(existsSync(join(root, 'src/client/SchedulerEntry.tsx')), false)
})

test('the Settings row is labelled with the panel title', () => {
  const src = read('src/client/index.ts')
  assert.match(src, /label:\s*\(\)\s*=>\s*t\('panel\.title'\)/)
})

test('the Settings section renders the panel inline', () => {
  const src = read('src/client/SchedulerPanel.tsx')
  assert.match(src, /embedded\?: boolean/)
  assert.match(src, /embedded \? S\.embedRoot : S\.overlay/)
  assert.match(src, /embedded \? S\.embedPanel : S\.panel/)
})

test('the embedded panel leaves Escape handling to the Settings dialog', () => {
  const src = read('src/client/SchedulerPanel.tsx')
  assert.match(src, /if \(embedded === true\) return/)
})
