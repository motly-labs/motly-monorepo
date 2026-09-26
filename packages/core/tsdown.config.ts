import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/utils/index.ts',
    'src/svg/index.ts',
    'src/canvas/index.ts',
    'src/auto/index.ts',
  ],
  format: ['esm', 'cjs'],
  target: 'es2022',
  dts: true,
  sourcemap: true,
  treeshake: true,
  clean: true,
});
