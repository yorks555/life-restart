const test=require('node:test'),assert=require('node:assert/strict');
const Town=require('../js/town-scene.js'),D=require('../js/life-rogue-data.js');
test('each life route has one fixed, accessible building entrance',()=>{
  for(const tag of Object.keys(D.routes)){
    const buildings=Town.places.filter(p=>p.tag===tag);assert.equal(buildings.length,1);
    const p=buildings[0];assert.ok(Town.walkable(p.x,p.y+15),'doorstep can be reached');
    assert.equal(Town.walkable(p.x,p.y-30),false,'cannot walk through buildings');
  }
  assert.equal(Town.places.find(p=>p.id==='chess').link,'gomoku.html');
});
test('walking stays inside the scene and does not enter the pond',()=>{
  assert.ok(Town.walkable(488,351));assert.ok(Town.walkable(400,350));
  for(const [x,y] of [[0,0],[Town.width+1,350],[488,Town.height+1],[900,620],[50,350]])assert.equal(Town.walkable(x,y),false);
});
test('click walking reaches every entrance from every other entrance without crossing obstacles',()=>{
 for(const from of Town.places)for(const to of Town.places){
  const start={x:from.x,y:from.y+15},goal={x:to.x,y:to.y+15},original=JSON.stringify([start,goal]),path=Town.planPath(start,goal);
  assert.notEqual(path,null,from.id+' → '+to.id);let previous=start;
  for(const point of path){assert.ok(Town.clearLine(previous,point),'every movement segment is clear');previous=point;}
  assert.deepEqual(previous,goal);assert.equal(JSON.stringify([start,goal]),original);
 }
});
test('click walking rejects blocked and invalid destinations and avoids house corners',()=>{
 const start={x:200,y:300},goal={x:300,y:150},path=Town.planPath(start,goal);
 assert.equal(Town.clearLine(start,goal),false);assert.ok(path.length>1);
 for(const target of [{x:900,y:620},{x:242,y:230},{x:0,y:0},{x:NaN,y:350}])assert.equal(Town.planPath({x:488,y:351},target),null);
 assert.equal(Town.planPath(null,goal),null);
});
test('movement follows the distance budget and stops exactly at the destination',()=>{
 const start={x:400,y:350},path=[{x:410,y:350},{x:410,y:360}],original=JSON.stringify([start,path]);
 assert.deepEqual(Town.followPath(start,path,15),{position:{x:410,y:355},path:[{x:410,y:360}]});
 assert.deepEqual(Town.followPath(start,path,100),{position:{x:410,y:360},path:[]});
 assert.deepEqual(Town.followPath(start,path,-1),{position:start,path});assert.equal(JSON.stringify([start,path]),original);
});
