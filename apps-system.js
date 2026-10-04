/* ===== System: Gallery, Camera, Files, Notes, Calculator, Settings ===== */
Apps.gallery={name:'Gallery',icon:'🌈',c:'#7652e8',tab:'all',
 view(v,p){
  if(v==='photo'){const x=DB.gallery.find(g=>g.id===p.id);if(!x)return{title:'Photo',html:'<p class="empty">Not found</p>'};
   return{flat:1,html:`<div class="photo" style="background:${G[x.g%G.length]}"><span>${esc(x.title)}</span></div><div class="pbar"><button data-act="fav" data-arg="${x.id}">${x.fav?'❤️':'♡'}</button><button data-act="post" data-arg="${x.id}">◎</button><button data-act="del" data-arg="${x.id}">🗑</button></div>`}}
  const l=DB.gallery.filter(g=>this.tab==='all'||g.fav);
  return{title:'Photos',html:l.length?`<div class="ggrid big">${l.map(g=>`<div style="background:${G[g.g%G.length]}" data-go="photo|${g.id}">${g.fav?'<i>♥</i>':''}</div>`).join('')}</div>`:'<p class="empty">No photos</p>',tabs:tabbar([['all','🖼','All'],['fav','❤️','Favorites']],this.tab)};
 },
 acts:{
  fav(id){const x=DB.gallery.find(g=>g.id===id);x.fav=!x.fav;Store.save();Host.render()},
  post(id){Host.open('instarp');Apps.instarp.newPost(id)},
  del(id){DB.gallery=DB.gallery.filter(g=>g.id!==id);Store.save();Host.back()}
 }
};

Apps.camera={name:'Camera',icon:'📷',c:'#555',
 view(){const l=DB.gallery.at(-1);return{flat:1,html:`<div class="vf"><div class="vf-bg"></div><div class="flash" id="flash"></div></div><div class="cbar"><div class="thumb" style="background:${l?G[l.g%G.length]:'#222'}" data-act="gal"></div><button class="shutter" data-act="shot"></button><span></span></div>`}},
 acts:{
  shot(){const f=$('#flash');f.classList.add('on');setTimeout(()=>f.classList.remove('on'),150);
   const n=1000+DB.gallery.length+1;DB.gallery.push({id:uid(),g:Math.floor(Math.random()*G.length),title:'IMG_'+n,fav:false});Store.save();UI.toast('Saved to Gallery');setTimeout(()=>Host.id==='camera'&&Host.render(),200)},
  gal(){Host.open('gallery')}
 }
};

Apps.files={name:'Files',icon:'🗂️',c:'#1c92d2',
 view(v,p){
  if(v==='doc'){const f=DB.files.find(x=>x.id===p.id);return{title:f?f.n:'File',html:f?`<div class="card"><p class="pre">${esc(f.body)}</p></div>`:'<p class="empty">Not found</p>'}}
  if(v==='folder'){const l=DB.files.filter(f=>f.folder===p.id);return{title:p.id,html:l.length?l.map(f=>`<div class="row" data-go="doc|${f.id}"><b>${/\.(png|jpg)$/.test(f.n)?'🖼':f.n.includes('.')?'📄':'🪪'}</b><div class="grow"><b>${esc(f.n)}</b></div></div>`).join(''):'<p class="empty">Empty</p>'}}
  const fs=[...new Set(['Documents','Photos','Downloads','Contracts','Receipts','ID Cards',...DB.files.map(f=>f.folder)])];
  return{title:'Files',sub:'On My Phone',html:fs.map(f=>`<div class="row" data-go="folder|${esc(f)}"><b>📁</b><div class="grow"><b>${esc(f)}</b><small class="mut">${DB.files.filter(x=>x.folder===f).length} items</small></div><span class="mut">›</span></div>`).join('')};
 }
};

Apps.notes={name:'Notes',icon:'📝',c:'#f5b800',
 view(v,p){
  if(v==='edit'){const n=DB.notes.find(x=>x.id===p.id);if(!n)return{title:'Note',html:'<p class="empty">Not found</p>'};
   return{title:'',right:`<button class="ic" data-act="del" data-arg="${n.id}">🗑</button>`,html:`<input class="ntitle" data-input="nt" value="${esc(n.title)}" placeholder="Title"><textarea class="nbody" data-input="nb" placeholder="Write something…">${esc(n.body)}</textarea>`}}
  return{title:'Notes',right:'<button class="ic" data-act="add">✎</button>',html:DB.notes.length?DB.notes.map(n=>`<div class="row" data-go="edit|${n.id}"><div class="grow"><b>${esc(n.title||'Untitled')}</b><small class="mut ell">${esc(n.body.replace(/\n/g,' ')||'No text')}</small></div></div>`).join(''):'<p class="empty">No notes</p>'};
 },
 acts:{
  add(){const n={id:uid(),title:'',body:''};DB.notes.unshift(n);Store.save();Host.go('edit',{id:n.id})},
  nt(v){const n=DB.notes.find(x=>x.id===Host.top().p.id);if(n){n.title=v;Store.save()}},
  nb(v){const n=DB.notes.find(x=>x.id===Host.top().p.id);if(n){n.body=v;Store.save()}},
  del(id){DB.notes=DB.notes.filter(n=>n.id!==id);Store.save();Host.back()}
 }
};

