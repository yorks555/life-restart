(function (root) {
  'use strict';
  const D = typeof module !== 'undefined' && module.exports ? require('./life-rogue-data.js') : root.LifeRogueData;
  const keys = ['body','money','mood','knowledge'];
  const N=typeof module!=='undefined'&&module.exports?require('./npc-events.js'):root.NPCEvents;
  function choices(s,e){const list=[...e.choices];if(s.version===2&&N.memory(s,'yu').relation>=40&&e.area==='commercial')list.push({label:'请余青帮忙参考',delta:{money:4,knowledge:2},story:'熟悉小镇生意的人，替你避开了一处小坑。'});return list;}
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
    if(s.version===2){
      s.offers=[];s.mapOffers=[];for(const area of [...new Set(candidates.map(e=>e.area))]){const pool=candidates.filter(e=>e.area===area),total=pool.reduce((v,e)=>v+e.weight,0);let roll=random(s)*total,selected=pool.at(-1);for(const e of pool){roll-=e.weight;if(roll<0){selected=e;break;}}s.offers.push(selected.id);s.mapOffers.push({area,id:selected.id});}s.phase='route';return;
    }
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

  function createMapped(seed,origin,talents,unlocked=0){const s=create(seed,origin,talents,unlocked);if(!s)return null;s.version=2;s.rng=s.seed;s.journeySteps=[];offers(s);return s;}
  function areas(s){return s.phase==='route'?(s.version===2?s.mapOffers.map(o=>o.area):[...new Set(s.offers.map(id=>D.events.find(e=>e.id===id).area))]):[];}
  function arrive(s,area){if(s.version!==2||s.phase!=='route')return false;const offer=s.mapOffers.find(o=>o.area===area);return !!offer&&pick(s,offer.id);}
  function steps(s){return s.actions.filter(a=>a.kind==='life'||(!a.kind&&a.route)).length;}
  function journey(s){
    if(s.version!==2||s.phase!=='route'||s.journeySteps.includes(steps(s)))return false;
    const turn=steps(s);s.journeySteps.push(turn);const state={rng:(s.seed^Math.imul(turn+1,0x9E3779B1))>>>0},pool=D.roadEvents.filter(e=>!s.visited.includes(e.id));
    const trigger=random(state)<(N.memory(s,'zhou').metPlayer ? .4 : .28)&&pool.length&&s.actions.filter(a=>a.kind==='road').length<5;
    const id=trigger?pool[Math.floor(random(state)*pool.length)].id:null;s.actions.push({kind:'journey',turn,event:id});
    if(id){s.event=id;s.phase='event';}return true;
  }
  function currentEvent(s){return [...D.events,...D.roadEvents].find(e=>e.id===s.event);}
  function pick(s,id) {
    if(s.phase!=='route' || !s.offers.includes(id)) return false;
    s.event=id;s.phase='event';return true;
  }
  function cancel(s) { if(s.phase!=='event'||currentEvent(s)?.type==='road')return false;delete s.event;s.phase='route';return true; }
  function probability(s,c,e) {
    if(c.chance===undefined) return null;
    return Math.min(.95,c.chance+(s.talents.includes('luck') ? .15 : 0)+(e.tag==='social'&&s.talents.includes('social') ? .2 : 0));
  }
  function delta(s,choice,event,success=true) {
    const out = Object.fromEntries(keys.map(k=>[k,(choice.delta[k]||0)+((success?choice.success:choice.failure)?.[k]||0)]));
    if(event.type!=='road')out.body -= [3,4,5,4,3][s.stage];
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
    s.remembered=id==='ordinary'&&N&&['lin','xia','chen','yu','zhou','he','qiao','wu'].filter(n=>N.memory(s,n).relation>=60).length>=3;
  }
  function decide(s,index) {
    if(s.phase!=='event' || !Number.isInteger(index)) return false;
    const e=currentEvent(s),c=e&&choices(s,e)[index];
    if(!c) return false;
    const p=probability(s,c,e),success=p===null||random(s)<p;
    const changes=delta(s,c,e,success),before={...s.resources};
    for(const key of keys) s.resources[key]=Math.max(key==='money'?-100:0,Math.min(key==='money'?200:100,s.resources[key]+changes[key]));
    for(const flag of [c.flag,success?c.successFlag:null]) if(flag&&!s.flags.includes(flag)) s.flags.push(flag);
    s.actions.push(s.version===2?{kind:e.type==='road'?'road':'life',area:e.area||null,route:s.event,choice:index}:{route:s.event,choice:index});s.visited.push(s.event);
    s.log.push({...(s.version===2?{type:e.type,area:e.area||null}:{}),stage:s.stage,title:e.title,choice:c.label,story:c.story,success,probability:p,changes:Object.fromEntries(keys.map(k=>[k,s.resources[k]-before[k]]))});
    delete s.event;
    if(s.resources.body<=0||s.resources.mood<=0) ending(s,true);
    else if(e.type==='road'){s.phase='route';}
    else if(++s.step===3) {s.step=0;if(++s.stage===5) ending(s);else offers(s);}
    else offers(s);
    return true;
  }
  function resident(s,id,choice,moves){if(!N.apply(s,id,choice,moves))return false;if(s.resources.body<=0||s.resources.mood<=0)ending(s,true);return true;}
  function pack(s) { return {version:s.version,...(s.version===2?{rules:s.living?'living-v1':'map-v1'}:{}),seed:s.seed,origin:s.origin,talents:s.talents,unlocked:s.unlocked,actions:s.actions,pending:s.phase==='event'?s.event:null}; }
  function restore(snapshot) {
    try {
      if(![1,2].includes(snapshot?.version)||(snapshot.version===2&&!['map-v1','living-v1'].includes(snapshot.rules))||!Array.isArray(snapshot.actions)||snapshot.actions.length>(snapshot.version===2?80:15)||!Number.isInteger(snapshot.unlocked)||snapshot.unlocked<0||snapshot.unlocked>8) return null;
      const s=(snapshot.version===2?createMapped:create)(snapshot.seed,snapshot.origin,snapshot.talents,snapshot.unlocked);if(!s)return null;
      for(const action of snapshot.actions){
        if(s.version===1){if(!pick(s,action.route)||!decide(s,action.choice))return null;}
        else if(action.kind==='resident'){if(snapshot.rules!=='living-v1'||!resident(s,action.npc,action.choice,action.moves))return null;}
        else if(action.kind==='journey'){if(!journey(s))return null;const recorded=s.actions.at(-1);if(recorded.turn!==action.turn||recorded.event!==action.event)return null;}
        else if(action.kind==='road'){if(s.phase!=='event'||s.event!==action.route||currentEvent(s)?.type!=='road'||!decide(s,action.choice))return null;}
        else if(action.kind==='life'){if(!arrive(s,action.area)||s.event!==action.route||!decide(s,action.choice))return null;}
        else return null;
      }
      if(s.phase==='event'){if(snapshot.pending!==s.event)return null;}else if(snapshot.pending&&!pick(s,snapshot.pending))return null;
      return s;
    } catch { return null; }
  }
  function meta(value={}) {
    const endings=Array.isArray(value?.endings)?[...new Set(value.endings.filter(id=>D.endings.some(e=>e.id===id)))]:[];
    return {endings,completed:Number.isSafeInteger(value?.completed)&&value.completed>=0?value.completed:0};
  }
  function endingInfo(s){const e=D.endings.find(e=>e.id===s.ending);return e&&s.remembered?{...e,name:'有人记得你',text:'你的日子没有惊天动地，但小镇里有人会说起你。旧灯还亮着，棋盘另一边留着位置。'}:e;}
  function summary(s) {
    const end=endingInfo(s);
    return ['人生肉鸽 · '+(end?end.name:'未完待续'),'出身：'+D.origins.find(o=>o.id===s.origin).name,'天赋：'+s.talents.map(id=>D.talents.find(t=>t.id===id).name).join('、'),...s.log.map(l=>(l.type==='road'?'途中':D.stages[l.stage])+' · '+l.title+' → '+l.choice),end?.text||'下一步，仍由你决定。','人生重启研究所 · 纯属娱乐'].join('\n');
  }
  const api={create,createMapped,areas,arrive,steps,journey,currentEvent,draft,pick,cancel,decide,delta,probability,pack,restore,meta,summary,choices,resident,endingInfo};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.LifeRogue=api;
})(typeof globalThis!=='undefined'?globalThis:this);
