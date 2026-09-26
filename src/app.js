/* ================= app (travel-journal UI) ================= */
const CC={sz:'#c67139',hk:'#a8463f',mo:'#6f8150',zh:'#3f7f86',gz:'#b08628'};
const CODE={sz:'SZX',hk:'HKG',mo:'MFM',zh:'ZUH',gz:'CAN'};
const KC={move:'#82796a',sight:'#56633f',food:'#b2622d',sweet:'#a8506e',shop:'#4f6a8f',show:'#6b559a',hotel:'#3f7f86',rest:'#a19786'};
const WD=['周日','周一','周二','周三','周四','周五','周六'];
const TABS=[['overview','总览'],['itinerary','每日行程'],['now','旅途中'],['map','地图'],['food','美食'],['hotels','住宿'],['tickets','订票清单'],['budget','预算'],['settings','设置']];
// Cloud mode = served from Cloudflare Pages with the /api backend (accounts, profiles, expenses)
const CLOUD={on:false,email:'',me:null,members:[],log:[],expenses:[],rev:0,ver:{},err:''};
const tabsList=()=>CLOUD.on&&CLOUD.me?TABS.slice(0,8).concat([['team','同伴'],['split','分账']],CLOUD.me.isAdmin?[['accounts','账号']]:[],[['settings','设置']]):TABS;
// viewers (只能查看) can read everything but not change shared data
const viewerOnly=()=>!!(CLOUD.on&&CLOUD.me&&CLOUD.me.role==='viewer');
const $=s=>document.querySelector(s);
const clone=o=>JSON.parse(JSON.stringify(o));
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const enc=encodeURIComponent;
const pad=n=>String(n).padStart(2,'0');
const tMin=t=>{const a=String(t||'0:0').split(':').map(Number);return (a[0]||0)*60+(a[1]||0)};
const fmtT=t=>{const h=parseInt(t,10);return h>=24?pad(h-24)+String(t).slice(2):t};
const sortI=a=>a.slice().sort((x,y)=>tMin(x.t)-tMin(y.t));
const dp=iso=>{const [y,m,d]=iso.split('-').map(Number);return {md:m+'/'+d,mmdd:pad(m)+'/'+pad(d),wd:WD[new Date(y,m-1,d).getDay()],dt:new Date(y,m-1,d)}};
const n0=v=>Math.round(v).toLocaleString('en-US');
const TS=(date,t)=>{const [y,m,d]=date.split('-').map(Number);return Date.UTC(y,m-1,d)-8*3600e3+tMin(t)*60e3};
const START=TS('2026-10-09','23:55'),END=TS('2026-10-17','22:00');
const SLO=TS('2026-10-09','20:00'),SHI=TS('2026-10-17','23:00');
const bj=ts=>{const d=new Date(ts+8*3600e3);return (d.getUTCMonth()+1)+'/'+d.getUTCDate()+' '+pad(d.getUTCHours())+':'+pad(d.getUTCMinutes())};
const short=n=>n.split(/[（(·]/)[0].trim();
const xhsU=n=>'https://www.rednote.com/search_result?keyword='+enc(n.replace(/（[^）]*）|\([^)]*\)/g,' ').replace(/·/g,' ').replace(/\s+/g,' ').trim());
const gmapU=n=>'https://www.google.com/maps/search/?api=1&query='+enc(n.replace(/[（）()·]/g,' ').trim());
// what to search on rednote for an itinerary item: the venue if there is one, otherwise the item itself
function xhsQuery(i,pl,d){if(i.kind==='move'&&!/船|缆车|天星|城际|高铁/.test(i.title))return '';if(i.kind==='rest')return '';const city=CITY[pl?pl.c:((d&&d.cities)||['sz'])[0]].n;if(pl)return pl.n+' '+city;const t=i.title.replace(MEAL_RE,'').replace(/（[^）]*）|([^)]*)/g,' ').trim();return t?t+' '+city:''}
const MEAL_RE=/^(早午餐|早餐|午餐|晚餐|早茶|甜品|下午茶|最后一顿晚餐)[：:]\s*/;

/* ---------- state ---------- */
const LS='gba-trip-redesign-v1',LS_OLD='gba-trip-2026-v3';
function norm(o){const d=clone(DEFAULT),s=o.settings||{};return {v:1,rev:o.rev||'x',updatedAt:o.updatedAt||0,settings:{...d.settings,...s,rates:{...d.settings.rates,...(s.rates||{})},hotel:{...d.settings.hotel,...(s.hotel||{})}},days:Array.isArray(o.days)&&o.days.length?o.days:d.days,bookings:o.bookings||{},assign:o.assign||{},bookedBy:o.bookedBy||{}}}
let trip=null;
try{const s=localStorage.getItem(LS)||localStorage.getItem(LS_OLD);if(s){const o=JSON.parse(s);if(o&&o.days)trip=norm(o)}}catch(e){}
if(!trip)trip=norm(clone(DEFAULT));
const S={budView:'pp',tab:'overview',day:0,edit:null,swap:null,pick:null,mapDay:'all',foodCity:'all',foodDay:'all',lb:null,sim:null,delArm:null,resetArm:false,views:{},active:null,json:''};

/* ---------- shared sync (claude.ai) ---------- */
let docRef=null,writing=false,dirty=false,saveTimer=null,readOnly=false,pending=false;
const SAVE_TXT={local:'✎ 修改会自动保存在这台设备',ok:'✓ 已同步 · 同行者打开同一个链接能看到修改',saving:'正在保存…',err:'同步失败，修改先存在这台设备',readonly:'你只能查看，修改只存在这台设备',cloud:'✓ 已同步 · 所有同伴都能看到',cloudErr:'连不上服务器，修改先存在这台设备，恢复后会自动补上'};
function setSync(s){const el=$('#save');el.dataset.s=s==='cloud'?'ok':s==='cloudErr'?'err':s;$('#save-t').textContent=SAVE_TXT[s]}
// fn mutates the plan; msg is the toast; log is the line written to the shared change log (cloud mode)
function commit(fn,msg,log){
  if(viewerOnly()){toast('你只有查看权限，改不了。需要编辑请找管理员');render();return}
  fn(trip);trip.rev=Math.random().toString(36).slice(2);trip.updatedAt=Date.now();
  try{localStorage.setItem(LS,JSON.stringify(trip))}catch(e){}
  if(CLOUD.on&&CLOUD.me){cloudQueue.push({fn,log:log===undefined?msg:log});cloudPump()}
  else if(docRef&&!readOnly){dirty=true;clearTimeout(saveTimer);saveTimer=setTimeout(flush,600)}
  render();if(msg)toast(msg);
}
const cloudQueue=[];let cloudBusy=false;
async function flush(){
  if(writing||!dirty||!docRef)return;writing=true;dirty=false;setSync('saving');
  try{await docRef.set(clone(trip));setSync('ok')}
  catch(e){const c=e&&e.code;if(c==='unavailable'){dirty=true;setTimeout(flush,1200+Math.random()*1200)}else if(c==='invalid_argument'){readOnly=true;setSync('readonly')}else setSync('err')}
  writing=false;if(dirty)flush();
}
(async()=>{try{
  if(!window.claude||typeof window.claude.use!=='function')return;
  const db=await window.claude.use('db');if(!db)return;
  docRef=db.doc('trip/plan');setSync('ok');
  docRef.onSnapshot(snap=>{
    if(snap.metadata&&snap.metadata.hasPendingWrites)return;if(!snap.exists)return;
    const d=snap.data();if(!d||!Array.isArray(d.days)||d.rev===trip.rev)return;
    trip=norm(clone(d));try{localStorage.setItem(LS,JSON.stringify(trip))}catch(e){}
    if(S.day>=trip.days.length)S.day=0;
    if(S.edit)pending=true;else{render();toast('行程已更新（来自同行者）')}
  },()=>setSync('err'));
}catch(e){}})();

/* ---------- domain helpers ---------- */
const hotelFor=c=>{const l=HOTELS[c];if(!l)return null;return l.find(h=>h.id===trip.settings.hotel[c])||l[0]};
function mix(){const p=Math.max(1,+trip.settings.people||1),r=Math.max(1,+trip.settings.rooms||1);const tri=Math.min(r,Math.max(0,p-r*2));return {twin:r-tri,tri,rooms:r}}
const night=H=>{if(!H)return 0;const m=mix();return m.twin*H.p+m.tri*(H.p3||Math.round(H.p*1.35))};
function roomText(){const m=mix(),a=[];if(m.twin)a.push(m.twin+'间双床房');if(m.tri)a.push(m.tri+'间三人房');return a.join(' + ')}
function place(pid){if(!pid)return null;if(pid.startsWith('H:')){const c=pid.slice(2),h=hotelFor(c);if(!h)return null;return {id:pid,n:h.n,c,la:h.la,ln:h.ln,r:h.r,rv:h.rv,hotel:true,hid:h.id,h:'入住一般14:00后，可以先寄存行李'}}const p=PLACES[pid];return p?{id:pid,...p}:null}
const cny=(v,cur)=>(Number(v)||0)*(trip.settings.rates[cur]||1);
function calc(){const s=trip.settings,ppl=Math.max(1,+s.people||1);const cat={hotel:0,move:0,food:0,ticket:0,other:0,misc:0,flight:0},perDay=[],cash={HKD:0,MOP:0};
  trip.days.forEach(d=>{let act=0;d.items.forEach(i=>{const m=i.per==='g'?1:ppl,c=cny(i.cost,i.cur)*m;cat[CAT_OF[i.kind]||'other']+=c;act+=c;if(cash[i.cur]!=null)cash[i.cur]+=(+i.cost||0)*m});const h=d.stay?night(hotelFor(d.stay)):0;cat.hotel+=h;perDay.push({act,h})});
  cat.misc=(+s.misc||0)*ppl;cat.flight=(+s.flight||0)*ppl/(s.myr||1);const c=Object.values(cat).reduce((a,b)=>a+b,0);return {cat,perDay,cny:c,myr:c*(+s.myr||0),ppl,cash}}
