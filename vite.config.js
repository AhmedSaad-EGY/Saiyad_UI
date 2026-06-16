import { defineConfig } from 'vite';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

/**
 * Injects a deterministic content hash into `__SW_VERSION__` placeholder in dist/sw.js.
 * Runs at closeBundle — after Vite copies public/ files to dist/.
 */
function collectBuildFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .flatMap((name) => {
      const file = join(dir, name);
      const stat = statSync(file);
      return stat.isDirectory() ? collectBuildFiles(file) : [file];
    });
}

function computeBuildHash(distDir, swPath) {
  const hash = createHash('sha256');
  collectBuildFiles(distDir)
    .filter((file) => file !== swPath)
    .map((file) => ({
      file,
      key: relative(distDir, file).replace(/\\/g, '/'),
    }))
    .sort((a, b) => a.key.localeCompare(b.key))
    .forEach(({ file, key }) => {
      hash.update(key);
      hash.update('\0');
      hash.update(readFileSync(file));
      hash.update('\0');
    });
  return hash.digest('hex').slice(0, 12);
}

function swVersionPlugin() {
  return {
    name: 'sw-version',
    closeBundle() {
      const distDir = resolve('dist');
      const swPath = resolve(distDir, 'sw.js');
      if (!existsSync(swPath)) return;
      const hash = computeBuildHash(distDir, swPath);
      const version = `v${hash}`;
      let content = readFileSync(swPath, 'utf-8');
      content = content.replace(/__SW_VERSION__/g, version);
      if (content.includes('__SW_VERSION__')) {
        throw new Error('Service worker version placeholder was not fully replaced.');
      }
      writeFileSync(swPath, content, 'utf-8');
      console.warn(`SW version injected: ${version}`);
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
