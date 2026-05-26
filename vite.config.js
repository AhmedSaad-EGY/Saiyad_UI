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
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-alpine': ['alpinejs'],
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
