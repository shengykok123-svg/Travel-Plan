// Copy the static site into public/ for Cloudflare Pages.
import { cpSync, rmSync, mkdirSync, existsSync } from 'node:fs';
rmSync('public', { recursive: true, force: true });
mkdirSync('public');
for (const p of ['index.html', 'img', 'CREDITS.md', 'xian']) if (existsSync(p)) cpSync(p, `public/${p}`, { recursive: true });
console.log('built public/');
