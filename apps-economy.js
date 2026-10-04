/* ===== Economy: Wallet, Bank, Marketplace ===== */
const txList=(accs,n=30)=>{const l=DB.tx.filter(t=>accs.includes(t.acc)).slice(0,n);return l.length?l.map(t=>`<div class="row"><div class="grow"><b>${esc(t.title)}</b><small class="mut">${esc(t.t)}</small></div><b class="${t.type==='in'?'inc':''}">${t.type==='in'?'+':'-'}${fmt(t.amt)}</b></div>`).join(''):'<p class="empty">No transactions</p>'};
const qrSvg=s=>{let h=hash(s)||1,o='';const f=(x,y,ox,oy)=>{const a=x-ox,b=y-oy;return a>=0&&a<7&&b>=0&&b<7?(a==0||a==6||b==0||b==6||(a>=2&&a<=4&&b>=2&&b<=4)?1:0):-1};
 for(let y=0;y<21;y++)for(let x=0;x<21;x++){let v=f(x,y,0,0);if(v<0)v=f(x,y,14,0);if(v<0)v=f(x,y,0,14);if(v<0){h=(h*1103515245+12345)>>>0;v=(h>>>16)&1}if(v)o+=`<rect x="${x}" y="${y}" width="1" height="1"/>`}
 return `<svg viewBox="-1 -1 23 23" class="qr"><rect x="-1" y="-1" width="23" height="23" fill="#fff"/><g fill="#000">${o}</g></svg>`};

Apps.wallet={name:'Wallet',icon:'💳',c:'#111',
 view(v){
  if(v==='receive')return{title:'Receive',html:`<div class="prof">${qrSvg(DB.me.phone)}<h3>${esc(DB.me.name)}</h3><p class="mut">${esc(DB.me.phone)}</p><small class="mut">Show this code to receive payments</small></div>`};
  return{title:'Wallet',html:`<div class="wcard"><small>Total Balance</small><h1>${fmt(DB.acc.wallet)}</h1><div class="wact"><button data-act="send"><b>↑</b>Send</button><button data-go="receive|x"><b>↓</b>Receive</button><button data-act="pay"><b>◉</b>Pay</button><button data-act="req"><b>⇄</b>Request</button><button data-act="top"><b>＋</b>Top up</button></div></div><h3 class="sh">Recent</h3>${txList(['wallet'])}`};
 },
 acts:{
  send(){Modal.form('Send money',[{id:'to',label:'To',type:'select',opts:cOpts()},{id:'amt',label:'Amount (₱)',type:'number',ph:'0'},{id:'note',label:'Note',ph:'payment'}],'Send',v=>{const ok=Economy.transfer('wallet',v.to,+v.amt,v.note);if(ok)Host.render();return ok})},
  pay(){Modal.form('Pay merchant',[{id:'m',label:'Merchant',ph:'Coffee Shop'},{id:'amt',label:'Amount (₱)',type:'number'}],'Pay',v=>{if(!v.m.trim()){UI.toast('Enter merchant');return false}const ok=Economy.pay('wallet',+v.amt,'Pay: '+v.m.trim());if(ok){Notify.push({app:'wallet',title:'Payment completed',msg:fmt(+v.amt)+' to '+v.m.trim(),go:['wallet']});Host.render()}return ok})},
  req(){Modal.form('Request money',[{id:'to',label:'From',type:'select',opts:cOpts()},{id:'amt',label:'Amount (₱)',type:'number'}],'Request',v=>{const a=+v.amt;if(!(a>0)){UI.toast('Invalid amount');return false}Msg.add(v.to,'me','💸 Requested '+fmt(a));setTimeout(()=>{Economy.add('wallet',a,nm(v.to)+' paid request');Notify.push({app:'wallet',title:'Payment received',msg:nm(v.to)+' sent you '+fmt(a),go:['wallet']});Msg.receive(v.to,v.to,'udah gue transfer ✅');Host.id==='wallet'&&Host.render()},3000);UI.toast('Request sent')})},
  top(){Modal.form('Top up from bank',[{id:'amt',label:'Amount (₱)',type:'number'}],'Top up',v=>{const ok=Economy.move('checking','wallet',+v.amt);if(ok)Host.render();return ok})}
 }
};

