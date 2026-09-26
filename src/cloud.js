/* ================= cloud mode: accounts, profiles, change log, expenses ================= */
var AVATAR_COLORS=['#c67139','#a8463f','#6f8150','#3f7f86','#b08628','#6b559a','#4f6a8f','#a8506e'];
var ROOM_NAME={twin:'双床房',triple:'三人房','':'还没分'};
var EXP_CURS=[['MYR','RM'],['CNY','¥'],['HKD','HK$'],['MOP','MOP']];
var cloudUI={editMe:false,obErr:'',expDel:null,expErr:'',rmArm:null,auth:null,temp:null,polling:false};

async function api(path,opt){opt=opt||{};
  const h={'content-type':'application/json'};
  try{const dev=localStorage.getItem('devEmail');if(dev&&/^(localhost|127\.0\.0\.1)$/.test(location.hostname))h['x-dev-email']=dev}catch(e){}
  let r;try{r=await fetch('/api'+path,{method:opt.method||'GET',headers:h,body:opt.body?JSON.stringify(opt.body):undefined,credentials:'same-origin'})}catch(e){return {status:0,ok:false,body:{}}}
  let b=null;if((r.headers.get('content-type')||'').includes('application/json')){try{b=await r.json()}catch(e){}}
  return {status:r.status,ok:r.ok,json:!!b,body:b||{}};
}
function memberName(email){const m=CLOUD.members.find(x=>x.email===email);return m?m.name:(email||'').split('@')[0]}
function avatar(m,size){size=size||34;const n=(m&&m.name)||'?';return `<span class="av" style="--c:${esc((m&&m.color)||'#a19786')};width:${size}px;height:${size}px;font-size:${Math.round(size*.42)}px" aria-hidden="true">${esc(n.slice(0,1))}</span>`}
function waLink(phone){let d=String(phone||'').replace(/[^\d+]/g,'');if(d.startsWith('+'))d=d.slice(1);else if(d.startsWith('0'))d='60'+d.slice(1);return d?'https://wa.me/'+d:''}
function ownerLine(t){const own=(trip.assign||{})[t.id]||'';
  return `<div class="tk-own"><label>负责订：<select data-assign="${esc(t.id)}" aria-label="谁负责订 ${esc(t.title)}"><option value="">还没分配</option>${CLOUD.members.map(m=>`<option value="${esc(m.email)}"${m.email===own?' selected':''}>${esc(m.name)}</option>`).join('')}</select></label>${own===CLOUD.email&&!trip.bookings[t.id]?'<span class="mine">轮到你订</span>':''}</div>`}

/* ---------- saving with conflict replay ---------- */
function planForServer(){const t=clone(trip);delete t.rev;delete t.updatedAt;return t}
async function cloudPump(){
  if(cloudBusy||!cloudQueue.length)return;cloudBusy=true;setSync('saving');
  const batch=cloudQueue.splice(0,cloudQueue.length);
  const r=await api('/plan',{method:'PUT',body:{data:planForServer(),baseRev:CLOUD.rev,log:batch.map(b=>b.log).filter(Boolean)}});
  if(r.status===409&&r.body.conflict){
    // someone saved first: take their version, replay our edits on top, try again
    const fresh=norm(r.body.data||clone(DEFAULT));batch.forEach(b=>{try{b.fn(fresh)}catch(e){}});
    trip=fresh;CLOUD.rev=r.body.rev;cloudQueue.unshift(...batch);cloudBusy=false;
    if(!S.edit)render();return cloudPump();
  }
  if(!r.ok){cloudQueue.unshift(...batch);cloudBusy=false;setSync('cloudErr');setTimeout(cloudPump,4000);return}
  CLOUD.rev=r.body.rev;cloudBusy=false;setSync('cloud');
  if(cloudQueue.length)cloudPump();else refreshLog();
}
async function refreshLog(){const r=await api('/log');if(r.ok){CLOUD.log=r.body.log||[];if(S.tab==='team')render()}}
async function refreshMembers(){const r=await api('/members');if(r.ok){CLOUD.members=r.body.members||[];const me=CLOUD.members.find(m=>m.email===CLOUD.email);if(me)CLOUD.me=me}}
async function refreshExpenses(){const r=await api('/expenses');if(r.ok)CLOUD.expenses=r.body.expenses||[]}
async function loadPlan(){const r=await api('/plan');if(!r.ok)return;if(r.body.data){trip=norm(r.body.data);CLOUD.rev=r.body.rev}else CLOUD.rev=0;try{localStorage.setItem(LS,JSON.stringify(trip))}catch(e){}}
async function poll(){
  if(!CLOUD.on||!CLOUD.me||document.hidden)return;
  const r=await api('/poll');if(!r.ok){setSync('cloudErr');return}
  const v=r.body,old=CLOUD.ver;CLOUD.ver=v;let changed=false;
  if(v.rev!==CLOUD.rev&&!cloudBusy&&!cloudQueue.length){await loadPlan();changed=true;toast('行程已更新（来自同伴）')}
  if(v.members!==old.members){await refreshMembers();changed=true}
  if(v.expenses!==old.expenses){await refreshExpenses();changed=true}
  if(v.log!==old.log)await refreshLog();
  if(!cloudBusy)setSync('cloud');
  if(changed){if(S.edit)pending=true;else render()}
}

