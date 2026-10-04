const test=require('node:test'),assert=require('node:assert/strict');
const Art=require('../js/town-renderer.js'),E=require('../js/life-rogue-engine.js'),D=require('../js/life-rogue-data.js');
test('life appearance advances through five stages and replay derives the same appearance without touching Run',()=>{
  const s=E.createMapped(1,'ordinary',E.draft(1,3).slice(0,2).map(t=>t.id),3),seen=new Set();
  while(s.phase!=='end'){
    const before=JSON.stringify(s),look=Art.appearance(s.stage);seen.add(look.name);assert.equal(JSON.stringify(s),before);assert.equal(look.name,D.stages[s.stage]);
    assert.deepEqual(Art.appearance(E.restore(E.pack(s)).stage),look);
    const options=s.offers.flatMap(id=>{const e=D.events.find(e=>e.id===id);return e.choices.map((c,i)=>({e,i,score:E.delta(s,c,e).body*3+E.delta(s,c,e).mood*2}));}).sort((a,b)=>b.score-a.score);
    E.arrive(s,options[0].e.area);E.decide(s,options[0].i);
  }
  assert.equal(seen.size,5);assert.equal(Art.appearance(4).elder,true);assert.equal(Art.appearance(1).student,true);assert.ok(Art.appearance(0).scale<Art.appearance(2).scale);
});
