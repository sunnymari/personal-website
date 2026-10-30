import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  publicDir: 'public',
  server: {
    proxy: {
      '/api/carbonbench': {
        target: 'https://carbonbench.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/carbonbench/, '/api'),
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        blog: resolve(__dirname, 'blog.html'),
        projects: resolve(__dirname, 'projects.html'),
        actuatorDiagnostics: resolve(__dirname, 'actuator-diagnostics.html'),
        growth: resolve(__dirname, 'growth.html'),
        dreamCompanies: resolve(__dirname, 'dream-companies.html'),
        dataCenterWatch: resolve(__dirname, 'data-center-watch.html'),
        art: resolve(__dirname, 'art.html'),
        shop: resolve(__dirname, 'shop.html'),
      },
    },
  },
});
