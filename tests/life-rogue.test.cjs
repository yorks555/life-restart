const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../js/life-rogue-engine.js'),D=require('../js/life-rogue-data.js'),Town=require('../js/town-map.js');
const make=(seed=42,count=0)=>E.create(seed,'ordinary',E.draft(seed,count).slice(0,2).map(t=>t.id),count);
test('content references, event count and unlock pool are consistent',()=>{
  assert.equal(D.events.length,30);assert.equal(new Set(D.events.map(e=>e.id)).size,30);
  assert.equal(D.talents.length,8);assert.equal(D.origins.length,3);assert.equal(D.endings.length,8);
  for(const e of D.events){assert.ok(D.routes[e.tag]);assert.ok(D.stages[e.stage]);assert.equal(e.choices.length,3);for(const c of e.choices){for(const k of Object.keys(c.delta))assert.ok(['body','money','mood','knowledge'].includes(k));}}
  for(let seed=0;seed<50;seed++)assert.ok(E.draft(seed).every(t=>!t.unlock));
  assert.equal(D.talents.filter(t=>!t.unlock||3>=t.unlock).length,8);
  assert.equal(E.create(42,'nope',['memory','night']),null);
  assert.equal(E.create(42,'ordinary',['memory','memory']),null);
});
test('pending choice and random outcome resume identically, without rerolling',()=>{
  const s=make();E.pick(s,s.offers[1]);
  const restored=E.restore(JSON.parse(JSON.stringify(E.pack(s))));assert.deepEqual(restored,s);
  E.decide(s,2);E.decide(restored,2);assert.deepEqual(restored,s);
  assert.deepEqual(E.restore(E.pack(s)),s);
  assert.equal(E.decide(s,0),false);
});
test('corrupt, invalid and out-of-order saves are rejected',()=>{
  const p=E.pack(make());
  for(const bad of [{...p,version:2},{...p,actions:[{route:'nope',choice:0}]},{...p,talents:['fake','memory']},{...p,pending:'nope'},{...p,actions:'bad'}])assert.equal(E.restore(bad),null);
});
test('talents alter real costs, gains and chance, not only labels',()=>{
  const s=make(),e=D.events.find(e=>e.id==='exam'),c=e.choices[0];
  s.stage=1;s.talents=[];const normal=E.delta(s,c,e);
  s.talents=['memory','night'];const buff=E.delta(s,c,e);
  assert.equal(buff.knowledge-normal.knowledge,4);assert.equal(buff.body-normal.body,3);
  s.talents=['social','luck'];const social=D.events.find(e=>e.id==='boss'),chance=social.choices[1];
  assert.ok(Math.abs(E.probability(s,chance,social)-.85)<1e-10);
  s.talents=['thick','optimist'];assert.equal(E.delta(s,chance,social,false).mood,0);
  s.talents=['save','scavenge'];const treasure=D.events.find(e=>e.id==='treasure');assert.equal(E.delta(s,treasure.choices[0],treasure,false).money,-1);
});
test('branch events only appear after their prerequisite',()=>{
  const s=make();s.stage=1;
  assert.equal(D.events.find(e=>e.id==='signal').requires,'radio');
  const eligible=flag=>D.events.filter(e=>e.stage===1&&(!e.requires||flag.includes(e.requires))).map(e=>e.id);
  assert.ok(!eligible([]).includes('signal'));assert.ok(eligible(['radio']).includes('signal'));
});
test('many full runs terminate, keep bounded resources and can always be replayed',()=>{
  const seen=new Set();
  for(let seed=0;seed<180;seed++){
    const s=make(seed,3);
    while(s.phase!=='end'){
      assert.ok(s.offers.length>0);const id=s.offers[(seed+s.actions.length)%s.offers.length];assert.ok(E.pick(s,id));assert.ok(E.decide(s,(seed+s.actions.length)%3));
      for(const [k,v] of Object.entries(s.resources))assert.ok(v>=(k==='money'?-100:0)&&v<=(k==='money'?200:100));
      assert.deepEqual(E.restore(E.pack(s)),s);
    }
    assert.ok(s.actions.length<=15);assert.ok(D.endings.some(e=>e.id===s.ending));seen.add(s.ending);
    assert.equal(E.pick(s,'sunset'),false);assert.equal(E.decide(s,0),false);
  }
  assert.ok(seen.size>=3,'routes produce varied endings');
});
test('fixed town has stable, independent maps and accessible places',()=>{
  const a=Town.map(),b=Town.map();assert.deepEqual(a,b);a[10][10]=99;assert.notDeepEqual(a,b);
  assert.equal(b.length,36);assert.ok(b.every(row=>row.length===48));
  for(const place of Town.locations)assert.equal(b[place.y][place.x],5);
  assert.equal(Town.locations.find(p=>p.name==='家').href,'life.html');
  assert.equal(Town.locations.find(p=>p.name==='棋摊').href,'gomoku.html');
});
