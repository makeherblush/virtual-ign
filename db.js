/* ===== Helpers & database (localStorage) ===== */
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const fmt=n=>'₱'+Number(n).toLocaleString('en-US');
const hhmm=()=>new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const hash=s=>[...String(s)].reduce((a,c)=>(a*31+c.charCodeAt(0))|0,7)>>>0;

const G=['linear-gradient(135deg,#3f5efb,#fc466b)','linear-gradient(135deg,#f9ce34,#ee2a7b,#6228d7)','linear-gradient(135deg,#11998e,#38ef7d)','linear-gradient(135deg,#ff8008,#ffc837)','linear-gradient(135deg,#232526,#6b7280)','linear-gradient(135deg,#654ea3,#eaafc8)','linear-gradient(135deg,#0f2027,#2c5364)','linear-gradient(135deg,#cb2d3e,#ef473a)','linear-gradient(135deg,#1c92d2,#8fd3f4)','linear-gradient(145deg,#171b29,#5b6284)'];
const WALLS=['radial-gradient(circle at 20% 15%,rgba(77,106,180,.4),transparent 35%),radial-gradient(circle at 80% 75%,rgba(120,60,180,.3),transparent 35%),linear-gradient(160deg,#17213b,#080a10 75%)','linear-gradient(160deg,#3a1c71,#d76d77,#ffaf7b)','linear-gradient(160deg,#0f2027,#203a43,#2c5364)','linear-gradient(160deg,#134e5e,#71b280)','linear-gradient(160deg,#232526,#414345)'];
const REPLIES=['oke siap','gas','nanti gue kabarin','hahaha serius?','otw','bentar ya','lu dimana?','boleh, jam berapa?','noted 👍','nanti malam aja','udah makan?'];
const INCOMING=['lu dimana?','meeting dipindah jam 9','cek chirper deh, rame','ntar ke city ga?','woi bales dong','ada info bagus nih'];
const THX=['makasih ya! 🙏','udah masuk, thanks','mantap, diterima','thx bro'];

