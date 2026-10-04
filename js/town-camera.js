(function(root){
  function follow(position,size,world){const width=Math.min(size.width,world.width),height=Math.min(size.height,world.height);return {x:Math.max(0,Math.min(world.width-width,position.x-width/2)),y:Math.max(0,Math.min(world.height-height,position.y-height/2)),width,height};}
  function toWorld(x,y,camera){return {x:camera.x+x*camera.width,y:camera.y+y*camera.height};}
  function toScreen(point,camera){return {x:(point.x-camera.x)/camera.width,y:(point.y-camera.y)/camera.height};}
  const api={follow,toWorld,toScreen};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TownCamera=api;
})(typeof globalThis!=='undefined'?globalThis:this);
