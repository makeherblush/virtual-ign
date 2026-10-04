/* ===== Phone OS core ===== */
const Apps={};
const Bus={e:{},on(n,f){(this.e[n]=this.e[n]||[]).push(f)},emit(n,d){(this.e[n]||[]).forEach(f=>f(d))}};
const Net={ok:()=>!DB.set.air&&(DB.set.wifi||DB.set.cell)};
const ct=id=>DB.contacts.find(c=>c.id===id);
const nm=id=>id==='me'?DB.me.name:(ct(id)?.name||DB.groups[id]?.name||id);
const un=id=>id==='me'?DB.me.user:(ct(id)?.user||id);
const av=(id,s='')=>`<div class="av ${s}" style="background:${G[hash(id)%G.length]}">${esc((nm(id)[0]||'?').toUpperCase())}</div>`;
const cOpts=()=>DB.contacts.map(c=>[c.id,c.name]);
const tabbar=(list,cur)=>`<nav class="tabs">${list.map(([k,i,l])=>`<button class="${k===cur?'on':''}" data-act="tab" data-arg="${k}"><b>${i}</b><span>${l}</span></button>`).join('')}</nav>`;
const sw=on=>`<span class="sw ${on?'on':''}"><i></i></span>`;

/* ---------- Modal ---------- */
const Modal={
 form(title,fields,ok,cb){
  const m=$('#modal');
  m.innerHTML=`<div class="sheet"><h3>${esc(title)}</h3>${fields.map(f=>`<label>${esc(f.label)}</label>`+(f.type==='select'?`<select id="f_${f.id}">${f.opts.map(o=>`<option value="${esc(o[0])}">${esc(o[1])}</option>`).join('')}</select>`:f.type==='area'?`<textarea id="f_${f.id}" rows="3" placeholder="${esc(f.ph||'')}">${esc(f.value||'')}</textarea>`:`<input id="f_${f.id}" type="${f.type||'text'}" placeholder="${esc(f.ph||'')}" value="${esc(f.value||'')}">`)).join('')}<div class="btns"><button class="btn sec" data-m="x">Cancel</button><button class="btn" data-m="ok">${esc(ok)}</button></div></div>`;
  m.classList.add('show');
  m.onclick=e=>{
   const b=e.target.closest('[data-m]');
   if(e.target===m||(b&&b.dataset.m==='x'))return m.classList.remove('show');
   if(b&&b.dataset.m==='ok'){const v={};fields.forEach(f=>v[f.id]=$('#f_'+f.id).value);if(cb(v)!==false)m.classList.remove('show')}
  };
 },
 confirm(title,msg,ok,cb){const m=$('#modal');m.innerHTML=`<div class="sheet"><h3>${esc(title)}</h3><p class="mut">${esc(msg)}</p><div class="btns"><button class="btn sec" data-m="x">Cancel</button><button class="btn red" data-m="ok">${esc(ok)}</button></div></div>`;m.classList.add('show');m.onclick=e=>{const b=e.target.closest('[data-m]');if(e.target===m||(b&&b.dataset.m==='x'))return m.classList.remove('show');if(b&&b.dataset.m==='ok'){m.classList.remove('show');cb()}}}
};

/* ---------- Notifications ---------- */
const Notify={push(n){
 DB.notifs.unshift({id:uid(),t:hhmm(),...n});DB.notifs=DB.notifs.slice(0,40);Store.save();
 UI.banner(n);UI.renderNC();UI.renderLock();UI.badges();Bus.emit('notify',n);
}};

/* ---------- Messages (shared) ---------- */
const Msg={
 add(c,f,x){(DB.msgs[c]=DB.msgs[c]||[]).push({f,x,t:hhmm(),ts:Date.now()});Store.save()},
 receive(c,f,x){
  this.add(c,f,x);
  const t=Host.top();
  if(Host.id==='messages'&&t.v==='chat'&&t.p.id===c&&!UI.locked){Host.render();return}
  DB.unread[c]=(DB.unread[c]||0)+1;Store.save();
  Notify.push({app:'messages',title:nm(c)+(DB.groups[c]?' · '+nm(f):''),msg:x,go:['messages','chat',{id:c}]});
  if(Host.id==='messages'&&t.v==='main')Host.render();
 }
};