/* ---------- boot ---------- */
var joinCode=(()=>{try{return (new URLSearchParams(location.search).get('join')||'').trim().toUpperCase()}catch(e){return ''}})();
async function cloudBoot(){
  const r=await api('/me');
  if(!r.json)return; // not on Cloudflare: keep GitHub Pages / claude.ai behaviour
  CLOUD.on=true;
  if(r.status===401){CLOUD.me=null;CLOUD.firstUser=!!r.body.firstUser;cloudUI.auth=cloudUI.auth||(CLOUD.firstUser||joinCode?'register':'login');renderOnboard();render();return}
  if(!r.ok){CLOUD.err=r.body.error||'服务器出错了';renderOnboard();return}
  CLOUD.err='';CLOUD.email=r.body.email;CLOUD.me=r.body.member;cloudUI.auth=null;
  if(joinCode){try{history.replaceState(null,'',location.pathname+location.hash)}catch(e){}joinCode=''}
  await Promise.all([refreshMembers(),refreshExpenses(),refreshLog(),loadPlan(),refreshInvite()]);
  // the very first account uploads the plan everyone starts from
  if(CLOUD.rev===0){cloudQueue.push({fn:()=>{},log:'建立了共享行程'});cloudPump()}
  const p=await api('/poll');if(p.ok)CLOUD.ver=p.body;
  setSync('cloud');renderOnboard();render();
  if(!cloudUI.polling){cloudUI.polling=true;setInterval(poll,5000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)poll()})}
}
async function refreshInvite(){if(!(CLOUD.me&&CLOUD.me.isAdmin))return;const r=await api('/invite');if(r.ok)CLOUD.invite=r.body.code}
function inviteLink(){return location.origin+location.pathname+'?join='+(CLOUD.invite||'')}

/* ---------- header chip, login / register ---------- */
function renderMeChip(){const el=$('#me-chip');if(!el)return;if(!(CLOUD.on&&CLOUD.me)){el.hidden=true;return}el.hidden=false;el.innerHTML=avatar(CLOUD.me,28)+`<span>${esc(CLOUD.me.name)}</span>`}
function profileFields(m,isNew){m=m||{};const col=m.color||AVATAR_COLORS[(CLOUD.members.length||0)%AVATAR_COLORS.length];
  return `<label>名字<input name="name" value="${esc(m.name||'')}" maxlength="40" required autocomplete="nickname" placeholder="同伴会看到这个名字"></label>
    <label>电话号码${isNew?'（用来登录）':'（登录账号，不能改）'}<input name="phone" value="${esc(m.phone||'')}" maxlength="24" required inputmode="tel" autocomplete="tel" placeholder="012-345 6789"${isNew?'':' readonly'}></label>
    <fieldset><legend>头像颜色</legend><div class="swatches">${AVATAR_COLORS.map(c=>`<label class="sw"><input type="radio" name="color" value="${c}"${c===col?' checked':''}><span style="--c:${c}"></span></label>`).join('')}</div></fieldset>
    <label>住哪间房<select name="room">${Object.entries(ROOM_NAME).map(([k,n])=>`<option value="${k}"${(m.room||'')===k?' selected':''}>${n}</option>`).join('')}</select></label>
    <label class="full">饮食禁忌 / 过敏（可不填）<input name="diet" value="${esc(m.diet||'')}" maxlength="100" placeholder="例如：不吃牛、海鲜过敏"></label>`}
