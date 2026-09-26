/* ================= extras: route rail, day picker, own meal options, photos, actual prices ================= */

/* ---------- 1. day chips: a travel route instead of a scrollbar ---------- */
const PLANE_SVG='<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M21.5 15.2v-1.9l-8-5V3.4a1.5 1.5 0 0 0-3 0v4.9l-8 5v1.9l8-2.5v4.6l-2 1.5v1.5l3.5-1 3.5 1v-1.5l-2-1.5v-4.6z"/></svg>';
function chipRail(di){const n=trip.days.length;
  const stops=trip.days.map((d,k)=>`<button type="button" class="rail-stop${k===di?' on':''}" data-a="goDay" data-v="${k}" style="left:${n>1?(k/(n-1)*100).toFixed(2):50}%;--c:${CC[(d.cities||['sz'])[0]]}" aria-label="第${k+1}天 ${dp(d.date).md}"><i></i><em>${dp(d.date).md}</em></button>`).join('');
  return `<div class="chiprail" id="chiprail"><div class="rail-track"><div class="rail-line"></div>${stops}<span class="rail-plane" id="rail-plane">${PLANE_SVG}</span></div></div>`}
function syncRail(){const box=$('#daychips'),rail=$('#chiprail'),plane=$('#rail-plane');if(!box||!rail)return;
  const over=box.scrollWidth-box.clientWidth;const wrap=box.parentElement;
  wrap.classList.toggle('scrolls',over>4);
  const f=over>4?box.scrollLeft/over:(S.day/Math.max(1,trip.days.length-1));
  wrap.classList.toggle('at-start',box.scrollLeft<4);wrap.classList.toggle('at-end',box.scrollLeft>over-4);
  if(plane)plane.style.left=(f*100).toFixed(2)+'%';
}
function initChipRail(){const box=$('#daychips');if(!box)return;
  const on=box.querySelector('[aria-pressed="true"]');
  if(on){const target=on.offsetLeft-box.clientWidth/2+on.offsetWidth/2;box.scrollLeft=Math.max(0,target)}
  syncRail();
  box.addEventListener('scroll',()=>requestAnimationFrame(syncRail),{passive:true});
}
addEventListener('resize',()=>syncRail());
// drag the plane (or press on the track) to scrub through the days
let railDrag=null;
document.addEventListener('pointerdown',e=>{const tr=e.target.closest('.rail-track');if(!tr||e.target.closest('.rail-stop'))return;const box=$('#daychips');if(!box)return;
  railDrag={tr,box};scrub(e);e.preventDefault()});
addEventListener('pointermove',e=>{if(railDrag)scrub(e)});
addEventListener('pointerup',()=>{railDrag=null});
function scrub(e){const r=railDrag.tr.getBoundingClientRect(),f=Math.min(1,Math.max(0,(e.clientX-r.left)/r.width));const over=railDrag.box.scrollWidth-railDrag.box.clientWidth;
  if(over>4)railDrag.box.scrollLeft=f*over;else{const k=Math.round(f*(trip.days.length-1));if(k!==S.day)goDay(k,true)}}

/* ---------- 2. day picker: postcards instead of a plain dropdown ---------- */
function renderPicker(){const root=$('#picker-root');if(!root)return;
  if(!S.picker){root.innerHTML='';document.body.classList.remove('picker-open');return}
  document.body.classList.add('picker-open');
  const B=calc();
  const cards=trip.days.map((d,k)=>{const p=dp(d.date),c=CC[(d.cities||['sz'])[0]],pp=(B.perDay[k].act+B.perDay[k].h)/B.ppl,on=k===S.day;
    return `<button type="button" class="pk-card${on?' on':''}" data-a="pickDay" data-v="${k}" style="--c:${c};--tilt:${[-1.4,1,-.6,1.3,-1,.7,-1.3,.9,-.5][k%9]}deg"${on?' aria-current="true"':''}>
      <span class="pk-tape"></span><span class="pk-day">DAY ${k+1} · ${p.wd}</span><b class="pk-md">${p.md}</b>
      <span class="pk-title">${esc(d.title)}</span>
      <span class="pk-foot"><span class="dots">${(d.cities||[]).map(x=>`<span class="cdot" style="--c:${CC[x]}"></span>`).join('')}</span><span class="pk-pp">¥${n0(pp)}/人</span></span>
      ${on?'<span class="pk-stamp">正在看</span>':''}</button>`}).join('');
  root.innerHTML=`<div class="pk-back" data-a="pickClose"></div><div class="pk-sheet" role="dialog" aria-modal="true" aria-labelledby="pk-h"><div class="pk-grab" aria-hidden="true"></div>
    <div class="pk-head"><h3 id="pk-h" class="disp">跳到哪一天？</h3><button type="button" class="pk-x" data-a="pickClose" aria-label="关闭">×</button></div>
    <div class="pk-grid">${cards}</div></div>`;
  const cur=root.querySelector('.pk-card.on')||root.querySelector('.pk-card');if(cur)cur.focus({preventScroll:true});
}
function openPicker(){S.picker=true;renderPicker()}
function closePicker(){if(!S.picker)return;S.picker=false;renderPicker();const m=$('.db-mid');if(m)m.focus({preventScroll:true})}
addEventListener('keydown',e=>{if(S.picker&&e.key==='Escape'){e.stopPropagation();closePicker()}},true);

