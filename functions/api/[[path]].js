// Travel-plan API for Cloudflare Pages Functions + D1.
// Accounts are simple: phone number + password, a session cookie, and an invite code to register.
// The account id is stored in the `email` column as "p:<digits>" (kept for schema compatibility).

const ROOMS = ['twin', 'triple', ''];
const CURS = ['MYR', 'CNY', 'HKD', 'MOP'];
const PHONE_RE = /^\+?[0-9][0-9\s-]{6,19}$/;
const COLOR_RE = /^#[0-9a-fA-F]{6}$/;
const SESSION_DAYS = 60;
const COOKIE = 'tp_session';

const now = () => Date.now();
const clip = (s, n) => String(s == null ? '' : s).trim().slice(0, n);
const json = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
});

/* ---------- crypto helpers ---------- */
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const randHex = (n) => hex(crypto.getRandomValues(new Uint8Array(n)));
const sha256 = async (s) => hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)));
async function hashPassword(pw, saltHex) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveBits']);
  const salt = Uint8Array.from(saltHex.match(/../g).map((h) => parseInt(h, 16)));
  return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100000 }, key, 256));
}
function safeEqual(a, b) { if (a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0; }
// Malaysian numbers written as 012-345 6789 become 60123456789, so both forms log in to the same account
function phoneId(phone) { let d = String(phone || '').replace(/[^\d+]/g, ''); if (d.startsWith('+')) d = d.slice(1); else if (d.startsWith('0')) d = '60' + d.slice(1); return d.length >= 8 ? 'p:' + d : null; }
const inviteCode = () => { const a = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; return [...crypto.getRandomValues(new Uint8Array(6))].map((x) => a[x % a.length]).join(''); };

/* ---------- sessions ---------- */
function readCookie(request, name) { const m = (request.headers.get('cookie') || '').match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)')); return m ? m[1] : null; }
function sessionCookie(request, token, maxAge) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}
async function newSession(db, request, id) {
  const token = randHex(32);
  await db.prepare('INSERT INTO sessions(token_hash,email,created_at,expires_at) VALUES(?,?,?,?)').bind(await sha256(token), id, now(), now() + SESSION_DAYS * 864e5).run();
  return sessionCookie(request, token, SESSION_DAYS * 86400);
}
async function whoAmI(request, env) {
  if (env.DEV_MODE === '1' && request.headers.get('x-dev-email')) return request.headers.get('x-dev-email').toLowerCase();
  const token = readCookie(request, COOKIE);
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return null;
  const s = await env.DB.prepare('SELECT email,expires_at FROM sessions WHERE token_hash=?').bind(await sha256(token)).first();
  if (!s || s.expires_at < now()) return null;
  return s.email;
}

/* ---------- db helpers ---------- */
const bump = (db, k) => db.prepare('INSERT INTO meta(k,v) VALUES(?,1) ON CONFLICT(k) DO UPDATE SET v=v+1').bind(k);
const memberRow = (m) => m && ({ email: m.email, name: m.name, phone: m.phone, color: m.color, room: m.room, diet: m.diet, isAdmin: !!m.is_admin });
const getMember = (db, id) => db.prepare('SELECT * FROM members WHERE email=?').bind(id).first();
const addLog = (db, id, texts) => (Array.isArray(texts) ? texts : [texts]).map((t) => clip(t, 200)).filter(Boolean).slice(0, 8)
  .map((t) => db.prepare('INSERT INTO log(at,email,text) VALUES(?,?,?)').bind(now(), id, t));
async function getInvite(db) {
  const r = await db.prepare("SELECT v FROM kv WHERE k='invite'").first();
  if (r) return r.v;
  const code = inviteCode();
  await db.prepare("INSERT OR IGNORE INTO kv(k,v) VALUES('invite',?)").bind(code).run();
  return (await db.prepare("SELECT v FROM kv WHERE k='invite'").first()).v;
}
function profileFields(body) {
  const name = clip(body.name, 40), phone = clip(body.phone, 24).replace(/\s+/g, ' ');
  if (!name) return { error: '请填写名字' };
  if (!PHONE_RE.test(phone) || !phoneId(phone)) return { error: '电话号码格式不对，例子：+60 12-345 6789 或 012-345 6789' };
  return { name, phone, color: COLOR_RE.test(body.color || '') ? body.color : '#c67139', room: ROOMS.includes(body.room) ? body.room : '', diet: clip(body.diet, 100) };
}

