import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/15-flash-cards/',
  build: {
    outDir: '../dist/15-flash-cards',
    emptyOutDir: true,
  },
});
