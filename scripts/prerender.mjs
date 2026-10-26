import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { paths, render, favicon } from '../.ssr/entry-server.js';
const output = path.resolve('dist');
const template = await readFile(path.join(output, 'index.html'), 'utf8');
const escape = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
const unique = new Set(paths);
if (unique.size !== paths.length) throw new Error('Duplicate page paths');
for (const route of [...paths, '/404.html']) {
  const { html, title } = render(route);
  const target =
    route === '/404.html'
      ? path.join(output, '404.html')
      : path.join(output, route.slice(1), 'index.html');
  if (!target.startsWith(`${output}${path.sep}`))
    throw new Error(`Invalid route: ${route}`);
  const page = template
    .replace(/<title>.*?<\/title>/s, `<title>${escape(title)}</title>`)
    .replace(
      /<link rel="icon"[^>]*>/,
      `<link rel="icon" href="${escape(favicon)}" />`,
    )
    .replace('<div id="root"></div>', () => `<div id="root">${html}</div>`);
  if (!page.includes('<main')) throw new Error(`Prerender failed for ${route}`);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, page);
}
await writeFile(path.join(output, '.nojekyll'), '');
console.log(`Prerendered ${paths.length} pages and 404.html into dist/`);
