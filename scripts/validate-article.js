import fs from 'node:fs';

const [, , inputPath] = process.argv;

if (!inputPath) {
  console.error('Usage: npm run validate -- drafts/article.md');
  process.exit(1);
}

const text = fs.readFileSync(inputPath, 'utf8');
const body = text.replace(/^---[\s\S]*?---\s*/, '');
const h1Count = (body.match(/^# /gm) || []).length;
const h2Count = (body.match(/^## /gm) || []).length;
const charCount = body.replace(/\s/g, '').length;
const banned = ['絶対に', '必ず稼げる', '100%'];
const foundBanned = banned.filter((word) => body.includes(word));

let hasError = false;

if (h1Count !== 1) {
  console.error(`H1 must be exactly 1. Current: ${h1Count}`);
  hasError = true;
}

if (h2Count < 2) {
  console.error(`H2 should be 2 or more. Current: ${h2Count}`);
  hasError = true;
}

if (foundBanned.length > 0) {
  console.error(`Banned expressions found: ${foundBanned.join(', ')}`);
  hasError = true;
}

console.log(`Character count: ${charCount}`);
console.log(`H1 count: ${h1Count}`);
console.log(`H2 count: ${h2Count}`);

if (hasError) process.exit(1);
console.log('Validation passed.');
