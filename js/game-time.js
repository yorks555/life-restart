(function(root){
  const slots=['清晨','上午','中午','下午','傍晚','夜晚'],duration=90;
  function restore(v){return {day:Number.isSafeInteger(v?.day)&&v.day>=0&&v.day<100000?v.day:0,slot:Number.isInteger(v?.slot)&&v.slot>=0&&v.slot<6?v.slot:0,elapsed:Number.isFinite(v?.elapsed)&&v.elapsed>=0&&v.elapsed<duration?v.elapsed:0};}
  function next(t){t.slot=(t.slot+1)%6;if(!t.slot)t.day++;t.elapsed=0;}
  function tick(t,dt,paused=false){if(paused||!Number.isFinite(dt)||dt<=0)return; t.elapsed+=Math.min(dt,1);if(t.elapsed>=duration){const rest=t.elapsed-duration;next(t);t.elapsed=rest;}}
  const api={slots,duration,restore,next,tick};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GameTime=api;
})(globalThis);