function mealPrefix(i){const m=i.title.match(/^(早午餐|早餐|午餐|晚餐|早茶|下午茶|甜品|糖水|最后一顿晚餐)/);if(m)return m[1];if(i.kind==='sweet')return '甜品';const h=parseInt(i.t,10);return h<11?'早餐':h<14?'午餐':h<17?'下午小吃':'晚餐'}
function curOpt(i){const L=MEAL_OPTS[i.id];if(!L)return -1;if(Number.isInteger(i.opt)&&L[i.opt])return i.opt;return L.findIndex(o=>o.pl?o.pl===i.place:!i.place)}
const optName=o=>o.n||(o.pl&&PLACES[o.pl]?PLACES[o.pl].n:'');
function links3(name,city){const q=name.replace(/[（）()·]/g,' ').replace(/\s+/g,' ').trim(),c=CITY[city].n;return `<div class="links"><a class="lk x" href="https://www.rednote.com/search_result?keyword=${enc(q+' '+c)}" target="_blank" rel="noopener">小红书评价</a><a class="lk g" href="https://www.google.com/maps/search/?api=1&query=${enc(q+' '+c)}" target="_blank" rel="noopener">Google 地图评价</a><a class="lk d" href="https://www.dianping.com/search/keyword/0/0_${enc(q)}" target="_blank" rel="noopener">大众点评</a></div>`}
function chooseMeal(itemId,k){const o=MEAL_OPTS[itemId]&&MEAL_OPTS[itemId][k];if(!o)return;
  commit(t=>{for(const d of t.days){const i=d.items.find(x=>x.id===itemId);if(!i)continue;i.title=mealPrefix(i)+'：'+optName(o).replace(/（.*?）/,'')+'（'+o.dish+'）';i.place=o.pl;i.cost=o.cost;i.cur=o.cur;i.per='p';i.opt=k;return}},'已换成 '+short(optName(o)),(()=>{for(const d of trip.days){const i=d.items.find(x=>x.id===itemId);if(i)return dp(d.date).md+' '+mealPrefix(i)+' 换成 '+short(optName(o))}return ''})());
  if(o.pl){S.pick=o.pl;render()}}
function gal(g){const ks=Array.isArray(g)?g:(g?[g]:[]),out=[];ks.forEach(k=>(GALLERY[k]||[]).forEach(x=>out.push({...x,k})));return out}
const placeGal=p=>p?(p.hotel?HOTEL_BRAND[p.hid]:PLACE_GAL[p.id]):null;
// gallery registry so buttons can reference an image list by id
const GREG={};let greg=0;
function regGal(imgs,title,note){const id='g'+(++greg);GREG[id]={imgs,title,note};return id}
function urgency(t){
  const s=t.title+' '+t.how;
  if(t.hotel)return {must:true,why:'4个人订2间双床房；广州碰上广交会，房间紧张。现在就订，选可免费取消。'};
  if(/12306/.test(t.how))return {must:true,why:'约提前15天开售，4个人要连座，周末和热门班次容易卖完。开售当天就买。'};
  if(/博物馆/.test(s))return {must:true,why:'免费但要实名预约，名额有限，提前3–7天。'};
  if(/长隆/.test(s))return {must:true,why:'网上买比现场便宜，入园直接刷护照，不用排队买票。提前1–3天。'};
  if(/船|邮轮/.test(s))return {must:true,why:'班次不多，4个人要同一班，提前1–2天买。'};
  if(t.kind==='food'||t.kind==='sweet')return {must:true,why:'热门店饭点排队久，提前1–2天打电话或在点评上订位。'};
  return {must:false,why:'当天或前一天在 App 上买就可以，先看天气再决定。'};
}
function tickets(){const out=[],ppl=Math.max(1,+trip.settings.people||1);
  trip.days.forEach(d=>sortI(d.items).forEach(i=>{if(i.book)out.push({id:i.id,date:d.date,t:i.t,kind:i.kind,title:i.title,how:i.book,cost:+i.cost?(CUR[i.cur]||'')+n0(+i.cost)+(i.per==='g'?'/全组':'/人'):'免费'})}));
  ['sz','zh','gz'].forEach(c=>{const ns=trip.days.filter(d=>d.stay===c);if(!ns.length)return;const h=hotelFor(c);out.push({id:'hotel-'+c,date:ns[0].date,t:'',title:'订酒店：'+h.n,how:ns.length+' 晚 · '+roomText()+' · 携程 / Trip.com / Agoda'+(c==='gz'?'（广交会期间，最先订）':''),cost:'¥'+n0(night(h)*ns.length),hotel:true})});
  return out.sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:tMin(a.t||'0:0')-tMin(b.t||'0:0'))}
const nowTs=()=>S.sim!=null?S.sim:Date.now();
function timeline(){const tl=[];trip.days.forEach((d,di)=>d.items.forEach(i=>tl.push({d,di,i,ts:TS(d.date,i.t)})));return tl.sort((a,b)=>a.ts-b.ts)}
function nowItemId(){const t=nowTs();if(t<START-3600e3||t>END+3600e3)return null;let id=null;timeline().forEach(x=>{if(x.ts<=t)id=x.i.id});return id}

/* ---------- small renderers ---------- */
const ph=(no,title,note,sm)=>`<div class="ph${sm?' sm':''}"><div style="min-width:0"><div class="ph-no">${no}</div><h2><span class="hl">${esc(title)}</span></h2></div><div class="ph-note">${esc(note)}</div></div>`;
function pickCard(tall){
  const p=place(S.pick);
  if(!p)return `<div class="sticky-note"><div class="tape terra" style="top:-10px;left:50%;margin-left:-46px;transform:rotate(3deg)"></div><p>点地图上的编号，或行程里的 ⌖ 地点名称，这里会显示评分、评价和导航链接。</p></div>`;
  const days=[];trip.days.forEach(d=>{if(d.items.some(x=>x.place===S.pick))days.push(dp(d.date).md)});
  const imgs=gal(placeGal(p));const gid=imgs.length?regGal(imgs,short(p.n),p.hotel?'同品牌其他分店的照片，只用来参考品牌风格，不是这家分店。':''):'';
  return `<div class="pcard"><div class="tape sage" style="top:-11px;left:24px;transform:rotate(-5deg)"></div>
    ${gid?`<button type="button" class="img" data-a="lb" data-g="${gid}" data-i="0" style="height:${tall?170:150}px" aria-label="看照片"><span style="background-image:url(${esc(imgs[0].f)})"></span></button>`:''}
    <div class="in"><div class="meta"><span class="cdot" style="--c:${CC[p.c]}"></span>${CITY[p.c].n}${p.hotel?' · 你选的酒店':''}<span class="star">★ ${p.r?p.r.toFixed(1):'—'}</span><span>参考评分</span></div>
      <div class="nm">${esc(p.n)}</div>
      ${p.h?`<div class="sm">营业：${esc(p.h)}</div>`:''}
      <p>${esc(p.rv||'')}</p>
      <div class="sm">行程里出现在：${days.join('、')||'—'}</div>
      <div class="links">${p.hotel?'':`<a class="lk x" href="${xhsU(p.n+' '+CITY[p.c].n)}" target="_blank" rel="noopener">小红书</a>`}<a class="lk g" href="${gmapU(p.n+' '+CITY[p.c].n)}" target="_blank" rel="noopener">Google 地图</a></div>
    </div></div>`;
}

/* ---------- map ---------- */
const MX=ln=>(ln-113.2)*COS*1000,MY=la=>(23.3-la)*1000;
function mapPoints(scope){
  let pts=[],route=[];
  if(scope==='all'){const seen={};trip.days.forEach(d=>d.items.forEach(i=>{const p=place(i.place);if(p&&!seen[p.id]){seen[p.id]=1;pts.push({...p,label:''})}}))}
  else{let last=null;sortI(trip.days[scope].items).forEach(i=>{const p=place(i.place);if(!p||p.id===last)return;last=p.id;route.push(p)});const m=new Map();route.forEach((p,k)=>{if(!m.has(p.id))m.set(p.id,{...p,nums:[]});m.get(p.id).nums.push(k+1)});pts=[...m.values()].map(p=>({...p,label:p.nums.length>2?p.nums[0]+'…':p.nums.join(',')}))}
  return {pts,route};
}
function fitVB(xy){if(!xy.length)return {x:0,y:0,w:1154,h:1500};const xs=xy.map(p=>p[0]),ys=xy.map(p=>p[1]);const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);const w=Math.max(x1-x0,30),h=Math.max(y1-y0,30),pd=Math.max(w,h)*.22+12;return {x:(x0+x1)/2-w/2-pd,y:(y0+y1)/2-h/2-pd,w:w+pd*2,h:h+pd*2}}
function mapSVG(key,scope){
  const {pts,route}=mapPoints(scope);const vk=key+'|'+scope;
  const vb=S.views[vk]||fitVB(pts.map(p=>[MX(p.ln),MY(p.la)]));
  const r=Math.max(vb.w,vb.h)*.017;
  const poly=a=>'M'+a.map(p=>MX(p[0]).toFixed(1)+','+MY(p[1]).toFixed(1)).join('L');
  let len=0;for(let k=1;k<route.length;k++)len+=Math.hypot(MX(route[k].ln)-MX(route[k-1].ln),MY(route[k].la)-MY(route[k-1].la));
  const rd=route.length>1?'M'+route.map(p=>MX(p.ln).toFixed(1)+','+MY(p.la).toFixed(1)).join('L'):'';
  let s=`<rect x="-3000" y="-3000" width="8000" height="8000" fill="#efe3cc"/>`;
  s+=`<path d="${poly(WATER)}Z" fill="#c9d8cf" stroke="#aebfb3" stroke-width="${(r*.14).toFixed(2)}"/>`;
  ISLANDS.forEach(i=>s+=`<path d="${poly(i)}Z" fill="#efe3cc" stroke="#aebfb3" stroke-width="${(r*.14).toFixed(2)}"/>`);
  s+=`<path d="${poly(RIVER)}" fill="none" stroke="#c9d8cf" stroke-width="${(r*.7).toFixed(2)}" stroke-linecap="round"/>`;
  Object.keys(CITY_LABEL).forEach(c=>s+=`<text x="${MX(CITY_LABEL[c][0])}" y="${MY(CITY_LABEL[c][1])}" font-size="${(r*2.2).toFixed(1)}" fill="rgba(32,30,29,.3)" font-family="'Noto Serif SC',serif" font-weight="700" text-anchor="middle">${CITY[c].n}</text>`);
  if(rd){s+=`<path d="${rd}" fill="none" stroke="#201e1d" stroke-width="${(r*.26).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round" style="stroke-dasharray:${len.toFixed(1)};stroke-dashoffset:${len.toFixed(1)};animation:tpDraw 1.8s cubic-bezier(.4,.1,.3,1) forwards"/>`;
    s+=`<circle r="${(r*.5).toFixed(2)}" fill="#c67139" stroke="#f9f4ed" stroke-width="${(r*.15).toFixed(2)}"><animateMotion dur="${Math.max(5,route.length*.9)}s" repeatCount="indefinite" path="${rd}"/></circle>`}
  pts.forEach(p=>{const sel=S.pick===p.id,rr=r*(sel?1.35:1)*(scope==='all'?.7:1),x=MX(p.ln),y=MY(p.la);
    s+=`<g class="mk" data-pid="${esc(p.id)}" transform="translate(${x.toFixed(1)},${y.toFixed(1)})"><title>${esc(p.n)}</title>`;
    if(sel)s+=`<circle r="${(rr*1.6).toFixed(2)}" fill="rgba(198,113,57,.25)"/>`;
    s+=`<circle r="${rr.toFixed(2)}" fill="${p.hotel?'#201e1d':(CC[p.c]||'#645c50')}" stroke="#f9f4ed" stroke-width="${(rr*.22).toFixed(2)}"/>`;
    if(p.label)s+=`<text font-size="${(rr*(p.label.length>2?.8:1.05)).toFixed(2)}" fill="#f9f4ed" font-weight="700" text-anchor="middle" dy=".35em" font-family="Figtree,sans-serif">${esc(p.label)}</text>`;
    if(scope!=='all'||sel)s+=`<text y="${(rr*2.3).toFixed(2)}" font-size="${(r*.9).toFixed(2)}" fill="#201e1d" text-anchor="middle" font-weight="600" stroke="#f9f4ed" stroke-width="${(r*.3).toFixed(2)}" paint-order="stroke" font-family="'Noto Sans SC',sans-serif">${esc(short(p.n).slice(0,10))}</text>`;
    s+=`</g>`});
  return {svg:`<svg viewBox="${vb.x} ${vb.y} ${vb.w} ${vb.h}" preserveAspectRatio="xMidYMid meet">${s}</svg>`,vb};
}
function mapHTML(key,scope,height){const vk=key+'|'+scope;const {svg}=mapSVG(key,scope);
  return `<div class="map" data-map="${esc(vk)}" data-key="${key}" data-scope="${scope}" style="height:${height}">${svg}
    <div class="map-ctl"><button type="button" data-a="mzoom" data-f="${1/1.4}" aria-label="放大">+</button><button type="button" data-a="mzoom" data-f="1.4" aria-label="缩小">−</button><button type="button" data-a="mreset" aria-label="重置视图">⟲</button></div>
    <div class="map-cap">珠三角示意图 · 拖动 / 滚轮缩放</div></div>`}
