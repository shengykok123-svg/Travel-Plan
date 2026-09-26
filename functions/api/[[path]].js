// Travel-plan API for Cloudflare Pages Functions + D1.
// Every request must come through Cloudflare Access; the Access JWT is verified here.

const ROOMS = ['twin', 'triple', ''];
const CURS = ['MYR', 'CNY', 'HKD', 'MOP'];
const PHONE_RE = /^\+?[0-9][0-9\s-]{6,19}$/;
const COLOR_RE = /^#[0-9a-fA-F]{6}$/;

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});
const now = () => Date.now();
const clip = (s, n) => String(s == null ? '' : s).trim().slice(0, n);

/* ---------- Cloudflare Access JWT ---------- */
const b64u = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=')), (c) => c.charCodeAt(0));
let certCache = { at: 0, keys: [] };
async function accessKeys(team) {
  if (now() - certCache.at < 3600e3 && certCache.keys.length) return certCache.keys;
  const r = await fetch(`https://${team}/cdn-cgi/access/certs`);
  if (!r.ok) throw new Error('certs');
  const { keys } = await r.json();
  certCache = { at: now(), keys };
  return keys;
}
async function verifyAccess(token, env) {
  const [h, p, s] = token.split('.');
  if (!h || !p || !s) return null;
  const header = JSON.parse(new TextDecoder().decode(b64u(h)));
  const payload = JSON.parse(new TextDecoder().decode(b64u(p)));
  const jwk = (await accessKeys(env.TEAM_DOMAIN)).find((k) => k.kid === header.kid);
  if (!jwk) return null;
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64u(s), new TextEncoder().encode(`${h}.${p}`));
  if (!ok) return null;
  const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!aud.includes(env.POLICY_AUD)) return null;
  if (payload.iss !== `https://${env.TEAM_DOMAIN}`) return null;
  if (!payload.exp || payload.exp * 1000 < now()) return null;
  return payload.email ? String(payload.email).toLowerCase() : null;
}
async function whoAmI(request, env) {
  // Local development only: `wrangler pages dev` with DEV_MODE=1 accepts an x-dev-email header.
  if (env.DEV_MODE === '1') return (request.headers.get('x-dev-email') || env.DEV_EMAIL || '').toLowerCase() || null;
  if (!env.TEAM_DOMAIN || !env.POLICY_AUD) return { error: 'not_configured' };
  const token = request.headers.get('cf-access-jwt-assertion');
  if (!token) return null;
  try { return await verifyAccess(token, env); } catch { return null; }
}

/* ---------- db helpers ---------- */
const bump = (db, k) => db.prepare("INSERT INTO meta(k,v) VALUES(?,1) ON CONFLICT(k) DO UPDATE SET v=v+1").bind(k);
const memberRow = (m) => m && ({ email: m.email, name: m.name, phone: m.phone, color: m.color, room: m.room, diet: m.diet, isAdmin: !!m.is_admin });
async function getMember(db, email) { return db.prepare('SELECT * FROM members WHERE email=?').bind(email).first(); }
async function addLog(db, email, texts) {
  const list = (Array.isArray(texts) ? texts : [texts]).map((t) => clip(t, 200)).filter(Boolean).slice(0, 8);
  if (!list.length) return [];
  return list.map((t) => db.prepare('INSERT INTO log(at,email,text) VALUES(?,?,?)').bind(now(), email, t));
}