Apps.bank={name:'Bank',icon:'🏦',c:'#12634d',online:1,
 view(v){
  if(v==='bills')return{title:'Bills',html:DB.bills.map(b=>`<div class="row"><div class="grow"><b>${esc(b.n)}</b><small class="mut">${fmt(b.amt)}</small></div>${b.paid?'<span class="inc">Paid ✓</span>':`<button class="btn sm" data-act="bill" data-arg="${b.id}">Pay</button>`}</div>`).join('')};
  if(v==='card'){const n=(hash('card')%9000+1000);return{title:'Bank Card',html:`<div class="bcard ${DB.cardFrozen?'frozen':''}"><small>IGNATIUS BANK</small><div class="cn">4821 •••• •••• ${n}</div><div class="cr"><span>${esc(DB.me.name.toUpperCase())}</span><span>12/29</span></div></div><div class="row" data-act="freeze"><div class="grow"><b>Freeze card</b><small class="mut">Blocks card payments in Marketplace</small></div>${sw(DB.cardFrozen)}</div>`}}
  if(v==='history')return{title:'History',html:txList(['checking','savings'])};
  return{title:'Ignatius Bank',sub:'Good morning, '+DB.me.name.split(' ')[0],html:`<div class="bbal"><small>Total Balance</small><h1>${fmt(DB.acc.checking+DB.acc.savings)}</h1><div class="split"><div><small>Checking</small><b>${fmt(DB.acc.checking)}</b></div><div><small>Savings</small><b>${fmt(DB.acc.savings)}</b></div></div></div><div class="bgrid"><button data-act="transfer">↗<span>Transfer</span></button><button data-act="tosav">⬇<span>To Savings</span></button><button data-act="fromsav">⬆<span>From Savings</span></button><button data-go="bills|x">🧾<span>Bills</span></button><button data-go="card|x">💳<span>Card</span></button><button data-go="history|x">🕘<span>History</span></button></div><h3 class="sh">Recent</h3>${txList(['checking','savings'],5)}`};
 },
 acts:{
  transfer(){Modal.form('Transfer',[{id:'to',label:'To',type:'select',opts:cOpts()},{id:'amt',label:'Amount (₱)',type:'number'},{id:'note',label:'Note',ph:'payment'}],'Send',v=>{const ok=Economy.transfer('checking',v.to,+v.amt,v.note);if(ok)Host.render();return ok})},
  tosav(){Modal.form('Move to savings',[{id:'amt',label:'Amount (₱)',type:'number'}],'Move',v=>{const ok=Economy.move('checking','savings',+v.amt);if(ok)Host.render();return ok})},
  fromsav(){Modal.form('Move to checking',[{id:'amt',label:'Amount (₱)',type:'number'}],'Move',v=>{const ok=Economy.move('savings','checking',+v.amt);if(ok)Host.render();return ok})},
  bill(id){const b=DB.bills.find(x=>x.id===id);if(Economy.pay('checking',b.amt,'Bill: '+b.n)){b.paid=true;Store.save();Notify.push({app:'bank',title:'Bill paid',msg:b.n+' · '+fmt(b.amt),go:['bank']});Host.render()}},
  freeze(){DB.cardFrozen=!DB.cardFrozen;Store.save();Host.render()}
 }
};