function curVB(el){const v=el.querySelector('svg').getAttribute('viewBox').split(/\s+/).map(Number);return {x:v[0],y:v[1],w:v[2],h:v[3]}}
function redrawMap(el){const {svg}=mapSVG(el.dataset.key,el.dataset.scope==='all'?'all':+el.dataset.scope);el.querySelector('svg').outerHTML=svg}
function zoomMap(el,f,fx,fy){const vb=curVB(el);fx=fx==null?.5:fx;fy=fy==null?.5:fy;const nw=Math.min(3000,Math.max(8,vb.w*f)),nh=vb.h*nw/vb.w;S.views[el.dataset.map]={x:vb.x+(vb.w-nw)*fx,y:vb.y+(vb.h-nh)*fy,w:nw,h:nh};redrawMap(el)}
let mapDrag=null,mapMoved=false;
document.addEventListener('pointerdown',e=>{const el=e.target.closest('.map');if(!el||e.button||e.target.closest('.map-ctl'))return;const svg=el.querySelector('svg');const rc=svg.getBoundingClientRect(),vb=curVB(el);mapDrag={el,svg,vb,sx:e.clientX,sy:e.clientY,sc:Math.max(vb.w/rc.width,vb.h/rc.height)};mapMoved=false});
addEventListener('pointermove',e=>{if(!mapDrag)return;const dx=e.clientX-mapDrag.sx,dy=e.clientY-mapDrag.sy;if(Math.abs(dx)+Math.abs(dy)>4)mapMoved=true;if(!mapMoved)return;const v=mapDrag.vb,nv={x:v.x-dx*mapDrag.sc,y:v.y-dy*mapDrag.sc,w:v.w,h:v.h};mapDrag.svg.setAttribute('viewBox',`${nv.x} ${nv.y} ${nv.w} ${nv.h}`);S.views[mapDrag.el.dataset.map]=nv});
addEventListener('pointerup',()=>{mapDrag=null;setTimeout(()=>{mapMoved=false},0)});
document.addEventListener('wheel',e=>{const el=e.target.closest('.map');if(!el)return;e.preventDefault();const rc=el.getBoundingClientRect();zoomMap(el,e.deltaY>0?1.15:1/1.15,(e.clientX-rc.left)/rc.width,(e.clientY-rc.top)/rc.height)},{passive:false});

/* ---------- hero + tabs ---------- */
function renderHero(){
  const B=calc(),tk=tickets(),done=tk.filter(t=>trip.bookings[t.id]).length,t=Date.now();
  const segs=[['sz','深圳','3晚',1],['hk','香港','一日游',2],['zh','珠海','3晚',3],['mo','澳门','一日游',4],['zh','长隆','一日',5],['gz','广州','2晚',6]];
  $('#route').innerHTML=segs.map((s,k)=>`<div class="stop-wrap">${k?'<div class="stop-link"></div>':''}<button type="button" class="stop" data-a="openDay" data-v="${s[3]}" title="看这天的行程"><div class="stamp" style="--c:${CC[s[0]]};--tilt:${[-8,6,-4,9,-6,4][k]}deg">${s[1]==='长隆'?'CL':CODE[s[0]]}</div><b>${s[1]}</b><small>${s[2]}</small></button></div>`).join('');
  let head,big,unit,sub;
  if(t<START){const ms=START-t;head='距离抵达深圳还有';big=Math.floor(ms/864e5);unit='天';sub=`${Math.floor(ms/36e5)%24} 小时 ${Math.floor(ms/6e4)%60} 分`}
  else if(t<=END){const di=Math.min(trip.days.length,Math.floor((t-TS('2026-10-09','00:00'))/864e5)+1);head='旅途进行中';big=di;unit='/ 9 天';sub='点“旅途中”看现在和接下来'}
  else{head='旅程已经结束';big=9;unit='天';sub='欢迎回家'}
  $('#postcard').innerHTML=`<div class="tape sage" style="top:-13px;left:50%;margin-left:-46px;transform:rotate(-4deg)"></div>
    <div class="postmark"><div><b>GBA</b><span>2026.10.09</span></div></div>
    <div style="font-size:13px;color:var(--mute)">${head}</div>
    <div class="cd-big"><b>${big}</b><span>${unit}</span></div>
    <div class="tab-num" style="font-size:14px;color:var(--mute)">${sub}</div>
    <div class="dash"></div>
    <div class="pc-grid"><div><small>人数</small><b>${B.ppl} 人 · ${trip.settings.rooms} 间房</b></div><div><small>每人预算</small><b>RM ${n0(B.myr/B.ppl)}</b></div><div><small>订票进度</small><b>${done} / ${tk.length}</b></div><div><small>城市</small><b>5 座</b></div></div>`;
  renderMeChip();$('#tabs').innerHTML=tabsList().map(([id,l])=>`<button type="button" class="tab" role="tab" data-a="tab" data-v="${id}" aria-selected="${S.tab===id}">${l}</button>`).join('');
}

/* ---------- P.01 overview ---------- */
function pOverview(){
  const B=calc();
  const hotels=['sz','zh','gz'].map(c=>{const h=hotelFor(c),n=trip.days.filter(d=>d.stay===c).length;return `<span><span class="cdot" style="--c:${CC[c]}"></span>${CITY[c].n} ${n}晚 · ${esc(short(h.n))}</span>`}).join('');
  const cards=trip.days.map((d,k)=>{const p=dp(d.date),s=sortI(d.items),c0=CC[(d.cities||['sz'])[0]];
    const hl=s.filter(i=>['sight','show','food'].includes(i.kind)).slice(0,4).map(i=>`<div><span>${fmtT(i.t)}</span><span>${esc(i.title.replace(MEAL_RE,''))}</span></div>`).join('');
    const pp=(B.perDay[k].act+B.perDay[k].h)/B.ppl;
    return `<button type="button" class="ov-card" data-a="openDay" data-v="${k}" style="--tilt:${[-1.6,1.2,-.8,1.8,-1.2,.9,-1.8,1.4,-.6][k%9]}deg;--c:${c0}">
      <div class="tp"></div><div class="ov-date"><b>${p.mmdd.slice(3)}</b><small>${p.wd}</small></div>
      <span class="ov-day">DAY ${k+1} · ${p.md}</span>
      <div class="ov-title">${esc(d.title)}</div>
      <div class="cpills">${(d.cities||[]).map(c=>`<span class="cpill"><span class="cdot" style="--c:${CC[c]}"></span>${CITY[c].n}</span>`).join('')}</div>
      <div class="ov-hl">${hl}</div>
      <div class="ov-foot"><span><span style="color:var(--mute)">每人约 </span><b>¥${n0(pp)}</b></span><span>打开 →</span></div></button>`}).join('');
  return `<section class="page">${ph('P.01','每日一览','九张明信片，一天一张。点开就是当天的详细行程。')}<div class="ov-hotels">${hotels}</div><div class="ov-grid">${cards}</div></section>`;
}

/* ---------- P.02 itinerary ---------- */
function optMini(item,cities){const L=MEAL_OPTS[item.id]||[],cur=curOpt(item);
  return `<div class="optmini-grid">${L.map((o,k)=>{const imgs=gal(o.gal),sel=k===cur;return `<button type="button" class="optmini${sel?' sel':''}" data-a="choose" data-id="${esc(item.id)}" data-k="${k}" style="--tilt:${[-1.2,1,-.7,1.3][k%4]}deg">
    ${imgs.length?`<span class="ph-img" style="background-image:url(${esc(imgs[0].f)})"></span>`:'<span class="ph-none"></span>'}
    <b>${esc(short(optName(o)))}</b><small>${esc(o.dish)} · ${CUR[o.cur]||''}${o.cost}/人</small>
    ${sel?'<span class="stampmark">已选 ✓</span>':''}</button>`}).join('')}</div>`}
