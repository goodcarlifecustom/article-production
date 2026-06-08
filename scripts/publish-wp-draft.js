import fs from 'node:fs';
import dotenv from 'dotenv';
import { marked } from 'marked';

dotenv.config();

const [, , inputPath] = process.argv;

if (!inputPath) {
  console.error('Usage: npm run wp:draft -- drafts/article.md');
  process.exit(1);
}

const { WP_BASE_URL, WP_USERNAME, WP_APP_PASSWORD } = process.env;

if (!WP_BASE_URL || !WP_USERNAME || !WP_APP_PASSWORD) {
  console.error('Missing WordPress environment variables. Check .env file.');
  process.exit(1);
}

const markdown = fs.readFileSync(inputPath, 'utf8');
const { body, meta } = parseFrontMatter(markdown);
const content = marked.parse(body);
const title = meta.title || extractH1(body) || 'Untitled article';
const slug = meta.slug || slugify(title);
const excerpt = meta.excerpt || '';

const auth = Buffer.from(`${WP_USERNAME}:${WP_APP_PASSWORD}`).toString('base64');
const endpoint = `${WP_BASE_URL.replace(/\/$/, '')}/wp-json/wp/v2/posts`;

const response = await fetch(endpoint, {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title,
    content,
    slug,
    excerpt,
    status: 'draft'
  })
});

if (!response.ok) {
  const errorText = await response.text();
  console.error(`WordPress API error: ${response.status}`);
  console.error(errorText);
  process.exit(1);
}

const post = await response.json();
console.log('Draft created successfully.');
console.log(`Post ID: ${post.id}`);
console.log(`Edit link: ${post.link}`);

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

function extractH1(text) {
  const match = text.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : '';
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}
