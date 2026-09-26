# 粤港澳九日行 · Travel Plan

A single-page trip planner in a travel-journal style (postcards, polaroids, washi tape, notebook pages) for a 9-day trip to Shenzhen, Hong Kong, Macau, Zhuhai and Guangzhou (10/9 – 10/17, 2026), for 5 people.

## Features

- **总览**: the whole trip at a glance, with per-person cost for each day
- **每日行程**: hour-by-hour schedule you can edit, a "today at a glance" bar, and Xiaohongshu / Google Maps links for every stop
- **旅途中**: tear-off calendar countdown, a time slider to preview any moment, what is happening now and the next 6 stops (Beijing time)
- **地图**: schematic map of the Pearl River Delta with every stop and the day's route
- **美食**: swap restaurants for each meal (2–4 options with photos, ratings and links), plus a must-eat list with photo galleries
- **住宿选择**: 3 hotel options per city, priced for a twin room + a triple room
- **订票清单**: split into "must book in advance" and "can book on the day"
- **预算**: per-person and total budget in RMB and MYR, adjustable exchange rates

## Run it

Open `index.html` in a browser, or enable GitHub Pages on this repo. No build step.

When opened outside claude.ai, edits are saved in the browser's localStorage only (shared editing needs the claude.ai artifact). Use 设置 → 备份与分享 to export or import the plan as text.

## Notes

Prices, opening hours and ratings are estimates; check the booking pages and review links before you go. Photo credits are in [CREDITS.md](CREDITS.md).

## 西安版 · Xi'an

A second planner in the same journal style lives in [`xian/`](xian/): 9 days, 8 nights in Xi'an for 4 people (Hainan Airlines via Haikou, 10/8 – 10/17, 2026), with 兵马俑, 华清宫《长恨歌》, 华山, 陕历博, 袁家村 and 大明宫. Open `xian/index.html`, or visit `/Travel-Plan/xian/` on GitHub Pages. Photo credits are in [xian/CREDITS.md](xian/CREDITS.md).

## Cloudflare version (accounts, profiles, shared editing)

The same `index.html` switches to cloud mode when it is served by Cloudflare Pages with the API in `functions/`:

- Login with an email one-time code through **Cloudflare Access** (only emails on the Access policy can open the site)
- Each person fills in a profile: name, phone, avatar colour, room, dietary notes
- Everyone edits one shared plan (D1 database). Saves use a revision number; if two people save at once, the later edit is replayed on top of the newer plan instead of overwriting it
- 同伴 page: companion cards (phone, WhatsApp link, room, bookings still to do) and a change log
- 分账 page: record who paid for what, split evenly, balances in MYR and the fewest transfers to settle up
- Booking checklist: assign who books each item; the stamp shows who booked it

Setup:

1. `npm install`, then `npx wrangler login`
2. `npx wrangler d1 create travel-plan` and put the id in `wrangler.toml`
3. Create a Cloudflare Access self-hosted application for the Pages domain (and `*.<project>.pages.dev`), with an Allow policy listing the travellers' emails and the One-time PIN login method
4. Put the team domain (`<team>.cloudflareaccess.com`) and the application AUD tag in `wrangler.toml` under `[vars]`
5. `npm run deploy` (builds `public/`, applies D1 migrations, deploys)

Local development: `npm run dev` runs with `DEV_MODE=1`, which trusts an `x-dev-email` header (set `localStorage.devEmail` in the browser). Never set `DEV_MODE` in production.
