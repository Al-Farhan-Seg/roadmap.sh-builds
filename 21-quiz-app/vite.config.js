import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/21-quiz-app/',
  build: {
    outDir: '../dist/21-quiz-app',
    emptyOutDir: true,
  },
});
