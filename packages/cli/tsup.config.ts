import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['@apiwatch/shared', '@apiwatch/plugin'],
  target: 'node20',
  outDir: 'dist',
});