/* ---------- Economy (shared) ---------- */
const Economy={
 log(acc,type,title,amt){DB.tx.unshift({id:uid(),acc,type,title,amt:+amt,t:new Date().toLocaleString('en-GB',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})})},
 pay(acc,amt,title){amt=+amt;if(!(amt>0)){UI.toast('Invalid amount');return false}if(DB.acc[acc]<amt){UI.toast('Insufficient balance');return false}DB.acc[acc]-=amt;this.log(acc,'out',title,amt);Store.save();Bus.emit('money');return true},
 add(acc,amt,title){DB.acc[acc]+=+amt;this.log(acc,'in',title,amt);Store.save();Bus.emit('money')},
 move(a,b,amt){if(!this.pay(a,amt,'Transfer to '+b))return false;this.add(b,amt,'Transfer from '+a);return true},
 transfer(acc,to,amt,note){
  if(!this.pay(acc,amt,'Sent to '+nm(to)))return false;
  Msg.add(to,'me','💸 Sent '+fmt(amt)+(note?' — '+note:''));
  Notify.push({app:acc==='wallet'?'wallet':'bank',title:'Transfer Sent',msg:fmt(amt)+' sent to '+nm(to),go:[acc==='wallet'?'wallet':'bank']});
  setTimeout(()=>Msg.receive(to,to,pick(THX)),2500);return true;
 }
};

/* ---------- App host (navigation stack) ---------- */
const Host={
 id:null,stack:[],_k:'',
 top(){return this.stack[this.stack.length-1]||{v:'main',p:{}}},
 open(id,v,p){const a=Apps[id];if(!a)return;if(this.id&&this.id!==id)Apps[this.id].onClose?.();this.id=id;this.stack=[{v:v||'main',p:p||{}}];a.onOpen?.();$('#app').classList.add('open');$('#phone').classList.add('inapp');this.render()},
 go(v,p){this.stack.push({v,p:p||{}});this.render()},
 back(){this.stack.length>1?(this.stack.pop(),this.render()):this.home()},
 home(){if(this.id)Apps[this.id].onClose?.();this.id=null;this.stack=[];$('#app').classList.remove('open');$('#phone').classList.remove('inapp','flatapp');UI.renderHome()},
 render(){
  if(!this.id)return;
  const a=Apps[this.id],t=this.top();
  const r=(a.online&&!Net.ok())?{title:a.name,html:'<div class="empty big">📡<p>No connection</p><small>Turn on Wi-Fi or cellular in Control Center</small></div>'}:a.view(t.v,t.p||{});
  const app=$('#app'),old=$('.body',app),key=this.id+t.v+this.stack.length;
  const sc=old&&this._k===key?old.scrollTop:0;this._k=key;
  app.classList.toggle('flat',!!r.flat);
  $('#phone').classList.toggle('flatapp',!!r.flat);
  app.innerHTML=(r.flat?'<button class="fback" data-back>‹</button>':`<div class="hdr"><button class="back" data-back>‹</button><div class="ttl"><h2>${esc(r.title)}</h2>${r.sub?`<small>${esc(r.sub)}</small>`:''}</div><div class="hr">${r.right||''}</div></div>`)+`<div class="body">${r.html}</div>${r.bar||''}${r.tabs||''}`;
  const b=$('.body',app);if(b)b.scrollTop=r.stick?99999:sc;
  UI.badges();
 }
};

