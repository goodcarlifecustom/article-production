import 'dotenv/config';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
function frontMatterValue(text, key) {
  const m = text.match(new RegExp(`^${key}:\\s*["']?(.+?)["']?\\s*$`, 'm'));
  return m?.[1];
}
function yamlBoolean(text, key) {
  const value = frontMatterValue(text, key);
  return value === 'true';
}
function visibleTextLength(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--([\s\S]*?)-->/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, '')
    .length;
}
async function writeFailure(dir, message, details = '') {
  await mkdir(dir, { recursive: true });
  const report = `# WordPress下書き投稿失敗\n\n- reason: ${message}${details ? `\n- details: ${details}` : ''}\n`;
  await writeFile(path.join(dir, 'check-report.md'), report, 'utf8');
  console.error(report);
}

const slug = arg('slug');
if (!slug) {
  console.error('Usage: npm run post -- --slug slug');
  process.exit(1);
}
const dir = path.join('articles', slug);
const input = await readFile(path.join(dir, 'input.yml'), 'utf8').catch(() => '');
if (!yamlBoolean(input, 'post_to_wp')) {
  await writeFailure(dir, 'post_to_wp が true ではないため、WordPress下書き投稿を停止しました。');
  process.exit(1);
}
const title = frontMatterValue(input, 'title') || slug;
let content;
try {
  content = await readFile(path.join(dir, 'article-decorated.html'), 'utf8');
} catch (error) {
  await writeFailure(dir, 'article-decorated.html が存在しないため、WordPress下書き投稿を停止しました。', error.message);
  process.exit(1);
}
const textLength = visibleTextLength(content);
if (textLength < 500) {
  await writeFailure(dir, 'NG: article-decorated.html の本文文字数が500文字未満です。WordPress投稿を停止しました。', `本文文字数: ${textLength}`);
  process.exit(1);
}
const status = process.env.WP_DEFAULT_STATUS || 'draft';
if (status !== 'draft') {
  await writeFailure(dir, 'WP_DEFAULT_STATUS must be draft.');
  process.exit(1);
}
const root = process.env.WP_REST_ROOT;
const user = process.env.WP_USERNAME;
const pass = process.env.WP_APP_PASSWORD;
if (!root || !user || !pass) {
  await writeFailure(dir, 'WP_REST_ROOT, WP_USERNAME, and WP_APP_PASSWORD are required.');
  process.exit(1);
}
const beforeLength = content.length;
const endpoint = new URL('wp/v2/posts', root).toString();
const auth = Buffer.from(`${user}:${pass}`).toString('base64');
const res = await fetch(endpoint, {
  method: 'POST',
  headers: {
    authorization: `Basic ${auth}`,
    'content-type': 'application/json'
  },
  body: JSON.stringify({ title, slug, content, status: 'draft' })
});
const json = await res.json().catch(() => ({}));
if (!res.ok) {
  await writeFailure(dir, `WordPress API error: ${res.status}`, JSON.stringify(json, null, 2));
  process.exit(1);
}
const afterContent = json.content?.raw || json.content?.rendered || '';
const result = `# WordPress下書き投稿結果\n\n- 投稿ID: ${json.id}\n- 編集URL: ${root.replace(/wp-json\/?$/, '')}wp-admin/post.php?post=${json.id}&action=edit\n- 確認URL: ${json.link || ''}\n- status: ${json.status}\n- 投稿前本文文字数: ${beforeLength}\n- 投稿後本文文字数: ${afterContent.length}\n`;
await writeFile(path.join(dir, 'wp-result.md'), result, 'utf8');
console.log(result);
