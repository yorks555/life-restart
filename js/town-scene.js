// Original, code-drawn town art. Fixed geography; no external asset licenses.
(function(root){
  const W=typeof module!=='undefined'&&module.exports?require('./town-map.js'):root.FixedTown,places=W.places,walkable=W.walkable;
  function clearLine(a,z){
    const count=Math.max(1,Math.ceil(Math.hypot(z.x-a.x,z.y-a.y)/2));
    for(let i=0;i<=count;i++)if(!walkable(a.x+(z.x-a.x)*i/count,a.y+(z.y-a.y)*i/count))return false;
    return true;
  }
  function planPath(start,goal){
    if(!start||!goal||![start.x,start.y,goal.x,goal.y].every(Number.isFinite)||!walkable(start.x,start.y)||!walkable(goal.x,goal.y))return null;
    if(clearLine(start,goal))return Math.hypot(goal.x-start.x,goal.y-start.y)<.01?[]:[{...goal}];
    const width=Math.ceil((W.width-90)/10),height=Math.ceil((W.height-140)/10),point=i=>({x:90+(i%width)*10,y:140+Math.floor(i/width)*10});
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
  const api={places,walkable,width:W.width,height:W.height,areas:W.areas,clearLine,planPath,followPath};if(typeof module!=='undefined'&&module.exports){module.exports=api;return;}root.TownScene=api;
  const cv=document.getElementById('worldCanvas'),ctx=cv.getContext('2d'),world=TownRenderer.createWorld(W),base=world.base;
  let lifeStage=2;api.setStage=stage=>{lifeStage=TownRenderer.appearance(stage).stage;cv.dataset.lifeStage=String(lifeStage);};
  let actor={x:488,y:351},keys=new Set(),onEnter=()=>{},last=0,path=[],destination=null,pendingPlace=null,facing='down',gait=0,discovered=new Set(['home']),distance=0,onState=()=>{},onJourney=()=>{},savedAt=0,eventMarkers=[];
  const interaction=document.getElementById('nearbyInteraction'),walkStatus=document.getElementById('walkStatus'),viewport=cv.parentElement,mini=document.getElementById('miniMap'),overview=document.getElementById('overviewCanvas');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;let camera=TownCamera.follow(actor,{width:1000,height:700},W);
  function blocked(){return document.hidden||document.documentElement.classList.contains('game-booting')||!!document.querySelector('dialog[open]');}
  function nearest(){return places.map(p=>({p,d:Math.hypot(actor.x-p.x,actor.y-(p.y+15))})).sort((a,z)=>a.d-z.d)[0];}
  function stop(){path=[];destination=null;pendingPlace=null;}
  function walkTo(goal,place=null){
    stop();const planned=planPath(actor,goal);if(planned===null){showToast('这里走不过去，试试空地或建筑入口。');onState();return false;}
    keys.clear();path=planned;destination={...goal};pendingPlace=place;onState();
    if(!path.length){stop();if(place&&DisplayMode.current()!=='mobile')onEnter(place);}return true;
  }
  function interact(){if(api.residents?.interact(actor))return;const close=nearest();if(close.d<=55){stop();keys.clear();discovered.add(close.p.id);onState();onEnter(close.p);}else showToast('走近建筑入口，再按 E');}
  api.walkTo=walkTo;api.pause=blocked;api.enter=handler=>onEnter=handler;api.onState=handler=>onState=handler;api.onJourney=handler=>onJourney=handler;
  api.snapshot=()=>({position:{...actor},area:W.areaAt(actor),goal:destination?{...destination,placeId:pendingPlace?.id||null}:null,discovered:[...discovered],distance});
  api.restore=value=>{const state=GameSave.mapState(value);actor={...state.position};discovered=new Set(state.discovered);distance=state.distance;stop();if(state.goal){path=planPath(actor,state.goal)||[];destination={x:state.goal.x,y:state.goal.y};pendingPlace=places.find(p=>p.id===state.goal.placeId)||null;}};
  api.reset=()=>{actor={x:488,y:351};distance=0;stop();onState();};
  api.moveTo=tag=>{const p=places.find(p=>p.tag===tag);if(p)walkTo({x:p.x,y:p.y+15});};
  api.visit=id=>{api.residents?.cancelApproach();const p=places.find(p=>p.id===id||p.tag===id);if(p){document.querySelectorAll('dialog[open]').forEach(dialog=>dialog.close());walkTo({x:p.x,y:p.y+15},p);}};
  api.setRoutes=(tags,enabled)=>{document.querySelectorAll('.place-pin').forEach(pin=>{const p=places.find(p=>p.id===pin.dataset.place),active=!!enabled&&(tags.includes(p.tag)||tags.includes(p.area));pin.classList.toggle('available',active);pin.setAttribute('aria-label',p.name+(active?'，本步可进入':'，查看地点'));});};
  api.setEvents=markers=>{eventMarkers=markers;const layer=document.getElementById('mapEvents');layer.replaceChildren();for(const marker of markers){const button=document.createElement('button');button.className='map-event-marker';button.dataset.marker=marker.id;button.dataset.placeId=marker.placeId;button.textContent=marker.glyph;button.setAttribute('aria-label',marker.label);button.addEventListener('click',()=>api.visit(marker.placeId));layer.append(button);}};
  api.thumbnail=id=>{const p=places.find(p=>p.id===id)||places[0],image=document.createElement('canvas');image.width=200;image.height=180;const paint=image.getContext('2d');paint.imageSmoothingEnabled=true;paint.drawImage(base,(p.x-100)*world.rasterScale,(p.y-150)*world.rasterScale,200*world.rasterScale,180*world.rasterScale,0,0,200,180);return image.toDataURL();};
  const pins=document.getElementById('scenePlaces');places.forEach(p=>{const button=document.createElement('button');button.className='place-pin';button.dataset.place=p.id;button.textContent=p.name;button.addEventListener('click',()=>api.visit(p.id));pins.append(button);});
  interaction.addEventListener('click',interact);
  cv.addEventListener('pointerdown',e=>{
    if(e.button!==0||blocked())return;e.preventDefault();cv.focus({preventScroll:true});const bounds=cv.getBoundingClientRect(),goal=TownCamera.toWorld((e.clientX-bounds.left)/bounds.width,(e.clientY-bounds.top)/bounds.height,camera);
    if(api.residents?.click(goal,actor))return;const place=places.find(p=>p.kind!=='landmark'?goal.x>p.x-82&&goal.x<p.x+82&&goal.y>p.y-140&&goal.y<p.y+10:Math.abs(goal.x-p.x)<48&&Math.abs(goal.y-p.y)<35);
    api.residents?.cancelApproach();if(place)api.visit(place.id);else walkTo(goal);
  });
  document.addEventListener('keydown',e=>{
    if(blocked()||e.target.closest('input,textarea,select,[contenteditable]'))return;const key=e.key.toLowerCase();
    if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(key)){e.preventDefault();stop();api.residents?.cancelApproach();keys.add(key);}
    else if(key==='e'&&!e.repeat){e.preventDefault();interact();}
    else if(key==='escape'&&path.length){e.preventDefault();stop();api.residents?.cancelApproach();onState();}
  });
  document.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>{keys.clear();onState();});document.addEventListener('visibilitychange',()=>{keys.clear();onState();});window.addEventListener('pagehide',()=>onState());
  function miniDraw(canvas){if(!canvas)return;const c=canvas.getContext('2d'),sx=canvas.width/W.width,sy=canvas.height/W.height;c.fillStyle='#b4c59e';c.fillRect(0,0,canvas.width,canvas.height);for(const a of W.areas){c.fillStyle=a.color;c.fillRect(a.x*sx,a.y*sy,a.w*sx,a.h*sy);}for(const r of W.forest){c.fillStyle='#789568';c.fillRect(r.x*sx,r.y*sy,r.w*sx,r.h*sy);}if(canvas.width>300){c.font='11px Microsoft YaHei';c.fillStyle='#536c47';for(const a of W.areas)c.fillText(a.name,(a.x+12)*sx,(a.y+30)*sy);}for(const r of W.water){c.fillStyle='#85aaa3';c.fillRect(r.x*sx,r.y*sy,r.w*sx,r.h*sy);}for(const p of places){c.fillStyle=discovered.has(p.id)?'#58774e':'#a5aa8d';c.fillRect(p.x*sx-2,p.y*sy-2,5,5);}c.strokeStyle='#f8f3dc';c.strokeRect(camera.x*sx,camera.y*sy,camera.width*sx,camera.height*sy);if(destination){c.fillStyle='#ae794f';c.fillRect(destination.x*sx-3,destination.y*sy-3,6,6);}c.fillStyle='#fff9da';c.fillRect(actor.x*sx-3,actor.y*sy-3,6,6);}
  function positionElement(element,point){const pos=TownCamera.toScreen(point,camera),visible=pos.x>=0&&pos.x<=1&&pos.y>=.04&&pos.y<=1;element.hidden=!visible;const edge=Math.min(.25,((element.offsetWidth||70)/2+6)/Math.max(1,viewport.clientWidth));element.style.left=Math.max(edge,Math.min(1-edge,pos.x))*100+'%';element.style.top=pos.y*100+'%';}
  function draw(time){
    const dt=last?Math.min((time-last)/1000,.035):0;last=time;const before={...actor};api.residents?.tick(dt,blocked(),actor);
    if(blocked()){keys.clear();}else{
      let dx=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0),dy=(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0);
      if(dx||dy){const length=Math.hypot(dx,dy);dx=dx/length*190*dt;dy=dy/length*190*dt;const nextX={x:actor.x+dx,y:actor.y};if(clearLine(actor,nextX))actor.x=nextX.x;const nextY={x:actor.x,y:actor.y+dy};if(clearLine(actor,nextY))actor.y=nextY.y;}
      else if(path.length){const motion=followPath(actor,path,190*dt);actor=motion.position;path=motion.path;if(!path.length){const place=pendingPlace;stop();if(place){discovered.add(place.id);onState();if(DisplayMode.current()!=='mobile')onEnter(place);}}}
    }
    const dx=actor.x-before.x,dy=actor.y-before.y,moved=Math.hypot(dx,dy),moving=moved>.01;if(moving){gait+=moved*.12;facing=Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up';distance+=moved;for(const p of places)if(Math.hypot(actor.x-p.x,actor.y-p.y)<85)discovered.add(p.id);if(distance>=180){distance=0;onJourney();}if(time-savedAt>250){savedAt=time;onState();}}
    const bounds=cv.getBoundingClientRect(),mobile=DisplayMode.current()==='mobile',viewWidth=mobile?560:Math.max(1100,Math.min(1440,bounds.width*.82)),viewHeight=Math.min(1000,viewWidth*bounds.height/Math.max(1,bounds.width));camera=TownCamera.follow(actor,{width:viewWidth,height:viewHeight},W);
    const pixelRatio=Math.min(2,window.devicePixelRatio||1),cw=Math.max(1,Math.round(bounds.width*pixelRatio)),ch=Math.max(1,Math.round(bounds.height*pixelRatio));if(cv.width!==cw||cv.height!==ch){cv.width=cw;cv.height=ch;ctx.imageSmoothingEnabled=true;}ctx.setTransform(cw/camera.width,0,0,ch/camera.height,-camera.x*cw/camera.width,-camera.y*ch/camera.height);TownRenderer.render(world,ctx,actor,{stage:lifeStage,facing,stride:moving&&!reduced?Math.sin(gait)*2:0,camera,...api.residents?.playerPose(),residents:api.residents?.actors()||[]});api.residents?.draw(ctx,actor,camera);
    if(destination){ctx.strokeStyle='#5a784e';ctx.lineWidth=2;ctx.strokeRect(destination.x-6,destination.y-3,12,6);ctx.fillStyle='#f8f1d5';ctx.fillRect(destination.x-2,destination.y-1,4,2);}
    if(!reduced){ctx.fillStyle='#f4e4ae90';for(let i=0;i<7;i++){const x=140+i*203+Math.sin(time/3000+i)*8,y=190+(i*173)%660+Math.cos(time/4000+i)*5;ctx.fillRect(x,y,2,2);}}
    const close=nearest(),resident=api.residents?.near(actor),near=!blocked()&&!path.length&&(resident||close.d<=55);interaction.hidden=!near;const label=resident?(mobile?'':'E · ')+(resident.action||'交谈')+' · '+resident.name:(mobile?'进入 / 互动 · ':'E · 进入')+close.p.name;if(interaction.textContent!==label)interaction.textContent=label;
    walkStatus.hidden=!path.length||blocked();const message=pendingPlace?'前往'+pendingPlace.name+(mobile?'':' · 方向键可接管'):'正在走过去'+(mobile?'':' · 方向键可接管');if(walkStatus.textContent!==message)walkStatus.textContent=message;
    viewport.classList.toggle('has-nearby',near);viewport.classList.toggle('is-walking',path.length>0);
    pins.querySelectorAll('.place-pin').forEach(pin=>{const p=places.find(p=>p.id===pin.dataset.place);positionElement(pin,{x:p.x,y:p.kind!=='landmark'?p.y-118:p.y-29});pin.classList.toggle('nearby',near&&pin.dataset.place===close.p.id);pin.classList.toggle('walking-to',pin.dataset.place===pendingPlace?.id);});
    document.querySelectorAll('.map-event-marker').forEach(button=>{const marker=eventMarkers.find(m=>m.id===button.dataset.marker);positionElement(button,marker);});
    const area=W.areas.find(a=>a.id===W.areaAt(actor));document.getElementById('currentArea').textContent=area.name;document.getElementById('currentTarget').textContent=pendingPlace?'目标 · '+pendingPlace.name:'自由探索';
    cv.dataset.playerX=actor.x.toFixed(1);cv.dataset.playerY=actor.y.toFixed(1);cv.dataset.facing=facing;cv.dataset.moving=String(moving||path.length>0);cv.dataset.cameraX=camera.x.toFixed(1);cv.dataset.cameraY=camera.y.toFixed(1);api.residents?.hud(cv);miniDraw(mini);if(overview?.closest('dialog')?.open)miniDraw(overview);
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})(typeof globalThis!=='undefined'?globalThis:this);
