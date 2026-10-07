/* ---------------- hotels we booked ourselves: details + room assignment ----------------
   trip.booked[city] = {n, addr, phone, cin, cout, ref, amt, cur, link, note, la, ln, prev,
                        rooms:[{no, type, who:[member id or name]}]}
   trip.settings.hotel[city] === 'booked' means the booked one is in use (itinerary, map, budget, booking list).
   Booked-ticks and paid prices are kept per hotel in trip.hotelMemo, so switching hotels never carries them over. */
const ROOM_TYPES={twin:'双床房',double:'大床房',triple:'三人房',family:'家庭房',other:'其他'};
const bookedOf=c=>{const b=(trip.booked||{})[c];return b&&b.n?b:null};
const isBooked=c=>trip.settings.hotel[c]==='booked'&&!!bookedOf(c);
const stayNights=c=>trip.days.filter(d=>d.stay===c);
// a Google Maps link carries "@lat,lng" or "?q=lat,lng"; anything else just isn't placed exactly
function parseLL(url){const s=String(url||'');const m=s.match(/!3d(-?\d{1,2}\.\d+)!4d(-?\d{1,3}\.\d+)/)||s.match(/@(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/)||s.match(/[?&](?:q|query|ll|center)=(-?\d{1,2}\.\d+),\s*(-?\d{1,3}\.\d+)/);return m?{la:+m[1],ln:+m[2]}:null}
function bookedHotel(c){const b=bookedOf(c);if(!b)return null;const ns=stayNights(c).length||1,a=PLACES[HOTEL_ANCHOR[c]]||{};
  const exact=b.la&&b.ln;return {id:'booked',booked:true,city:c,n:b.n,area:b.addr||'',la:exact?b.la:a.la,ln:exact?b.ln:a.ln,exact,rv:b.note||'我们自己订好的酒店。',
    perNight:+b.amt?cny(b.amt,b.cur)/ns:null}}
// who is in which room, for profiles and member cards
function roomOf(c,id){const b=bookedOf(c);if(!b||!id)return null;return (b.rooms||[]).find(r=>(r.who||[]).includes(id))||null}
function roomsOfMember(id){const o={};stayCities().forEach(c=>{const r=roomOf(c,id);if(r)o[c]=r});return o}
const whoName=x=>{const m=(typeof CLOUD!=='undefined'&&CLOUD.on)?CLOUD.members.find(z=>z.email===x):null;return m?m.name:String(x)};
const meId=()=>(typeof CLOUD!=='undefined'&&CLOUD.on&&CLOUD.me)?CLOUD.me.email:null;

// move the booked tick / paid price of the hotel we leave into the memo, bring back the new one's
function swapHotel(t,c,to){const from=t.settings.hotel[c];if(from===to)return;const k='hotel-'+c;
  t.hotelMemo=t.hotelMemo||{};const memo=t.hotelMemo[c]=t.hotelMemo[c]||{};
  memo[from]={b:t.bookings[k]||null,by:(t.bookedBy||{})[k]||null,a:(t.actual||{})[k]||null,who:(t.assign||{})[k]||null};
  const r=memo[to]||{};delete memo[to];
  delete t.bookings[k];if(t.bookedBy)delete t.bookedBy[k];if(t.actual)delete t.actual[k];if(t.assign)delete t.assign[k];
  if(r.b)t.bookings[k]=r.b;if(r.by)(t.bookedBy=t.bookedBy||{})[k]=r.by;if(r.a)(t.actual=t.actual||{})[k]=r.a;if(r.who)(t.assign=t.assign||{})[k]=r.who;
  t.settings.hotel[c]=to}

/* ---- the card on the hotels page ---- */
function bookedBlock(c){const b=bookedOf(c),on=isBooked(c),ro=viewerOnly();
  if(S.bkEdit===c)return bookedForm(c);
  if(!b)return ro?'':`<button type="button" class="addbtn bk-add" data-a="bkEdit" data-v="${c}">＋ 我们已经订好了，填写酒店资料和分房</button>`;
  const ns=stayNights(c),me=meId(),myr=+trip.settings.myr||0,amtC=+b.amt?cny(b.amt,b.cur):0;
  const mapU=b.link||'https://www.google.com/maps/search/?api=1&query='+enc(b.n+' '+(b.addr||'')+' '+CITY[c].n);
  const cp=(v,l)=>v?`<button type="button" class="cp" data-a="bkCopy" data-v="${esc(v)}" aria-label="复制${l}">复制</button>`:'';
  const rooms=(b.rooms||[]).filter(r=>r.no||(r.who||[]).length);
  return `<div class="bkcard${on?' on':''}" style="--c:${CC[c]}"><div class="tp"></div>
    <div class="bk-h"><div><div class="bk-eyebrow">我们已订的酒店</div><div class="bk-n">${esc(b.n)}</div></div>${on?'<span class="stampmark">已订 ✓</span>':''}</div>
    <dl class="bk-dl">
      ${b.addr?`<dt>地址</dt><dd>${esc(b.addr)} ${cp(b.addr,'地址')} <a class="lk g" href="${esc(mapU)}" target="_blank" rel="noopener">地图</a></dd>`:`<dt>地图</dt><dd><a class="lk g" href="${esc(mapU)}" target="_blank" rel="noopener">在地图上找</a></dd>`}
      ${b.phone?`<dt>电话</dt><dd class="tab-num">${esc(b.phone)} ${cp(b.phone,'电话')}</dd>`:''}
      <dt>入住</dt><dd>${b.cin?esc(b.cin.slice(5).replace('-','/')):'?'} – ${b.cout?esc(b.cout.slice(5).replace('-','/')):'?'} 退房 · ${ns.length} 晚</dd>
      ${b.ref?`<dt>订单号</dt><dd class="tab-num">${esc(b.ref)} ${cp(b.ref,'订单号')}</dd>`:''}
      ${amtC?`<dt>总价</dt><dd><b>${CUR[b.cur]||''}${n0(+b.amt)}</b> 全组 · 每人约 ¥${n0(amtC/Math.max(1,+trip.settings.people||1))} ≈ RM ${n0(amtC*myr/Math.max(1,+trip.settings.people||1))}</dd>`:''}
      ${b.note?`<dt>备注</dt><dd>${esc(b.note)}</dd>`:''}
    </dl>
    ${rooms.length?`<div class="bk-rooms">${rooms.map(r=>`<div class="bk-room"><b class="tab-num">${r.no?esc(r.no):'房号未知'}</b><span>${ROOM_TYPES[r.type]||''}</span><span class="bk-who">${(r.who||[]).map(x=>`<i${x===me?' class="me"':''}>${esc(whoName(x))}${x===me?'（你）':''}</i>`).join('')||'<em>还没分人</em>'}</span></div>`).join('')}</div>`:'<p class="bk-hint">还没填分房。</p>'}
    ${b.exact?'':'<p class="bk-hint">地图上先用市中心位置代替。要放到准确位置：在电脑版 Google 地图打开酒店，复制浏览器地址栏的完整网址（里面有 @纬度,经度）贴到地图链接。maps.app.goo.gl 短链接没有坐标。</p>'}
    ${ro?'':`<div class="bk-acts">${on?'':`<button type="button" class="btn" data-a="bkUse" data-v="${c}">用这家</button>`}<button type="button" class="btn ghost" data-a="bkEdit" data-v="${c}">编辑资料 / 分房</button><button type="button" class="mini-btn${S.bkDel===c?' armed':''}" data-a="bkDel" data-v="${c}">${S.bkDel===c?'再点一次删除':'删除'}</button></div>`}
  </div>`}

function bookedDraft(c){const b=bookedOf(c);if(S.bkDraft&&S.bkDraft.c===c)return S.bkDraft;
  const ns=stayNights(c),last=ns.length?dp(ns[ns.length-1].date).dt:null;let out='';if(last){last.setDate(last.getDate()+1);out=last.getFullYear()+'-'+pad(last.getMonth()+1)+'-'+pad(last.getDate())}
  const n=Math.max(1,+trip.settings.rooms||1);
  return {c,...(b?JSON.parse(JSON.stringify(b)):{n:'',addr:'',phone:'',ref:'',amt:'',cur:'CNY',link:'',note:'',cin:ns.length?ns[0].date:'',cout:out}),
    rooms:b&&b.rooms&&b.rooms.length?JSON.parse(JSON.stringify(b.rooms)):Array.from({length:n},()=>({no:'',type:'twin',who:[]}))}}
function bookedForm(c){const d=bookedDraft(c),cloud=typeof CLOUD!=='undefined'&&CLOUD.on&&CLOUD.members.length;
  const F=(name,label,v,extra)=>`<label${extra&&extra.full?' class="full"':''}>${label}<input name="${name}" value="${esc(v==null?'':v)}"${extra&&extra.attrs||''}></label>`;
  const room=(r,i)=>`<div class="bk-rrow" data-i="${i}">
      <label>房间号<input name="r${i}_no" value="${esc(r.no||'')}" maxlength="12" placeholder="例如 1203"></label>
      <label>房型<select name="r${i}_type">${Object.entries(ROOM_TYPES).map(([k,n])=>`<option value="${k}"${r.type===k?' selected':''}>${n}</option>`).join('')}</select></label>
      ${cloud?`<fieldset class="bk-whos"><legend>住客</legend>${CLOUD.members.map(m=>`<label class="chk"><input type="checkbox" name="r${i}_who" value="${esc(m.email)}"${(r.who||[]).includes(m.email)?' checked':''}> ${esc(m.name)}</label>`).join('')}</fieldset>`
        :`<label class="bk-whos">住客（名字用逗号分开）<input name="r${i}_who" value="${esc((r.who||[]).join('、'))}" placeholder="例如：阿明、小美"></label>`}
      <button type="button" class="mini-btn" data-a="bkRmRoom" data-v="${i}" aria-label="删除这间房">删除</button></div>`;
  return `<form class="edit-panel bk-form" id="bk-form" data-c="${c}">
    <div class="full bk-ftitle">${CITY[c].n} · 我们已订的酒店</div>
    ${F('n','酒店名称 *',d.n,{full:true,attrs:' required maxlength="80" placeholder="例如：汉庭酒店（深圳会展中心店）"'})}
    ${F('addr','地址',d.addr,{full:true,attrs:' maxlength="120"'})}
    ${F('phone','酒店电话',d.phone,{attrs:' maxlength="30" inputmode="tel"'})}
    ${F('ref','订单号',d.ref,{attrs:' maxlength="40"'})}
    ${F('cin','入住日期',d.cin,{attrs:' type="date"'})}
    ${F('cout','退房日期',d.cout,{attrs:' type="date"'})}
    ${F('amt','总价（全组）',d.amt,{attrs:' type="number" min="0" step="0.01" inputmode="decimal"'})}
    <label>币种<select name="cur">${[['CNY','人民币'],['HKD','港币'],['MOP','澳门元'],['MYR','马币']].map(([k,n])=>`<option value="${k}"${d.cur===k?' selected':''}>${n}</option>`).join('')}</select></label>
    ${F('link','地图链接（Google / 高德，可不填）',d.link,{full:true,attrs:' type="url" maxlength="400" placeholder="https://maps.app.goo.gl/…"'})}
    ${F('note','备注（早餐、停车、入住要求等）',d.note,{full:true,attrs:' maxlength="200"'})}
    <div class="full bk-rooms-edit"><div class="bk-ftitle sm">分房${cloud?'（勾选住客，大家的个人资料会自动显示房号）':''}</div>${d.rooms.map(room).join('')}
      <button type="button" class="addbtn" data-a="bkAddRoom">＋ 加一间房</button></div>
    <div class="acts"><button type="button" class="btn ghost" data-a="bkCancel">取消</button><button type="submit" class="btn">保存</button></div>
  </form>`}
// read what is typed so far (used before adding/removing a room row, and on save)
function readBkForm(form){const f=new FormData(form),c=form.dataset.c,cloud=typeof CLOUD!=='undefined'&&CLOUD.on&&CLOUD.members.length;
  const idx=[...form.querySelectorAll('.bk-rrow')].map(x=>+x.dataset.i);const g=k=>String(f.get(k)||'').trim();
  return {c,n:g('n'),addr:g('addr'),phone:g('phone'),ref:g('ref'),cin:g('cin'),cout:g('cout'),amt:g('amt'),cur:g('cur')||'CNY',link:g('link'),note:g('note'),
    rooms:idx.map(i=>({no:g('r'+i+'_no'),type:g('r'+i+'_type')||'twin',who:cloud?f.getAll('r'+i+'_who').map(String):g('r'+i+'_who').split(/[,，、\s]+/).filter(Boolean)}))}}

document.addEventListener('submit',e=>{if(e.target.id!=='bk-form')return;e.preventDefault();const d=readBkForm(e.target),c=d.c;
  if(!d.n){toast('请填写酒店名称');return}
  // one person sits in one room only: keep the first room they were ticked in
  const seen=new Set();d.rooms.forEach(r=>{r.who=r.who.filter(x=>!seen.has(x)&&seen.add(x))});
  d.rooms=d.rooms.filter(r=>r.no||r.who.length);
  const ll=parseLL(d.link);const rec={n:d.n.slice(0,80),addr:d.addr.slice(0,120),phone:d.phone.slice(0,30),ref:d.ref.slice(0,40),cin:d.cin,cout:d.cout,
    amt:+d.amt>0?Math.round(+d.amt*100)/100:'',cur:d.cur,link:/^https?:\/\//.test(d.link)?d.link.slice(0,400):'',note:d.note.slice(0,200),rooms:d.rooms,...(ll?{la:ll.la,ln:ll.ln}:{})};
  const isNew=!bookedOf(c);S.bkEdit=null;S.bkDraft=null;
  commit(t=>{t.booked=t.booked||{};const prev=(t.booked[c]&&t.booked[c].prev)||(t.settings.hotel[c]!=='booked'?t.settings.hotel[c]:'');
    const old=t.booked[c],keep=!('la' in rec)&&old&&old.la&&old.ln&&old.n===rec.n;
    t.booked[c]={...rec,prev,...(keep?{la:old.la,ln:old.ln}:{})};swapHotel(t,c,'booked');const k='hotel-'+c;
    if(!t.bookings[k])t.bookings[k]=Date.now();if(typeof CLOUD!=='undefined'&&CLOUD.email){t.bookedBy=t.bookedBy||{};t.bookedBy[k]=t.bookedBy[k]||CLOUD.email}
    t.actual=t.actual||{};if(rec.amt)t.actual[k]={amt:rec.amt,cur:rec.cur,per:'g'};else delete t.actual[k]},
    isNew?'已保存，订票清单和预算也更新了':'已更新酒店资料',(isNew?'填写了已订酒店：':'更新了已订酒店：')+CITY[c].n+' '+rec.n)});

// actions, called from the main click handler
function bookedAction(a,v,el){
  switch(a){
    case 'bkEdit':S.bkEdit=v;S.bkDraft=null;S.bkDel=null;render();{const f=$('#bk-form');if(f){f.scrollIntoView({block:'center'});f.querySelector('input').focus({preventScroll:true})}}return true;
    case 'bkCancel':S.bkEdit=null;S.bkDraft=null;render();return true;
    case 'bkAddRoom':case 'bkRmRoom':{const f=$('#bk-form');if(!f)return true;const d=readBkForm(f);
      if(a==='bkAddRoom')d.rooms.push({no:'',type:'twin',who:[]});else{const pos=[...f.querySelectorAll('.bk-rrow')].findIndex(x=>x.dataset.i===v);if(pos>=0)d.rooms.splice(pos,1)}
      S.bkDraft=d;render();return true}
    case 'bkUse':{const b=bookedOf(v);if(b)commit(t=>swapHotel(t,v,'booked'),'改用我们已订的酒店',CITY[v].n+'酒店换成 '+b.n);return true}
    case 'bkDel':{if(S.bkDel!==v){S.bkDel=v;render();setTimeout(()=>{if(S.bkDel===v){S.bkDel=null;render()}},2500);return true}
      S.bkDel=null;const b=bookedOf(v);commit(t=>{const to=(t.booked[v]&&t.booked[v].prev)||HOTELS[v][0].id;if(t.settings.hotel[v]==='booked')swapHotel(t,v,HOTELS[v].some(h=>h.id===to)?to:HOTELS[v][0].id);
        delete t.booked[v];if(t.hotelMemo&&t.hotelMemo[v])delete t.hotelMemo[v].booked},'已删除已订酒店',(b?'删除了已订酒店：'+b.n:'删除了已订酒店'));return true}
    case 'bkCopy':{const fb=()=>toast(v);try{navigator.clipboard.writeText(v).then(()=>toast('已复制'),fb)}catch(err){fb()}return true}
  }
  return false}