function editPanel(i){const o=(obj,v)=>Object.entries(obj).map(([k,n])=>`<option value="${k}"${k===v?' selected':''}>${n}</option>`).join('');
  return `<form class="edit-panel" id="edit-form" data-id="${esc(i.id)}">
    <label>时间（次日写 24:xx）<input name="t" value="${esc(i.t)}" pattern="[0-2][0-9]:[0-5][0-9]" required></label>
    <label>类型<select name="kind">${o(KIND,i.kind)}</select></label>
    <label>费用<input name="cost" type="number" min="0" step="1" value="${+i.cost||0}"></label>
    <label>币种<select name="cur">${o({CNY:'人民币',HKD:'港币',MOP:'澳门元'},i.cur)}</select></label>
    <label>计价<select name="per">${o({p:'每人',g:'全组一共'},i.per)}</select></label>
    <label class="full">标题<input name="title" value="${esc(i.title)}" required></label>
    <label class="full">备注<textarea name="note">${esc(i.note)}</textarea></label>
    <label class="full">订票方式（留空 = 不需要预订）<input name="book" value="${esc(i.book)}"></label>
    <div class="acts"><button type="button" class="btn ghost" data-a="cancelEdit">取消</button><button type="submit" class="btn">保存</button></div></form>`}
function pItinerary(){
  const di=Math.min(S.day,trip.days.length-1),d=trip.days[di],p=dp(d.date),H=d.stay?hotelFor(d.stay):null,B=calc();
  const chips=trip.days.map((x,k)=>{const q=dp(x.date);return `<button type="button" class="dchip" data-a="goDay" data-v="${k}" aria-pressed="${k===di}" style="--tilt:${[-2,1.5,-1,2,-1.5,1,-2,1.5,-1][k%9]}deg;--c:${CC[(x.cities||['sz'])[0]]}"><div class="tp"></div><small>DAY ${k+1} · ${q.wd}</small><b>${q.md}</b><span class="dots">${(x.cities||[]).map(c=>`<span class="cdot" style="--c:${CC[c]}"></span>`).join('')}</span></button>`}).join('');
  const nid=nowItemId();
  const rows=sortI(d.items).map(i=>{
    const pl=place(i.place),opts=MEAL_OPTS[i.id],imgs=gal(placeGal(pl)),kc=KC[i.kind]||'#645c50',booked=trip.bookings[i.id];
    const gid=imgs.length?regGal(imgs,pl?short(pl.n):i.title,pl&&pl.hotel?'同品牌其他分店的照片，只用来参考品牌风格，不是这家分店。':''):'';
    return `<div class="ev${S.active===i.id?' active':''}${nid===i.id?' now':''}" data-ev="${esc(i.id)}" style="--kc:${kc}">
      <div class="ev-time"><b>${fmtT(i.t)}</b>${parseInt(i.t,10)>=24?'<small>次日</small>':''}</div>
      <div class="ev-rail"><div class="ev-dot"></div></div>
      <div class="ev-body"><div class="ev-card">
        <div class="ev-row"><div class="ev-main">
          <div class="ev-tags"><span class="kpill">${KIND[i.kind]||i.kind}</span>${nid===i.id?'<span class="tag-now">进行中</span>':''}${i.book?(booked?'<span class="tag-done">已订</span>':'<span class="tag-book">需预订</span>'):''}</div>
          <div class="ev-title"><span>${esc(i.title)}</span></div>
          ${pl?`<button type="button" class="ev-place" data-a="pick" data-v="${esc(pl.id)}">⌖ ${esc(short(pl.n))}</button>`:''}
        </div>
        ${gid?`<button type="button" class="ev-thumb" data-a="lb" data-g="${gid}" data-i="0" aria-label="看照片"><i></i><span style="background-image:url(${esc(imgs[0].f)})"></span></button>`:''}
        <div class="ev-cost">${+i.cost?(CUR[i.cur]||'')+n0(+i.cost):''}<small>${+i.cost?(i.per==='g'?'全组':'每人'):''}</small></div></div>
        ${i.note?`<p class="ev-note">${esc(i.note)}</p>`:''}
        ${i.book?`<p class="ev-book">订票：${esc(i.book)}</p>`:''}
        <div class="ev-acts">
          ${opts?`<button type="button" class="swapbtn" data-a="swap" data-id="${esc(i.id)}" aria-expanded="${S.swap===i.id}">⇄ 换一家（${opts.length} 选 1）</button>`:''}
          ${xhsQuery(i,pl,d)?`<a class="lk x" href="${xhsU(xhsQuery(i,pl,d))}" target="_blank" rel="noopener" title="在小红书搜：${esc(xhsQuery(i,pl,d))}">小红书</a>`:''}
          ${pl?`<a class="lk g" href="${gmapU(pl.n+' '+CITY[pl.c].n)}" target="_blank" rel="noopener">地图导航</a>`:''}
          <span class="sp"></span>
          <button type="button" class="mini-btn" data-a="edit" data-id="${esc(i.id)}">✎ 编辑</button>
          <button type="button" class="mini-btn${S.delArm===i.id?' armed':''}" data-a="del" data-id="${esc(i.id)}">${S.delArm===i.id?'确定删除？':'删除'}</button>
        </div>
        ${S.swap===i.id&&opts?optMini(i,d.cities):''}
        ${S.edit===i.id?editPanel(i):''}
      </div></div></div>`}).join('');
  const pp=(B.perDay[di].act+B.perDay[di].h)/B.ppl;
  return `<section class="page">
    <div class="daychips">${chips}</div>
    ${dayBar(di)}
    <div class="it-wrap">
      <div class="notebook nb-page" id="nb">
        <div class="holes"></div>
        <div class="day-top"><div style="min-width:0">
          <div class="eyebrow">第 ${di+1} 天 · ${p.md} ${p.wd}</div>
          <h2><span class="hl">${esc(d.title)}</span></h2>
          <div class="day-meta"><span class="nw">住：${H?esc(short(H.n)):'不住宿（回程）'}</span><span class="nw">每人约 <b>¥${n0(pp)}</b> ≈ RM ${n0(pp*trip.settings.myr)}</span><span class="nw">${d.items.length} 项安排</span></div>
        </div><div class="day-nav"><button type="button" class="rbtn" data-a="goDay" data-v="${di-1}" aria-label="前一天"${di===0?' disabled':''}>←</button><button type="button" class="rbtn go" data-a="goDay" data-v="${di+1}" aria-label="后一天"${di===trip.days.length-1?' disabled':''}>→</button></div></div>
        <div>${rows}</div>
        <div style="padding-left:78px;margin-top:10px"><button type="button" class="addbtn" data-a="add">＋ 加一项安排</button></div>
        ${dayFoot(di)}
      </div>
      <aside class="side stick">
        <div class="mapframe"><div class="tape sage" style="top:-12px;left:18px;transform:rotate(-8deg)"></div><div class="tape terra" style="top:-12px;right:18px;transform:rotate(7deg)"></div>${mapHTML('mini',di,'340px')}</div>
        <div id="pick-slot">${pickCard(false)}</div>
        <div class="side-hint">手机上左右滑动、电脑上按 ← → 切换天数</div>
      </aside>
    </div></section>`;
}

/* ---------- P.03 now ---------- */
function nowParts(){
  const t=nowTs(),tl=timeline();let ci=-1;tl.forEach((x,k)=>{if(x.ts<=t)ci=k});
  const ended=t>END+3600e3,cur=ci>=0&&!ended&&t>=START-3600e3?tl[ci]:null;
  const phase=ended?'旅程已经结束':t<START?'距离抵达深圳':'旅途进行中 · 距离返程起飞';
  const cdt=t<START?START-t:Math.max(0,END-t);
  const boxes=[['天',Math.floor(cdt/864e5)],['时',Math.floor(cdt/36e5)%24],['分',Math.floor(cdt/6e4)%60],['秒',Math.floor(cdt/1e3)%60]];
  const fm=x=>{const p=place(x.i.place);return {when:dp(x.d.date).md+' '+fmtT(x.i.t),kind:KIND[x.i.kind],title:x.i.title,place:p?p.n:'',note:x.i.note}};
  const eta=ms=>{const m=Math.round(ms/6e4);if(m<1)return '马上';if(m<60)return m+' 分钟后';const h=Math.floor(m/60);if(h<24)return h+' 小时'+(m%60?' '+m%60+' 分':'')+'后';return Math.floor(h/24)+' 天后'};
  const next=tl.slice(ci+1,ci+7).map((x,k)=>({...fm(x),eta:eta(x.ts-t),first:k===0}));
  const clamp=Math.min(SHI,Math.max(SLO,t));
  return {t,phase,boxes,cur:cur?fm(cur):null,ended,next,clamp};
}
function nowDynamic(){const P=nowParts();
  return {
    cd:`<div class="eyebrow">${P.phase}</div><div class="sheets">${P.boxes.map(([l,v])=>`<div class="sheet"><div class="ring"><i></i><i></i></div><b>${pad(v)}</b><small>${l}</small></div>`).join('')}</div><div style="font-size:13px;color:var(--mute);margin-top:12px">北京时间 ${bj(P.t)}</div>`,
    lab:bj(P.clamp),
    days:trip.days.map((d,k)=>{const on=P.t>=TS(d.date,'00:00')&&P.t<TS(d.date,'24:00');return `<button type="button" data-a="simDay" data-v="${k}" aria-pressed="${on}">${dp(d.date).md}</button>`}).join(''),
    cur:`<div class="tape terra" style="top:-12px;left:50%;margin-left:-46px;transform:rotate(2deg)"></div><div class="live"><i></i>正在进行</div>`+(P.cur?`<div style="margin-top:12px"><div style="font-size:13px">${esc(P.cur.when)} · ${esc(P.cur.kind)}</div><div class="t">${esc(P.cur.title)}</div><div style="font-size:13px">${esc(P.cur.place)}</div>${P.cur.note?`<p style="margin:8px 0 0;font-size:13px">${esc(P.cur.note)}</p>`:''}</div>`:`<p style="margin:12px 0 0">${P.ended?'欢迎回家，记得把照片整理出来。':'旅程还没开始。拖动上面的时间条，可以预览旅途中任何一刻。'}</p>`),
    next:`<div class="eyebrow">接下来</div><div style="display:flex;flex-direction:column;margin-top:8px">${P.next.map(x=>`<div class="nx${x.first?' first':''}"><i></i><span class="w">${esc(x.when)}</span><span class="tt">${esc(x.title)}</span><span class="e">${x.eta}</span></div>`).join('')||'<p class="ph-note">没有更多安排了。</p>'}</div>`,
    val:Math.round((P.clamp-SLO)/6e4)};
}
function pNow(){const D=nowDynamic();
  return `<section class="page" style="display:flex;flex-direction:column;gap:26px">${ph('P.03','旅途中','出发前可以拖动时间条，预览旅途中任何一刻在做什么、下一站是哪。')}
    <div class="now-top"><div class="cd-col" id="now-cd">${D.cd}</div>
      <div class="sim-card"><div class="row"><div style="font-weight:700;flex:1 1 auto">拖动预览旅途中的某个时刻</div><button type="button" class="ink-btn" data-a="simOff" id="sim-off"${S.sim==null?' hidden':''}>回到现在</button></div>
        <div class="sim-label" id="sim-lab">${D.lab}</div>
        <input type="range" id="sim-range" min="0" max="${Math.round((SHI-SLO)/6e4)}" step="5" value="${D.val}" aria-label="预览时间">
        <div class="sdays" id="sim-days">${D.days}</div></div></div>
    <div class="now-bottom"><div class="now-cur" id="now-cur">${D.cur}</div><div class="notebook now-next" id="now-next">${D.next}</div></div></section>`}