function profileForm(m){return `<form class="pform" id="me-form">${profileFields(m,false)}
    <label class="full">改密码（不改就留空）<input name="newPassword" type="password" minlength="6" autocomplete="new-password" placeholder="至少 6 位"></label>
    ${cloudUI.obErr?`<p class="ferr" role="alert">${esc(cloudUI.obErr)}</p>`:''}
    <div class="acts"><button type="button" class="btn ghost" data-a="cl-cancelMe">取消</button><button type="submit" class="btn">保存资料</button></div></form>`}
function renderOnboard(){const root=$('#ob-root');if(!root)return;renderMeChip();
  if(!CLOUD.on||(CLOUD.me&&!CLOUD.err)){root.innerHTML='';return}
  if(CLOUD.err){root.innerHTML=`<div class="ob"><div class="ob-card"><div class="tape terra" style="top:-12px;left:50%;margin-left:-46px"></div><h2 class="disp">暂时进不去</h2><p>${esc(CLOUD.err)}</p><button type="button" class="btn" data-a="cl-retry">再试一次</button></div></div>`;return}
  const reg=cloudUI.auth==='register',err=cloudUI.obErr?`<p class="ferr" role="alert">${esc(cloudUI.obErr)}</p>`:'';
  const head=CLOUD.firstUser?'你是第一个注册的人，注册后会成为管理员，可以把邀请链接发给同伴。':reg?(joinCode?'你是用邀请链接打开的，填好资料就能加入。':'注册要用邀请码，可以向同伴要邀请链接。'):'用注册时的电话号码和密码登录。';
  root.innerHTML=`<div class="ob" role="dialog" aria-modal="true" aria-labelledby="ob-h"><div class="ob-card"><div class="tape sage" style="top:-12px;left:50%;margin-left:-46px;transform:rotate(-3deg)"></div>
    <div class="ph-no">粤港澳九日行 · 旅行手帐</div><h2 class="disp" id="ob-h"><span class="hl">${reg?'加入行程':'欢迎回来'}</span></h2>
    ${CLOUD.firstUser?'':`<div class="seg auth-seg" role="group" aria-label="登录或注册"><button type="button" data-a="cl-auth" data-v="login" aria-pressed="${!reg}">登录</button><button type="button" data-a="cl-auth" data-v="register" aria-pressed="${reg}">注册</button></div>`}
    <p class="ph-note">${head}</p>
    ${reg?`<form class="pform" id="reg-form">${profileFields(null,true)}
        <label>密码<input name="password" type="password" minlength="6" required autocomplete="new-password" placeholder="至少 6 位"></label>
        ${CLOUD.firstUser?'':`<label>邀请码<input name="invite" value="${esc(joinCode)}" maxlength="10" required autocomplete="off" style="text-transform:uppercase" placeholder="6 位"></label>`}
        ${err}<div class="acts"><button type="submit" class="btn">注册并加入</button></div></form>`
      :`<form class="pform" id="login-form"><label>电话号码<input name="phone" required inputmode="tel" autocomplete="tel" placeholder="012-345 6789"></label>
        <label>密码<input name="password" type="password" required autocomplete="current-password"></label>
        ${err}<p class="ph-note full" style="margin:0">忘了密码？请管理员在「同伴」页帮你重设。</p>
        <div class="acts"><button type="submit" class="btn">登录</button></div></form>`}
  </div></div>`;
}
async function doAuth(form,kind){const f=new FormData(form);
  const body=kind==='register'?{name:f.get('name'),phone:f.get('phone'),color:f.get('color'),room:f.get('room'),diet:f.get('diet'),password:f.get('password'),invite:f.get('invite')}:{phone:f.get('phone'),password:f.get('password')};
  const btn=form.querySelector('[type=submit]');if(btn){btn.disabled=true;btn.textContent='请稍候…'}
  const r=await api('/auth/'+kind,{method:'POST',body});
  if(!r.ok){cloudUI.obErr=r.body.error||'出错了，请再试一次';renderOnboard();return}
  cloudUI.obErr='';await cloudBoot();toast(kind==='register'?'欢迎加入！':'已登录')}
