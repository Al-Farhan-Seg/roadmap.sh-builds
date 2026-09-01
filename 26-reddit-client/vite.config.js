import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/26-reddit-client/',
  build: {
    outDir: '../dist/26-reddit-client',
    emptyOutDir: true,
  },
});