function refreshNow(){if(S.tab!=='now')return;const D=nowDynamic();$('#now-cd').innerHTML=D.cd;$('#sim-lab').textContent=D.lab;$('#sim-days').innerHTML=D.days;$('#now-cur').innerHTML=D.cur;$('#now-next').innerHTML=D.next;$('#sim-off').hidden=S.sim==null;const r=$('#sim-range');if(r&&document.activeElement!==r)r.value=D.val}

/* ---------- P.04 map ---------- */
function pMap(){
  const chips=[['all','全部地点']].concat(trip.days.map((d,k)=>[k,dp(d.date).md+' '+d.title])).map(([k,l])=>`<button type="button" class="chip" data-a="mapDay" data-v="${k}" aria-pressed="${String(S.mapDay)===String(k)}">${esc(l)}</button>`).join('');
  const legend=Object.keys(CITY).map(c=>`<span><i style="--c:${CC[c]}"></i>${CITY[c].n}</span>`).join('')+`<span><i style="--c:#201e1d"></i>酒店</span>`;
  return `<section class="page">${ph('P.04','地图','珠三角示意图。选一天看它的路线，编号就是当天的顺序。')}
    <div class="chips">${chips}</div><div class="legend">${legend}</div>
    <div class="map-wrap"><div class="map-big"><div class="tape sage" style="top:-12px;left:30px;transform:rotate(-6deg)"></div><div class="tape terra" style="top:-12px;right:30px;transform:rotate(5deg)"></div>${mapHTML('full',S.mapDay,'min(640px,72vh)')}</div>
    <div style="flex:1 1 300px;min-width:0;padding-top:10px" id="pick-slot">${pickCard(true)}</div></div></section>`}

/* ---------- P.05 food ---------- */
function optCard(item,cities){const L=MEAL_OPTS[item.id]||[],cur=curOpt(item),myr=+trip.settings.myr||0;
  return L.map((o,k)=>{const p=o.pl?PLACES[o.pl]:null,city=p?p.c:(cities||['sz'])[0],name=optName(o),c=cny(o.cost,o.cur),imgs=gal(o.gal),sel=k===cur,sh=imgs.slice(0,3),gid=imgs.length?regGal(imgs,short(name)):'';
    return `<div class="opt${sel?' sel':''}" style="--tilt:${[-1.2,1,-.7,1.3][k%4]}deg;--c:${CC[city]}"><div class="tp"></div>
      ${imgs.length?`<div class="thumbs">${sh.map((x,j)=>`<button type="button" data-a="lb" data-g="${gid}" data-i="${j}" aria-label="看照片"><span style="background-image:url(${esc(x.f)})"></span>${j===sh.length-1&&imgs.length>sh.length?`<em>+${imgs.length-sh.length}</em>`:''}</button>`).join('')}</div>`:'<div class="noimg">暂时没有可用的免版权照片，点下面的小红书看实拍</div>'}
      <div class="in"><div class="nr"><b>${esc(name)}</b><span>${p&&p.r?'★ '+p.r.toFixed(1):''}</span></div>
        <div class="dish">${esc(o.dish)}</div>
        <div class="pr"><b>${CUR[o.cur]||''}${o.cost}/人</b><small>${o.cur!=='CNY'?'≈¥'+n0(c)+' · ':''}≈RM ${n0(c*myr)}</small></div>
        ${p?`<p>${esc(p.rv)}</p>`:''}
        ${links3(p?name:o.dish,city)}
        <button type="button" class="pick" data-a="choose" data-id="${esc(item.id)}" data-k="${k}"${sel?' disabled':''}>${sel?'✓ 已选':'选这家'}</button></div>
      ${sel?'<span class="stampmark">已选 ✓</span>':''}</div>`}).join('')}
function pFood(){
  const bucket=i=>i.kind==='sweet'?'s':(i.t<'10:30'?'b':(i.t<'16:30'?'l':'d'));
  const cell=a=>`<div class="mcell">${a.length?a.map(m=>`<div>${esc(m.t)} <small>${m.c}</small></div>`).join(''):'<span class="none">—</span>'}</div>`;
  const rows=trip.days.map((d,k)=>{const m={b:[],l:[],d:[],s:[]};sortI(d.items).filter(i=>i.kind==='food'||i.kind==='sweet').forEach(i=>m[bucket(i)].push({t:i.title.replace(MEAL_RE,''),c:+i.cost?(CUR[i.cur]||'')+n0(+i.cost):''}));const p=dp(d.date);
    return `<div class="mrow body" data-a="openDay" data-v="${k}"><div class="d"><b>${p.md}</b><small>${p.wd}</small></div>${cell(m.b)}${cell(m.l)}${cell(m.d)}${cell(m.s)}</div>`}).join('');
  const fdChips=[['all','全部']].concat(trip.days.map((d,k)=>[k,dp(d.date).md+' '+d.title])).map(([k,l])=>`<button type="button" class="chip" data-a="foodDay" data-v="${k}" aria-pressed="${String(S.foodDay)===String(k)}">${esc(l)}</button>`).join('');
  const slotDays=trip.days.map((d,di)=>({d,di})).filter(({di})=>S.foodDay==='all'||+S.foodDay===di).map(({d})=>{const its=sortI(d.items).filter(i=>MEAL_OPTS[i.id]);if(!its.length)return '';const p=dp(d.date);
    return `<div><h3 class="slot-dh"><span>${p.md} ${p.wd}</span><span>${esc(d.title)}</span></h3><div class="slots">${its.map(i=>{const c=curOpt(i);return `<div class="slot"><div class="slot-h"><span class="t">${fmtT(i.t)}</span><b class="nw">${mealPrefix(i)}</b><small>现在选的：${c<0?'你自定义的安排 · '+esc(i.title):esc(optName(MEAL_OPTS[i.id][c]))}</small></div><div class="optgrid">${optCard(i,d.cities)}</div></div>`}).join('')}</div></div>`}).join('');
  const fChips=[['all','全部','#201e1d'],...Object.keys(CITY).map(c=>[c,CITY[c].n,CC[c]])].map(([k,l,c])=>`<button type="button" class="chip" data-a="foodCity" data-v="${k}" aria-pressed="${S.foodCity===k}"><span class="cdot" style="--c:${c}"></span>${l}</button>`).join('');
  const foods=FOODS.map((f,k)=>({f,k})).filter(({f})=>S.foodCity==='all'||f.c===S.foodCity).map(({f,k})=>{const imgs=gal(f.g),p=f.w?place(f.w):null,gid=imgs.length?regGal(imgs,f.n):'';
    return `<div class="fwrap" style="--tilt:${[-1.5,1,-.7,1.6,-1.1,.8][k%6]}deg;--c:${CC[f.c]}"><div class="flip" data-a="flip">
      <div class="face front" style="--tr:${[-4,3,-2,5][k%4]}deg"><div class="tp"></div>
        <div class="pic">${imgs.length?`<span class="im" role="img" aria-label="${esc(f.n)}" style="background-image:url(${esc(imgs[0].f)})"></span>`:''}<span class="cty"><span class="cdot" style="--c:${CC[f.c]}"></span>${CITY[f.c].n}</span></div>
        <div class="bt"><div class="nr"><div style="min-width:0"><b>${esc(f.n)}</b><small>${esc(f.p)}</small></div><span class="flipi">↻</span></div>${links3(p?p.n:f.n,f.c)}</div></div>
      <div class="face back"><div class="hd"><small>${CITY[f.c].n} · 必吃</small><b>${esc(f.n)}</b></div>
        <div class="bd"><p>${esc(f.d)}</p><div style="font-size:13px;font-weight:700">${esc(f.p)}</div>
          ${p?`<button type="button" class="rec" data-a="toMap" data-v="${esc(p.id)}">推荐：<b>${esc(p.n)}</b> <span style="color:var(--acc-h);font-weight:700" class="nw">★ ${p.r?p.r.toFixed(1):''}</span> · 在地图上看 →</button><div class="rv">${esc(p.rv)}</div>`:''}
          <div class="end">${links3(p?p.n:f.n,f.c)}${gid?`<button type="button" class="photos-btn" data-a="lb" data-g="${gid}" data-i="0">看照片 (${imgs.length})</button>`:''}</div></div></div>
    </div></div>`}).join('');
  return `<section class="page food-page">
    <div>${ph('P.05','每日餐单','人均价格 · 在下面换餐厅，这里和行程都会跟着变。点一行打开那天的行程。',1)}
      <div class="notebook meal-tbl"><div class="meal-in"><div class="mrow head"><span>日期</span><span>早餐（人均）</span><span>午餐（人均）</span><span>晚餐（人均）</span><span>甜品 · 小吃（人均）</span></div>${rows}</div></div></div>
    <div>${ph('P.05·2','换餐厅','每一餐有 2–4 个选择，点「选这家」就会更新行程和预算。',1)}
      <div class="chips" style="margin-bottom:18px">${fdChips}</div>
      ${slotDays?`<div class="slot-days">${slotDays}</div>`:'<p class="ph-note">这一天没有可以换的餐。</p>'}</div>
    <div>${ph('P.05·3','必吃清单','点卡片翻面看做法、推荐店和评价链接。评分是各平台的大致水平。',1)}
      <div class="chips wrap" style="margin-bottom:26px">${fChips}</div>
      <div class="fgrid">${foods}</div>
      <p class="fnote">照片来自 Wikimedia Commons 的免版权图片（点大图可以看作者和授权），用来展示这道菜的样子，不一定拍自推荐的那家店。每家店的实拍照片和最新评价，请点小红书、Google 地图或大众点评链接。</p></div>
  </section>`;
}