async function saveProfile(form){const f=new FormData(form);
  const body={name:f.get('name'),phone:f.get('phone'),color:f.get('color'),room:f.get('room'),diet:f.get('diet'),newPassword:f.get('newPassword')||''};
  const r=await api('/me',{method:'PUT',body});
  if(!r.ok){cloudUI.obErr=r.body.error||'保存失败';render();return}
  cloudUI.obErr='';cloudUI.editMe=false;CLOUD.me=r.body.member;await refreshMembers();renderMeChip();render();toast(body.newPassword?'资料和密码已保存':'资料已保存')}

/* ---------- P.10 companions ---------- */
function pTeam(){
  const me=CLOUD.me,isAdmin=me&&me.isAdmin;
  const cards=CLOUD.members.map((m,k)=>{const mine=m.email===CLOUD.email;const wa=waLink(m.phone);
    const todo=Object.entries(trip.assign||{}).filter(([id,e])=>e===m.email&&!trip.bookings[id]).length;
    return `<div class="mcard" style="--tilt:${[-1.2,1,-.6,1.4,-.9,.7][k%6]}deg;--c:${esc(m.color)}"><div class="tp"></div>
      <div class="mtop">${avatar(m,52)}<div style="min-width:0"><div class="mname">${esc(m.name)}${m.isAdmin?' <span class="badge">管理员</span>':''}${mine?' <span class="badge you">你</span>':''}</div><div class="memail">${m.isAdmin?'管理员 · 可以发邀请、重设密码':'同伴'}</div></div></div>
      <div class="mrow2"><span>电话</span><b class="tab-num">${esc(m.phone)}</b></div>
      <div class="mrow2"><span>房间</span><b>${ROOM_NAME[m.room||'']}</b></div>
      ${m.diet?`<div class="mrow2"><span>饮食</span><b>${esc(m.diet)}</b></div>`:''}
      <div class="mrow2"><span>待订</span><b>${todo} 项</b></div>
      <div class="links">${wa?`<a class="lk d" href="${wa}" target="_blank" rel="noopener">WhatsApp</a>`:''}<button type="button" class="lk g as-btn" data-a="cl-copy" data-v="${esc(m.phone)}">复制电话</button>
        ${mine?'<button type="button" class="lk x as-btn" data-a="cl-editMe">编辑我的资料</button><button type="button" class="lk g as-btn" data-a="cl-logout">登出</button>':''}
        ${isAdmin&&!mine?`<button type="button" class="lk g as-btn" data-a="cl-reset" data-v="${esc(m.email)}">重设密码</button><button type="button" class="lk g as-btn${cloudUI.rmArm===m.email?' armed':''}" data-a="cl-rm" data-v="${esc(m.email)}">${cloudUI.rmArm===m.email?'确定移除？':'移除'}</button>`:''}</div>
      ${cloudUI.temp&&cloudUI.temp.id===m.email?`<p class="ferr" style="background:var(--sage2);color:var(--sage8)">临时密码：<b class="tab-num">${esc(cloudUI.temp.pw)}</b>　发给 ${esc(m.name)}，登录后请他在「编辑我的资料」改密码。</p>`:''}</div>`}).join('');
  const log=CLOUD.log.map(l=>{const m=CLOUD.members.find(x=>x.email===l.email);return `<div class="lrow">${avatar(m||{name:l.email},26)}<div class="lt"><b>${esc(m?m.name:l.email.split('@')[0])}</b> ${esc(l.text)}</div><span class="lw tab-num">${bj(l.at)}</span></div>`}).join('')||'<p class="ph-note">还没有修改记录。</p>';
  return `<section class="page" style="display:flex;flex-direction:column;gap:34px">${ph('P.10','同伴',`${CLOUD.members.length} 位同伴。名字和电话只有加入这个行程的人看得到。`)}
    ${cloudUI.editMe?`<div class="notebook me-edit"><div class="holes"></div><h3 class="disp" style="margin:0 0 12px">编辑我的资料</h3>${profileForm(me,false)}</div>`:''}
    <div class="mgrid">${cards}</div>
    <div class="sticky-note invite" style="transform:rotate(-.6deg)"><div class="tape terra" style="top:-10px;right:40px;transform:rotate(4deg)"></div>
      ${isAdmin&&CLOUD.invite?`<p><b>邀请同伴：</b>把这个链接发到群里，对方打开后填资料、设密码就能加入。</p>
        <div class="inv"><code class="tab-num">${esc(inviteLink())}</code><button type="button" class="btn" data-a="cl-copyInvite">复制链接</button><button type="button" class="btn ghost" data-a="cl-newInvite">换一个邀请码</button></div>
        <p class="ph-note" style="margin:6px 0 0;color:var(--sage8)">邀请码：<b class="tab-num">${esc(CLOUD.invite)}</b>。换了之后旧链接就不能用了，已经加入的人不受影响。</p>`
      :`<p><b>邀请同伴：</b>请管理员（${esc((CLOUD.members.find(x=>x.isAdmin)||{}).name||'')}）在这一页复制邀请链接发到群里。</p>`}</div>
    <div><div class="tk-gh"><h3>修改记录</h3><span>最近 80 条 · 北京时间</span></div><div class="notebook logbook"><div class="holes"></div>${log}</div></div></section>`;
}

