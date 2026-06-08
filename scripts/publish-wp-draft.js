import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { marked } from 'marked';

dotenv.config();

const [, , inputPath] = process.argv;
const TARGET_ORIGIN = 'https://www.atarijo.com';
const TARGET_PATH = '/media';
const POST_STATUS = 'draft';

if (!inputPath) {
  console.error('Usage: npm run wp:draft -- public/article.html');
  process.exit(1);
}

const { WP_BASE_URL, WP_USERNAME, WP_APP_PASSWORD } = process.env;

if (!WP_BASE_URL || !WP_USERNAME || !WP_APP_PASSWORD) {
  console.error('Missing WordPress environment variables. Set WP_BASE_URL, WP_USERNAME, and WP_APP_PASSWORD.');
  process.exit(1);
}

const baseUrl = validateWordPressBaseUrl(WP_BASE_URL);
const source = fs.readFileSync(inputPath, 'utf8');
const article = buildArticle(inputPath, source);
const auth = Buffer.from(`${WP_USERNAME}:${WP_APP_PASSWORD}`).toString('base64');
const endpoint = `${baseUrl}/wp-json/wp/v2/posts`;

const response = await fetch(endpoint, {
  method: 'POST',
  headers: {
    Authorization: `Basic ${auth}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: article.title,
    content: article.content,
    slug: article.slug,
    excerpt: article.excerpt,
    status: POST_STATUS
  })
});

if (!response.ok) {
  const errorText = await response.text();
  console.error(`WordPress API error: ${response.status}`);
  console.error(errorText);
  process.exit(1);
}

const post = await response.json();
const editUrl = `${baseUrl}/wp-admin/post.php?post=${post.id}&action=edit`;

console.log('Draft created successfully.');
console.log(`Post ID: ${post.id}`);
console.log(`Status: ${post.status}`);
console.log(`Edit URL: ${editUrl}`);

if (post.status !== POST_STATUS) {
  console.error(`Unexpected WordPress status: ${post.status}`);
  process.exit(1);
}

function validateWordPressBaseUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    console.error('WP_BASE_URL is not a valid URL.');
    process.exit(1);
  }

  const normalizedPath = url.pathname.replace(/\/+$/, '') || '/';
  if (url.origin !== TARGET_ORIGIN || normalizedPath !== TARGET_PATH) {
    console.error(`WP_BASE_URL must be ${TARGET_ORIGIN}${TARGET_PATH}`);
    process.exit(1);
  }

  return `${TARGET_ORIGIN}${TARGET_PATH}`;
}

function buildArticle(filePath, sourceText) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.html' || ext === '.htm') {
    return buildHtmlArticle(filePath, sourceText);
  }

  return buildMarkdownArticle(sourceText);
}

function buildHtmlArticle(filePath, html) {
  const title = decodeHtml(extractHtmlTag(html, 'title') || extractHtmlTag(html, 'h1') || 'Untitled article');
  const excerpt = decodeHtml(extractMetaContent(html, 'description'));
  const body = extractHtmlBody(html).trim() || html.trim();

  return {
    title,
    content: body,
    slug: slugify(path.basename(filePath, path.extname(filePath))) || slugify(title),
    excerpt
  };
}

function buildMarkdownArticle(markdown) {
  const { body, meta } = parseFrontMatter(markdown);
  const title = meta.title || extractH1(body) || 'Untitled article';

  return {
    title,
    content: marked.parse(body),
    slug: meta.slug || slugify(title),
    excerpt: meta.excerpt || ''
  };
}

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

function extractHtmlBody(html) {
  const match = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  return match ? match[1] : '';
}

function extractHtmlTag(html, tagName) {
  const pattern = new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = html.match(pattern);
  return match ? stripTags(match[1]).trim() : '';
}

function extractMetaContent(html, name) {
  const pattern = new RegExp(`<meta\\b(?=[^>]*\\bname=["']${escapeRegExp(name)}["'])(?=[^>]*\\bcontent=["']([^"']*)["'])[^>]*>`, 'i');
  const match = html.match(pattern);
  return match ? match[1].trim() : '';
}

function extractH1(text) {
  const match = text.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : '';
}

function stripTags(value) {
  return value.replace(/<[^>]+>/g, '');
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}
