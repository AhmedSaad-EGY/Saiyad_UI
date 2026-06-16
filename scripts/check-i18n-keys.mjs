import { readdirSync, readFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

global.localStorage = {
  getItem: () => 'en',
  setItem: () => {},
  removeItem: () => {},
};

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'src');
const { translations } = await import('../src/shared/utils/i18n.js');
const usedKeys = new Map();
const extensions = new Set(['.js', '.html']);

function lineNumber(source, index) {
  return source.slice(0, index).split('\n').length;
}

function addKey(key, file, line, kind) {
  if (!key || key.includes('${')) return;
  if (!usedKeys.has(key)) usedKeys.set(key, []);
  usedKeys.get(key).push(`${relative(root, file)}:${line} (${kind})`);
}

function scanFile(file) {
  const source = readFileSync(file, 'utf8');
  let match;

  const tCall = /(?:^|[^\w$])(\$?t)\s*\(\s*(['"`])([^'"`]+?)\2/g;
  while ((match = tCall.exec(source))) {
    const afterLiteral = source.slice(tCall.lastIndex).trimStart();
    if (afterLiteral.startsWith('+')) continue;
    addKey(match[3], file, lineNumber(source, match.index), match[1]);
  }

  const dataI18n = /data-i18n(?:-(?:title|placeholder))?\s*=\s*(['"])(.*?)\1/g;
  while ((match = dataI18n.exec(source))) {
    addKey(match[2], file, lineNumber(source, match.index), 'data-i18n');
  }
}

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const file = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(file);
    } else if (extensions.has(extname(entry.name))) {
      scanFile(file);
    }
  }
}

walk(srcDir);

const missing = [...usedKeys.keys()]
  .sort()
  .map((key) => ({
    key,
    en: Object.prototype.hasOwnProperty.call(translations.en, key),
    ar: Object.prototype.hasOwnProperty.call(translations.ar, key),
    refs: usedKeys.get(key),
  }))
  .filter((entry) => !entry.en || !entry.ar);

if (missing.length) {
  console.error(`Missing ${missing.length} i18n key(s):`);
  for (const entry of missing) {
    console.error(`- ${entry.key} en=${entry.en} ar=${entry.ar}`);
    for (const ref of entry.refs.slice(0, 3)) console.error(`  ${ref}`);
  }
  process.exit(1);
}

console.log(`i18n OK: ${usedKeys.size} literal key(s) exist in en and ar.`);
