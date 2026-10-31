/**
 * Browser client bundle for the dsh-scheduler plugin, mirroring the DeepSeek
 * Harness client preset: a closure-factory artifact that calls
 * window.__ModuleLoader__.load({ id, factory }) and resolves externals through
 * the injected `require` (loader module table).
 */
import { defineConfig } from 'tsdown'

const id = 'dsh-scheduler'

/** Externals resolved from the loader module table at runtime. */
const CLIENT_EXTERNALS = ['react', 'react/jsx-runtime']

export default defineConfig({
  entry: { client: 'src/client/index.ts' },
  tsconfig: 'tsconfig.client.json',
  outDir: 'client',
  format: 'cjs',
  platform: 'browser',
  target: 'es2022',
  dts: false,
  sourcemap: true,
  clean: false,
  deps: {
    neverBundle: [...CLIENT_EXTERNALS],
    alwaysBundle: (source: string) => (CLIENT_EXTERNALS.includes(source) ? undefined : true),
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  outputOptions: {
    entryFileNames: 'client.js',
    banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(id)}, factory: (require) => {`,
    footer: 'return module.exports; } });',
    intro: 'var module = { exports: {} }; var exports = module.exports;',
  },
})
