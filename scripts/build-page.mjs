// Assemble index.html from src/. Edit files in src/, then run `npm run page`.
import { readFileSync, writeFileSync } from 'node:fs';
const r = (f) => readFileSync(new URL(`../src/${f}`, import.meta.url), 'utf8');
const code = [r('data.js'), r('meal-options.js'), r('app.js'), r('cloud.js')].join('\n');
const body = `${r('page.html')}\n<script>\n${code}\n</script>\n`;
const html = `<!doctype html>\n<html lang="zh-CN">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>\n</head>\n<body>\n${body}\n</body>\n</html>\n`;
writeFileSync(new URL('../index.html', import.meta.url), html);
console.log('index.html built');
