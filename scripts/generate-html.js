import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';

const [, , inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  console.error('Usage: npm run html -- drafts/article.md public/article.html');
  process.exit(1);
}

const markdown = fs.readFileSync(inputPath, 'utf8');
const { body, meta } = parseFrontMatter(markdown);
const html = marked.parse(body);
const templatePath = path.resolve('templates/html-template.html');
const template = fs.existsSync(templatePath)
  ? fs.readFileSync(templatePath, 'utf8')
  : '<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>{{title}}</title></head><body>{{content}}</body></html>';

const output = template
  .replaceAll('{{title}}', escapeHtml(meta.title || '確認用HTML'))
  .replaceAll('{{excerpt}}', escapeHtml(meta.excerpt || ''))
  .replaceAll('{{content}}', html);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, output, 'utf8');
console.log(`Generated: ${outputPath}`);

function parseFrontMatter(text) {
  if (!text.startsWith('---')) return { body: text, meta: {} };
  const end = text.indexOf('\n---', 3);
  if (end === -1) return { body: text, meta: {} };
  const raw = text.slice(3, end).trim();
  const body = text.slice(end + 4).trimStart();
  const meta = {};
  for (const line of raw.split('\n')) {
    const idx = line.indexOf(':');
    if (idx !== -1) meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return { body, meta };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
