import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const DEFAULT_CATEGORY = 'バイク買取';
const DEFAULT_TARGET_MEDIA = 'https://poi-poi.co.jp/bike/';
const DEFAULT_WORD_COUNT = 5000;

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
function yamlValue(text, key) {
  const match = text.match(new RegExp(`^${key}:\\s*["']?(.+?)["']?\\s*$`, 'm'));
  return match?.[1]?.trim();
}
function timestampSlug() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `article-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}
export function slugFromKeyword(keyword = '') {
  const dictionary = [
    ['バイク', 'bike'], ['買取', 'kaitori'], ['千葉', 'chiba'], ['東京', 'tokyo'], ['大阪', 'osaka'], ['神奈川', 'kanagawa'],
    ['埼玉', 'saitama'], ['不動車', 'fudosha'], ['原付', 'gentsuki'], ['事故車', 'jikosha'], ['廃車', 'haisha'], ['査定', 'satei']
  ];
  let text = String(keyword).toLowerCase();
  for (const [from, to] of dictionary) text = text.split(from).join(` ${to} `);
  const slug = text.normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/-{2,}/g, '-');
  return /^[a-z0-9-]+$/.test(slug) && /[a-z]/.test(slug) ? slug : '';
}
function normalizeBoolean(value, fallback = 'false') {
  return String(value ?? fallback).trim() === 'true' ? 'true' : 'false';
}
function normalizeWordCount(value) {
  const n = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_WORD_COUNT;
}

const inputFile = arg('input');
const inputText = inputFile && existsSync(inputFile) ? await readFile(inputFile, 'utf8') : '';
const mainKeyword = arg('main_keyword') || yamlValue(inputText, 'main_keyword') || '';
const keyword = arg('keyword') || yamlValue(inputText, 'keyword') || '';
const effectiveKeyword = mainKeyword || keyword;
const providedSlug = arg('slug') || yamlValue(inputText, 'slug') || '';
const slug = providedSlug || slugFromKeyword(effectiveKeyword) || timestampSlug();
if (!/^[a-z0-9-]+$/.test(slug)) {
  console.error('slug must contain only lowercase letters, numbers, and hyphens. Omit --slug to auto-generate a safe slug.');
  process.exit(1);
}
if (!effectiveKeyword) {
  console.error('Usage: npm run create -- --main_keyword "バイク 買取 千葉" --title "..." --target_word_count 5000 [--slug article-slug]');
  process.exit(1);
}

const title = arg('title') || yamlValue(inputText, 'title') || '';
const category = arg('category') || yamlValue(inputText, 'category') || DEFAULT_CATEGORY;
const targetMedia = arg('target_media') || yamlValue(inputText, 'target_media') || DEFAULT_TARGET_MEDIA;
const postToWp = normalizeBoolean(arg('post_to_wp') ?? yamlValue(inputText, 'post_to_wp'));
const rawWordCount = arg('target_word_count') || yamlValue(inputText, 'target_word_count');
const targetWordCount = normalizeWordCount(rawWordCount);
const warnings = [];
if (!rawWordCount) warnings.push(`target_word_count が未指定のため、本文作成時の標準目安として ${DEFAULT_WORD_COUNT} を使います。`);

const dir = path.join('articles', slug);
await mkdir(dir, { recursive: true });
for (const file of ['input.yml', 'serp.md', 'headings.csv', 'heading-analysis.md', 'heading-plan.md', 'draft.md', 'article.html', 'article-linked.html', 'article-decorated.html', 'external-links.md', 'check-report.md']) {
  const target = path.join(dir, file);
  if (!existsSync(target)) await writeFile(target, '', 'utf8');
}
const normalizedInput = [
  `main_keyword: "${effectiveKeyword.replace(/"/g, '\\"')}"`,
  title ? `title: "${title.replace(/"/g, '\\"')}"` : 'title: ""',
  `target_word_count: ${targetWordCount}`,
  `slug: "${slug}"`,
  `category: "${category.replace(/"/g, '\\"')}"`,
  `target_media: "${targetMedia.replace(/"/g, '\\"')}"`,
  `post_to_wp: ${postToWp}`
].join('\n') + '\n';
if (!existsSync(path.join(dir, 'input.yml')) || (await readFile(path.join(dir, 'input.yml'), 'utf8')).trim() === '') {
  await writeFile(path.join(dir, 'input.yml'), normalizedInput, 'utf8');
}
const report = warnings.length ? `\nWarnings:\n${warnings.map((w) => `- ${w}`).join('\n')}` : '';
console.log(`Created ${dir}${report}`);