/* ---------- auth endpoints (no session needed) ---------- */
async function handleAuth(request, env, action) {
  const db = env.DB;
  const body = await request.json().catch(() => ({}));
  if (action === 'status') {
    const n = (await db.prepare('SELECT COUNT(*) AS n FROM members').first()).n;
    return json({ firstUser: n === 0 });
  }
  if (action === 'register') {
    const p = profileFields(body); if (p.error) return json({ error: p.error }, 400);
    const pw = String(body.password || '');
    if (pw.length < 6) return json({ error: '密码至少 6 位' }, 400);
    const n = (await db.prepare('SELECT COUNT(*) AS n FROM members').first()).n;
    if (n > 0 && String(body.invite || '').trim().toUpperCase() !== await getInvite(db)) return json({ error: '邀请码不对。请用同伴发给你的邀请链接打开，或向管理员要邀请码。' }, 403);
    const id = phoneId(p.phone);
    if (await getMember(db, id)) return json({ error: '这个电话号码已经注册过了，请直接登录' }, 409);
    const salt = randHex(16), hash = await hashPassword(pw, salt);
    await db.batch([
      db.prepare('INSERT INTO members(email,name,phone,color,room,diet,is_admin,created_at,updated_at,pw_hash,pw_salt) VALUES(?,?,?,?,?,?,?,?,?,?,?)')
        .bind(id, p.name, p.phone, p.color, p.room, p.diet, n === 0 ? 1 : 0, now(), now(), hash, salt),
      bump(db, 'members'),
      ...addLog(db, id, `${p.name} 加入了行程`),
    ]);
    if (n === 0) await getInvite(db);
    return json({ ok: true }, 200, { 'set-cookie': await newSession(db, request, id) });
  }
  if (action === 'login') {
    const id = phoneId(body.phone), pw = String(body.password || '');
    const m = id && await getMember(db, id);
    if (!m || !m.pw_hash) return json({ error: '电话号码或密码不对' }, 401);
    if (m.locked_until > now()) return json({ error: `尝试次数太多，请 ${Math.ceil((m.locked_until - now()) / 60000)} 分钟后再试` }, 429);
    const ok = safeEqual(await hashPassword(pw, m.pw_salt), m.pw_hash);
    if (!ok) {
      const fails = (m.fails || 0) + 1;
      await db.prepare('UPDATE members SET fails=?, locked_until=? WHERE email=?').bind(fails >= 8 ? 0 : fails, fails >= 8 ? now() + 15 * 60000 : 0, id).run();
      return json({ error: '电话号码或密码不对' }, 401);
    }
    await db.prepare('UPDATE members SET fails=0, locked_until=0 WHERE email=?').bind(id).run();
    return json({ ok: true }, 200, { 'set-cookie': await newSession(db, request, id) });
  }
  if (action === 'logout') {
    const token = readCookie(request, COOKIE);
    if (token) await db.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await sha256(token)).run();
    return json({ ok: true }, 200, { 'set-cookie': sessionCookie(request, '', 0) });
  }
  return json({ error: 'not found' }, 404);
}

