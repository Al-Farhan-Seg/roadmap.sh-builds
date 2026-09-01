import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/22-weather-web-app/',
  build: {
    outDir: '../dist/22-weather-web-app',
    emptyOutDir: true,
  },
});
