/* ===== Communication: Phone, Messages, Contacts, Mail ===== */
const KEYS=[['1',''],['2','ABC'],['3','DEF'],['4','GHI'],['5','JKL'],['6','MNO'],['7','PQRS'],['8','TUV'],['9','WXYZ'],['*',''],['0','+'],['#','']];

Apps.phone={name:'Phone',icon:'📞',c:'#24c76b',tab:'keypad',num:'',call:null,timers:[],
 startCall(name,id){
  const a=this;a.stop();a.call={name,id,st:'calling…',s:0};
  DB.recents.unshift({name,id,t:hhmm(),dir:'out'});DB.recents=DB.recents.slice(0,30);Store.save();
  Host.go('call');
  const tick=()=>{const e=$('#cst');if(e&&a.call)e.textContent=String(Math.floor(a.call.s/60)).padStart(2,'0')+':'+String(a.call.s%60).padStart(2,'0')};
  a.timers.push(setTimeout(()=>{if(!a.call)return;a.call.st='00:00';tick();a.timers.push(setInterval(()=>{if(!a.call)return;a.call.s++;tick()},1000))},2200));
 },
 out(name,id){Host.open('phone','main');this.startCall(name,id)},
 stop(){this.timers.forEach(t=>{clearTimeout(t);clearInterval(t)});this.timers=[];this.call=null},
 onClose(){this.stop()},
 view(v){
  if(v==='call'){const c=this.call||{name:'',st:''};return{flat:1,html:`<div class="callscr"><small>${c.id?'mobile':'unknown'}</small><h1>${esc(c.name)}</h1><p id="cst">${esc(c.st)}</p><div class="cgrid"><span>🔇<small>mute</small></span><span>🔢<small>keypad</small></span><span>🔊<small>speaker</small></span></div><button class="endcall" data-act="end">✕</button></div>`}}
  const t=this.tab;let b='';
  const row=(n,id,sub)=>`<div class="row" data-act="callc" data-arg="${esc(id||n)}" data-n="${esc(n)}">${id?av(id):'<div class="av">#</div>'}<div class="grow"><b>${esc(n)}</b><small class="mut">${esc(sub||'')}</small></div><span class="acc">📞</span></div>`;
  if(t==='keypad')b=`<div class="dn" id="dn">${esc(this.num)}</div><div class="keys">${KEYS.map(k=>`<button data-act="key" data-arg="${k[0]}">${k[0]}<small>${k[1]}</small></button>`).join('')}</div><div class="keyrow"><span></span><button class="callbtn" data-act="dial">📞</button><button class="delbtn" data-act="del">⌫</button></div>`;
  else if(t==='recents')b=DB.recents.length?DB.recents.map(r=>row(r.name,r.id,(r.dir==='out'?'↗ Outgoing':'↙ Incoming')+' · '+r.t)).join(''):'<p class="empty">No recent calls</p>';
  else if(t==='favs')b=DB.contacts.slice(0,4).map(c=>row(c.name,c.id,c.phone)).join('');
  else b=DB.contacts.map(c=>row(c.name,c.id,c.phone)).join('');
  return{title:'Phone',html:b,tabs:tabbar([['favs','⭐','Favorites'],['recents','🕘','Recents'],['contacts','👤','Contacts'],['keypad','⌨️','Keypad']],t)};
 },
 acts:{
  key(k){this.num+=k;const e=$('#dn');if(e)e.textContent=this.num},
  del(){this.num=this.num.slice(0,-1);const e=$('#dn');if(e)e.textContent=this.num},
  dial(){if(!this.num)return;const c=DB.contacts.find(c=>c.phone.replace(/\D/g,'')===this.num.replace(/\D/g,''));this.startCall(c?c.name:this.num,c?c.id:null)},
  callc(arg,el){this.startCall(el.dataset.n,ct(arg)?arg:null)},
  end(){this.stop();Host.back()}
 }
};

