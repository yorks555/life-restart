(function(root){
  const node=typeof module!=='undefined'&&module.exports,E=node?require('./life-rogue-engine.js'):root.LifeRogue,W=node?require('./town-map.js'):root.FixedTown;
  const schemaVersion=3,spawn={x:488,y:351};
  const G=node?require('./game-time.js'):root.GameTime,N=node?require('./npc-system.js'):root.NPCSystem;
  function mapState(value){
    const position=value?.position&&W.walkable(value.position.x,value.position.y)?{x:value.position.x,y:value.position.y}:{...spawn};
    let goal=value?.goal&&W.walkable(value.goal.x,value.goal.y)?{x:value.goal.x,y:value.goal.y,placeId:W.places.some(p=>p.id===value.goal.placeId)?value.goal.placeId:null}:null;
    if(goal?.placeId){const place=W.places.find(p=>p.id===goal.placeId);if(goal.x!==place.x||goal.y!==place.y+15)goal=null;}
    const discovered=Array.isArray(value?.discovered)?[...new Set(value.discovered.filter(id=>W.places.some(p=>p.id===id)))]:['home'];
    return {position,area:W.areaAt(position),goal,discovered,distance:Number.isFinite(value?.distance)&&value.distance>=0?Math.min(value.distance,180):0};
  }
  function migrate(value){
    const raw=value&&typeof value==='object'?value:{},run=E.restore(raw.run),map=mapState([2,3].includes(raw.schemaVersion)?raw.map:null),living=raw.schemaVersion===3&&(!raw.run||run)?raw.living:null;
    return {schemaVersion,meta:E.meta(raw.meta),run,settled:!!raw.settled&&!!run?.ending,outcome:!!raw.outcome&&!!run?.log.length&&run.phase!=='event',map,living:{time:G.restore(living?.time),world:N.snapshot(N.create(run?.seed||0,living?.world)),clue:living?.clue===true,steps:run?E.steps(run):0},notice:raw.run&&!run?'旧人生记录无法完整恢复，已保留图鉴并重置本局。':raw.schemaVersion&&![2,3].includes(raw.schemaVersion)?'地图记录使用默认位置，人生与图鉴已保留。':''};
  }
  function pack(value){return {schemaVersion,meta:E.meta(value.meta),run:value.run?E.pack(value.run):null,settled:!!value.settled,outcome:!!value.outcome,map:mapState(value.map),living:value.living||null};}
  const api={schemaVersion,mapState,migrate,pack};if(node)module.exports=api;else root.GameSave=api;
})(typeof globalThis!=='undefined'?globalThis:this);
