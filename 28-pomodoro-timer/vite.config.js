import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/28-pomodoro-timer/',
  build: {
    outDir: '../dist/28-pomodoro-timer',
    emptyOutDir: true,
  },
});
