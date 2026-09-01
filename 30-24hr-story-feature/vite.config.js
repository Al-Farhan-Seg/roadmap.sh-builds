import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/30-24hr-story-feature/',
  build: {
    outDir: '../dist/30-24hr-story-feature',
    emptyOutDir: true,
  },
});