/* ---------- P.11 expenses ---------- */
function toMYR(a,cur){const s=trip.settings,myr=+s.myr||.59;if(cur==='MYR')return a;if(cur==='CNY')return a*myr;return a*(s.rates[cur]||1)*myr}
function balances(){const net={};CLOUD.members.forEach(m=>net[m.email]=0);let total=0;
  CLOUD.expenses.forEach(e=>{const v=toMYR(+e.amount,e.cur);total+=v;const sp=(e.split||[]).filter(x=>x in net);if(!sp.length||!(e.payer in net))return;net[e.payer]+=v;sp.forEach(x=>net[x]-=v/sp.length)});
  const cr=Object.entries(net).filter(([,v])=>v>.5).map(([e,v])=>({e,v})).sort((a,b)=>b.v-a.v),db=Object.entries(net).filter(([,v])=>v<-.5).map(([e,v])=>({e,v:-v})).sort((a,b)=>b.v-a.v);
  const moves=[];let i=0,j=0;while(i<db.length&&j<cr.length){const x=Math.min(db[i].v,cr[j].v);moves.push({from:db[i].e,to:cr[j].e,v:x});db[i].v-=x;cr[j].v-=x;if(db[i].v<.5)i++;if(cr[j].v<.5)j++}
  return {net,moves,total}}
