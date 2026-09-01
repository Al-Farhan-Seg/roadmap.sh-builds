import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/23-github-random-repository/',
  build: {
    outDir: '../dist/23-github-random-repository',
    emptyOutDir: true,
  },
});
