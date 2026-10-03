(function (root) {
  'use strict';
  const D = typeof module !== 'undefined' && module.exports ? require('./life-rogue-data.js') : root.LifeRogueData;
  const keys = ['body','money','mood','knowledge'];
  function random(state) {
    state.rng = (state.rng + 0x6D2B79F5) >>> 0;
    let t = Math.imul(state.rng ^ (state.rng >>> 15), 1 | state.rng);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function shuffle(list,state) {
    const copy = [...list];
    for (let i=copy.length-1;i>0;i--) { const j = Math.floor(random(state)*(i+1)); [copy[i],copy[j]]=[copy[j],copy[i]]; }
    return copy;
  }
  function draft(seed, count=0) { return shuffle(D.talents.filter(t=>!t.unlock || count>=t.unlock),{rng:seed>>>0}).slice(0,4); }
  function offers(s) {
    const candidates = D.events.filter(e=>e.stage===s.stage && !s.visited.includes(e.id) && (!e.requires || s.flags.includes(e.requires)));
    const rest = candidates.find(e=>e.tag==='rest');
    const other = shuffle(candidates.filter(e=>e!==rest),s);
    s.offers = (rest ? [rest,...other.slice(0,2)] : other.slice(0,3)).map(e=>e.id);
    s.phase='route';
  }
  function create(seed, origin, talents, unlocked=0) {
    if (!Number.isInteger(seed) || seed<0 || seed>4294967295 || !D.origins.some(o=>o.id===origin) || !Array.isArray(talents) || talents.length!==2 || new Set(talents).size!==2 || !talents.every(t=>draft(seed,unlocked).some(d=>d.id===t))) return null;
    const s = {version:1,seed:seed>>>0,rng:seed>>>0,origin,talents:[...talents],unlocked,stage:0,step:0,resources:{...D.origins.find(o=>o.id===origin).resources},flags:[],visited:[],actions:[],log:[],ending:null,phase:'route'};
    offers(s); return s;
  }
  function pick(s,id) {
    if(s.phase!=='route' || !s.offers.includes(id)) return false;
    s.event=id;s.phase='event';return true;
  }
  function cancel(s) { if(s.phase!=='event')return false;delete s.event;s.phase='route';return true; }
  function probability(s,c,e) {
    if(c.chance===undefined) return null;
    return Math.min(.95,c.chance+(s.talents.includes('luck') ? .15 : 0)+(e.tag==='social'&&s.talents.includes('social') ? .2 : 0));
  }
  function delta(s,choice,event,success=true) {
    const out = Object.fromEntries(keys.map(k=>[k,(choice.delta[k]||0)+((success?choice.success:choice.failure)?.[k]||0)]));
    out.body -= [3,4,5,4,3][s.stage];
    if (s.talents.includes('night') && ['study','work'].includes(event.tag) && out.body<0) out.body=Math.min(0,out.body+3);
    if (s.talents.includes('memory') && event.tag==='study' && out.knowledge>0) out.knowledge+=4;
    if (s.talents.includes('social') && event.tag==='social' && out.money>0) out.money+=5;
    if (s.talents.includes('thick') && event.tag==='social' && !success && out.mood<0) out.mood=0;
    if (s.talents.includes('save') && out.money<0) out.money=-Math.floor(-out.money*.7);
    if (s.talents.includes('optimist') && out.mood<0) out.mood=Math.min(0,out.mood+4);
    if (s.talents.includes('scavenge') && event.tag==='adventure') out.money+=6;
    return out;
  }
  function ending(s,exhausted=false) {
    const r=s.resources;
    let id=exhausted?'ordinary':s.flags.includes('shareholder')&&r.money>=60?'shareholder':r.knowledge>=75?'scholar':r.money>=120?'wealth':s.flags.includes('dance')&&r.mood>=75?'dance':r.money<0&&r.mood>=60?'debt':s.flags.includes('treasure')?'treasure':r.body>=65&&r.mood>=65?'calm':'ordinary';
    s.ending=id;s.phase='end';s.exhausted=exhausted;
  }
  function decide(s,index) {
    if(s.phase!=='event' || !Number.isInteger(index)) return false;
    const e=D.events.find(e=>e.id===s.event),c=e.choices[index];
    if(!c) return false;
    const p=probability(s,c,e),success=p===null||random(s)<p;
    const changes=delta(s,c,e,success),before={...s.resources};
    for(const key of keys) s.resources[key]=Math.max(key==='money'?-100:0,Math.min(key==='money'?200:100,s.resources[key]+changes[key]));
    for(const flag of [c.flag,success?c.successFlag:null]) if(flag&&!s.flags.includes(flag)) s.flags.push(flag);
    s.actions.push({route:s.event,choice:index});s.visited.push(s.event);
    s.log.push({stage:s.stage,title:e.title,choice:c.label,story:c.story,success,probability:p,changes:Object.fromEntries(keys.map(k=>[k,s.resources[k]-before[k]]))});
    delete s.event;
    if(s.resources.body<=0||s.resources.mood<=0) ending(s,true);
    else if(++s.step===3) {s.step=0;if(++s.stage===5) ending(s);else offers(s);}
    else offers(s);
    return true;
  }
  function pack(s) { return {version:1,seed:s.seed,origin:s.origin,talents:s.talents,unlocked:s.unlocked,actions:s.actions,pending:s.phase==='event'?s.event:null}; }
  function restore(snapshot) {
    try {
      if(snapshot?.version!==1||!Array.isArray(snapshot.actions)||snapshot.actions.length>15||!Number.isInteger(snapshot.unlocked)||snapshot.unlocked<0||snapshot.unlocked>8) return null;
      const s=create(snapshot.seed,snapshot.origin,snapshot.talents,snapshot.unlocked);if(!s)return null;
      for(const action of snapshot.actions) if(!pick(s,action.route)||!decide(s,action.choice))return null;
      if(snapshot.pending&&!pick(s,snapshot.pending))return null;
      return s;
    } catch { return null; }
  }
  function meta(value={}) {
    const endings=Array.isArray(value?.endings)?[...new Set(value.endings.filter(id=>D.endings.some(e=>e.id===id)))]:[];
    return {endings,completed:Number.isSafeInteger(value?.completed)&&value.completed>=0?value.completed:0};
  }
  function summary(s) {
    const end=D.endings.find(e=>e.id===s.ending);
    return ['人生肉鸽 · '+(end?end.name:'未完待续'),'出身：'+D.origins.find(o=>o.id===s.origin).name,'天赋：'+s.talents.map(id=>D.talents.find(t=>t.id===id).name).join('、'),...s.log.map(l=>D.stages[l.stage]+' · '+l.title+' → '+l.choice),end?.text||'下一步，仍由你决定。','人生重启研究所 · 纯属娱乐'].join('\n');
  }
  const api={create,draft,pick,cancel,decide,delta,probability,pack,restore,meta,summary};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.LifeRogue=api;
})(typeof globalThis!=='undefined'?globalThis:this);