/* ---------- 5. own options, uploads, item photos ---------- */
// every option of a meal slot: built-in ones keep their number, member-added ones use "c:<id>"
function customList(itemId){return ((trip.customOpts||{})[itemId])||[]}
function allOpts(item){const base=(MEAL_OPTS[item.id]||[]).map((o,k)=>({...o,key:k}));
  const orig=(trip.customOrig||{})[item.id];
  const head=!base.length&&orig?[{key:'orig',n:orig.title.replace(MEAL_RE,''),dish:'原本的安排',cost:orig.cost,cur:orig.cur,pl:orig.place,gal:null,orig:true}]:[];
  return head.concat(base,customList(item.id).map(c=>({...c,key:'c:'+c.id,custom:true,pl:''})))}
const canAddOpts=i=>i.kind==='food'||i.kind==='sweet';
function optKey(item){if(typeof item.opt==='string'&&item.opt.startsWith('c:')&&customList(item.id).some(c=>'c:'+c.id===item.opt))return item.opt;
  if(item.opt==='orig')return 'orig';const k=curOpt(item);return k<0?(!(MEAL_OPTS[item.id]||[]).length&&(trip.customOrig||{})[item.id]?'orig':null):k}
function optImgs(o){if(o.custom)return (o.photos||[]).map(id=>({f:upUrl(id),a:memberName(o.by)||'同伴',l:'成员上传',p:'',own:true}));return gal(o.gal)}
const upUrl=id=>'/api/uploads/'+id;
function chooseAny(itemId,key){
  if(typeof key==='number'||/^\d+$/.test(key))return chooseMeal(itemId,+key);
  let item=null,day=null;for(const d of trip.days){const i=d.items.find(x=>x.id===itemId);if(i){item=i;day=d;break}}if(!item)return;
  const o=allOpts(item).find(x=>String(x.key)===String(key));if(!o)return;
  const prefix=mealPrefix(item);
  commit(t=>{for(const d of t.days){const i=d.items.find(x=>x.id===itemId);if(!i)continue;
      if(o.orig){const org=(t.customOrig||{})[itemId];if(org){i.title=org.title;i.place=org.place;i.cost=org.cost;i.cur=org.cur;i.per=org.per||'p'}i.opt='orig';return}
      i.title=prefix+'：'+o.n+(o.dish?'（'+o.dish+'）':'');i.place='';i.cost=+o.cost||0;i.cur=o.cur||'CNY';i.per='p';i.opt=key;return}},
    '已换成 '+(o.orig?'原本的安排':o.n),dp(day.date).md+' '+prefix+' 换成 '+(o.orig?'原本的安排':o.n));
}
// the add-your-own form (shared by the itinerary and the food page)
function addOptForm(item){const ph=S.formPhotos||[];
  return `<form class="addopt" id="addopt-form" data-id="${esc(item.id)}">
    <div class="ao-h"><b>加一个自己的选项</b><small>加好后大家都能看到、都能选</small></div>
    <label>店名<input name="n" required maxlength="40" placeholder="例如：陶陶居"></label>
    <label>吃什么<input name="dish" required maxlength="40" placeholder="例如：虾饺、叉烧包"></label>
    <label>价格（每人）<input name="cost" type="number" min="0" step="1" required inputmode="decimal"></label>
    <label>币种<select name="cur">${[['CNY','人民币'],['HKD','港币'],['MOP','澳门元'],['MYR','马币']].map(([k,n])=>`<option value="${k}"${k===item.cur?' selected':''}>${n}</option>`).join('')}</select></label>
    <label class="full">参考链接（小红书、地图、点评都可以）<input name="link" type="url" maxlength="400" placeholder="https://"></label>
    <label class="full">备注<input name="note" maxlength="120" placeholder="例如：要排队，最好 11 点前到"></label>
    ${photoField(ph)}
    <div class="acts"><button type="button" class="btn ghost" data-a="addOptCancel">取消</button><button type="submit" class="btn">加进选项</button></div></form>`}