/* ---------- handlers ---------- */
async function handle(request, env, parts) {
  const db = env.DB;
  const who = await whoAmI(request, env);
  if (who && who.error) return json({ error: 'Login is not configured on the server yet (TEAM_DOMAIN / POLICY_AUD).' }, 503);
  if (!who) return json({ error: 'Not signed in through Cloudflare Access.' }, 401);
  const email = who;
  const me = await getMember(db, email);
  const method = request.method;
  const [res, id] = parts;
  const body = method === 'PUT' || method === 'POST' ? await request.json().catch(() => ({})) : {};
  const needMember = () => (me ? null : json({ error: 'Fill in your profile first.' }, 403));

  // who am I + my profile
  if (res === 'me') {
    if (method === 'GET') return json({ email, member: memberRow(me) });
    if (method === 'PUT') {
      const name = clip(body.name, 40), phone = clip(body.phone, 24).replace(/\s+/g, ' ');
      if (!name) return json({ error: '请填写名字' }, 400);
      if (!PHONE_RE.test(phone)) return json({ error: '电话号码格式不对，例子：+60 12-345 6789' }, 400);
      const color = COLOR_RE.test(body.color || '') ? body.color : '#c67139';
      const room = ROOMS.includes(body.room) ? body.room : '';
      const diet = clip(body.diet, 100);
      const count = (await db.prepare('SELECT COUNT(*) AS n FROM members').first()).n;
      const stmts = [
        db.prepare(`INSERT INTO members(email,name,phone,color,room,diet,is_admin,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)
          ON CONFLICT(email) DO UPDATE SET name=excluded.name,phone=excluded.phone,color=excluded.color,room=excluded.room,diet=excluded.diet,updated_at=excluded.updated_at`)
          .bind(email, name, phone, color, room, diet, count === 0 ? 1 : 0, now(), now()),
        bump(db, 'members'),
        ...(await addLog(db, email, me ? '更新了个人资料' : `${name} 加入了行程`)),
      ];
      await db.batch(stmts);
      return json({ email, member: memberRow(await getMember(db, email)) });
    }
  }

  if (res === 'members') {
    if (method === 'GET') {
      if (!me) return json({ members: [] });
      const { results } = await db.prepare('SELECT * FROM members ORDER BY created_at').all();
      return json({ members: results.map(memberRow) });
    }
    if (method === 'DELETE' && id) {
      if (!me || !me.is_admin) return json({ error: '只有管理员可以移除同伴' }, 403);
      const target = decodeURIComponent(id).toLowerCase();
      if (target === email) return json({ error: '不能移除自己' }, 400);
      const t = await getMember(db, target);
      if (!t) return json({ error: '找不到这个同伴' }, 404);
      await db.batch([db.prepare('DELETE FROM members WHERE email=?').bind(target), bump(db, 'members'), ...(await addLog(db, email, `移除了 ${t.name}`))]);
      return json({ ok: true });
    }
  }

  // the shared trip plan, with optimistic concurrency on rev
  if (res === 'plan') {
    if (method === 'GET') {
      const row = await db.prepare("SELECT data,rev,updated_at,updated_by FROM plan WHERE id='main'").first();
      return json(row ? { data: JSON.parse(row.data), rev: row.rev, updatedAt: row.updated_at, updatedBy: row.updated_by } : { data: null, rev: 0 });
    }
    if (method === 'PUT') {
      const deny = needMember(); if (deny) return deny;
      const data = body.data, baseRev = Number(body.baseRev) || 0;
      if (!data || !Array.isArray(data.days)) return json({ error: 'bad plan' }, 400);
      const text = JSON.stringify(data);
      if (text.length > 900000) return json({ error: 'plan too large' }, 413);
      let r;
      if (baseRev === 0) r = await db.prepare("INSERT OR IGNORE INTO plan(id,data,rev,updated_at,updated_by) VALUES('main',?,1,?,?)").bind(text, now(), email).run();
      else r = await db.prepare("UPDATE plan SET data=?,rev=rev+1,updated_at=?,updated_by=? WHERE id='main' AND rev=?").bind(text, now(), email, baseRev).run();
      if (!r.meta.changes) {
        const cur = await db.prepare("SELECT data,rev FROM plan WHERE id='main'").first();
        return json({ conflict: true, data: cur ? JSON.parse(cur.data) : null, rev: cur ? cur.rev : 0 }, 409);
      }
      const logs = await addLog(db, email, body.log);
      if (logs.length) await db.batch(logs);
      const cur = await db.prepare("SELECT rev FROM plan WHERE id='main'").first();
      return json({ rev: cur.rev });
    }
  }

  if (res === 'log' && method === 'GET') {
    if (!me) return json({ log: [] });
    const { results } = await db.prepare('SELECT id,at,email,text FROM log ORDER BY id DESC LIMIT 80').all();
    return json({ log: results });
  }

  if (res === 'expenses') {
    if (!me) return json({ expenses: [] });
    if (method === 'GET') {
      const { results } = await db.prepare('SELECT * FROM expenses WHERE deleted=0 ORDER BY day DESC, id DESC').all();
      return json({ expenses: results.map((e) => ({ ...e, split: JSON.parse(e.split || '[]') })) });
    }
    if (method === 'POST') {
      const { results } = await db.prepare('SELECT email,name FROM members').all();
      const emails = new Set(results.map((m) => m.email));
      const amount = Number(body.amount), cur = body.cur, payer = String(body.payer || '').toLowerCase();
      const split = [...new Set((body.split || []).map((s) => String(s).toLowerCase()))].filter((s) => emails.has(s));
      const descr = clip(body.descr, 80), day = /^\d{4}-\d{2}-\d{2}$/.test(body.day || '') ? body.day : new Date(now() + 8 * 3600e3).toISOString().slice(0, 10);
      if (!descr) return json({ error: '请写一下是什么花费' }, 400);
      if (!(amount > 0 && amount < 1e6)) return json({ error: '金额不对' }, 400);
      if (!CURS.includes(cur)) return json({ error: '币种不对' }, 400);
      if (!emails.has(payer)) return json({ error: '付钱的人不在同伴名单里' }, 400);
      if (!split.length) return json({ error: '至少选一个人分摊' }, 400);
      const payerName = results.find((m) => m.email === payer).name;
      await db.batch([
        db.prepare('INSERT INTO expenses(at,day,payer,amount,cur,descr,split,created_by) VALUES(?,?,?,?,?,?,?,?)').bind(now(), day, payer, amount, cur, descr, JSON.stringify(split), email),
        bump(db, 'expenses'),
        ...(await addLog(db, email, `记了一笔账：${descr} ${cur} ${amount}（${payerName} 付）`)),
      ]);
      return json({ ok: true });
    }
    if (method === 'DELETE' && id) {
      const e = await db.prepare('SELECT descr FROM expenses WHERE id=? AND deleted=0').bind(Number(id)).first();
      if (!e) return json({ error: '找不到这笔账' }, 404);
      await db.batch([db.prepare('UPDATE expenses SET deleted=1 WHERE id=?').bind(Number(id)), bump(db, 'expenses'), ...(await addLog(db, email, `删除了一笔账：${e.descr}`))]);
      return json({ ok: true });
    }
  }

  // cheap change check the page calls every few seconds
  if (res === 'poll' && method === 'GET') {
    const plan = await db.prepare("SELECT rev FROM plan WHERE id='main'").first();
    const logMax = await db.prepare('SELECT MAX(id) AS m FROM log').first();
    const { results } = await db.prepare('SELECT k,v FROM meta').all();
    const meta = Object.fromEntries(results.map((r) => [r.k, r.v]));
    return json({ rev: plan ? plan.rev : 0, log: logMax.m || 0, expenses: meta.expenses || 0, members: meta.members || 0 });
  }

  return json({ error: 'not found' }, 404);
}

export async function onRequest({ request, env, params }) {
  const parts = [].concat(params.path || []);
  try { return await handle(request, env, parts); }
  catch (e) { return json({ error: 'server error' }, 500); }
}
