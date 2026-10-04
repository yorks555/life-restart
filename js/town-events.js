(function(root){
  const node=typeof module!=='undefined'&&module.exports,D=node?require('./life-rogue-data.js'):root.LifeRogueData,W=node?require('./town-map.js'):root.FixedTown;
  function markers(run){
    if(!run||run.phase!=='route')return [];
    return run.offers.map(id=>{const event=D.events.find(e=>e.id===id),place=run.version===2?W.places.find(p=>p.id===W.areas.find(a=>a.id===event.area).place):W.places.find(p=>p.tag===event.tag);return {id:run.seed+'-'+run.stage+'-'+run.step+'-'+id,area:event.area,placeId:place.id,eventId:id,x:place.x+38,y:place.y+18,glyph:event.rarity==='rare'?'✦':event.tag==='odd'?'?':'!',label:W.areas.find(a=>a.id===event.area).name+' · '+(event.rarity==='rare'?'线索奇遇':'可选人生经历')};});
  }
  const api={markers};if(node)module.exports=api;else root.TownEvents=api;
})(typeof globalThis!=='undefined'?globalThis:this);