Apps.messages={name:'Messages',icon:'💬',c:'#1685ff',
 view(v,p){
  if(v==='chat'){
   const id=p.id,g=DB.groups[id],ms=DB.msgs[id]||[];DB.unread[id]=0;
   return{title:nm(id),sub:g?(g.members.length+1)+' members':(ct(id)?.phone||''),stick:1,
    html:`<div class="chat">${ms.map(m=>`<div class="bub ${m.f==='me'?'me':'them'}">${g&&m.f!=='me'?`<small>${esc(nm(m.f))}</small>`:''}${esc(m.x)}<i>${m.t}</i></div>`).join('')||'<p class="empty">No messages yet</p>'}</div>`,
    bar:`<div class="inputbar"><input id="mi" data-enter="send" placeholder="iMessage" autocomplete="off"><button data-act="send">➤</button></div>`,
    right:ct(id)?`<button class="ic" data-act="callchat" data-arg="${id}">📞</button>`:''};
  }
  const ids=Object.keys(DB.msgs).sort((a,b)=>(DB.msgs[b].at(-1)?.ts||0)-(DB.msgs[a].at(-1)?.ts||0));
  return{title:'Messages',right:'<button class="ic" data-act="new">✎</button>',html:ids.length?ids.map(id=>{const l=DB.msgs[id].at(-1)||{x:'',t:''},u=DB.unread[id];return`<div class="row" data-go="chat|${id}">${DB.groups[id]?`<div class="av" style="background:${G[hash(id)%G.length]}">👥</div>`:av(id)}<div class="grow"><b>${esc(nm(id))}</b><small class="mut ell">${l.f==='me'?'You: ':''}${esc(l.x)}</small></div><small class="mut">${l.t}</small>${u?`<i class="dot">${u}</i>`:''}</div>`}).join(''):'<p class="empty">No conversations</p>'};
 },
 acts:{
  send(){
   const i=$('#mi'),x=i&&i.value.trim();if(!x)return;const id=Host.top().p.id;
   Msg.add(id,'me',x);Host.render();const n=$('#mi');n&&n.focus();
   if(!Net.ok())return UI.toast('Not delivered — no connection');
   const g=DB.groups[id];setTimeout(()=>Msg.receive(id,g?pick(g.members):id,pick(REPLIES)),1200+Math.random()*2000);
  },
  new(){Modal.form('New message',[{id:'to',label:'To',type:'select',opts:[...cOpts(),...Object.entries(DB.groups).map(([k,g])=>[k,'👥 '+g.name])]}],'Open',v=>{if(!DB.msgs[v.to])DB.msgs[v.to]=[];Host.go('chat',{id:v.to})})},
  callchat(id){Apps.phone.out(nm(id),id)}
 }
};

Apps.contacts={name:'Contacts',icon:'👤',c:'#8e8e93',
 view(v,p){
  if(v==='profile'){const c=ct(p.id);if(!c)return{title:'Contact',html:'<p class="empty">Not found</p>'};
   return{title:'',html:`<div class="prof">${av(c.id,'xl')}<h2>${esc(c.name)}</h2><p class="mut">${esc(c.phone)}</p><div class="pact3"><button data-act="msg" data-arg="${c.id}">💬<span>Message</span></button><button data-act="call" data-arg="${c.id}">📞<span>Call</span></button><button data-act="social" data-arg="${c.id}">◎<span>Instarp</span></button></div><div class="card"><small class="mut">email</small><div>${esc(c.email||'—')}</div></div><div class="card"><small class="mut">username</small><div>@${esc(c.user)}</div></div><button class="btn red" data-act="del" data-arg="${c.id}">Delete contact</button></div>`}}
  const s=[...DB.contacts].sort((a,b)=>a.name.localeCompare(b.name));let L='',h='';
  s.forEach(c=>{const l=c.name[0].toUpperCase();if(l!==L){L=l;h+=`<div class="sec">${l}</div>`}h+=`<div class="row" data-go="profile|${c.id}">${av(c.id)}<div class="grow"><b>${esc(c.name)}</b><small class="mut">${esc(c.phone)}</small></div></div>`});
  return{title:'Contacts',right:'<button class="ic" data-act="add">＋</button>',html:h||'<p class="empty">No contacts</p>'};
 },
 acts:{
  add(){Modal.form('New contact',[{id:'n',label:'Name'},{id:'p',label:'Phone',type:'tel',ph:'+62'},{id:'e',label:'Email',type:'email'}],'Save',v=>{if(!v.n.trim())return false;const id=uid();DB.contacts.push({id,name:v.n.trim(),phone:v.p||'—',user:v.n.trim().toLowerCase().replace(/\W/g,''),email:v.e});Store.save();Host.render()})},
  msg(id){if(!DB.msgs[id])DB.msgs[id]=[];Host.open('messages','chat',{id})},
  call(id){Apps.phone.out(nm(id),id)},
  social(id){Host.open('instarp','profile',{id})},
  del(id){Modal.confirm('Delete contact?',nm(id),'Delete',()=>{DB.contacts=DB.contacts.filter(c=>c.id!==id);Store.save();Host.back()})}
 }
};

Apps.mail={name:'Mail',icon:'✉️',c:'#1685ff',online:1,
 view(v,p){
  if(v==='read'){const m=DB.mail.find(x=>x.id===p.id);if(!m)return{title:'Mail',html:'<p class="empty">Not found</p>'};m.read=true;Store.save();
   return{title:'',right:`<button class="ic" data-act="del" data-arg="${m.id}">🗑</button>`,html:`<div class="mailv"><h2>${esc(m.sub)}</h2><div class="row nb">${av(m.from)}<div class="grow"><b>${esc(m.from)}</b><small class="mut">to me · ${esc(m.t)}</small></div></div><p class="pre">${esc(m.body)}</p></div>`}}
  return{title:'Inbox',sub:DB.mail.filter(m=>!m.read).length+' unread',html:DB.mail.length?DB.mail.map(m=>`<div class="row" data-go="read|${m.id}">${m.read?'<i class="ud off"></i>':'<i class="ud"></i>'}<div class="grow"><b>${esc(m.from)}</b><div>${esc(m.sub)}</div><small class="mut ell">${esc(m.body.replace(/\n/g,' '))}</small></div><small class="mut">${esc(m.t)}</small></div>`).join(''):'<p class="empty">Inbox empty</p>'};
 },
 acts:{del(id){DB.mail=DB.mail.filter(m=>m.id!==id);Store.save();Host.back()}}
};
