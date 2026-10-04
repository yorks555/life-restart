(function(root){
  const choices=['auto','desktop','mobile'];
  function preference(value){return choices.includes(value)?value:'auto';}
  function resolve(value,device){const choice=preference(value);return choice==='auto'?(device.width<=760||(device.coarse&&device.touch&&device.width<=1100)?'mobile':'desktop'):choice;}
  const api={preference,resolve};if(typeof module!=='undefined'&&module.exports){module.exports=api;return;}root.DisplayMode=api;
  let selected='auto';try{const stored=localStorage.getItem('displayMode');try{selected=preference(JSON.parse(stored));}catch{selected=preference(stored);}}catch{}
  function device(){return {width:innerWidth,coarse:matchMedia('(pointer:coarse)').matches,touch:navigator.maxTouchPoints>0};}
  function apply(){const mode=resolve(selected,device());document.documentElement.dataset.displayMode=mode;document.documentElement.dataset.modePreference=selected;document.dispatchEvent(new CustomEvent('display:change',{detail:{mode,preference:selected}}));return mode;}
  api.current=()=>document.documentElement.dataset.displayMode;api.selected=()=>selected;
  api.set=value=>{selected=preference(value);try{localStorage.setItem('displayMode',JSON.stringify(selected));}catch{document.dispatchEvent(new CustomEvent('display:save-error'));}return apply();};
  window.addEventListener('resize',()=>{if(selected==='auto')apply();});apply();
})(typeof globalThis!=='undefined'?globalThis:this);