function photoField(ph){if(!(CLOUD.on&&CLOUD.me))return '<p class="full ph-note" style="margin:0">上传照片要在 Cloudflare 版本登录后才能用，这里可以先填链接。</p>';
  return `<div class="full upl"><span class="upl-l">照片（最多 4 张，会自动压缩）</span><div class="upl-row" id="upl-row">${ph.map(id=>`<span class="upl-th" style="background-image:url(${upUrl(id)})"><button type="button" data-a="rmPhoto" data-v="${id}" aria-label="移除这张照片">×</button></span>`).join('')}
    ${ph.length<4?`<label class="upl-add"><input type="file" accept="image/*" multiple id="upl-input" hidden><span>＋ 选照片</span></label>`:''}</div><small class="upl-msg" id="upl-msg"></small></div>`}
async function shrinkImage(file){
  const bmp=await createImageBitmap(file).catch(()=>null);if(!bmp)throw new Error('读不了这张图片');
  const scale=Math.min(1,1280/Math.max(bmp.width,bmp.height));const w=Math.round(bmp.width*scale),h=Math.round(bmp.height*scale);
  const cv=document.createElement('canvas');cv.width=w;cv.height=h;cv.getContext('2d').drawImage(bmp,0,0,w,h);
  for(const q of [.82,.7,.55]){const b=await new Promise(r=>cv.toBlob(r,'image/jpeg',q));if(b&&b.size<=1400000)return b}
  throw new Error('图片太大，压缩后还是超过 1.5MB');
}
async function uploadFiles(files){const msg=$('#upl-msg');S.formPhotos=S.formPhotos||[];
  for(const f of files){if(S.formPhotos.length>=4)break;
    try{if(msg)msg.textContent='正在上传 '+f.name+'…';const blob=await shrinkImage(f);
      const r=await fetch('/api/uploads',{method:'POST',headers:{'content-type':'image/jpeg'},body:blob,credentials:'same-origin'});
      const b=await r.json().catch(()=>({}));if(!r.ok)throw new Error(b.error||'上传失败');S.formPhotos.push(b.id)}
    catch(err){if(msg)msg.textContent=err.message;toast(err.message);break}}
  const row=$('#upl-row');if(row){const holder=document.createElement('div');holder.innerHTML=photoField(S.formPhotos);row.closest('.upl').replaceWith(holder.firstElementChild)}
}
document.addEventListener('change',e=>{if(e.target.id==='upl-input'&&e.target.files.length)uploadFiles([...e.target.files])});
document.addEventListener('submit',e=>{if(e.target.id!=='addopt-form')return;e.preventDefault();const f=new FormData(e.target),itemId=e.target.dataset.id;
  const link=String(f.get('link')||'').trim();if(link&&!/^https?:\/\//i.test(link)){toast('链接要以 http:// 或 https:// 开头');return}
  const o={id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),n:String(f.get('n')).trim(),dish:String(f.get('dish')).trim(),cost:Math.max(0,+f.get('cost')||0),cur:f.get('cur'),link,note:String(f.get('note')||'').trim(),photos:(S.formPhotos||[]).slice(0,4),by:CLOUD.email||'',at:Date.now()};
  if(!o.n||!o.dish)return;
  let snap=null,md='';for(const d of trip.days){const i=d.items.find(x=>x.id===itemId);if(i){snap={title:i.title,place:i.place,cost:i.cost,cur:i.cur,per:i.per};md=dp(d.date).md+' '+mealPrefix(i);break}}
  S.addOpt=null;S.formPhotos=[];
  commit(t=>{t.customOpts=t.customOpts||{};t.customOrig=t.customOrig||{};(t.customOpts[itemId]=t.customOpts[itemId]||[]).push(o);if(!(MEAL_OPTS[itemId]||[]).length&&!t.customOrig[itemId]&&snap)t.customOrig[itemId]=snap},'已加入选项：'+o.n,md+' 加了一个选项：'+o.n);
});
function delCustom(itemId,optId){let name='';commit(t=>{const L=((t.customOpts||{})[itemId])||[];const o=L.find(x=>x.id===optId);if(o)name=o.n;t.customOpts[itemId]=L.filter(x=>x.id!==optId);
    for(const d of t.days){const i=d.items.find(x=>x.id===itemId);if(i&&i.opt==='c:'+optId){const org=(t.customOrig||{})[itemId];const base=MEAL_OPTS[itemId];
      if(base&&base[0]){const b=base[0];i.title=mealPrefix(i)+'：'+optName(b).replace(/（.*?）/,'')+'（'+b.dish+'）';i.place=b.pl;i.cost=b.cost;i.cur=b.cur;i.opt=0}
      else if(org){i.title=org.title;i.place=org.place;i.cost=org.cost;i.cur=org.cur;i.opt='orig'}}}},'已删除选项','删除了一个自己加的选项')}