/* ---------- UI ---------- */
const UI={
 locked:true,busy:false,
 toast(t){const e=$('#toast');e.textContent=t;e.classList.add('show');clearTimeout(this._tt);this._tt=setTimeout(()=>e.classList.remove('show'),2000)},
 clock(){
  const n=new Date(),t=n.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
  $('#lt').textContent=t;$('#ld').textContent=n.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
  const s=$('#st-time');if(s)s.textContent=t;
  const hd=$('#home-day');if(hd){hd.textContent=n.toLocaleDateString('en-US',{weekday:'long'});$('#home-date').textContent=n.toLocaleDateString('en-US',{month:'long',day:'numeric'})}
 },
 renderStatus(){
  const s=DB.set,net=s.air?'✈︎':s.cell?'5G':'';
  $('#status').innerHTML=`<span id="st-time">${hhmm()}</span><span class="st-r"><span class="bars ${s.cell&&!s.air?'':'off'}">▂▄▆█</span><span>${net}</span>${s.wifi&&!s.air?'<span>Wi‑Fi</span>':''}<span class="batt"><i style="width:82%"></i></span></span>`;
 },
 applySet(){
  const s=DB.set,p=$('#phone');
  p.classList.toggle('dark',!!s.dark);p.classList.toggle('torch',!!s.torch);
  p.style.setProperty('--wall',WALLS[s.wall]||WALLS[0]);
  $('#dim').style.opacity=(100-s.bright)/100*.7;
  this.renderStatus();this.renderCC();
 },
 /* ---- home ---- */
 order:['messages','phone','contacts','mail','instarp','chirper','wallet','bank','market','gallery','camera','files','notes','calc','settings'],
 icon(id){const a=Apps[id];return `<button class="app-icon" data-open="${id}"><div class="icon" style="background:${a.c}">${a.icon}<i class="badge" data-badge="${id}"></i></div><span>${a.name}</span></button>`},
 renderHome(){
  const o=this.order,n=new Date();
  $('#home').innerHTML=`<div class="pages" id="pages"><div class="pg"><div class="hdate"><span id="home-day"></span><strong id="home-date"></strong></div>
  <div class="widget" data-open="wallet"><small>Wallet</small><b>${fmt(DB.acc.wallet)}</b><span>Bank ${fmt(DB.acc.checking+DB.acc.savings)}</span></div>
  <div class="grid">${o.slice(0,8).map(i=>this.icon(i)).join('')}</div></div>
  <div class="pg"><div class="widget w2" data-open="notes"><small>Notes</small><b>${esc(DB.notes[0]?.title||'No notes')}</b><span>${esc((DB.notes[0]?.body||'').slice(0,60))}</span></div>
  <div class="grid">${o.slice(8).map(i=>this.icon(i)).join('')}</div></div></div>
  <div class="dots"><i class="on" data-pg="0"></i><i data-pg="1"></i></div>
  <div class="dock">${['phone','messages','instarp','wallet'].map(i=>`<button class="dock-i" data-open="${i}"><div class="icon" style="background:${Apps[i].c}">${Apps[i].icon}<i class="badge" data-badge="${i}"></i></div></button>`).join('')}</div>`;
  const pg=$('#pages');pg.onscroll=()=>{const i=Math.round(pg.scrollLeft/pg.clientWidth);$$('.dots i').forEach((d,k)=>d.classList.toggle('on',k===i))};
  this.clock();this.badges();
 },
 badges(){
  const m=Object.values(DB.unread).reduce((a,b)=>a+b,0),ml=DB.mail.filter(x=>!x.read).length;
  const map={messages:m,mail:ml};
  $$('[data-badge]').forEach(e=>{const v=map[e.dataset.badge]||0;e.textContent=v>99?'99+':v;e.style.display=v?'grid':'none'});
 },
 /* ---- lock ---- */
 renderLock(){
  $('#ln').innerHTML=DB.notifs.slice(0,3).map(n=>`<div class="lk-n"><b>${esc(Apps[n.app]?.icon||'🔔')}</b><div><strong>${esc(n.title)}</strong><p>${esc(n.msg)}</p></div><small>${n.t}</small></div>`).join('');
 },
 unlock(after){
  if(!this.locked||this.busy)return;this.busy=true;
  const f=$('#fid');f.className='fid scan';f.textContent='◉';
  setTimeout(()=>{f.className='fid ok';f.textContent='✓';setTimeout(()=>{$('#lock').classList.add('gone');this.locked=false;this.busy=false;f.className='fid';f.textContent='🔒';after&&after()},350)},800);
 },
 lock(){this.closePanels();Host.home();this.locked=true;$('#lock').classList.remove('gone');this.renderLock()},
 /* ---- panels ---- */
 closePanels(){$('#nc').classList.remove('show');$('#cc').classList.remove('show')},
 panel(which){const n=$('#nc'),c=$('#cc');if(this.locked&&which==='nc'){}const el=which==='nc'?n:c,other=which==='nc'?c:n;other.classList.remove('show');el.classList.toggle('show');if(which==='nc')this.renderNC()},
 renderNC(){
  const el=$('#nc');if(!el)return;
  el.innerHTML=`<div class="pn-h"><h2>Notifications</h2>${DB.notifs.length?'<button class="chip" data-nc="clear">Clear all</button>':''}</div><div class="pn-l">${DB.notifs.length?DB.notifs.map(n=>`<div class="lk-n dk" data-nc="go" data-id="${n.id}"><b>${esc(Apps[n.app]?.icon||'🔔')}</b><div><strong>${esc(n.title)}</strong><p>${esc(n.msg)}</p></div><small>${n.t}</small></div>`).join(''):'<p class="empty">No notifications</p>'}</div>`;
 },
 renderCC(){
  const el=$('#cc'),s=DB.set;if(!el)return;
  const T=(k,i,l)=>`<button class="tile ${s[k]?'on':''}" data-cc="${k}"><b>${i}</b><span>${l}</span></button>`;
  el.innerHTML=`<div class="cc-g">${T('wifi','📶','Wi‑Fi')}${T('bt','🔷','Bluetooth')}${T('air','✈️','Airplane')}${T('cell','📡','Cellular')}${T('dark','🌙','Dark')}${T('torch','🔦','Torch')}<button class="tile" data-cc="lock"><b>🔒</b><span>Lock</span></button>${T('live','⚡','Live RP')}</div>
  <div class="cc-s"><span>🔆</span><input type="range" min="20" max="100" value="${s.bright}" data-cc-r="bright"></div>
  <div class="cc-s"><span>🔊</span><input type="range" min="0" max="100" value="${s.vol}" data-cc-r="vol"></div>
  <div class="cc-g sm"><button class="tile" data-open="calc"><b>🧮</b></button><button class="tile" data-open="camera"><b>📷</b></button><button class="tile" data-open="notes"><b>📝</b></button><button class="tile" data-open="settings"><b>⚙️</b></button></div>`;
 },
 banner(n){
  if(this.locked)return;const b=$('#banner');
  b.innerHTML=`<div class="bn" data-bn><b>${esc(Apps[n.app]?.icon||'🔔')}</b><div><strong>${esc(n.title)}</strong><p>${esc(n.msg)}</p></div><small>now</small></div>`;
  b._go=n.go||[n.app];b.classList.add('show');clearTimeout(this._bt);this._bt=setTimeout(()=>b.classList.remove('show'),3500);
 },
 openGo(go){this.closePanels();if(this.locked)return;Host.open(go[0],go[1],go[2])}
};

