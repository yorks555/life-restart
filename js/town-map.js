// Authored town layout: fixed streets, buildings, park and waterfront.
(function(root){
  const locations=[
    {name:'家',x:9,y:11,label:'出发去体验另一段人生',href:'life.html'},
    {name:'图书馆',x:17,y:11,label:'查看人生与棋局图鉴',href:'index.html#tujian'},
    {name:'签铺',x:30,y:11,label:'抽一支签',href:'qian.html'},
    {name:'棋摊',x:9,y:24,label:'来下一局五子棋',href:'gomoku.html'},
    {name:'研究所',x:17,y:24,label:'看看今日命运',href:'fortune.html'},
    {name:'档案室',x:30,y:24,label:'查看个人档案',href:'index.html#me'},
    {name:'观景台',x:38,y:24,label:'看看已经走过多少天',href:'progress.html'}
  ];
  function map(){
    const g=Array.from({length:36},()=>Array(48).fill(0));
    const rect=(x,y,w,h,type)=>{for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)g[yy][xx]=type;};
    rect(3,3,42,30,1);rect(5,5,38,26,2);
    rect(5,17,38,2,3);rect(23,5,2,26,3);
    rect(5,13,38,1,3);rect(5,26,38,1,3);
    rect(34,6,8,7,0);rect(33,6,1,7,1);
    for(const l of locations){rect(l.x-1,l.y-1,3,2,5);rect(l.x,l.y+1,1,l.y<17?2:1,3);}
    for(const [x,y] of [[6,6],[8,6],[10,6],[6,8],[14,6],[16,6],[18,6],[28,6],[30,6],[6,28],[9,29],[13,29],[17,29],[20,29],[27,29],[30,29],[34,29],[40,29],[41,15],[38,15],[36,15],[6,20],[12,20],[19,20],[28,20],[33,20],[39,20]])g[y][x]=4;
    return g;
  }

  const width=1620,height=1100;
  const areas=[
    {id:'residential',name:'住宅区',x:80,y:125,w:290,h:280,place:'home',color:'#c4d0ad',text:'家庭、生活与休息。'},
    {id:'school',name:'学校与书屋',x:380,y:125,w:260,h:190,place:'library',color:'#bdceaf',text:'学习、考试与知识。'},
    {id:'commercial',name:'商业街',x:655,y:125,w:400,h:390,place:'market',color:'#d0caa6',text:'生意、消费与财富。'},
    {id:'plaza',name:'小镇广场',x:85,y:320,w:680,h:355,place:'cafe',color:'#c8cfad',text:'社交、公共活动与偶遇。'},
    {id:'park',name:'河畔公园',x:765,y:765,w:410,h:265,place:'park',color:'#b8cea7',text:'健康、心情与闲暇。'},
    {id:'workplace',name:'工坊街',x:1180,y:760,w:255,h:285,place:'workshop',color:'#cdc8a6',text:'工作、职业与人际。'},
    {id:'outskirts',name:'城郊山坡',x:1100,y:145,w:430,h:560,place:'station',color:'#acc39e',text:'探索、奇遇与旧物线索。'}
  ];
  const places=[
    {id:'home',name:'旅人之家',area:'residential',tag:'rest',x:242,y:275,color:'#b77359',text:'灯还亮着。歇一会儿，再决定下一步。',link:'index.html#me',action:'旅人档案'},
    {id:'library',name:'旧书屋',area:'school',tag:'study',x:486,y:240,color:'#64888b',text:'书页里藏着答案，也藏着新的问题。',link:'archive.html#tujian',action:'翻阅命运图鉴'},
    {id:'market',name:'杂货铺',area:'commercial',tag:'work',x:748,y:275,color:'#ba9856',text:'这里收故事，也收一点生活费。',link:'qian.html',action:'抽一支今日签'},
    {id:'cafe',name:'巷口茶馆',area:'plaza',tag:'social',x:242,y:510,color:'#968665',text:'总有人在这里，等着和你聊两句。',link:'fortune.html',action:'看看今日命运'},
    {id:'station',name:'山坡车站',area:'outskirts',tag:'adventure',x:1380,y:660,color:'#829786',text:'铁道通向尚未开放的远方，旧物的故事在山坡上继续。',link:'progress.html',action:'看看人生刻度'},
    {id:'observatory',name:'观星小屋',area:'outskirts',tag:'odd',x:1380,y:340,color:'#79829a',text:'星图和未知的故事，一起藏在这里。',link:'bazi.html',action:'翻开命运排盘'},
    {id:'chess',name:'树下棋摊',area:'plaza',kind:'landmark',x:750,y:359,text:'黑白之间，输赢之外。和镇上的人下一局吧。',link:'gomoku.html',action:'开始五子棋'},
    {id:'park',name:'河畔长椅',area:'park',kind:'landmark',x:1050,y:910,text:'风从河面吹过来，今天可以慢一点。'},
    {id:'workshop',name:'小镇工坊',area:'workplace',x:1260,y:920,color:'#9b8970',text:'招工告示和升职通知，贴在同一扇门上。'},
    {id:'archive',name:'小镇档案馆',area:'residential',x:242,y:800,color:'#78928a',text:'每一段旅途，都可以留下记录。',link:'archive.html#tujian',action:'翻阅命运图鉴'},
    {id:'shrine',name:'路口签亭',area:'commercial',x:1000,y:490,color:'#a39265',text:'商街尽头的小亭，收着十二支今日签。',link:'qian.html',action:'抽一支今日签'}
  ];
  const water=[{x:790,y:533,w:160,h:207},{x:1450,y:795,w:170,h:305}];
  const forest=[{x:85,y:920,w:680,h:180},{x:1080,y:135,w:500,h:105}];
  const solids=places.filter(p=>p.kind!=='landmark');
  function walkable(x,y){return Number.isFinite(x)&&Number.isFinite(y)&&x>85&&x<width-77&&y>135&&y<height-50&&![...water,...forest].some(r=>x>r.x&&x<r.x+r.w&&y>r.y&&y<r.y+r.h)&&!solids.some(p=>x>p.x-76&&x<p.x+76&&y>p.y-104&&y<p.y-4);}
  function areaAt(position){const close=places.find(p=>Math.hypot(position.x-p.x,position.y-(p.y+15))<70);if(close)return close.area;return areas.find(a=>position.x>=a.x&&position.x<=a.x+a.w&&position.y>=a.y&&position.y<=a.y+a.h)?.id||'plaza';}

  const api={map,locations,width,height,areas,places,water,forest,walkable,areaAt};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.FixedTown=api;
})(typeof globalThis!=='undefined'?globalThis:this);