const canDelOpt=o=>o.custom&&(!CLOUD.on||!CLOUD.me||o.by===CLOUD.email||CLOUD.me.isAdmin);
function customCard(item,o,sel,cities,compact){const imgs=optImgs(o),gid=imgs.length?regGal(imgs,o.n,'同伴上传的照片'):'';const c=cny(o.cost,o.cur),myr=+trip.settings.myr||0;const city=(cities||['sz'])[0];
  if(compact)return `<button type="button" class="optmini own${sel?' sel':''}" data-a="chooseAny" data-id="${esc(item.id)}" data-k="${esc(o.key)}" style="--tilt:${sel?0:1}deg">${imgs.length?`<span class="ph-img" style="background-image:url(${esc(imgs[0].f)})"></span>`:'<span class="ph-none own"><em>同伴推荐</em></span>'}<b>${esc(o.n)}</b><small>${esc(o.dish)} · ${CUR[o.cur]||''}${o.cost}/人</small><span class="own-tag">${esc(memberName(o.by)||'自己加的')}</span>${sel?'<span class="stampmark">已选 ✓</span>':''}</button>`;
  return `<div class="opt own${sel?' sel':''}" style="--tilt:${sel?0:.8}deg;--c:${CC[city]}"><div class="tp"></div>
    ${imgs.length?`<div class="thumbs">${imgs.slice(0,3).map((x,j)=>`<button type="button" data-a="lb" data-g="${gid}" data-i="${j}" aria-label="看照片"><span style="background-image:url(${esc(x.f)})"></span></button>`).join('')}</div>`:'<div class="noimg">没有照片</div>'}
    <div class="in"><div class="nr"><b>${esc(o.n)}</b><span class="own-tag">${esc(memberName(o.by)||'')} 推荐</span></div>
      <div class="dish">${esc(o.dish)}</div>
      <div class="pr"><b>${CUR[o.cur]||''}${o.cost}/人</b><small>${o.cur!=='CNY'?'≈¥'+n0(c)+' · ':''}≈RM ${n0(c*myr)}</small></div>
      ${o.note?`<p>${esc(o.note)}</p>`:''}
      <div class="links">${o.link?`<a class="lk d" href="${esc(o.link)}" target="_blank" rel="noopener noreferrer">参考链接</a>`:''}<a class="lk x" href="${xhsU(o.n+' '+CITY[city].n)}" target="_blank" rel="noopener">小红书</a><a class="lk g" href="${gmapU(o.n+' '+CITY[city].n)}" target="_blank" rel="noopener">地图</a></div>
      <div class="own-acts"><button type="button" class="pick" data-a="chooseAny" data-id="${esc(item.id)}" data-k="${esc(o.key)}"${sel?' disabled':''}>${sel?'✓ 已选':'选这家'}</button>${canDelOpt(o)?`<button type="button" class="mini-btn${S.delOpt===o.id?' armed':''}" data-a="delOpt" data-id="${esc(item.id)}" data-v="${esc(o.id)}">${S.delOpt===o.id?'确定删除？':'删除'}</button>`:''}</div></div>
    ${sel?'<span class="stampmark">已选 ✓</span>':''}</div>`}
