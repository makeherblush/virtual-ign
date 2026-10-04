/* ===== Social: Instarp, Chirper ===== */
const photoOpts=()=>DB.gallery.map(p=>[p.id,p.title]);

Apps.instarp={name:'Instarp',icon:'◎',c:'linear-gradient(135deg,#ffca3a,#ff245c,#8c32ff)',online:1,tab:'home',
 postHTML(p){
  return `<article class="post"><div class="row nb" data-go="profile|${p.u}">${av(p.u,'sm')}<b>@${esc(un(p.u))}</b></div><div class="pimg" style="background:${G[p.g%G.length]}"><span>${esc(p.lbl||'')}</span></div><div class="pact"><button data-act="like" data-arg="${p.id}">${p.liked?'❤️':'♡'}</button><button data-go="comments|${p.id}">💬</button><button data-act="share">↗</button></div><b class="ml">${p.likes.toLocaleString()} likes</b><p class="ml"><b>@${esc(un(p.u))}</b> ${esc(p.cap)}</p><small class="ml mut" data-go="comments|${p.id}">View all ${p.cm.length} comments</small></article>`;
 },
 prof(id){
  const me=id==='me',posts=DB.posts.filter(p=>p.u===id),fol=DB.follows.includes(id);
  return `<div class="iprof">${av(id,'xl')}<h2>${esc(nm(id))}</h2><p class="mut">@${esc(un(id))}</p><div class="stats"><div><b>${posts.length}</b><small>posts</small></div><div><b>${me?DB.follows.length*37+120:(hash(id)%900)+100}</b><small>followers</small></div><div><b>${me?DB.follows.length:(hash(id)%200)+20}</b><small>following</small></div></div>${me?'':`<div class="btns"><button class="btn ${fol?'sec':''}" data-act="follow" data-arg="${id}">${fol?'Following':'Follow'}</button><button class="btn sec" data-act="dm" data-arg="${id}">Message</button></div>`}</div><div class="ggrid">${posts.map(p=>`<div style="background:${G[p.g%G.length]}" data-go="comments|${p.id}">${esc(p.lbl||'')}</div>`).join('')||'<p class="empty">No posts yet</p>'}</div>`;
 },
 view(v,p){
  if(v==='story'){const s=DB.stories.find(x=>x.id===p.id)||{};return{flat:1,html:`<div class="story-v" data-back style="background:${G[(s.g||0)%G.length]}"><div class="row nb">${av(s.u||'me','sm')}<b>@${esc(un(s.u||'me'))}</b></div><h1>${esc(s.txt||'')}</h1></div>`}}
  if(v==='comments'){const x=DB.posts.find(q=>q.id===p.id);if(!x)return{title:'Post',html:'<p class="empty">Not found</p>'};
   return{title:'Comments',html:this.postHTML(x)+x.cm.map(c=>`<div class="row nb">${av(c.u,'sm')}<div><b>@${esc(un(c.u))}</b> ${esc(c.x)}</div></div>`).join(''),bar:`<div class="inputbar"><input id="ci" data-enter="comment" placeholder="Add a comment…" autocomplete="off"><button data-act="comment">➤</button></div>`};}
  if(v==='profile')return{title:'@'+un(p.id),html:this.prof(p.id)};
  const T=tabbar([['home','🏠','Home'],['me','👤','Profile']],this.tab);
  if(this.tab==='me')return{title:'Profile',right:'<button class="ic" data-act="newpost">＋</button>',html:this.prof('me'),tabs:T};
  return{title:'instarp',right:'<button class="ic" data-act="newpost">＋</button>',tabs:T,
   html:`<div class="stories"><div class="story" data-act="newstory"><div class="sav add">+</div><small>Your story</small></div>${DB.stories.map(s=>`<div class="story" data-go="story|${s.id}"><div class="sav" style="--c:${G[s.g%G.length]}">${esc(nm(s.u)[0])}</div><small>${esc(nm(s.u))}</small></div>`).join('')}</div>${DB.posts.map(x=>this.postHTML(x)).join('')}`};
 },
 newPost(pid){
  Modal.form('New post',[{id:'ph',label:'Photo (from Gallery)',type:'select',opts:photoOpts()},{id:'cap',label:'Caption',type:'area',ph:'Write a caption…'}],'Share',v=>{
   const ph=DB.gallery.find(g=>g.id===v.ph);if(!ph)return false;
   const post={id:uid(),u:'me',g:ph.g,lbl:ph.title,cap:v.cap||'',likes:0,liked:false,cm:[]};DB.posts.unshift(post);Store.save();
   setTimeout(()=>{post.likes+=Math.floor(Math.random()*40)+5;Store.save();Notify.push({app:'instarp',title:'Instarp',msg:'@'+pick(DB.contacts).user+' liked your post',go:['instarp','comments',{id:post.id}]})},4000);
   setTimeout(()=>{const c=pick(DB.contacts);post.cm.push({u:c.id,x:pick(['keren!','mantap 🔥','gila sih','suka banget'])});Store.save();Notify.push({app:'instarp',title:'Instarp',msg:'@'+c.user+' commented on your post',go:['instarp','comments',{id:post.id}]})},9000);
   Host.id==='instarp'&&Host.render();
  });
  if(pid){const s=$('#f_ph');if(s)s.value=pid}
 },
 acts:{
  like(id){const p=DB.posts.find(x=>x.id===id);p.liked=!p.liked;p.likes+=p.liked?1:-1;Store.save();Host.render()},
  share(){UI.toast('Link copied')},
  comment(){const i=$('#ci'),x=i&&i.value.trim();if(!x)return;DB.posts.find(q=>q.id===Host.top().p.id).cm.push({u:'me',x});Store.save();Host.render()},
  follow(id){const i=DB.follows.indexOf(id);i>=0?DB.follows.splice(i,1):DB.follows.push(id);Store.save();Host.render()},
  dm(id){if(!DB.msgs[id])DB.msgs[id]=[];Host.open('messages','chat',{id})},
  newpost(){Apps.instarp.newPost()},
  newstory(){Modal.form('Your story',[{id:'ph',label:'Photo',type:'select',opts:photoOpts()},{id:'t',label:'Text'}],'Post',v=>{const ph=DB.gallery.find(g=>g.id===v.ph);if(!ph)return false;DB.stories.unshift({id:uid(),u:'me',g:ph.g,txt:v.t});Store.save();Host.render()})}
 }
};

