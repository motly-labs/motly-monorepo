import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    target: 'es2022',
    dts: true,
    sourcemap: true,
    treeshake: true,
    clean: true,
  },
  {
    // The script build, for a page with no bundler: core bundled in, the plugin as `Motly`.
    entry: { motly: 'src/iife.ts' },
    format: 'iife',
    globalName: 'Motly',
    target: 'es2022',
    noExternal: [/^@motly\/core/],
    minify: true,
    sourcemap: true,
    treeshake: true,
  },
]);