const defaults=()=>{const n=Date.now();return{
 me:{name:'Jex Ignatius',user:'jex',phone:'+62 812 0000 0000',email:'jex@ignatius.rp'},
 set:{wall:0,dark:false,wifi:true,bt:true,air:false,cell:true,bright:100,vol:60,live:true,torch:false},
 acc:{wallet:125420,checking:3420500,savings:5000000},cardFrozen:false,
 contacts:[
  {id:'raven',name:'Raven',phone:'+62 813 0000 0001',user:'raven',email:'raven@ignatius.rp'},
  {id:'sea',name:'Sea',phone:'+62 813 0000 0002',user:'sea',email:'sea@ignatius.rp'},
  {id:'jenna',name:'Jenna',phone:'+62 813 0000 0003',user:'jenna',email:'jenna@ignatius.rp'},
  {id:'raka',name:'Raka',phone:'+62 813 0000 0004',user:'raka',email:'raka@ignatius.rp'},
  {id:'shiba',name:'Shiba',phone:'+62 813 0000 0005',user:'shiba',email:'shiba@ignatius.rp'},
  {id:'javan',name:'Javan',phone:'+62 813 0000 0006',user:'javan',email:'javan@ignatius.rp'}],
 groups:{geng:{name:'Geng Ignatius',members:['raven','sea','raka']}},
 msgs:{
  raven:[{f:'raven',x:'meeting jam 8',t:'08:22',ts:n-3e6},{f:'raven',x:'lu dimana?',t:'09:41',ts:n-6e4}],
  sea:[{f:'me',x:'udah makan?',t:'09:10',ts:n-9e5},{f:'sea',x:'udah, nanti ke city?',t:'09:12',ts:n-8e5}],
  geng:[{f:'raka',x:'malam ini kumpul?',t:'07:30',ts:n-7e6},{f:'sea',x:'gas',t:'07:31',ts:n-6.9e6}]},
 unread:{raven:1},
 recents:[{name:'Raven',id:'raven',t:'08:15',dir:'in'},{name:'Sea',id:'sea',t:'Yesterday',dir:'out'}],
 mail:[
  {id:'m1',from:'Ignatius Bank',sub:'Your monthly statement',body:'Dear customer,\n\nYour monthly statement is ready. Your balances are available in the Bank app.\n\n— Ignatius Bank',t:'Today',read:false},
  {id:'m2',from:'JX Corporation',sub:'Employment Contract',body:'Welcome aboard!\n\nPlease review the contract in Files > Contracts and reply before Friday.\n\n— HR, JX Corporation',t:'Yesterday',read:false},
  {id:'m3',from:'Ignatius University',sub:'Academic Notice',body:'Your registration for the next semester has been confirmed.',t:'Mon',read:true},
  {id:'m4',from:'City Council',sub:'Invitation: Town Hall',body:'You are invited to the Ignatius City town hall this Saturday, 19:00.',t:'Sun',read:true}],
 posts:[
  {id:'p1',u:'raven',g:9,lbl:'NIGHT',cap:'Night in Ignatius City.',likes:1204,liked:false,cm:[{u:'sea',x:'cakep banget'}]},
  {id:'p2',u:'sea',g:2,lbl:'PARK',cap:'Morning run 🌿',likes:342,liked:false,cm:[]},
  {id:'p3',u:'raka',g:7,lbl:'CAR',cap:'New ride.',likes:871,liked:false,cm:[{u:'raven',x:'gila 🔥'},{u:'jenna',x:'bagi tumpangan dong'}]}],
 stories:[{id:'s1',u:'raven',g:1,txt:'Night run'},{id:'s2',u:'sea',g:5,txt:'Coffee time ☕'},{id:'s3',u:'raka',g:6,txt:'Garage day'}],
 follows:['raven','sea'],
 chirps:[
  {id:'c1',u:'IgnatiusNews',x:'BREAKING: New economic policy announced for Ignatius City. #economy',likes:1200,liked:false,rc:92,t:'09:30'},
  {id:'c2',u:'raven',x:'City looks different tonight. #nightcity',likes:240,liked:false,rc:12,t:'09:12'},
  {id:'c3',u:'sea',x:'Siapa yang ke town hall Sabtu? #townhall',likes:88,liked:false,rc:5,t:'08:50'},
  {id:'c4',u:'IgnatiusNews',x:'Traffic alert: Central Ave closed until 18:00. #traffic',likes:310,liked:false,rc:44,t:'08:10'}],
 tx:[
  {id:'t1',acc:'wallet',type:'in',title:'Salary',amt:25000,t:'Today'},
  {id:'t2',acc:'wallet',type:'out',title:'Coffee Shop',amt:120,t:'Yesterday'},
  {id:'t3',acc:'wallet',type:'out',title:'Clothing',amt:2500,t:'Yesterday'},
  {id:'t4',acc:'checking',type:'in',title:'JX Corporation payroll',amt:3500000,t:'Mon'}],
 bills:[{id:'b1',n:'Electricity',amt:450000,paid:false},{id:'b2',n:'Internet',amt:300000,paid:false},{id:'b3',n:'Apartment rent',amt:2500000,paid:false}],
 products:[
  {id:'pr1',n:'Black Jacket',p:850,cat:'Fashion',seller:'JexStore',em:'🧥',r:4.9},
  {id:'pr2',n:'Silver Watch',p:2500,cat:'Fashion',seller:'TimeHouse',em:'⌚',r:4.7},
  {id:'pr3',n:'Smartphone X',p:9800,cat:'Electronics',seller:'TechCity',em:'📱',r:4.8},
  {id:'pr4',n:'Gaming Laptop',p:24000,cat:'Electronics',seller:'TechCity',em:'💻',r:4.6},
  {id:'pr5',n:'Sport Coupe',p:850000,cat:'Cars',seller:'AutoIgnatius',em:'🏎️',r:4.9},
  {id:'pr6',n:'Burger Combo',p:90,cat:'Food',seller:'BurgerCo',em:'🍔',r:4.5},
  {id:'pr7',n:'Studio Apartment',p:1200000,cat:'Property',seller:'CityHomes',em:'🏢',r:4.4},
  {id:'pr8',n:'Car Detailing',p:350,cat:'Services',seller:'ShinePro',em:'🧽',r:4.7}],
 cart:[],orders:[],
 files:[
  {id:'f1',n:'Employment_Contract.pdf',folder:'Contracts',body:'EMPLOYMENT CONTRACT\n\nEmployer: JX Corporation\nEmployee: Jex Ignatius\nPosition: Operations Lead\nSalary: ₱3,500,000 / month'},
  {id:'f2',n:'Apartment_Lease.pdf',folder:'Contracts',body:'LEASE AGREEMENT\n\nProperty: Studio, Central Ave\nTerm: 12 months\nRent: ₱2,500,000 / month'},
  {id:'f3',n:'Bank_Statement.pdf',folder:'Documents',body:'IGNATIUS BANK\nMonthly statement — see Bank app for live balances.'},
  {id:'f4',n:'Identity_Card',folder:'ID Cards',body:'IGNATIUS CITY ID\n\nName: Jex Ignatius\nID: user_001'},
  {id:'f5',n:'Coffee_Receipt.png',folder:'Receipts',body:'Coffee Shop — ₱120'},
  {id:'f6',n:'Welcome.txt',folder:'Downloads',body:'Welcome to Ignatius Phone.'}],
 notes:[{id:'n1',title:'To do',body:'- bayar tagihan\n- meeting jam 8\n- cek marketplace'}],
 gallery:[1,2,3,4,5,6].map(i=>({id:'g'+i,g:i,title:'IMG_'+(1000+i),fav:i===1})),
 notifs:[]
}};
let DB=defaults();
const Store={
 key:'ignatius_phone_v1',
 save(){try{localStorage.setItem(this.key,JSON.stringify(DB))}catch(e){}},
 load(){try{const r=localStorage.getItem(this.key);if(!r)return;const d=JSON.parse(r),df=defaults();DB={...df,...d};DB.set={...df.set,...d.set};DB.acc={...df.acc,...d.acc};DB.me={...df.me,...d.me}}catch(e){console.error('DB load',e)}},
 reset(){try{localStorage.removeItem(this.key)}catch(e){}location.reload()}
};