function origCard(item,o,sel,compact){if(compact)return `<button type="button" class="optmini${sel?' sel':''}" data-a="chooseAny" data-id="${esc(item.id)}" data-k="orig"><span class="ph-none"></span><b>${esc(short(o.n))}</b><small>原本的安排 · ${CUR[o.cur]||''}${o.cost}/人</small>${sel?'<span class="stampmark">已选 ✓</span>':''}</button>`;
  return `<div class="opt${sel?' sel':''}"><div class="noimg">原本的安排</div><div class="in"><div class="nr"><b>${esc(o.n)}</b></div><div class="pr"><b>${CUR[o.cur]||''}${o.cost}/人</b></div><button type="button" class="pick" data-a="chooseAny" data-id="${esc(item.id)}" data-k="orig"${sel?' disabled':''}>${sel?'✓ 已选':'换回这个'}</button></div>${sel?'<span class="stampmark">已选 ✓</span>':''}</div>`}
function addOptTile(item,compact){if(viewerOnly())return '';return S.addOpt===item.id?(compact?'':''):`<button type="button" class="${compact?'optmini':'opt'} add-tile" data-a="addOpt" data-id="${esc(item.id)}"><span class="plus">＋</span><b>自己加一个</b><small>店名、价格、链接和照片</small></button>`}
// item photos + links in the edit form and on the card
function itemMedia(i){const ph=i.photos||[],imgs=ph.map(id=>({f:upUrl(id),a:'同伴上传',l:'成员上传',p:'',own:true}));const gid=imgs.length?regGal(imgs,i.title,'同伴上传的照片'):'';
  if(!imgs.length&&!i.link)return '';
  return `<div class="ev-media">${imgs.map((x,j)=>`<button type="button" class="ev-ph" data-a="lb" data-g="${gid}" data-i="${j}" aria-label="看照片 ${j+1}" style="background-image:url(${esc(x.f)})"></button>`).join('')}${i.link?`<a class="lk d" href="${esc(i.link)}" target="_blank" rel="noopener noreferrer">参考链接</a>`:''}</div>`}

/* ---------- 6. actual prices ---------- */
// what was really paid for an item or a hotel stay; per 'p' = each person, 'g' = whole group
const actualOf=id=>((trip.actual||{})[id])||null;
function priceLine(t){const a=actualOf(t.id),ro=viewerOnly();
  const est=t.hotel?{amt:t.estCny,cur:'CNY',per:'g'}:{amt:t.estAmt,cur:t.estCur,per:t.estPer};
  const fmt=x=>(CUR[x.cur]||'')+n0(x.amt)+(x.per==='g'?'/全组':'/人');
  let diff='';if(a){const ppl=Math.max(1,+trip.settings.people||1);const tot=x=>cny(x.amt,x.cur)*(x.per==='g'?1:ppl);const dv=tot(a)-tot(est);diff=Math.abs(dv)<1?'<span class="pd same">跟预估一样</span>':`<span class="pd ${dv<0?'save':'more'}">${dv<0?'比预估省':'比预估多'} ¥${n0(Math.abs(dv))}</span>`}
  if(ro)return a?`<div class="tk-price"><span>实付 <b>${fmt(a)}</b></span>${diff}</div>`:'';
  return `<form class="tk-price" data-actual="${esc(t.id)}"><span class="tp-l">实付</span>
    <input name="amt" type="number" min="0" step="0.01" inputmode="decimal" value="${a?a.amt:''}" placeholder="${n0(est.amt)}" aria-label="实际价格">
    <select name="cur" aria-label="币种">${[['CNY','¥'],['HKD','HK$'],['MOP','MOP'],['MYR','RM']].map(([k,n])=>`<option value="${k}"${(a?a.cur:est.cur)===k?' selected':''}>${n}</option>`).join('')}</select>
    <select name="per" aria-label="计价">${[['p','每人'],['g','全组']].map(([k,n])=>`<option value="${k}"${(a?a.per:est.per)===k?' selected':''}>${n}</option>`).join('')}</select>
    <button type="submit" class="mini-btn">${a?'更新':'记下'}</button>${a?`<button type="button" class="mini-btn" data-a="clearActual" data-v="${esc(t.id)}">清除</button>`:''}${diff}</form>`}
document.addEventListener('submit',e=>{const id=e.target.dataset&&e.target.dataset.actual;if(!id)return;e.preventDefault();const f=new FormData(e.target);const amt=+f.get('amt');
  if(!(amt>=0)||f.get('amt')===''){toast('请填实际价格');return}
  const t=tickets().find(x=>x.id===id);const v={amt,cur:f.get('cur'),per:f.get('per')};
  commit(x=>{x.actual=x.actual||{};x.actual[id]=v},'已记下实付价格',(t?t.title:id)+' 实付 '+(CUR[v.cur]||'')+amt+(v.per==='g'?'（全组）':'（每人）'))});
