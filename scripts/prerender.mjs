import { chromium } from 'playwright';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import http from 'http';

/**
 * Prerender the public, content-bearing pages to static HTML so crawlers
 * (including AdSense's weaker crawler) see the actual question content
 * instead of an empty <div id="root">.
 *
 * Runs: `node scripts/prerender.mjs` after `npm run build`.
 * Writes: dist/<route>/index.html for each public route.
 */

const DIST = path.resolve('dist');
const PORT = 5174;

const PUBLIC_ROUTES = [
  '/',
  '/past-questions',
  '/past-questions/english',
  '/past-questions/mathematics',
  '/past-questions/physics',
  '/past-questions/chemistry',
  '/past-questions/biology',
  '/past-questions/literature',
  '/past-questions/government',
  '/past-questions/economics',
  '/past-questions/geography',
  '/past-questions/agricultural_science',
  '/about',
  '/contact',
  '/terms',
  '/privacy',
];

async function main() {
  console.log('[prerender] building app...');
  execSync('npx vite build', { stdio: 'inherit', cwd: process.cwd() });

  // Serve dist/ locally so Playwright can render the SPA routes.
  const server = http.createServer((req, res) => {
    let filePath = path.join(
      DIST,
      req.url === '/' || !req.url ? '/index.html' : req.url,
    );
    fs.stat(filePath, (err, stat) => {
      if (!err && stat.isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }
      fs.readFile(filePath, (readErr, data) => {
        if (readErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not found');
          return;
        }
        const ext = path.extname(filePath);
        const types = {
          '.html': 'text/html',
          '.css': 'text/css',
          '.js': 'application/javascript',
          '.json': 'application/json',
          '.svg': 'image/svg+xml',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.ico': 'image/x-icon',
          '.webmanifest': 'application/manifest+json',
        };
        res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
        res.end(data);
      });
    });
  });

  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`[prerender] local server on http://localhost:${PORT}`);

  const chromiumExe =
  process.env.PW_CHROMIUM_EXE ||
  path.join(
    process.env.LOCALAPPDATA || '',
    'ms-playwright',
    'chromium-1228',
    'chrome-win64',
    'chrome.exe',
  );
  const browser = await chromium.launch({
  headless: true,
  executablePath: chromiumExe,
});
  const page = await browser.newPage();

  for (const route of PUBLIC_ROUTES) {
    const url = `http://localhost:${PORT}${route}`;
    console.log(`[prerender] rendering ${route}...`);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });

      // Give any late Supabase-fetched content (preview questions) a moment.
      await page.waitForTimeout(1500);

      const html = await page.content();

      let outPath;
      if (route === '/') {
        outPath = path.join(DIST, 'index.html');
      } else {
        outPath = path.join(DIST, route, 'index.html');
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
      }
      fs.writeFileSync(outPath, html, 'utf8');
      console.log(`[prerender]   wrote ${outPath}`);
    } catch (err) {
      console.error(`[prerender]   FAILED ${route}: ${err.message}`);
    }
  }

  await browser.close();
  server.close();
  console.log('[prerender] done');
}

main().catch((err) => {
  console.error('[prerender] fatal:', err);
  process.exit(1);
});
