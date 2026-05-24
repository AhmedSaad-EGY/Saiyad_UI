import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  base: '/',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-alpine': ['alpinejs'],
        },
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://sayiad.runasp.net',
        changeOrigin: true,
      },
      '/hubs': {
        target: 'https://sayiad.runasp.net',
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
