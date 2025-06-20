import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts', 'src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['@apiwatch/shared'],
  noExternal: [],
  target: 'node20',
  outDir: 'dist',
});