/* ---------- everything else needs a session ---------- */
async function handle(request, env, parts) {
  const db = env.DB;
  const [res, id, sub] = parts;
  if (res === 'auth') return handleAuth(request, env, id);
  const who = await whoAmI(request, env);
  if (!who) {
    const n = (await db.prepare('SELECT COUNT(*) AS n FROM members').first()).n;
    return json({ error: 'login', firstUser: n === 0 }, 401);
  }
  const me = await getMember(db, who);
  if (!me) return json({ error: 'login', firstUser: false }, 401, { 'set-cookie': sessionCookie(request, '', 0) });
  const method = request.method;
  const body = method === 'PUT' || method === 'POST' ? await request.json().catch(() => ({})) : {};

  if (res === 'me') {
    if (method === 'GET') return json({ email: who, member: memberRow(me) });
    if (method === 'PUT') {
      const p = profileFields(body); if (p.error) return json({ error: p.error }, 400);
      if (phoneId(p.phone) !== who) return json({ error: '电话号码是登录账号，不能在这里改。要换号码请重新注册。' }, 400);
      const stmts = [db.prepare('UPDATE members SET name=?,phone=?,color=?,room=?,diet=?,updated_at=? WHERE email=?').bind(p.name, p.phone, p.color, p.room, p.diet, now(), who), bump(db, 'members'), ...addLog(db, who, '更新了个人资料')];
      if (body.newPassword) {
        if (String(body.newPassword).length < 6) return json({ error: '新密码至少 6 位' }, 400);
        const salt = randHex(16);
        stmts.push(db.prepare('UPDATE members SET pw_hash=?,pw_salt=? WHERE email=?').bind(await hashPassword(String(body.newPassword), salt), salt, who));
      }
      await db.batch(stmts);
      return json({ email: who, member: memberRow(await getMember(db, who)) });
    }
  }

  if (res === 'invite') {
    if (!me.is_admin) return json({ error: '只有管理员可以看邀请码' }, 403);
    if (method === 'GET') return json({ code: await getInvite(db) });
    if (method === 'POST') { const code = inviteCode(); await db.prepare("INSERT INTO kv(k,v) VALUES('invite',?) ON CONFLICT(k) DO UPDATE SET v=excluded.v").bind(code).run(); return json({ code }); }
  }

  if (res === 'members') {
    if (method === 'GET') { const { results } = await db.prepare('SELECT * FROM members ORDER BY created_at').all(); return json({ members: results.map(memberRow) }); }
    const target = id ? decodeURIComponent(id) : '';
    if (!me.is_admin) return json({ error: '只有管理员可以这样做' }, 403);
    const t = target && await getMember(db, target);
    if (!t) return json({ error: '找不到这个同伴' }, 404);
    if (method === 'POST' && sub === 'reset') {
      const temp = randHex(4), salt = randHex(16);
      await db.batch([db.prepare('UPDATE members SET pw_hash=?,pw_salt=?,fails=0,locked_until=0 WHERE email=?').bind(await hashPassword(temp, salt), salt, target), db.prepare('DELETE FROM sessions WHERE email=?').bind(target), ...addLog(db, who, `重设了 ${t.name} 的密码`)]);
      return json({ temp });
    }
    if (method === 'DELETE') {
      if (target === who) return json({ error: '不能移除自己' }, 400);
      await db.batch([db.prepare('DELETE FROM members WHERE email=?').bind(target), db.prepare('DELETE FROM sessions WHERE email=?').bind(target), bump(db, 'members'), ...addLog(db, who, `移除了 ${t.name}`)]);
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
      const data = body.data, baseRev = Number(body.baseRev) || 0;
      if (!data || !Array.isArray(data.days) || !data.days.length) return json({ error: 'bad plan' }, 400);
      const text = JSON.stringify(data);
      if (text.length > 900000) return json({ error: 'plan too large' }, 413);
      const r = baseRev === 0
        ? await db.prepare("INSERT OR IGNORE INTO plan(id,data,rev,updated_at,updated_by) VALUES('main',?,1,?,?)").bind(text, now(), who).run()
        : await db.prepare("UPDATE plan SET data=?,rev=rev+1,updated_at=?,updated_by=? WHERE id='main' AND rev=?").bind(text, now(), who, baseRev).run();
      if (!r.meta.changes) {
        const cur = await db.prepare("SELECT data,rev FROM plan WHERE id='main'").first();
        return json({ conflict: true, data: cur ? JSON.parse(cur.data) : null, rev: cur ? cur.rev : 0 }, 409);
      }
      const logs = addLog(db, who, body.log); if (logs.length) await db.batch(logs);
      return json({ rev: (await db.prepare("SELECT rev FROM plan WHERE id='main'").first()).rev });
    }
  }

  if (res === 'log' && method === 'GET') {
    const { results } = await db.prepare('SELECT id,at,email,text FROM log ORDER BY id DESC LIMIT 80').all();
    return json({ log: results });
  }

  if (res === 'expenses') {
    if (method === 'GET') {
      const { results } = await db.prepare('SELECT * FROM expenses WHERE deleted=0 ORDER BY day DESC, id DESC').all();
      return json({ expenses: results.map((e) => ({ ...e, split: JSON.parse(e.split || '[]') })) });
    }
    if (method === 'POST') {
      const { results } = await db.prepare('SELECT email,name FROM members').all();
      const ids = new Set(results.map((m) => m.email));
      const amount = Number(body.amount), cur = body.cur, payer = String(body.payer || '');
      const split = [...new Set((body.split || []).map(String))].filter((s) => ids.has(s));
      const descr = clip(body.descr, 80), day = /^\d{4}-\d{2}-\d{2}$/.test(body.day || '') ? body.day : new Date(now() + 8 * 3600e3).toISOString().slice(0, 10);
      if (!descr) return json({ error: '请写一下是什么花费' }, 400);
      if (!(amount > 0 && amount < 1e6)) return json({ error: '金额不对' }, 400);
      if (!CURS.includes(cur)) return json({ error: '币种不对' }, 400);
      if (!ids.has(payer)) return json({ error: '付钱的人不在同伴名单里' }, 400);
      if (!split.length) return json({ error: '至少选一个人分摊' }, 400);
      const payerName = results.find((m) => m.email === payer).name;
      await db.batch([
        db.prepare('INSERT INTO expenses(at,day,payer,amount,cur,descr,split,created_by) VALUES(?,?,?,?,?,?,?,?)').bind(now(), day, payer, amount, cur, descr, JSON.stringify(split), who),
        bump(db, 'expenses'),
        ...addLog(db, who, `记了一笔账：${descr} ${cur} ${amount}（${payerName} 付）`),
      ]);
      return json({ ok: true });
    }
    if (method === 'DELETE' && id) {
      const e = await db.prepare('SELECT descr FROM expenses WHERE id=? AND deleted=0').bind(Number(id)).first();
      if (!e) return json({ error: '找不到这笔账' }, 404);
      await db.batch([db.prepare('UPDATE expenses SET deleted=1 WHERE id=?').bind(Number(id)), bump(db, 'expenses'), ...addLog(db, who, `删除了一笔账：${e.descr}`)]);
      return json({ ok: true });
    }
  }

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
  try { return await handle(request, env, [].concat(params.path || [])); }
  catch (e) { return json({ error: 'server error' }, 500); }
}