/* ---------- P.06 hotels ---------- */
function pHotels(){const ppl=Math.max(1,+trip.settings.people||1);
  const cities=['sz','zh','gz'].map(c=>{const ns=trip.days.filter(d=>d.stay===c);
    const cards=HOTELS[c].map((h,hk)=>{const sel=trip.settings.hotel[c]===h.id,nc=night(h),g=gal(HOTEL_BRAND[h.id]);
      return `<button type="button" class="hcard${sel?' sel':''}" data-a="hotel" data-c="${c}" data-v="${h.id}" style="--tilt:${[-1.2,.8,-.6][hk%3]}deg;--c:${CC[c]}" aria-pressed="${sel}"><div class="tp"></div>
        <div class="pic">${g[0]?`<span class="im" style="background-image:url(${esc(g[0].f)})"></span>`:''}<span class="tier">${esc(h.tier)}</span></div>
        ${sel?'<span class="stampmark">已选 ✓</span>':''}
        <div class="in"><div class="nm">${esc(h.n)}</div><div class="ar">${esc(h.area)} · <b>★ ${h.r.toFixed(1)}</b></div><p>${esc(h.rv)}</p>
          <div class="pc">${h.pro.map(x=>`<span class="p">＋ ${esc(x)}</span>`).join('')}${h.con.map(x=>`<span class="c">－ ${esc(x)}</span>`).join('')}</div>
          <div class="ft"><div><b>¥${n0(nc)}<small> /晚</small></b><div class="tot">合计 ¥${n0(nc*ns.length)} · 每人 ¥${n0(nc*ns.length/ppl)}</div></div><span class="sb">${sel?'✓ 已选择':'选这家'}</span></div></div></button>`}).join('');
    return `<div><div class="hcity-h"><div class="hcode" style="--c:${CC[c]}">${CODE[c]}</div><h3>${CITY[c].n}</h3><span class="nw" style="font-size:13px;color:var(--mute)">${ns.length} 晚 · ${ns.length?dp(ns[0].date).md+' – '+dp(ns[ns.length-1].date).md+' 入住':''}</span></div><div class="hgrid">${cards}</div></div>`}).join('');
  return `<section class="page" style="display:flex;flex-direction:column;gap:40px"><div>${ph('P.06','住宿选择','每座城市三家可选，价格为每晚估价。选好的酒店会自动算进预算和订票清单。')}
    <div style="font-size:13px;color:var(--mute);margin-top:-8px">${ppl} 人住 ${roomText()}${mix().tri?' · 三人房数量少，订之前在携程上筛选“三人间 / 家庭房”或打电话问酒店。':''}广州那两晚碰上广交会，已按上涨后的价格估算。</div></div>${cities}</section>`}

/* ---------- P.07 tickets ---------- */
function pTickets(){const tk=tickets(),done=tk.filter(t=>trip.bookings[t.id]).length,pct=tk.length?Math.round(done/tk.length*100):0;
  const row=t=>{const on=!!trip.bookings[t.id],p=dp(t.date),u=urgency(t);let sale='';if(/12306/.test(t.how)){const s=new Date(p.dt);s.setDate(s.getDate()-14);sale=`约 ${s.getMonth()+1}/${s.getDate()} 开售`}
    return `<button type="button" class="tkr${on?' done':''}" data-a="book" data-v="${esc(t.id)}" aria-pressed="${on}"><span class="box">${on?'✓':''}</span><span class="w">${p.md}${t.t?' '+fmtT(t.t):''}</span>
      <span class="m"><b>${esc(t.title)}</b><small>${esc(t.how)}${sale?` · <span class="sale">${sale}</span>`:''}</small><small class="why">${esc(u.why)}</small></span><span class="c">${esc(t.cost)}</span>${on?`<span class="stampmark terra">已订 ✓${trip.bookedBy&&trip.bookedBy[t.id]?' · '+esc(memberName(trip.bookedBy[t.id])):''}</span>`:''}</button>${CLOUD.on&&CLOUD.me?ownerLine(t):''}`};
  const groups=[['必须提前订','酒店、高铁、热门门票和订位',tk.filter(t=>urgency(t).must)],['当天或前一天订也可以','视天气和体力决定',tk.filter(t=>!urgency(t).must)]].filter(g=>g[2].length).map(([ti,sub,list])=>`<div><div class="tk-gh"><h3>${ti}</h3><span>${sub} · ${list.filter(t=>trip.bookings[t.id]).length}/${list.length}</span></div><div class="notebook tk-page"><div class="holes"></div>${list.map(row).join('')}</div></div>`).join('');
  return `<section class="page" style="display:flex;flex-direction:column;gap:30px">${ph('P.07','订票清单','点一下标记为已订，会盖上一个印章。酒店按你在「住宿」里选的那家计算。')}
    <div class="tk-sum"><div class="tape terra" style="top:-12px;right:40px;transform:rotate(6deg)"></div>
      <div class="ring"><svg viewBox="0 0 110 110" width="110" height="110"><circle cx="55" cy="55" r="46" fill="none" stroke="#ccdbb2" stroke-width="12"/><circle cx="55" cy="55" r="46" fill="none" stroke="#c67139" stroke-width="12" stroke-linecap="round" stroke-dasharray="289" style="stroke-dashoffset:${(289*(1-pct/100)).toFixed(1)};transition:stroke-dashoffset .7s cubic-bezier(.3,.7,.3,1)"/></svg><b>${pct}%</b></div>
      <div style="flex:1 1 240px"><div class="t">已订 ${done} / ${tk.length} 项</div><div class="s">越早订越省心，高铁和热门门票通常提前几天开售。</div></div></div>
    ${groups}</section>`}

/* ---------- P.08 budget ---------- */
// Rates are shown per 1 MYR; internally the budget still stores CNY→MYR and HKD/MOP→CNY.
const perMYR={CNY:()=>1/(+trip.settings.myr||.59),HKD:()=>perMYR.CNY()/(trip.settings.rates.HKD||.92),MOP:()=>perMYR.CNY()/(trip.settings.rates.MOP||.89)};
const SLIDERS=[
  {k:'people',l:'出行人数',min:1,max:10,step:1,dec:0,suf:'人',int:true,get:()=>trip.settings.people,set:(t,v)=>{t.settings.people=v;if(t.settings.rooms<Math.ceil(v/3))t.settings.rooms=Math.ceil(v/3)}},
  {k:'rooms',l:'酒店房间数',min:1,max:6,step:1,dec:0,suf:'间',int:true,get:()=>trip.settings.rooms,set:(t,v)=>{t.settings.rooms=v}},
  {k:'flight',l:'机票（每人来回）',min:0,max:3000,step:10,dec:0,pre:'RM',get:()=>trip.settings.flight,set:(t,v)=>{t.settings.flight=v}},
  {k:'misc',l:'杂费（每人，人民币）',min:0,max:3000,step:50,dec:0,pre:'¥',get:()=>trip.settings.misc,set:(t,v)=>{t.settings.misc=v}},
  {k:'rCNY',l:'1 马币 = ? 人民币',min:1.4,max:1.9,step:.005,dec:3,suf:'¥',rate:true,get:()=>perMYR.CNY(),set:(t,v)=>{const h=perMYR.HKD(),m=perMYR.MOP();t.settings.myr=1/v;t.settings.rates.HKD=v/h;t.settings.rates.MOP=v/m}},
  {k:'rHKD',l:'1 马币 = ? 港币',min:1.5,max:2.1,step:.005,dec:3,suf:'HK$',rate:true,get:()=>perMYR.HKD(),set:(t,v)=>{t.settings.rates.HKD=perMYR.CNY()/v}},
  {k:'rMOP',l:'1 马币 = ? 澳门元',min:1.5,max:2.2,step:.005,dec:3,suf:'MOP',rate:true,get:()=>perMYR.MOP(),set:(t,v)=>{t.settings.rates.MOP=perMYR.CNY()/v}}];
const fmtS=(s,v)=>s.dec?(+v).toFixed(s.dec):String(Math.round(v));
function applySetting(k,raw){const s=SLIDERS.find(x=>x.k===k);if(!s)return;let v=+raw;
  if(!isFinite(v)||v<=0&&(s.rate||s.int)||v<0){toast('请输入有效的数字');render();return}
  if(s.int)v=Math.max(s.min,Math.round(v));
  commit(t=>s.set(t,v),null,'把「'+s.l+'」改成 '+(s.pre||'')+fmtS(s,v)+(s.suf?' '+s.suf:''))}
