const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');

for (const page of ['index.html', 'biography.html']) {
  const html = readFileSync(page, 'utf8');
  assert.doesNotMatch(html, /data-non-eu-text|research-region\.js/, page);
  assert.ok(html.includes('applications in control and spatiotemporal data modeling'), page);
}

const homepage = readFileSync('index.html', 'utf8');
assert.ok(homepage.includes('applications in robotic, motion, and process control'));

for (const page of ['biography.html', 'research.html', 'research-high-precision-control.html']) {
  const html = readFileSync(page, 'utf8');
  assert.match(html, /<h[1-3]>(?:<a\b[^>]*>)?Control applications(?:<\/a>)?<\/h[1-3]>/, page);
}
