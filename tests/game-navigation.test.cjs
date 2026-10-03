const test=require('node:test'),assert=require('node:assert/strict'),Nav=require('../js/game-navigation.js'),E=require('../js/life-rogue-engine.js');
test('old entry points resolve into the same game and panel routes',()=>{
 assert.deepEqual(Nav.target('archive.html','#tujian'),{panel:'collection'});assert.deepEqual(Nav.target('index.html','#me'),{panel:'profile'});assert.deepEqual(Nav.target('index.html','#lab'),{panel:'directory'});assert.deepEqual(Nav.target('pixel-town.html'),{panel:'town'});
 for(const name of Object.keys(Nav.tools))assert.deepEqual(Nav.target(name+'.html'),{tool:name});
});
test('navigation rejects external, unknown and prototype paths',()=>{
 for(const path of ['https://example.com','../gomoku.html','constructor.html','toString.html','missing.html','gomoku.html?x=1'])assert.equal(Nav.target(path),null);
});
test('the atlas preserves legacy named achievements and zodiac collections',()=>{
 assert.deepEqual(Nav.collectionIndices(['兔','兔','龙',3,-1,'unknown'],['鼠','牛','虎','兔','龙']),[3,4]);
 assert.deepEqual(Nav.collectionIndices(['📸 颜值担当','🧠 智慧担当',1,'invalid'],['颜值担当','智慧担当']),[0,1]);
 assert.deepEqual(Nav.collectionIndices(null,['兔']),[]);
});
test('returning before a decision preserves the entire run and future result',()=>{
 const seed=31,s=E.create(seed,'ordinary',E.draft(seed).slice(0,2).map(t=>t.id)),before=JSON.parse(JSON.stringify(s));
 const route=s.offers[1];assert.ok(E.pick(s,route));assert.deepEqual(E.restore(E.pack(s)),s);assert.ok(E.cancel(s));assert.deepEqual(s,before);assert.equal(E.cancel(s),false);
 const other=E.restore(E.pack(before));E.pick(s,route);E.pick(other,route);E.decide(s,2);E.decide(other,2);assert.deepEqual(s,other);assert.equal(E.cancel(s),false);
});