Apps.calc={name:'Calculator',icon:'🧮',c:'#ff9f0a',exp:'',
 show(){const e=$('#cd');if(e)e.textContent=this.exp||'0'},
 view(){const B=['AC','±','%','÷','7','8','9','×','4','5','6','−','1','2','3','+','0','.','⌫','='];
  return{flat:1,html:`<div class="calc"><div class="cd" id="cd">${esc(this.exp||'0')}</div><div class="ck">${B.map(b=>`<button class="${/[÷×−+=]/.test(b)?'op':/AC|±|%|⌫/.test(b)?'fn':''}" data-act="k" data-arg="${b}">${b}</button>`).join('')}</div></div>`}},
 acts:{k(b){
  let e=this.exp;
  if(b==='AC')e='';
  else if(b==='⌫')e=e.slice(0,-1);
  else if(b==='±'){e=e.replace(/(-?[\d.]+)$/,m=>m.startsWith('-')?m.slice(1):'-'+m)}
  else if(b==='%'){e=e.replace(/([\d.]+)$/,m=>String(+m/100))}
  else if(b==='='){try{const x=e.replace(/÷/g,'/').replace(/×/g,'*').replace(/−/g,'-');if(/^[\d+\-*/.() ]+$/.test(x)&&x)e=String(+Function('return '+x)().toFixed(8));}catch(_){e='Error'}}
  else{if(e==='Error')e='';e+=b==='−'?'−':b}
  this.exp=e;this.show();
 }}
};

Apps.settings={name:'Settings',icon:'⚙️',c:'#8e8e93',
 TG:[['dark','Dark mode'],['live','Live RP events'],['wifi','Wi‑Fi'],['bt','Bluetooth'],['air','Airplane mode'],['cell','Cellular']],
 view(v){
  if(v==='wall')return{title:'Wallpaper',html:`<div class="wgrid">${WALLS.map((w,i)=>`<div class="wp ${DB.set.wall===i?'on':''}" style="background:${w}" data-act="wall" data-arg="${i}"></div>`).join('')}</div>`};
  if(v==='about'){const kb=Math.round(JSON.stringify(DB).length/1024*10)/10;return{title:'About',html:`<div class="card"><div class="row nb"><b class="grow">Model</b><span class="mut">Ignatius Phone</span></div><div class="row nb"><b class="grow">Version</b><span class="mut">1.0</span></div><div class="row nb"><b class="grow">Number</b><span class="mut">${esc(DB.me.phone)}</span></div><div class="row nb"><b class="grow">User ID</b><span class="mut">user_001</span></div><div class="row nb"><b class="grow">Data stored</b><span class="mut">${kb} KB</span></div></div>`}}
  return{title:'Settings',html:`<div class="row prof-r" data-act="profile">${av('me')}<div class="grow"><b>${esc(DB.me.name)}</b><small class="mut">@${esc(DB.me.user)} · ${esc(DB.me.phone)}</small></div><span class="mut">›</span></div>
  <div class="sec">General</div>${this.TG.map(([k,l])=>`<div class="row" data-act="tg" data-arg="${k}"><div class="grow">${l}</div>${sw(DB.set[k])}</div>`).join('')}
  <div class="sec">Personalise</div><div class="row" data-go="wall|x"><div class="grow">Wallpaper</div><span class="mut">›</span></div>
  <div class="row" data-act="clearn"><div class="grow">Clear notifications</div><span class="mut">${DB.notifs.length}</span></div>
  <div class="row" data-go="about|x"><div class="grow">About</div><span class="mut">›</span></div>
  <div class="pad"><button class="btn red" data-act="reset">Reset phone</button></div>`};
 },
 acts:{
  tg(k){DB.set[k]=!DB.set[k];if(k==='air'){DB.set.wifi=!DB.set.air;DB.set.cell=!DB.set.air}Store.save();UI.applySet();Host.render()},
  wall(i){DB.set.wall=+i;Store.save();UI.applySet();Host.render()},
  clearn(){DB.notifs=[];Store.save();UI.renderNC();UI.renderLock();Host.render()},
  profile(){Modal.form('Edit profile',[{id:'n',label:'Name',value:DB.me.name},{id:'u',label:'Username',value:DB.me.user},{id:'p',label:'Phone',value:DB.me.phone}],'Save',v=>{if(!v.n.trim()||!v.u.trim())return false;DB.me.name=v.n.trim();DB.me.user=v.u.trim().replace(/^@/,'');DB.me.phone=v.p.trim();Store.save();Host.render();UI.renderHome()})},
  reset(){Modal.confirm('Reset phone?','All data (messages, money, posts…) returns to defaults.','Reset',()=>Store.reset())}
 }
};