Apps.chirper={name:'Chirper',icon:'𝕏',c:'#111',online:1,tab:'home',
 view(v){
  const T=tabbar([['home','🏠','Home'],['trend','🔥','Trending']],this.tab);
  if(this.tab==='trend'){
   const c={};DB.chirps.forEach(x=>(x.x.match(/#\w+/g)||[]).forEach(t=>c[t]=(c[t]||0)+1+x.rc/20));
   const l=Object.entries(c).sort((a,b)=>b[1]-a[1]);
   return{title:'Trending',tabs:T,html:l.map(([t,n],i)=>`<div class="row"><b class="mut">${i+1}</b><div class="grow"><b>${esc(t)}</b><small class="mut">${Math.round(n*1000)} chirps</small></div></div>`).join('')||'<p class="empty">Nothing trending</p>'};
  }
  return{title:'Chirper',tabs:T,html:`<div class="compose">${av('me','sm')}<input id="cx" data-enter="chirp" placeholder="What's happening?" autocomplete="off"><button class="btn sm" data-act="chirp">Chirp</button></div>`+DB.chirps.map(c=>`<div class="row top">${av(c.u,'sm')}<div class="grow"><b>@${esc(un(c.u))}</b> <small class="mut">${esc(c.t)}</small><div>${esc(c.x).replace(/#\w+/g,'<span class="tag">$&</span>')}</div><div class="cact"><button data-act="like" data-arg="${c.id}">${c.liked?'❤️':'♡'} ${c.likes.toLocaleString()}</button><button data-act="rc" data-arg="${c.id}">↻ ${c.rc}</button><button data-act="share">↗</button></div></div></div>`).join('')};
 },
 acts:{
  chirp(){const i=$('#cx'),x=i&&i.value.trim();if(!x)return;const c={id:uid(),u:'me',x,likes:0,liked:false,rc:0,t:hhmm()};DB.chirps.unshift(c);Store.save();Host.render();
   setTimeout(()=>{c.likes+=Math.floor(Math.random()*30)+3;Store.save();Notify.push({app:'chirper',title:'Chirper',msg:'@'+pick(DB.contacts).user+' liked your chirp',go:['chirper']})},5000)},
  like(id){const c=DB.chirps.find(x=>x.id===id);c.liked=!c.liked;c.likes+=c.liked?1:-1;Store.save();Host.render()},
  rc(id){const c=DB.chirps.find(x=>x.id===id);c.rc++;Store.save();Host.render()},
  share(){UI.toast('Link copied')}
 }
};