/* ---------- events (delegated) ---------- */
function wire(){
 const ph=$('#phone');
 ph.addEventListener('click',e=>{
  const o=e.target.closest('[data-open]');if(o&&!e.target.closest('#app')){UI.closePanels();return Host.open(o.dataset.open)}
  if(o&&e.target.closest('#cc')){UI.closePanels();return Host.open(o.dataset.open)}
  const pgd=e.target.closest('[data-pg]');if(pgd){const p=$('#pages');p.scrollTo({left:p.clientWidth*+pgd.dataset.pg,behavior:'smooth'});return}
  const cc=e.target.closest('[data-cc]');
  if(cc){const k=cc.dataset.cc;if(k==='lock')return UI.lock();DB.set[k]=!DB.set[k];if(k==='air'&&DB.set.air){DB.set.wifi=false;DB.set.cell=false}if(k==='air'&&!DB.set.air){DB.set.wifi=true;DB.set.cell=true}Store.save();UI.applySet();Host.render();return}
  const nc=e.target.closest('[data-nc]');
  if(nc){if(nc.dataset.nc==='clear'){DB.notifs=[];Store.save();UI.renderNC();UI.renderLock()}else{const n=DB.notifs.find(x=>x.id===nc.dataset.id);DB.notifs=DB.notifs.filter(x=>x.id!==nc.dataset.id);Store.save();UI.renderNC();if(n)UI.openGo(n.go||[n.app])}return}
  const bn=e.target.closest('[data-bn]');if(bn){$('#banner').classList.remove('show');UI.openGo($('#banner')._go);return}
  if(e.target.classList.contains('panel'))return UI.closePanels();
  if(e.target.closest('#lk-torch')){DB.set.torch=!DB.set.torch;Store.save();UI.applySet();return}
  if(e.target.closest('#lk-cam'))return UI.unlock(()=>Host.open('camera'));
  if(e.target.closest('.fid'))return UI.unlock();
  /* inside app */
  if(!e.target.closest('#app')||!Host.id)return;
  const a=Apps[Host.id];
  if(e.target.closest('[data-back]'))return Host.back();
  const g=e.target.closest('[data-go]');if(g){const [v,id]=g.dataset.go.split('|');return Host.go(v,{id})}
  const ac=e.target.closest('[data-act]');
  if(ac){const f=a.acts&&a.acts[ac.dataset.act];if(f)f.call(a,ac.dataset.arg,ac);else if(ac.dataset.act==='tab'){a.tab=ac.dataset.arg;Host.render()}}
 });
 ph.addEventListener('input',e=>{
  const r=e.target.dataset.ccR;if(r){DB.set[r]=+e.target.value;Store.save();$('#dim').style.opacity=(100-DB.set.bright)/100*.7;return}
  if(!Host.id)return;const n=e.target.dataset.input;if(n&&Apps[Host.id].acts[n])Apps[Host.id].acts[n].call(Apps[Host.id],e.target.value,e.target);
 });
 ph.addEventListener('keydown',e=>{
  if(e.key==='Enter'&&e.target.dataset.enter&&Host.id){e.preventDefault();Apps[Host.id].acts[e.target.dataset.enter].call(Apps[Host.id])}
 });
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){if($('#modal').classList.contains('show'))return $('#modal').classList.remove('show');UI.closePanels();if(!UI.locked)Host.home()}});

 /* gestures */
 const gest=(el,fn)=>{let s=null;el.addEventListener('pointerdown',e=>{s={x:e.clientX,y:e.clientY};try{el.setPointerCapture(e.pointerId)}catch(_){}});el.addEventListener('pointerup',e=>{if(!s)return;const r=el.getBoundingClientRect();fn(e.clientX-s.x,e.clientY-s.y,(s.x-r.left)/r.width);s=null});el.addEventListener('pointercancel',()=>{s=null})};
 const panelOpen=()=>$('#nc').classList.contains('show')||$('#cc').classList.contains('show');
 gest($('#e-top'),(dx,dy,rx)=>{
  const which=rx<.6?'nc':'cc';
  if(dy>40||(Math.abs(dy)<10&&Math.abs(dx)<10))UI.panel(which);
  else if(dy<-40)UI.closePanels();
 });
 gest($('#e-bottom'),(dx,dy)=>{
  if(dy<-30||(Math.abs(dy)<8&&Math.abs(dx)<8)){
   if(panelOpen())return UI.closePanels();
   if(Host.id)Host.home();else if(UI.locked)UI.unlock();
  }
 });
 gest($('#e-left'),(dx,dy)=>{if(dx>60&&Host.id&&!panelOpen())Host.back()});
 gest($('#lock'),(dx,dy)=>{if(dy<-70)UI.unlock()});
}