Apps.market={name:'Market',icon:'🛍',c:'#ff8b18',online:1,tab:'shop',cat:'All',q:'',
 CATS:['All','Cars','Fashion','Electronics','Food','Property','Services','Other'],
 sellerName:p=>p.seller==='me'?DB.me.user:p.seller,
 grid(){
  const q=this.q.toLowerCase(),l=DB.products.filter(p=>(this.cat==='All'||p.cat===this.cat)&&p.n.toLowerCase().includes(q));
  return l.length?`<div class="pgrid">${l.map(p=>`<div class="prod" data-go="detail|${p.id}"><div class="pim" style="background:${G[hash(p.id)%G.length]}">${esc(p.em)}</div><b>${esc(p.n)}</b><div class="pr">${fmt(p.p)}</div><small class="mut">@${esc(this.sellerName(p))} · ★ ${p.r}</small></div>`).join('')}</div>`:'<p class="empty">No products found</p>';
 },
 view(v,p){
  const T=tabbar([['shop','🛍','Shop'],['cart','🛒','Cart'+(DB.cart.length?' ('+DB.cart.length+')':'')],['orders','📦','Orders'],['sell','🏷','Sell']],this.tab);
  if(v==='detail'){const x=DB.products.find(q=>q.id===p.id);if(!x)return{title:'Product',html:'<p class="empty">Not found</p>'};const mine=x.seller==='me';
   return{title:'',html:`<div class="pim big" style="background:${G[hash(x.id)%G.length]}">${esc(x.em)}</div><div class="pd"><h2>${esc(x.n)}</h2><div class="pr xl">${fmt(x.p)}</div><p class="mut">@${esc(this.sellerName(x))} · ★ ${x.r} · ${esc(x.cat)}</p>${mine?`<button class="btn red" data-act="unlist" data-arg="${x.id}">Remove my listing</button>`:`<div class="btns"><button class="btn sec" data-act="addcart" data-arg="${x.id}">Add to cart</button><button class="btn" data-act="buy" data-arg="${x.id}">Buy now</button></div>`}</div>`}}
  if(this.tab==='cart'){const l=DB.cart.map(id=>DB.products.find(p=>p.id===id)).filter(Boolean),tot=l.reduce((a,b)=>a+b.p,0);
   return{title:'Cart',tabs:T,html:l.length?l.map(x=>`<div class="row"><div class="pim sm" style="background:${G[hash(x.id)%G.length]}">${esc(x.em)}</div><div class="grow"><b>${esc(x.n)}</b><small class="mut">${fmt(x.p)}</small></div><button class="ic" data-act="rmcart" data-arg="${x.id}">✕</button></div>`).join('')+`<div class="pad"><div class="row nb"><b class="grow">Total</b><b>${fmt(tot)}</b></div><button class="btn" data-act="checkout">Checkout</button></div>`:'<p class="empty">Your cart is empty</p>'};}
  if(this.tab==='orders'){const S=['Order placed','Payment confirmed','Processing','Delivered'];
   return{title:'Orders',tabs:T,html:DB.orders.length?DB.orders.map(o=>`<div class="card"><b>Order #${esc(o.id)}</b><div class="mut">${o.items.map(i=>esc(i.n)).join(', ')} · ${fmt(o.total)}</div><div class="steps">${S.map((s,i)=>`<div class="${i<=o.status?'done':''}">${i<o.status?'✓':i===o.status?'●':'○'} ${s}</div>`).join('')}</div></div>`).join(''):'<p class="empty">No orders yet</p>'};}
  return{title:'Marketplace',tabs:T,html:`<input class="search" data-input="search" placeholder="Search products…" value="${esc(this.q)}"><div class="chips">${this.CATS.map(c=>`<button class="chip ${c===this.cat?'on':''}" data-act="cat" data-arg="${c}">${c}</button>`).join('')}</div><div id="mlist">${this.grid()}</div>`};
 },
 track(o){
  if(o.status>=3)return;
  setTimeout(()=>{o.status=Math.max(o.status,2);Store.save();Host.id==='market'&&Host.render()},5000);
  setTimeout(()=>{o.status=3;Store.save();Notify.push({app:'market',title:'Order delivered',msg:'#'+o.id+' has been delivered',go:['market']});Host.id==='market'&&Host.render()},14000);
 },
 onLoad(){DB.orders.forEach(o=>this.track(o))},
 checkout(items){
  const tot=items.reduce((a,b)=>a+b.p,0);
  Modal.form('Pay '+fmt(tot),[{id:'m',label:'Payment method',type:'select',opts:[['wallet','Wallet · '+fmt(DB.acc.wallet)],['checking','Ignatius Bank · '+fmt(DB.acc.checking)]]}],'Pay',v=>{
   if(v.m==='checking'&&DB.cardFrozen){UI.toast('Bank card is frozen');return false}
   if(!Economy.pay(v.m,tot,'Marketplace: '+items.map(i=>i.n).join(', ')))return false;
   const o={id:'IG-'+(240091+DB.orders.length+1),items:items.map(i=>({n:i.n,p:i.p,seller:i.seller})),total:tot,status:1,t:hhmm()};
   DB.orders.unshift(o);DB.cart=DB.cart.filter(id=>!items.find(i=>i.id===id));
   DB.mail.unshift({id:uid(),from:'Marketplace',sub:'Receipt #'+o.id,body:'Thanks for your order!\n\n'+o.items.map(i=>i.n+' — '+fmt(i.p)).join('\n')+'\n\nTotal: '+fmt(tot)+'\nPaid with: '+(v.m==='wallet'?'Wallet':'Ignatius Bank'),t:'Now',read:false});
   Store.save();Notify.push({app:'market',title:'Purchase complete',msg:items.map(i=>i.n).join(', ')+' · '+fmt(tot),go:['market']});
   this.tab='orders';this.track(o);Host.stack=[{v:'main',p:{}}];Host.render();
  });
 },
 acts:{
  search(v){this.q=v;const e=$('#mlist');if(e)e.innerHTML=this.grid()},
  cat(c){this.cat=c;Host.render()},
  tab(k){if(k==='sell')return this.sell();this.tab=k;Host.stack=[{v:'main',p:{}}];Host.render()},
  addcart(id){if(!DB.cart.includes(id))DB.cart.push(id);Store.save();UI.toast('Added to cart')},
  rmcart(id){DB.cart=DB.cart.filter(x=>x!==id);Store.save();Host.render()},
  buy(id){this.checkout([DB.products.find(p=>p.id===id)])},
  checkout(){this.checkout(DB.cart.map(id=>DB.products.find(p=>p.id===id)).filter(Boolean))},
  unlist(id){DB.products=DB.products.filter(p=>p.id!==id);DB.cart=DB.cart.filter(x=>x!==id);Store.save();Host.back()}
 },
 sell(){
  Modal.form('Sell an item',[{id:'n',label:'Item name'},{id:'p',label:'Price (₱)',type:'number'},{id:'c',label:'Category',type:'select',opts:this.CATS.slice(1).map(c=>[c,c])},{id:'e',label:'Emoji',value:'📦'}],'List',v=>{
   if(!v.n.trim()||!(+v.p>0)){UI.toast('Fill name and price');return false}
   const x={id:uid(),n:v.n.trim(),p:+v.p,cat:v.c,seller:'me',em:v.e||'📦',r:5};DB.products.unshift(x);Store.save();
   setTimeout(()=>{if(!DB.products.find(q=>q.id===x.id))return;const b=pick(DB.contacts);DB.products=DB.products.filter(q=>q.id!==x.id);Economy.add('wallet',x.p,'Sold: '+x.n);Notify.push({app:'market',title:'Item sold!',msg:b.name+' bought '+x.n+' for '+fmt(x.p),go:['wallet']});Msg.receive(b.id,b.id,'barang udah gue ambil ya, thanks!');Host.id==='market'&&Host.render()},15000);
   this.tab='shop';Host.render();UI.toast('Listed — a buyer may show up soon');
  });
 }
};