function pBudget(){const B=calc(),myr=+trip.settings.myr||0,n=B.ppl;
  const cl=[['hotel','住宿','#3f7f86'],['food','餐饮','#c67139'],['ticket','门票 · 体验','#56633f'],['move','交通','#82796a'],['other','购物 · 其他','#4f6a8f'],['misc','杂费','#a8506e'],['flight','机票','#201e1d']];
  const pp=S.budView!=='all',div=pp?n:1;
  const mx=Math.max(1,...cl.map(c=>B.cat[c[0]]));
  const dayV=k=>(B.perDay[k].act+B.perDay[k].h)/div;const dm=Math.max(1,...trip.days.map((d,k)=>dayV(k)));
  const seg=`<div class="seg" role="group" aria-label="显示方式"><button type="button" data-a="budView" data-v="pp" aria-pressed="${pp}">每人</button><button type="button" data-a="budView" data-v="all" aria-pressed="${!pp}">${n} 人合计</button></div>`;
  return `<section class="page">${ph('P.08','预算','拖动左边的便签，右边的账单会立刻重新算。金额按人民币和马币同时显示。')}
    <div class="bud"><div class="sliders"><div class="tape terra" style="top:-12px;left:50%;margin-left:-46px;transform:rotate(-3deg)"></div>
      ${SLIDERS.map(s=>{const v=s.get();return `<div class="srow"><div class="lr"><label for="n-${s.k}">${s.l}</label><span class="numwrap">${s.pre?`<i>${s.pre}</i>`:''}<input type="number" class="num" id="n-${s.k}" data-n="${s.k}" value="${fmtS(s,v)}" min="${s.int?s.min:0}" step="${s.dec?'0.001':s.step}" inputmode="decimal">${s.suf?`<i>${s.suf}</i>`:''}</span></div><input type="range" data-s="${s.k}" min="${s.min}" max="${s.max}" step="${s.step}" value="${v}" aria-label="${s.l}"></div>`}).join('')}
      <p>汇率都以马币为准，可以直接在方框里输入，也可以拖动。杂费默认 ¥500/人，包含 eSIM 流量、手信和应急开销。机票按每人来回 RM 1,100 估算，订好后改成实际价格。</p></div>
    <div class="bud-r"><div class="receipt"><div class="rc-h">GBA TRIP · 预算账单</div>
      <div class="rc-tot"><div><small>每人</small><div class="big">RM ${n0(B.myr/n)}</div><div class="sub">¥${n0(B.cny/n)}</div></div>
        <div><small>${n} 人合计</small><div class="mid">RM ${n0(B.myr)}</div><div class="sub">¥${n0(B.cny)}</div></div>
        <div><small>要换的现金</small><div class="cash" style="margin-top:4px">HK$ ${n0(B.cash.HKD)}</div><div class="cash">MOP ${n0(B.cash.MOP)}</div></div></div>
      <div class="cats-h"><span>${pp?'每人分类花费':n+' 人分类合计'}</span>${seg}</div>
      <div class="cats">${cl.map(([k,l,c])=>`<div class="cat"><span>${l}</span><div class="tr"><i style="width:${Math.round(B.cat[k]/mx*100)}%;--c:${c}"></i></div><span class="v">¥${n0(B.cat[k]/div)} · RM ${n0(B.cat[k]/div*myr)}</span></div>`).join('')}
        <div class="cat tot"><span>${pp?'每人合计':'全部合计'}</span><div></div><span class="v">¥${n0(B.cny/div)} · RM ${n0(B.myr/div)}</span></div></div></div>
      <div class="daybars"><div class="t">${pp?'每天每人':'每天 '+n+' 人合计'}花多少（¥，含住宿）· 点柱子看那天</div>
        <div class="bars">${trip.days.map((d,k)=>`<button type="button" data-a="openDay" data-v="${k}" title="${esc(d.title)}"><small>${n0(dayV(k))}</small><i style="height:${Math.max(3,Math.round(dayV(k)/dm*100))}%;--c:${CC[(d.cities||['sz'])[0]]}"></i><em>${dp(d.date).md}</em></button>`).join('')}</div></div></div></div></section>`}

/* ---------- P.09 settings ---------- */
function pSettings(){const synced=!!docRef||CLOUD.on;
  return `<section class="page">${ph('P.09','设置与备份',synced?'出发前确认一下这几件事。行程改动会同步给打开同一个 claude.ai 链接的同行者。':'出发前确认一下这几件事。行程改动只存在这台设备上，要分享给同行者就导出成文字。')}
    <div class="set"><div class="notebook nb"><div class="holes"></div><h3>待你确认的事</h3><ul>
      <li><b>4 人（2男2女）</b>住 <b>2 间双床房</b>：男生一间，女生一间。</li>
      <li>10/9 <b>23:55</b> 抵达深圳宝安机场，凌晨叫车到福田酒店。10/9 那晚的房间还是要订，订房时备注凌晨到达。</li>
      <li>10/17 <b>22:00</b> 从深圳宝安机场起飞：上午留在广州，中午坐城际到机场寄存行李，下午去附近的欢乐港湾，19:15 回机场值机。</li>
      <li>机票按每人来回约 <b>RM ${n0(trip.settings.flight)}</b> 计算。</li>
      <li>价格是 2026 年的大致估算，评分是各平台的大致水平。实际以订票页面和链接里的最新评价为准。</li></ul></div>
    <div class="backup"><div class="tape sage" style="top:-12px;left:36px;transform:rotate(-5deg)"></div><h3>备份与分享</h3>
      <p>把行程导出成一段文字保存或发给朋友；朋友也可以把别人给的文字贴进来导入。</p>
      <textarea id="json-box" spellcheck="false" aria-label="行程数据">${esc(S.json)}</textarea>
      <div class="acts"><button type="button" class="btn" data-a="export">导出当前行程</button><button type="button" class="btn ghost" data-a="copy">复制</button><button type="button" class="btn ghost" data-a="import">导入上面的内容</button><span style="flex:1"></span><button type="button" class="reset${S.resetArm?' armed':''}" data-a="reset">${S.resetArm?'再点一次确认恢复':'恢复默认行程'}</button></div></div></div></section>`}

/* ---------- overlays ---------- */
function toast(m){$('#toast-root').innerHTML=`<div class="toast">${esc(m)}</div>`;clearTimeout(toast._t);toast._t=setTimeout(()=>{$('#toast-root').innerHTML=''},2000)}
function renderLb(){const L=S.lb;if(!L){$('#lb-root').innerHTML='';return}const im=L.imgs[L.i];
  $('#lb-root').innerHTML=`<div class="lb" data-a="lbClose" role="dialog" aria-modal="true" aria-label="照片"><button type="button" class="lb-btn lb-x" data-a="lbClose" aria-label="关闭">×</button><button type="button" class="lb-btn lb-prev" data-a="lbStep" data-v="-1" aria-label="上一张">‹</button>
    <figure data-stop="1"><img src="${esc(im.f)}" alt="${esc(L.title)}"><figcaption><b>${esc(L.title)}</b> · ${L.i+1} / ${L.imgs.length}<br>照片：${esc(im.a)} · ${esc(im.l)} · <a href="${esc(im.p)}" target="_blank" rel="noopener">Wikimedia Commons</a><br><small>${esc(L.note||'参考照片，展示这道菜或这个品牌的样子，不一定拍自这家店。')}</small></figcaption></figure>
    <button type="button" class="lb-btn lb-next" data-a="lbStep" data-v="1" aria-label="下一张">›</button></div>`}

