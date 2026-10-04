const test=require('node:test'),assert=require('node:assert/strict'),E=require('../js/life-rogue-engine.js'),D=require('../js/life-rogue-data.js'),W=require('../js/town-map.js'),T=require('../js/town-scene.js'),C=require('../js/town-camera.js'),S=require('../js/game-save.js'),Mode=require('../js/display-mode.js'),Events=require('../js/town-events.js');
const make=(seed=1)=>E.createMapped(seed,'ordinary',E.draft(seed,3).slice(0,2).map(t=>t.id),3);
test('expanded world is bounded, about 2.5 times the original, and every region can be reached',()=>{
 assert.ok(W.width*W.height/(1000*700)>=2&&W.width*W.height/(1000*700)<=3);assert.equal(W.areas.length,7);
 for(const a of W.areas){const p=W.places.find(p=>p.id===a.place),path=T.planPath({x:488,y:351},{x:p.x,y:p.y+15});assert.ok(path);let before={x:488,y:351};for(const point of path){assert.ok(T.clearLine(before,point));before=point;}}
 for(const r of W.water)assert.equal(W.walkable(r.x+5,r.y+5),false);assert.equal(W.walkable(W.width,500),false);
});
test('camera projection round trips world positions without changing them',()=>{
 const point={x:1380,y:675},original={...point};for(const size of [{width:1000,height:700},{width:560,height:850}]){const camera=C.follow(point,size,W),screen=C.toScreen(point,camera),result=C.toWorld(screen.x,screen.y,camera);assert.deepEqual(result,point);assert.ok(camera.x>=0&&camera.y>=0&&camera.x+camera.width<=W.width&&camera.y+camera.height<=W.height);}assert.deepEqual(point,original);
});
test('region pools preserve every authored event and respect flags',()=>{
 assert.equal(D.events.length,30);for(const e of D.events)assert.ok(W.areas.some(a=>a.id===e.area));
 const s=make(7);for(const o of s.mapOffers){const event=D.events.find(e=>e.id===o.id);assert.equal(event.area,o.area);assert.ok(!event.requires||s.flags.includes(event.requires));}
 const school=E.restore(E.pack(s)),commercial=E.restore(E.pack(s));assert.ok(E.arrive(school,'school'));assert.ok(E.arrive(commercial,'commercial'));assert.notEqual(school.event,commercial.event);assert.equal(E.currentEvent(school).area,'school');assert.equal(E.currentEvent(commercial).area,'commercial');
 const before=E.pack(school);assert.ok(E.cancel(school));assert.ok(E.arrive(school,'school'));assert.deepEqual(E.pack(school),before);
});
test('many mapped runs complete with bounded, deterministic and nonrepeatable road events',()=>{
 const endings=new Set();let triggered=0;
 for(let seed=0;seed<100;seed++){
  const s=make(seed);while(s.phase!=='end'){
   const before=E.steps(s);assert.ok(E.journey(s));assert.equal(E.journey(s),false);assert.deepEqual(E.restore(E.pack(s)),s);
   if(s.phase==='event'){assert.equal(E.currentEvent(s).type,'road');assert.equal(E.cancel(s),false);assert.ok(E.decide(s,0));triggered++;assert.equal(E.decide(s,0),false);assert.equal(E.steps(s),before);assert.deepEqual(E.restore(E.pack(s)),s);if(s.phase==='end')break;}
   const area=E.areas(s)[(seed+before)%E.areas(s).length];assert.ok(E.arrive(s,area));assert.ok(E.decide(s,(seed+before)%3));assert.deepEqual(E.restore(E.pack(s)),s);
   for(const [key,value] of Object.entries(s.resources))assert.ok(value>=(key==='money'?-100:0)&&value<=(key==='money'?200:100));
  }
  assert.ok(E.steps(s)<=15);assert.ok(s.actions.filter(a=>a.kind==='road').length<=5);assert.equal(new Set(s.visited).size,s.visited.length);assert.equal(Events.markers(s).length,0);endings.add(s.ending);
 }
 assert.ok(triggered>0);assert.ok(endings.size>=3);
});
test('completed map events lose their marker and cannot grant their reward again',()=>{
 const s=make(),markers=Events.markers(s),selected=markers[0];assert.ok(E.arrive(s,selected.area));assert.ok(E.decide(s,0));const copy=structuredClone(s);assert.equal(E.pick(s,selected.eventId),false);assert.equal(E.decide(s,0),false);assert.deepEqual(s,copy);assert.ok(!Events.markers(s).some(m=>m.id===selected.id));assert.deepEqual(E.restore(E.pack(s)),s);
});
test('schema migration preserves legacy run and meta and safely defaults corrupt map data',()=>{
 const legacy=E.create(42,'ordinary',E.draft(42).slice(0,2).map(t=>t.id));E.pick(legacy,legacy.offers[0]);const migrated=S.migrate({run:E.pack(legacy),meta:{completed:5,endings:['scholar']}});assert.equal(migrated.schemaVersion,3);assert.deepEqual(migrated.run,legacy);assert.deepEqual(migrated.meta,{completed:5,endings:['scholar']});assert.ok(W.walkable(migrated.map.position.x,migrated.map.position.y));
 const fresh=make(10);E.journey(fresh);const value={meta:migrated.meta,run:fresh,map:{position:{x:1050,y:925},goal:{x:1380,y:675,placeId:'station'},discovered:['home','park'],distance:117},outcome:false,settled:false};const packed=S.pack(value),restored=S.migrate(packed);assert.equal(packed.schemaVersion,3);assert.deepEqual(restored.run,fresh);assert.deepEqual(restored.map,packed.map);
 const corrupt=S.migrate({...packed,map:{position:{x:NaN,y:1},goal:{x:900,y:620},discovered:['fake'],distance:Infinity}});assert.deepEqual(corrupt.map.position,{x:488,y:351});assert.equal(corrupt.map.goal,null);assert.equal(corrupt.map.distance,0);assert.deepEqual(corrupt.run,fresh);
 const bad=S.migrate({run:{version:999},meta:migrated.meta});assert.equal(bad.run,null);assert.deepEqual(bad.meta,migrated.meta);assert.ok(bad.notice);
});
test('display preferences respect manual choice and never change shared game state',()=>{
 const s=make(8),position={x:1050,y:925},state=JSON.stringify({s,position});const phone={width:390,coarse:true,touch:true},desktop={width:1366,coarse:false,touch:false};
 assert.equal(Mode.resolve('auto',phone),'mobile');assert.equal(Mode.resolve('auto',desktop),'desktop');assert.equal(Mode.resolve('desktop',phone),'desktop');assert.equal(Mode.resolve('mobile',desktop),'mobile');assert.equal(Mode.resolve('invalid',phone),'mobile');assert.equal(JSON.stringify({s,position}),state);
});
