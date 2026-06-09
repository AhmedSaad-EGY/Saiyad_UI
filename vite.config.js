import { defineConfig } from 'vite';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Injects a build timestamp into `__SW_VERSION__` placeholder in dist/sw.js.
 * Runs at closeBundle — after Vite copies public/ files to dist/.
 */
function swVersionPlugin() {
  return {
    name: 'sw-version',
    closeBundle() {
      const swPath = resolve('dist', 'sw.js');
      if (!existsSync(swPath)) return;
      const hash = Date.now().toString(36);
      let content = readFileSync(swPath, 'utf-8');
      content = content.replace(/__SW_VERSION__/g, `v${hash}`);
      writeFileSync(swPath, content, 'utf-8');
      console.log(`  \uD83D\uDD11 SW version injected: v${hash}`);
    },
  };
}

export default defineConfig({
  root: 'src',
  base: '/',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor chunks
          if (id.includes('node_modules/alpinejs')) return 'vendor-alpine';
          if (id.includes('node_modules/bootstrap')) return 'vendor-bootstrap';

          // Core app chunks (loaded on every page)
          if (id.includes('/src/app/')) {
            if (id.includes('i18n')) return 'core-i18n';
            return 'core-app';
          }
          if (id.includes('/src/shared/api/')) return 'core-api';
          if (id.includes('/src/shared/utils/')) return 'core-utils';

          // Page chunks (loaded only when route is visited)
          const pageMatch = id.match(/\/src\/pages\/([^/]+)\.js$/);
          if (pageMatch) return `page-${pageMatch[1]}`;
        },
      },
    },
  },
  plugins: [swVersionPlugin()],
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