function pSplit(){const B=balances(),today=new Date(Date.now()+8*3600e3).toISOString().slice(0,10);
  const form=`<form class="notebook expform" id="exp-form"><div class="holes"></div><h3 class="disp" style="margin:0 0 12px">记一笔</h3>
    <div class="egrid"><label class="full">是什么<input name="descr" maxlength="80" required placeholder="例如：10/11 一乐烧鹅午餐"></label>
      <label>金额<input name="amount" type="number" min="0.01" step="0.01" required inputmode="decimal"></label>
      <label>币种<select name="cur">${EXP_CURS.map(([c,s])=>`<option value="${c}"${c==='CNY'?' selected':''}>${s} ${c}</option>`).join('')}</select></label>
      <label>谁付的<select name="payer">${CLOUD.members.map(m=>`<option value="${esc(m.email)}"${m.email===CLOUD.email?' selected':''}>${esc(m.name)}</option>`).join('')}</select></label>
      <label>日期<input name="day" type="date" value="${today}" min="2026-10-01" max="2026-10-31"></label>
      <fieldset class="full"><legend>谁一起分（平均分）</legend><div class="who">${CLOUD.members.map(m=>`<label class="whoc"><input type="checkbox" name="split" value="${esc(m.email)}" checked>${avatar(m,22)}${esc(m.name)}</label>`).join('')}</div></fieldset></div>
    ${cloudUI.expErr?`<p class="ferr" role="alert">${esc(cloudUI.expErr)}</p>`:''}
    <div class="acts"><button type="submit" class="btn">加进账本</button></div></form>`;
  const bal=CLOUD.members.map(m=>{const v=B.net[m.email]||0;return `<div class="brow">${avatar(m,28)}<span class="bn">${esc(m.name)}</span><b class="tab-num ${v>.5?'pos':v<-.5?'neg':''}">${v>.5?'应收 ':v<-.5?'应付 ':''}RM ${n0(Math.abs(v))}</b></div>`}).join('');
  const moves=B.moves.length?B.moves.map(x=>`<div class="mv">${avatar(CLOUD.members.find(m=>m.email===x.from),24)}<b>${esc(memberName(x.from))}</b><span>转给</span>${avatar(CLOUD.members.find(m=>m.email===x.to),24)}<b>${esc(memberName(x.to))}</b><em class="tab-num">RM ${n0(x.v)}</em></div>`).join(''):'<p class="ph-note">目前大家都不欠钱。</p>';
  const list=CLOUD.expenses.map(e=>{const sym=(EXP_CURS.find(c=>c[0]===e.cur)||['',''])[1];const armed=cloudUI.expDel===e.id;
    return `<div class="erow">${avatar(CLOUD.members.find(m=>m.email===e.payer),30)}<div class="em"><b>${esc(e.descr)}</b><small>${esc(memberName(e.payer))} 付 · ${esc(e.day.slice(5).replace('-','/'))} · ${e.split.length} 人分（${e.split.map(x=>esc(memberName(x))).join('、')}）</small></div>
      <div class="ea"><b class="tab-num">${sym}${(+e.amount).toLocaleString('en-US',{maximumFractionDigits:2})}</b>${e.cur!=='MYR'?`<small>≈ RM ${n0(toMYR(+e.amount,e.cur))}</small>`:''}</div>
      <button type="button" class="mini-btn${armed?' armed':''}" data-a="cl-expDel" data-v="${e.id}">${armed?'确定删除？':'删除'}</button></div>`}).join('')||'<p class="ph-note" style="padding:12px 0">还没有记账。旅途中谁先付了钱，就在上面记一笔。</p>';
  return `<section class="page" style="display:flex;flex-direction:column;gap:30px">${ph('P.11','分账','谁先付了钱就记一笔，最后按马币算清楚谁要转多少给谁。汇率跟「预算」里的设置一样。')}
    <div class="split-top">${form}
      <div class="split-side"><div class="receipt"><div class="rc-h">GBA TRIP · 分账</div>
        <div class="rc-tot"><div><small>一共花了</small><div class="big">RM ${n0(B.total)}</div><div class="sub">${CLOUD.expenses.length} 笔</div></div><div><small>平均每人</small><div class="mid">RM ${n0(B.total/Math.max(1,CLOUD.members.length))}</div></div></div>
        <div class="bals">${bal}</div></div>
        <div class="sticky-note settle"><div class="tape terra" style="top:-10px;left:50%;margin-left:-46px"></div><h3 class="disp" style="margin:0 0 10px;font-size:20px">怎么还最省事</h3>${moves}</div></div></div>
    <div><div class="tk-gh"><h3>账本</h3><span>按日期，最新的在上面</span></div><div class="notebook elist"><div class="holes"></div>${list}</div></div></section>`;
}

