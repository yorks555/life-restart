// Original, code-drawn town art. Fixed geography; no external asset licenses.
(function(root){
  const places=[
    {id:'home',name:'旅人之家',tag:'rest',x:242,y:275,color:'#b77359',text:'灯还亮着。歇一会儿，再决定下一步。'},
    {id:'library',name:'旧书屋',tag:'study',x:486,y:240,color:'#64888b',text:'书页里藏着答案，也藏着新的问题。',link:'archive.html#tujian',action:'翻阅命运图鉴'},
    {id:'market',name:'杂货铺',tag:'work',x:748,y:275,color:'#ba9856',text:'这里收故事，也收一点生活费。',link:'qian.html',action:'抽一支今日签'},
    {id:'cafe',name:'巷口茶馆',tag:'social',x:242,y:510,color:'#968665',text:'总有人在这里，等着和你聊两句。',link:'fortune.html',action:'看看今日命运'},
    {id:'station',name:'旧站台',tag:'adventure',x:495,y:566,color:'#829786',text:'下一班车还没来，也许惊喜会先到。',link:'progress.html',action:'看看人生进度'},
    {id:'observatory',name:'天文小屋',tag:'odd',x:756,y:509,color:'#79829a',text:'正常日子的另一面，在这里。',link:'bazi.html',action:'翻开命运排盘'},
    {id:'chess',name:'树下棋摊',x:750,y:359,text:'黑白之间，输赢之外。和镇上的人下一局吧。',link:'gomoku.html',action:'开始五子棋'}
  ];
  function walkable(x,y){return x>85&&x<923&&y>135&&y<650&&!(x>790&&y>533)&&!places.filter(p=>p.tag).some(p=>x>p.x-76&&x<p.x+76&&y>p.y-104&&y<p.y-4);}
  function clearLine(a,z){
    const count=Math.max(1,Math.ceil(Math.hypot(z.x-a.x,z.y-a.y)/2));
    for(let i=0;i<=count;i++)if(!walkable(a.x+(z.x-a.x)*i/count,a.y+(z.y-a.y)*i/count))return false;
    return true;
  }
  function planPath(start,goal){
    if(!start||!goal||![start.x,start.y,goal.x,goal.y].every(Number.isFinite)||!walkable(start.x,start.y)||!walkable(goal.x,goal.y))return null;
    if(clearLine(start,goal))return Math.hypot(goal.x-start.x,goal.y-start.y)<.01?[]:[{...goal}];
    const width=84,height=52,point=i=>({x:90+(i%width)*10,y:140+Math.floor(i/width)*10});
    const free=Array.from({length:width*height},(_,i)=>{const p=point(i);return walkable(p.x,p.y);});
    function nearest(p){let best=-1,distance=Infinity;for(let i=0;i<free.length;i++){if(!free[i])continue;const q=point(i),d=Math.hypot(q.x-p.x,q.y-p.y);if(d<distance&&clearLine(p,q)){best=i;distance=d;}}return best;}
    const from=nearest(start),to=nearest(goal);if(from<0||to<0)return null;
    const costs=new Map([[from,0]]),parents=new Map(),closed=new Set(),open=new Set([from]);
    const heuristic=i=>Math.abs(i%width-to%width)+Math.abs(Math.floor(i/width)-Math.floor(to/width));
    while(open.size){
      let current=-1,score=Infinity;for(const i of open){const s=costs.get(i)+heuristic(i);if(s<score){score=s;current=i;}}
      if(current===to){
        const raw=[{...goal}];for(let i=to;i!==undefined;i=parents.get(i))raw.unshift(point(i));
        const path=[];let anchor=start,index=0;
        while(index<raw.length){let far=index;while(far+1<raw.length&&clearLine(anchor,raw[far+1]))far++;path.push(raw[far]);anchor=raw[far];index=far+1;}
        return path;
      }
      open.delete(current);closed.add(current);const col=current%width,row=Math.floor(current/width);
      for(const [dx,dy] of [[1,0],[0,1],[-1,0],[0,-1]]){
        const x=col+dx,y=row+dy,i=y*width+x;if(x<0||x>=width||y<0||y>=height||!free[i]||closed.has(i)||!clearLine(point(current),point(i)))continue;
        const cost=costs.get(current)+1;if(cost<(costs.get(i)??Infinity)){costs.set(i,cost);parents.set(i,current);open.add(i);}
      }
    }
    return null;
  }
  function followPath(position,path,distance){
    const next={...position},remaining=path.map(p=>({...p}));let budget=Math.max(0,Number.isFinite(distance)?distance:0);
    while(remaining.length){const target=remaining[0],d=Math.hypot(target.x-next.x,target.y-next.y);if(d<=budget){Object.assign(next,target);remaining.shift();budget-=d;}else{if(d&&budget){next.x+=(target.x-next.x)*budget/d;next.y+=(target.y-next.y)*budget/d;}break;}}
    return {position:next,path:remaining};
  }
  const api={places,walkable,clearLine,planPath,followPath};if(typeof module!=='undefined'&&module.exports){module.exports=api;return;}root.TownScene=api;
  const cv=document.getElementById('worldCanvas'),ctx=cv.getContext('2d'),base=document.createElement('canvas');base.width=1000;base.height=700;const b=base.getContext('2d');
  function rect(x,y,w,h,c){b.fillStyle=c;b.fillRect(Math.round(x),Math.round(y),w,h);}
  function poly(points,c){b.fillStyle=c;b.beginPath();points.forEach(([x,y],i)=>i?b.lineTo(x,y):b.moveTo(x,y));b.closePath();b.fill();}
  function ellipse(x,y,rx,ry,c){b.fillStyle=c;b.beginPath();b.ellipse(x,y,rx,ry,0,0,Math.PI*2);b.fill();}
  function tree(x,y,size=1){b.save();b.translate(x,y);b.scale(size,size);ellipse(12,9,26,8,'#4e75432b');rect(-4,-25,9,32,'#8b7954');rect(-3,-25,3,28,'#a08c5c');poly([[-31,-24],[-25,-45],[-13,-49],[-11,-68],[12,-76],[30,-63],[28,-45],[40,-31],[30,-13],[-13,-13]],'#688d55');poly([[-25,-34],[-20,-48],[-5,-54],[-5,-65],[13,-67],[24,-54],[21,-40],[30,-29],[14,-22],[-10,-25]],'#82a266');rect(-9,-49,8,5,'#a6b87c');rect(10,-59,10,5,'#a6b87c');rect(21,-36,6,5,'#91ad71');b.restore();}
  function flowers(x,y){for(let i=0;i<4;i++){rect(x+i*9,y+(i%2)*3,2,8,'#70945b');rect(x+i*9-2,y+(i%2)*3,6,4,i%2?'#e6cb85':'#dcaa92');}}
  function fence(x,y,len){rect(x,y+9,len,4,'#d5c499');for(let i=0;i<len;i+=16){rect(x+i,y,5,24,'#daccaa');rect(x+i+4,y+2,2,22,'#b7a179');}}
  function building(p,index){const x=p.x,y=p.y;ellipse(x+10,y+5,91,17,'#576b4330');rect(x-69,y-66,138,65,'#665d48');rect(x-65,y-66,130,62,'#ead8b0');rect(x-65,y-22,130,18,'#d6c39a');rect(x-65,y-64,7,60,'#aa946e');rect(x+58,y-64,7,60,'#aa946e');
    poly([[x-81,y-65],[x-53,y-115],[x+53,y-115],[x+81,y-65]],'#695d49');poly([[x-76,y-69],[x-50,y-110],[x+50,y-110],[x+76,y-69]],p.color);
    for(let row=0;row<4;row++){const offset=row*6;rect(x-49-offset,y-108+row*10,98+offset*2,3,'#ffedca25');for(let col=0;col<7;col++)rect(x-47+col*16-offset,y-105+row*10,2,7,'#3d423322');}
    rect(x+36,y-134,13,34,'#aca389');rect(x+34,y-137,18,6,'#827b68');rect(x-15,y-36,30,36,'#847754');rect(x-11,y-32,22,30,'#a5986e');rect(x+5,y-19,3,3,'#e5d39b');rect(x-21,y-2,42,5,'#c4b996');rect(x-26,y+3,52,5,'#d0c7a4');
    for(const sign of [-1,1]){const wx=x+sign*42;rect(wx-14,y-51,28,25,'#807c62');rect(wx-11,y-48,22,19,'#a8c3b1');rect(wx-10,y-48,3,19,'#c4d6bf');rect(wx-1,y-48,2,19,'#e0d2a6');rect(wx-10,y-40,21,2,'#e0d2a6');rect(wx-18,y-51,4,25,p.color);rect(wx+14,y-51,4,25,p.color);rect(wx-17,y-24,34,5,'#817a51');flowers(wx-15,y-30);}
    if(index===2||index===3){for(let i=0;i<8;i++)rect(x-64+i*16,y-60,16,14,i%2?'#f1e4bd':p.color);poly([[x-65,y-60],[x+65,y-60],[x+75,y-44],[x-75,y-44]],'#e7d6a8');for(let i=0;i<8;i++)rect(x-64+i*16,y-57,12,14,i%2?'#f3e6c0':p.color);}
    if(index===5){ellipse(x,y-115,31,20,'#6a7591');ellipse(x-4,y-119,25,16,'#8999b1');rect(x-2,y-143,5,10,'#c4ba94');rect(x+24,y-127,29,6,'#8c98a7');}
    rect(x-84,y-10,14,20,'#ad9670');rect(x-82,y-16,10,8,'#77965e');rect(x+76,y-12,10,15,'#998866');flowers(x+73,y-19);
  }
  // Meadow, old stone paths, pond and authored vegetation.
  rect(0,0,1000,700,'#bbcda5');for(let y=0;y<700;y+=8)for(let x=0;x<1000;x+=8){const n=(x*13+y*7)%61;if(n<6)rect(x,y,8,8,n%2?'#becfa8':'#b5c89f');}
  poly([[0,0],[1000,0],[1000,108],[923,87],[820,104],[693,87],[550,104],[368,96],[212,112],[84,95],[0,115]],'#acc297');
  poly([[0,626],[70,638],[160,646],[270,669],[430,665],[580,649],[755,664],[1000,650],[1000,700],[0,700]],'#aec59e');
  rect(82,326,837,43,'#d9d0ad');rect(468,145,43,494,'#d9d0ad');rect(82,323,837,3,'#aeaf85');rect(82,369,837,3,'#a5ac80');for(const p of places.filter(p=>p.tag)){rect(p.x-13,Math.min(p.y,348),26,Math.abs(348-p.y),'#d9d0ad');}
  // Upper connecting paths are drawn separately so no path goes through a house.
  for(const p of places.filter(p=>p.tag&&p.y<348))rect(p.x-13,p.y,26,348-p.y,'#d9d0ad');
  for(let y=327;y<369;y+=11)for(let x=85;x<916;x+=22){rect(x+(y%2?6:0),y,18,2,'#c6bf9b');}
  for(let y=148;y<638;y+=18){rect(471,y,16,2,'#c6bf9b');rect(492,y+9,16,2,'#c6bf9b');}
  poly([[802,548],[828,523],[890,532],[923,563],[953,616],[943,700],[787,700],[775,643],[786,583]],'#adbf91');poly([[818,556],[842,546],[894,551],[912,580],[937,622],[927,700],[800,700],[792,647],[802,589]],'#85aaa3');poly([[830,568],[853,559],[890,565],[904,598],[923,633],[919,700],[813,700],[807,645],[816,593]],'#99bab0');
  for(let y=583;y<700;y+=27){rect(839+(y%13),y,34,3,'#c4d8bb');rect(891,y+9,17,2,'#afcdbd');}rect(777,628,63,18,'#aa9468');for(let x=779;x<840;x+=9)rect(x,628,2,18,'#8c805c');
  const trees=[[54,156,1.2],[99,186,.9],[66,282,1.1],[46,392,1.2],[82,465,1],[64,568,1.3],[114,634,.9],[170,152,.75],[344,175,.85],[625,178,1],[880,179,1.2],[935,228,1],[904,304,.85],[931,420,1.2],[893,478,.8],[654,593,.9],[612,641,.8],[353,582,.85],[182,618,.9],[365,447,.75],[624,414,.7]];
  trees.filter(t=>t[1]<325).forEach(t=>tree(...t));places.filter(p=>p.tag).forEach(building);trees.filter(t=>t[1]>=325).forEach(t=>tree(...t));
  fence(131,297,63);fence(299,297,62);fence(672,295,28);fence(819,295,35);fence(149,544,45);fence(298,544,39);fence(669,546,42);
  for(const [x,y] of [[380,295],[576,283],[142,395],[588,529],[713,614],[927,523]])flowers(x,y);
  // A chess table, benches, lanterns and residents.
  ellipse(750,375,40,12,'#6d7b4c35');rect(729,349,40,7,'#948362');rect(733,356,5,17,'#877752');rect(760,356,5,17,'#877752');rect(734,337,32,17,'#ecdfb3');for(let i=0;i<4;i++){rect(739+i*7,339,1,13,'#b4aa82');rect(737,341+i*3,25,1,'#b4aa82');}rect(742,344,3,3,'#495344');rect(753,346,3,3,'#fbf0d2');rect(707,355,14,7,'#a18c64');rect(779,355,14,7,'#a18c64');
  for(const x of [335,614]){rect(x,390,55,8,'#b29d70');rect(x+4,398,5,14,'#8b7b59');rect(x+44,398,5,14,'#8b7b59');rect(x,380,55,5,'#c3ad7e');rect(x+4,381,5,17,'#8b7b59');rect(x+44,381,5,17,'#8b7b59');}
  for(const [x,y] of [[140,326],[392,326],[574,326],[863,326]]){rect(x,y-38,4,40,'#778065');rect(x-5,y-47,14,12,'#e8dcb1');rect(x-7,y-51,18,4,'#748067');rect(x-1,y-44,3,6,'#f6ebc9');}
  function person(c,x,y,color,step=0){c.fillStyle='#3d59322b';c.fillRect(x-9,y+5,19,4);c.fillStyle='#495044';c.fillRect(x-6,y,5,7+(step%2?2:0));c.fillRect(x+2,y,5,7+(step%2?0:2));c.fillStyle=color;c.fillRect(x-8,y-16,17,18);c.fillStyle='#e4b591';c.fillRect(x-6,y-29,13,14);c.fillRect(x-11,y-12,4,9);c.fillRect(x+9,y-12,4,9);c.fillStyle='#51463b';c.fillRect(x-7,y-31,15,6);c.fillRect(x-7,y-25,4,5);c.fillStyle='#423e34';c.fillRect(x+3,y-22,2,2);c.fillStyle='#c6b58a';c.fillRect(x+5,y-12,6,12);}
  person(b,712,359,'#9395a1');person(b,790,361,'#aa8973');person(b,606,354,'#9d806f');person(b,325,320,'#af9e76');

  let actor={x:488,y:351},keys=new Set(),onEnter=()=>{},last=0,path=[],destination=null,pendingPlace=null,facing='down',gait=0;
  const interaction=document.getElementById('nearbyInteraction'),walkStatus=document.getElementById('walkStatus'),viewport=cv.parentElement;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function blocked(){return document.documentElement.classList.contains('game-booting')||!!document.querySelector('dialog[open]');}
  function nearest(){return places.map(p=>({p,d:Math.hypot(actor.x-p.x,actor.y-(p.y+15))})).sort((a,z)=>a.d-z.d)[0];}
  function stop(){path=[];destination=null;pendingPlace=null;}
  function walkTo(goal,place=null){
    stop();const planned=planPath(actor,goal);if(planned===null){showToast('这里走不过去，试试空地或建筑入口。');return false;}
    keys.clear();path=planned;destination={...goal};pendingPlace=place;
    if(!path.length){stop();if(place)onEnter(place);}return true;
  }
  function interact(){const close=nearest();if(close.d<=46){stop();keys.clear();onEnter(close.p);}else showToast('走近建筑入口，再按 E');}
  api.enter=handler=>onEnter=handler;
  api.moveTo=tag=>{const p=places.find(p=>p.tag===tag);if(p)walkTo({x:p.x,y:p.y+15});};
  api.visit=id=>{const p=places.find(p=>p.id===id||p.tag===id);if(p){document.querySelectorAll('dialog[open]').forEach(dialog=>dialog.close());walkTo({x:p.x,y:p.y+15},p);}};
  api.setRoutes=(tags,enabled)=>{document.querySelectorAll('.place-pin').forEach(pin=>{const p=places.find(p=>p.id===pin.dataset.place),active=!!enabled&&tags.includes(p.tag);pin.classList.toggle('available',active);pin.setAttribute('aria-label',p.name+(active?'，本步可进入':'，查看地点'));});};
  api.thumbnail=id=>{const p=places.find(p=>p.id===id),image=document.createElement('canvas');image.width=200;image.height=180;const paint=image.getContext('2d');paint.imageSmoothingEnabled=false;paint.drawImage(base,p.x-100,p.y-150,200,180,0,0,200,180);return image.toDataURL();};
  const pins=document.getElementById('scenePlaces');places.forEach(p=>{const button=document.createElement('button');button.className='place-pin';button.dataset.place=p.id;button.textContent=p.name;button.style.left=p.x/10+'%';button.style.top=(p.tag?p.y-118:p.y-29)/7+'%';button.addEventListener('click',()=>api.visit(p.id));pins.append(button);});
  interaction.addEventListener('click',interact);
  cv.addEventListener('pointerdown',e=>{
    if(e.button!==0||blocked())return;e.preventDefault();cv.focus({preventScroll:true});const bounds=cv.getBoundingClientRect(),goal={x:(e.clientX-bounds.left)*1000/bounds.width,y:(e.clientY-bounds.top)*700/bounds.height};
    const place=places.find(p=>p.tag?goal.x>p.x-82&&goal.x<p.x+82&&goal.y>p.y-140&&goal.y<p.y+10:Math.abs(goal.x-p.x)<48&&Math.abs(goal.y-p.y)<35);
    if(place)api.visit(place.id);else walkTo(goal);
  });
  document.addEventListener('keydown',e=>{
    if(blocked()||e.target.closest('input,textarea,select,[contenteditable]'))return;const key=e.key.toLowerCase();
    if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(key)){e.preventDefault();stop();keys.add(key);}
    else if(key==='e'&&!e.repeat){e.preventDefault();interact();}
    else if(key==='escape'&&path.length){e.preventDefault();stop();}
  });
  document.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>{keys.clear();stop();});
  function player(x,y,moving){
    const stride=moving&&!reduced?Math.round(Math.sin(gait)*2):0;ctx.save();ctx.translate(Math.round(x),Math.round(y));if(facing==='left')ctx.scale(-1,1);
    ctx.fillStyle='#3d593240';ctx.fillRect(-10,6,21,4);ctx.fillStyle='#40523e';ctx.fillRect(-6,stride,5,8);ctx.fillRect(2,-stride,5,8);
    ctx.fillStyle='#283d31';ctx.fillRect(-6,6+stride,5,3);ctx.fillRect(2,6-stride,5,3);
    ctx.fillStyle='#4b7958';ctx.fillRect(-8,-16,17,18);ctx.fillStyle='#6b9364';ctx.fillRect(-6,-15,4,16);
    ctx.fillStyle='#e4b591';ctx.fillRect(-6,-29,13,14);ctx.fillRect(-11,-12-stride,4,9);ctx.fillRect(9,-12+stride,4,9);
    ctx.fillStyle='#51463b';ctx.fillRect(-7,-31,15,6);ctx.fillRect(-7,-25,4,5);
    if(facing==='up'){ctx.fillRect(-6,-26,13,9);ctx.fillStyle='#386447';ctx.fillRect(-4,-13,10,3);}else{ctx.fillStyle='#423e34';if(facing==='down'){ctx.fillRect(-3,-22,2,2);ctx.fillRect(3,-22,2,2);}else ctx.fillRect(3,-22,2,2);}
    ctx.fillStyle='#c6b58a';ctx.fillRect(5,-12,6,12);ctx.fillStyle='#f8f1d5';ctx.fillRect(-4,-42,9,3);ctx.fillRect(-1,-39,3,3);ctx.restore();
  }
  function draw(time){
    const dt=last?Math.min((time-last)/1000,.035):0;last=time;const before={...actor};
    if(blocked()){keys.clear();stop();}else{
      let dx=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0),dy=(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0);
      if(dx||dy){const length=Math.hypot(dx,dy);dx=dx/length*150*dt;dy=dy/length*150*dt;const nextX={x:actor.x+dx,y:actor.y};if(clearLine(actor,nextX))actor.x=nextX.x;const nextY={x:actor.x,y:actor.y+dy};if(clearLine(actor,nextY))actor.y=nextY.y;}
      else if(path.length){const motion=followPath(actor,path,150*dt);actor=motion.position;path=motion.path;if(!path.length){const place=pendingPlace;stop();if(place)onEnter(place);}}
    }
    const dx=actor.x-before.x,dy=actor.y-before.y,moving=Math.hypot(dx,dy)>.01;if(moving){gait+=Math.hypot(dx,dy)*.12;facing=Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up';}
    ctx.drawImage(base,0,0);
    if(destination){ctx.strokeStyle='#5a784e';ctx.lineWidth=2;ctx.strokeRect(destination.x-6,destination.y-3,12,6);ctx.fillStyle='#f8f1d5';ctx.fillRect(destination.x-2,destination.y-1,4,2);}
    player(actor.x,actor.y,moving);
    if(!reduced){ctx.fillStyle='#f4e4ae90';for(let i=0;i<7;i++){const x=140+i*103+Math.sin(time/3000+i)*8,y=190+(i*73)%360+Math.cos(time/4000+i)*5;ctx.fillRect(x,y,2,2);}}
    const close=nearest(),near=!blocked()&&!path.length&&close.d<=46;interaction.hidden=!near;
    const label='E · 进入'+close.p.name;if(interaction.textContent!==label)interaction.textContent=label;
    walkStatus.hidden=!path.length;const message=pendingPlace?'正在前往'+pendingPlace.name+' · 方向键可接管':'正在走过去 · 方向键可接管';if(walkStatus.textContent!==message)walkStatus.textContent=message;
    viewport.classList.toggle('has-nearby',near);viewport.classList.toggle('is-walking',path.length>0);
    pins.querySelectorAll('.place-pin').forEach(pin=>{pin.classList.toggle('nearby',near&&pin.dataset.place===close.p.id);pin.classList.toggle('walking-to',pin.dataset.place===pendingPlace?.id);});
    cv.dataset.playerX=actor.x.toFixed(1);cv.dataset.playerY=actor.y.toFixed(1);cv.dataset.facing=facing;cv.dataset.moving=String(moving||path.length>0);
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})(typeof globalThis!=='undefined'?globalThis:this);
