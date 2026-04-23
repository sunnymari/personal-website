import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  publicDir: 'public',
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        blog: resolve(__dirname, 'blog.html'),
        reading: resolve(__dirname, 'reading.html'),
        projects: resolve(__dirname, 'projects.html'),
        workWithMe: resolve(__dirname, 'work-with-me.html'),
        pageant: resolve(__dirname, 'pageant.html'),
        chibi: resolve(__dirname, 'chibi.html'),
      },
    },
  },
});