/* ---------- render ---------- */
function render(){
  pending=false;
  for(const k in GREG)delete GREG[k];
  renderHero();
  const P={overview:pOverview,itinerary:pItinerary,now:pNow,map:pMap,food:pFood,hotels:pHotels,tickets:pTickets,budget:pBudget,settings:pSettings,team:pTeam,split:pSplit,accounts:pAccounts}[['team','split','accounts'].includes(S.tab)&&!(CLOUD.on&&CLOUD.me)?'overview':S.tab]||pOverview;
  $('#main').innerHTML=P();
  renderLb();
  if(S.tab==='itinerary')onScroll();
}
function setTab(id){S.tab=id;if(id!=='map'&&id!=='itinerary')S.pick=null;S.swap=null;S.edit=null;render();try{history.replaceState(null,'','#'+id)}catch(e){}}
function openDay(k){S.tab='itinerary';S.day=Math.max(0,Math.min(trip.days.length-1,k));S.edit=null;S.swap=null;S.pick=null;S.delArm=null;render();scrollTo({top:$('.tabs').offsetTop,behavior:'smooth'})}
function goDay(k,noScroll){if(k<0||k>=trip.days.length)return;S.day=k;S.edit=null;S.swap=null;S.pick=null;S.delArm=null;S.active=null;render();if(!noScroll)toDayTop()}
// scroll so the day's heading sits just under the sticky tabs + day bar
function toDayTop(){const nb=$('#nb');if(!nb)return;const off=($('.tabs')?$('.tabs').offsetHeight:0)+($('.daybar')&&getComputedStyle($('.daybar')).display!=='none'?$('.daybar').offsetHeight:0)+8;const y=nb.getBoundingClientRect().top+scrollY-off;if(Math.abs(scrollY-y)>40)scrollTo({top:y,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}
function dayBar(di){const d=trip.days[di],p=dp(d.date),n=trip.days.length;
  return `<div class="daybar" role="navigation" aria-label="切换天数"><button type="button" class="db-arrow" data-a="goDay" data-v="${di-1}" aria-label="前一天"${di===0?' disabled':''}>‹</button>
    <label class="db-mid"><span class="db-day">DAY ${di+1} · ${p.md} ${p.wd}</span><span class="db-title">${esc(d.title)}</span><span class="db-caret" aria-hidden="true">▾</span><span class="db-hint">也可以按键盘 ← →</span>
      <select id="db-select" aria-label="跳到某一天">${trip.days.map((x,k)=>{const q=dp(x.date);return `<option value="${k}"${k===di?' selected':''}>第${k+1}天 · ${q.md} ${q.wd} · ${esc(x.title)}</option>`}).join('')}</select></label>
    <button type="button" class="db-arrow go" data-a="goDay" data-v="${di+1}" aria-label="后一天"${di===n-1?' disabled':''}>›</button></div>`}
function dayFoot(di){const n=trip.days.length,nx=trip.days[di+1],pv=trip.days[di-1];
  return `<div class="dayfoot">${nx?`<button type="button" class="df-next" data-a="goDay" data-v="${di+1}" style="--c:${CC[(nx.cities||['sz'])[0]]}"><span class="df-lab">下一天 · DAY ${di+2} · ${dp(nx.date).md} ${dp(nx.date).wd}</span><span class="df-title">${esc(nx.title)}</span><span class="df-go" aria-hidden="true">→</span></button>`:'<div class="df-end">这是最后一天 · 一路平安 ✈</div>'}
    <div class="df-row">${pv?`<button type="button" class="df-prev" data-a="goDay" data-v="${di-1}">← 上一天：${dp(pv.date).md} ${esc(pv.title)}</button>`:'<span></span>'}<button type="button" class="df-prev" data-a="dayTop">↑ 回到今天开头</button></div></div>`}
function updPick(){const slot=$('#pick-slot');if(slot)slot.innerHTML=pickCard(S.tab==='map');document.querySelectorAll('.map').forEach(redrawMap)}

/* ---------- events ---------- */
document.addEventListener('click',e=>{
  const el=e.target.closest('[data-a]');if(!el)return;
  if(e.target.closest('[data-stop]')&&el.classList.contains('lb'))return;
  if(e.target.closest('a'))return;
  const a=el.dataset.a,v=el.dataset.v;
  switch(a){
    case 'tab':setTab(v);break;
    case 'openDay':openDay(+v);break;
    case 'goDay':goDay(+v);break;
    case 'dayTop':toDayTop();break;
    case 'pick':S.pick=v;updPick();break;
    case 'swap':S.swap=S.swap===el.dataset.id?null:el.dataset.id;S.edit=null;render();break;
    case 'choose':{const id=el.dataset.id,k=+el.dataset.k,it=trip.days.flatMap(d=>d.items).find(x=>x.id===id);if(it&&k!==curOpt(it))chooseMeal(id,k);break}
    case 'edit':S.edit=S.edit===el.dataset.id?null:el.dataset.id;S.swap=null;render();break;
    case 'cancelEdit':{const di=S.day,it=trip.days[di].items.find(x=>x.id===S.edit);S.edit=null;if(it&&it._new){commit(t=>{t.days[di].items=t.days[di].items.filter(x=>x.id!==it.id)},null,null)}else render();break}
    case 'del':{const id=el.dataset.id;if(S.delArm===id){S.delArm=null;const di0=S.day,gone=trip.days[di0].items.find(x=>x.id===id);commit(t=>{t.days[di0].items=t.days[di0].items.filter(x=>x.id!==id);delete t.bookings[id]},'已删除',gone?'删除了 '+dp(trip.days[di0].date).md+'：'+gone.title:null)}else{S.delArm=id;render();clearTimeout(pDel);pDel=setTimeout(()=>{if(S.delArm===id){S.delArm=null;render()}},2500)}break}
    case 'add':{const d=trip.days[S.day],s=sortI(d.items),last=s.length?s[s.length-1].t:'09:00';const [hh,mm]=last.split(':').map(Number);const n={id:'x'+Date.now().toString(36),t:pad(Math.min(27,hh+1))+':'+pad(mm||0),kind:'sight',title:'新的安排',place:'',cost:0,cur:CITY[(d.cities||['sz'])[0]].cur,per:'p',note:'',book:'',_new:true};S.edit=n.id;const di1=S.day;commit(t=>t.days[di1].items.push(n),null,null);break}
    case 'lb':{const G=GREG[el.dataset.g];if(G){S.lb={imgs:G.imgs,title:G.title,note:G.note,i:+el.dataset.i||0};renderLb()}e.preventDefault();break}
    case 'lbClose':S.lb=null;renderLb();break;
    case 'lbStep':{const L=S.lb;if(L){L.i=(L.i+(+v)+L.imgs.length)%L.imgs.length;renderLb()}break}
    case 'simDay':{const d=trip.days[+v];S.sim=+v===0?TS(d.date,'23:55'):TS(d.date,'09:00');refreshNow();break}
    case 'simOff':S.sim=null;refreshNow();break;
    case 'mapDay':S.mapDay=v==='all'?'all':+v;render();break;
    case 'mzoom':zoomMap(el.closest('.map'),+el.dataset.f);break;
    case 'mreset':{const m=el.closest('.map');delete S.views[m.dataset.map];redrawMap(m);break}
    case 'foodDay':S.foodDay=v==='all'?'all':+v;render();break;
    case 'foodCity':S.foodCity=v;render();break;
    case 'budView':S.budView=v;render();break;
    case 'flip':el.classList.toggle('on');break;
    case 'toMap':e.stopPropagation();S.tab='map';S.mapDay='all';S.pick=v;render();scrollTo({top:$('.tabs').offsetTop,behavior:'smooth'});break;
    case 'hotel':{const c=el.dataset.c,h=el.dataset.v;if(trip.settings.hotel[c]!==h)commit(t=>{t.settings.hotel[c]=h},'已选 '+short(HOTELS[c].find(x=>x.id===h).n),CITY[c].n+'酒店换成 '+HOTELS[c].find(x=>x.id===h).n);break}
    case 'book':{const id=v,was=!!trip.bookings[id],tt=(tickets().find(x=>x.id===id)||{}).title||id;commit(t=>{t.bookedBy=t.bookedBy||{};if(t.bookings[id]){delete t.bookings[id];delete t.bookedBy[id]}else{t.bookings[id]=Date.now();if(CLOUD.email)t.bookedBy[id]=CLOUD.email}},was?'已取消标记':'已标记为已订',(was?'取消了已订：':'标记已订：')+tt);break}
    case 'export':S.json=JSON.stringify(trip);$('#json-box').value=S.json;toast('已导出到文本框');break;
    case 'copy':{const b=$('#json-box');if(!b.value)b.value=JSON.stringify(trip);const fb=()=>{b.focus();b.select();toast('已选中，按 Ctrl+C 复制')};try{navigator.clipboard.writeText(b.value).then(()=>toast('已复制'),fb)}catch(err){fb()}break}
    case 'import':{try{const o=JSON.parse($('#json-box').value);if(!o||!Array.isArray(o.days))throw 0;const t=norm(o);S.day=0;commit(x=>{Object.assign(x,t)},'已导入','导入了一份行程')}catch(err){toast('内容格式不对，导入失败')}break}
    case 'reset':{if(S.resetArm){S.resetArm=false;const b=trip.bookings;commit(x=>{Object.assign(x,norm(clone(DEFAULT)));x.bookings=b},'已恢复默认行程（订票勾选保留）','恢复了默认行程')}else{S.resetArm=true;render();setTimeout(()=>{if(S.resetArm){S.resetArm=false;if(S.tab==='settings')render()}},3000)}break}
  }
});
let pDel=null;
// the map uses click on markers, gated by the drag flag
document.addEventListener('click',e=>{const g=e.target.closest('.mk');if(!g||mapMoved)return;S.pick=g.dataset.pid;updPick();if(S.tab==='itinerary'){const ev=[...document.querySelectorAll('[data-ev]')].find(x=>{const it=trip.days[S.day].items.find(i=>i.id===x.dataset.ev);return it&&it.place===S.pick});if(ev)ev.scrollIntoView({block:'center',behavior:'smooth'})}});
document.addEventListener('submit',e=>{if(e.target.id!=='edit-form')return;e.preventDefault();const f=new FormData(e.target),id=e.target.dataset.id;
  const t=String(f.get('t')||'').trim(),title=String(f.get('title')||'').trim();if(!title)return;
  S.edit=null;commit(x=>{for(const d of x.days){const it=d.items.find(i=>i.id===id);if(!it)continue;Object.assign(it,{t:/^\d{2}:\d{2}$/.test(t)?t:it.t,kind:f.get('kind'),title,cost:Math.max(0,+f.get('cost')||0),cur:f.get('cur'),per:f.get('per'),note:String(f.get('note')||'').trim(),book:String(f.get('book')||'').trim()});delete it._new}},'已保存','修改了 '+(()=>{const d=trip.days.find(d=>d.items.some(i=>i.id===id));return d?dp(d.date).md:''})()+' '+(/^d{2}:d{2}$/.test(t)?fmtT(t):'')+'：'+title);
  if(pending)render()});
document.addEventListener('change',e=>{if(e.target.id==='db-select')goDay(+e.target.value)});
document.addEventListener('input',e=>{
  if(e.target.id==='sim-range'){S.sim=SLO+(+e.target.value)*6e4;refreshNow();return}
  const ds=e.target.dataset||{};
  if(ds.s){const s=SLIDERS.find(x=>x.k===ds.s),n=$('#n-'+ds.s);if(s&&n)n.value=fmtS(s,e.target.value)}
  else if(ds.n){const r=document.querySelector(`[data-s="${ds.n}"]`);if(r&&e.target.value!=='')r.value=e.target.value}
});
document.addEventListener('change',e=>{const ds=e.target.dataset||{};const k=ds.s||ds.n;if(!k)return;applySetting(k,e.target.value)});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.dataset&&e.target.dataset.n){e.preventDefault();e.target.blur()}});
document.addEventListener('input',e=>{if(e.target.id==='json-box')S.json=e.target.value});
addEventListener('keydown',e=>{
  if(S.lb){if(e.key==='Escape'){S.lb=null;renderLb()}if(e.key==='ArrowRight'){S.lb.i=(S.lb.i+1)%S.lb.imgs.length;renderLb()}if(e.key==='ArrowLeft'){S.lb.i=(S.lb.i-1+S.lb.imgs.length)%S.lb.imgs.length;renderLb()}return}
  const tg=document.activeElement&&document.activeElement.tagName;
  if(S.tab==='itinerary'&&!S.edit&&!/INPUT|TEXTAREA|SELECT/.test(tg)){if(e.key==='ArrowRight')goDay(S.day+1);if(e.key==='ArrowLeft')goDay(S.day-1)}
});
let tx=null,ty=null;
document.addEventListener('touchstart',e=>{if(!e.target.closest('#nb'))return;tx=e.touches[0].clientX;ty=e.touches[0].clientY},{passive:true});
document.addEventListener('touchend',e=>{if(tx==null)return;const dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;tx=null;if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.5&&!S.edit)goDay(S.day+(dx<0?1:-1))},{passive:true});
// scroll-linked highlight in the day notebook
let scRaf=0;
function onScroll(){if(S.tab!=='itinerary')return;cancelAnimationFrame(scRaf);scRaf=requestAnimationFrame(()=>{let best=null,bd=1e9;const mid=innerHeight*.42;document.querySelectorAll('[data-ev]').forEach(el=>{const r=el.getBoundingClientRect();const d=Math.abs(r.top+Math.min(r.height,120)/2-mid);if(d<bd){bd=d;best=el}});
  if(best&&best.dataset.ev!==S.active){S.active=best.dataset.ev;document.querySelectorAll('[data-ev].active').forEach(x=>x.classList.remove('active'));best.classList.add('active')}})}
addEventListener('scroll',onScroll,{passive:true});
// clocks: hero every 30 s, the 旅途中 page every second
setInterval(()=>{if(S.tab==='now')refreshNow()},1000);
setInterval(()=>{renderHero()},30000);

/* ---------- boot ---------- */
(function(){const h=(location.hash||'').slice(1);if(TABS.some(t=>t[0]===h)||['team','split','accounts'].includes(h))S.tab=h;
  const t=Date.now();if(t>=START-3600e3&&t<=END+3600e3){const id=nowItemId();trip.days.forEach((d,k)=>{if(d.items.some(i=>i.id===id))S.day=k})}
  render()})();