/* ---------- events ---------- */
document.addEventListener('submit',async e=>{
  if(e.target.id==='me-form'){e.preventDefault();saveProfile(e.target);return}
  if(e.target.id==='reg-form'||e.target.id==='login-form'){e.preventDefault();doAuth(e.target,e.target.id==='reg-form'?'register':'login');return}
  if(e.target.id==='exp-form'){e.preventDefault();const f=new FormData(e.target);
    const body={descr:f.get('descr'),amount:+f.get('amount'),cur:f.get('cur'),payer:f.get('payer'),day:f.get('day'),split:f.getAll('split')};
    const r=await api('/expenses',{method:'POST',body});
    if(!r.ok){cloudUI.expErr=r.body.error||'记账失败';render();return}
    cloudUI.expErr='';await refreshExpenses();refreshLog();render();toast('已记一笔')}
});
document.addEventListener('click',async e=>{const el=e.target.closest('[data-a^="cl-"]');if(!el)return;const a=el.dataset.a,v=el.dataset.v;
  if(a==='cl-editMe'){cloudUI.editMe=true;render();scrollTo({top:$('.tabs').offsetTop,behavior:'smooth'})}
  if(a==='cl-cancelMe'){cloudUI.editMe=false;cloudUI.obErr='';render()}
  if(a==='cl-copy'){try{await navigator.clipboard.writeText(v);toast('已复制 '+v)}catch(err){toast(v)}}
  if(a==='cl-rm'){if(cloudUI.rmArm!==v){cloudUI.rmArm=v;render();setTimeout(()=>{if(cloudUI.rmArm===v){cloudUI.rmArm=null;render()}},3000);return}
    cloudUI.rmArm=null;const r=await api('/members/'+encodeURIComponent(v),{method:'DELETE'});if(!r.ok){toast(r.body.error||'移除失败');return}await refreshMembers();refreshLog();render();toast('已移除')}
  if(a==='cl-auth'){cloudUI.auth=v;cloudUI.obErr='';renderOnboard()}
  if(a==='cl-retry'){CLOUD.err='';cloudBoot()}
  if(a==='cl-logout'){await api('/auth/logout',{method:'POST'});CLOUD.me=null;CLOUD.members=[];CLOUD.expenses=[];CLOUD.log=[];cloudUI.auth='login';S.tab='overview';await cloudBoot();toast('已登出')}
  if(a==='cl-reset'){const r=await api('/members/'+encodeURIComponent(v)+'/reset',{method:'POST'});if(!r.ok){toast(r.body.error||'重设失败');return}cloudUI.temp={id:v,pw:r.body.temp};refreshLog();render()}
  if(a==='cl-copyInvite'){const l=inviteLink();try{await navigator.clipboard.writeText(l);toast('已复制邀请链接')}catch(err){toast(l)}}
  if(a==='cl-newInvite'){const r=await api('/invite',{method:'POST'});if(r.ok){CLOUD.invite=r.body.code;render();toast('已换新的邀请码，旧链接不能用了')}}
  if(a==='cl-expDel'){const id=+v;if(cloudUI.expDel!==id){cloudUI.expDel=id;render();setTimeout(()=>{if(cloudUI.expDel===id){cloudUI.expDel=null;render()}},3000);return}
    cloudUI.expDel=null;const r=await api('/expenses/'+id,{method:'DELETE'});if(!r.ok){toast(r.body.error||'删除失败');return}await refreshExpenses();refreshLog();render();toast('已删除')}
});
document.addEventListener('change',e=>{const id=e.target.dataset&&e.target.dataset.assign;if(!id)return;const who=e.target.value,tt=(tickets().find(x=>x.id===id)||{}).title||id;
  commit(t=>{t.assign=t.assign||{};if(who)t.assign[id]=who;else delete t.assign[id]},who?'已分配给 '+memberName(who):'已取消分配',who?tt+' 交给 '+memberName(who)+' 订':'取消了 '+tt+' 的分配')});
document.addEventListener('click',e=>{if(e.target.closest('#me-chip')){S.tab='team';render();scrollTo({top:$('.tabs').offsetTop,behavior:'smooth'})}});
cloudBoot();
