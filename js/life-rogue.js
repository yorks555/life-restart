(function () {
  'use strict';
  const D=LifeRogueData,E=LifeRogue,$=id=>document.getElementById(id),KEY='life_rogue_v1';
  const saved=GameSave.migrate(Store.get(KEY,{})||{});
  let library=saved.meta,run=saved.run,settled=saved.settled,outcome=saved.outcome;
  TownScene.restore(saved.map);
  let saveFailed=false;
  let seed=0,origin=null,talents=[],candidates=[];
  const names={body:'体力',money:'财富',mood:'心情',knowledge:'学识'};
  function node(tag,text,cls) { const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n; }
  function hide(id,hidden) { $(id).classList.toggle('hidden',hidden); }
  function modal(id) { document.querySelectorAll('dialog[open]').forEach(d=>{if(d.id!==id)d.close();});if(!$(id).open)$(id).showModal(); }
  function closeModal(id) { if($(id).open)$(id).close(); }
  const keeps={...NPCEvents.items,leaflet:['奇怪传单','路上的人留下一条旧路的线索。'],button:['幸运纽扣','没有魔法，只有一段小小的旅途。'],charm:['木制挂件','先替未知的失主好好保管。'],radio:['旧收音机','童年带回的旧机器，听起来像是在说未来。'],radioFixed:['修好的收音机','你听懂了广播，也修好了它。'],board:['股份约定','当年那一句提问，可能会换来股东大会的邀请。'],shareholder:['股东凭证','你终于拿到了公司的分红。'],treasure:['旧货宝物','一条藏宝线索，变成了真的收获。'],dance:['舞队邀请','生活的节拍，偶尔也由你掌握。']};
  function syncDesktop(showEvent=true) {
    const active=!!run,route=active&&!outcome&&run.phase==='route',stage=active?D.stages[Math.min(4,run.stage)]:'序章';
    const look=TownRenderer.appearance(active?Math.min(4,run.stage):2);TownScene.setStage(look.stage);
    const portrait=$('travellerPortrait');if(portrait.dataset.stage!==String(look.stage)){portrait.src=TownRenderer.portrait(look.stage);portrait.dataset.stage=String(look.stage);portrait.alt=look.name+'时期的小镇旅人';}
    $('portraitAge').textContent=active?look.name:'旅人';
    document.documentElement.dataset.lifeState=active?'active':'idle';
    hide('idleStats',active);hide('idleConsole',route);hide('launch',route);hide('routeView',!route);
    $('characterName').textContent=Profile.name()||'小镇旅人';
    $('characterSubtitle').textContent=active?(run.ending?'这段人生，已留下回声。':stage+' · 下一步仍由你决定'):'一座小镇，无数种活法。';
    $('worldTime').textContent=active?['春日 · 晴','夏日 · 微风','初秋 · 晴','深秋 · 暖阳','冬日 · 薄云'][Math.min(4,run.stage)]:'春日 · 晴';
    $('journeyProgress').textContent=active?'已走过 '+E.steps(run)+' / 15 步':'尚未启程';
    $('journalStage').textContent=stage;$('journalTitle').textContent=active?(run.ending?'你曾经来过':run.log.length?'选择，正在留下回声':'人生的第一张空白页'):'关于下一次出发';
    $('journalIntro').textContent=active?'每一步都有代价，也有收获。你的足迹会记在这里。':'有些路走过才知道，有些选择会在很久以后回响。这里会记下你做出的每一个决定。';
    $('launchTitle').textContent=active?(run.ending?'翻开这次人生的最后一页':'继续未完的经历'):'开始一段新的人生';
    $('launchDescription').textContent=active?(run.ending?'一段人生已经落笔，回头看看你的故事。':'回到未完的经历，继续做出你的选择。'):'选出身 · 搭天赋 · 写下你的故事';
    $('launchAction').textContent=active?(run.ending?'查看':'继续'):'出发';
    $('sceneHint').textContent=route?'亮起的建筑有新的经历。去哪里，由你决定。':active?'你的故事已经保存。随时可以继续。':'小镇一直在这里，等你开始新的故事。';
    TownScene.setRoutes(route?(run.version===2?E.areas(run):run.offers.map(id=>D.events.find(e=>e.id===id).tag)):[],route);TownScene.setEvents(route?TownEvents.markers(run):[]);
    $('bagItems').replaceChildren();let count=0;for(const flag of run?.flags||[]){if(!keeps[flag]||(flag==='radio'&&run.flags.includes('radioFixed')))continue;const item=node('div',undefined,'ending-entry');item.append(node('h3',keeps[flag][0]),node('p',keeps[flag][1]));$('bagItems').append(item);count++;}
    $('bagCount').textContent=count;if(!count)$('bagItems').append(node('p','口袋里还很轻。某些事件的选择，会让你带回新的线索。','muted'));
    if(!active){$('history').replaceChildren();$('stageTrack').replaceChildren();D.stages.forEach(name=>$('stageTrack').append(node('span',name)));}
    document.dispatchEvent(new CustomEvent('game:update'));
    if(showEvent){if(active&&(outcome||run.phase==='event'||run.phase==='end'))modal('eventDialog');else closeModal('eventDialog');}
  }
  function enterRoute(id,area) {if(!run)return;if(run.version===2?E.arrive(run,area):E.pick(run,id)){outcome=false;save();renderRun();}}
  TownScene.enter(place=>{
    if(run?.phase==='event'){renderRun();return;}
    const id=run&&!outcome&&run.phase==='route'?(run.version===2?run.mapOffers.find(o=>o.area===place.area)?.id:run.offers.find(id=>D.events.find(e=>e.id===id).tag===place.tag)):null;
    $('placeTitle').textContent=place.name;$('placeText').textContent=place.text;
    $('placeScene').src=TownScene.thumbnail(place.id);$('placeScene').alt=place.name+'的小镇建筑';
    $('placeActions').replaceChildren();$('placeRouteNote').textContent=id?'今日经历会占用人生的一步；下方闲逛活动不影响本局资源。':run&&run.phase==='route'?'本步这里没有新的经历。你可以闲逛，或去亮起的建筑推进人生。':'闲逛不消耗本局资源，关闭窗口就能回到小镇。';
    if(id){const event=D.events.find(e=>e.id===id),button=node('button',undefined,'place-action primary');button.append(GameArt.icon(event.tag),node('span','今日经历 · '+event.title),node('small','推进人生一步 →'));button.addEventListener('click',()=>enterRoute(id,place.area));$('placeActions').append(button);}
    if(place.link){const button=node('button',undefined,'place-action');button.append(GameArt.icon(place.tag||'book'),node('span',place.action),node('small','闲逛活动 →'));button.addEventListener('click',()=>GamePanels.tool(place.link));$('placeActions').append(button);}
    if(place.id==='home'){const button=node('button',undefined,'place-action');button.append(GameArt.icon('home'),node('span',run?'继续这段人生':'开始一段人生'),node('small','回到旅程 →'));button.addEventListener('click',()=>{closeModal('placeDialog');if(run)renderRun();else modal('setupDialog');});$('placeActions').append(button);}
    modal('placeDialog');
  });
  function returnToTown() {if(run?.phase==='event'){E.cancel(run);save();renderRun();}else if(outcome){outcome=false;save();renderRun();}closeModal('eventDialog');}
  document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>button.dataset.close==='eventDialog'?returnToTown():closeModal(button.dataset.close)));
  $('eventDialog').addEventListener('cancel',event=>{event.preventDefault();returnToTown();});
  $('launch').addEventListener('click',()=>run?renderRun():modal('setupDialog'));
  for(const [button,dialog] of [['helpBtn','helpDialog'],['bagBtn','bagDialog']])$(button).addEventListener('click',()=>modal(dialog));
  function soundLabel() { const muted=Store.get('mute',0)===1;$('muteBtn').textContent=muted?'音效关':'音效开';$('muteBtn').setAttribute('aria-pressed',String(muted)); }
  $('muteBtn').addEventListener('click',()=>{Store.set('mute',Store.get('mute',0)===1?0:1);soundLabel();});soundLabel();
  function effects(delta) { return Object.entries(delta).filter(([,v])=>v).map(([k,v])=>names[k]+' '+(v>0?'+':'')+v).join(' · ')||'没有数值变化'; }
  function save() {
    try { localStorage.setItem(KEY,JSON.stringify(GameSave.pack({meta:library,run,settled,outcome,map:TownScene.snapshot(),living:globalThis.ResidentUI?.snapshot()||saved.living})));saveFailed=false;$('saveState').textContent='已保存到本地 · 可以随时离开并继续'; }
    catch { $('saveState').textContent='当前浏览器未能保存，请保持此页打开。';if(!saveFailed)showToast('存档未保存，请保持页面打开');saveFailed=true; }
  }
  function renderCollection() {
    $('collectionCount').textContent=library.endings.length+' / '+D.endings.length;
    $('endings').replaceChildren();
    D.endings.forEach(e=>{const own=library.endings.includes(e.id),box=node('div',undefined,'ending-entry'+(own?'':' locked')),heading=node('h3');heading.append(GameArt.icon(own?e.id:'lock'),node('span',e.name));box.append(heading,node('p',own?e.text:'解锁：'+e.hint));$('endings').append(box);});
    $('unlockNote').textContent='已发现 '+library.endings.length+' 种结局 · 已完成 '+library.completed+' 段人生。'+(library.endings.length<1?'首个结局会解锁“捡漏体质”。':library.endings.length<3?'再发现 '+(3-library.endings.length)+' 种结局，解锁“命运亲戚”。':'八种天赋已全部加入候选池。');
  }
  function freshDraft() {
    const words=new Uint32Array(1);if(globalThis.crypto?.getRandomValues)crypto.getRandomValues(words);else words[0]=Math.floor(Math.random()*4294967296);
    seed=words[0];origin=null;talents=[];candidates=E.draft(seed,library.endings.length);renderDraft();
  }
  function renderDraft() {
    $('origins').replaceChildren();
    D.origins.forEach(o=>{
      const b=node('button',undefined,'pick-card'+(origin===o.id?' selected':''));b.type='button';b.setAttribute('aria-pressed',String(origin===o.id));
      b.append(GameArt.icon(o.id),node('strong',o.name),node('p',o.text),node('small',effects(o.resources)));
      b.addEventListener('click',()=>{origin=o.id;renderDraft();});$('origins').append(b);
    });
    $('talents').replaceChildren();candidates.forEach(t=>{
      const own=talents.includes(t.id),b=node('button',undefined,'pick-card'+(own?' selected':''));b.type='button';b.setAttribute('aria-pressed',String(own));
      b.append(GameArt.icon(t.id),node('strong',t.name),node('p',t.text));
      b.addEventListener('click',()=>{if(own)talents=talents.filter(id=>id!==t.id);else if(talents.length<2)talents.push(t.id);else showToast('本局只能携带两个天赋，先取消一个再换');renderDraft();});$('talents').append(b);
    });
    $('talentCount').textContent='已选 '+talents.length+' / 2';$('begin').disabled=!origin||talents.length!==2;
  }
  function settle() {
    if(!run?.ending||settled)return;
    library.completed++;if(!library.endings.includes(run.ending))library.endings.push(run.ending);
    const old=Store.get('life_stats',{count:0,best:''})||{},grades=['D','C','B','A','S'];
    const score=run.resources.knowledge+run.resources.mood+Math.max(0,run.resources.money)*.25;
    const grade=score>=180?'S':score>=135?'A':score>=90?'B':score>=45?'C':'D';
    if(!old.best||grades.indexOf(grade)>grades.indexOf(old.best))old.best=grade;
    Store.set('life_stats',old);settled=true;
  }
  function renderRun(showEvent=true) {
    if(!run)return;closeModal('setupDialog');hide('setup',true);hide('run',false);
    const sceneEvent=[...D.events,...D.roadEvents].find(e=>e.id===(run.event||run.actions.at(-1)?.route));
    const sceneArea=FixedTown.areas.find(a=>a.id===(sceneEvent?.area||TownScene.snapshot().area));const scenePlace=TownScene.places.find(p=>p.id===sceneArea?.place)||TownScene.places[0];
    $('eventArt').textContent=scenePlace.name;$('eventScene').src=TownScene.thumbnail(scenePlace.id);$('eventScene').alt=scenePlace.name+'的小镇建筑';
    $('runIdentity').dataset.seed=String(run.seed);$('runIdentity').textContent=D.origins.find(o=>o.id===run.origin).name+' · 第 '+(library.completed+(settled?0:1))+' 段人生';
    $('stageTrack').replaceChildren();D.stages.forEach((name,i)=>$('stageTrack').append(node('span',name,i===run.stage?'current':i<run.stage?'done':'')));
    $('resources').replaceChildren();Object.keys(names).forEach(k=>{
      const value=run.resources[k],box=node('div',undefined,'resource'+((k==='body'||k==='mood')&&value<=15?' low':'')),label=node('small',undefined);label.append(GameArt.icon(k),node('span',names[k]));box.append(label,node('b',String(value)));
      const meter=node('div',undefined,'meter'),fill=node('span');fill.style.width=Math.max(0,Math.min(100,value/(k==='money'?200:100)*100))+'%';meter.append(fill);box.append(meter);$('resources').append(box);
    });
    $('runTalents').replaceChildren();run.talents.forEach(id=>{const t=D.talents.find(t=>t.id===id),label=node('span');label.append(GameArt.icon(id),node('b',t.name));label.title=t.text;$('runTalents').append(label);});
    hide('routeView',outcome||run.phase!=='route');hide('eventView',outcome||run.phase!=='event');hide('endingView',outcome||run.phase!=='end');hide('outcomeView',!outcome);
    $('routes').replaceChildren();if(run.phase==='route'){
      $('stepText').textContent=D.stages[run.stage]+' · '+(run.step+1)+' / 3';
      run.offers.forEach(id=>{const event=D.events.find(e=>e.id===id),r=D.routes[event.tag],area=FixedTown.areas.find(a=>a.id===event.area),button=node('button',undefined,'pick-card');button.type='button';button.append(GameArt.icon(event.tag),node('strong',run.version===2?area.name:r.name));button.addEventListener('click',()=>TownScene.visit(run.version===2?area.place:event.tag));$('routes').append(button);});
    }
    $('choices').replaceChildren();if(run.phase==='event'){
      const e=E.currentEvent(run),place=scenePlace;$('eventArt').textContent=place.name;$('eventScene').src=TownScene.thumbnail(place.id);$('eventScene').alt=place.name+'的小镇建筑';$('eventCategory').textContent=e.type==='road'?'途中 · '+FixedTown.areas.find(a=>a.id===TownScene.snapshot().area).name:D.stages[run.stage]+' · '+(run.version===2?FixedTown.areas.find(a=>a.id===e.area).name:D.routes[e.tag].name);document.querySelector('.choice-note').textContent=e.type==='road'?'途中小事不占人生步数，每步最多遇到一次。':'变化已包含天赋效果与本阶段体力消耗。';$('eventTitle').textContent=e.title;$('eventText').textContent=e.text;
      E.choices(run,e).forEach((c,i)=>{const b=node('button',undefined,'choice');b.type='button';const p=E.probability(run,c,e);b.append(node('strong',c.label));
        if(p===null)b.append(node('small',effects(E.delta(run,c,e))));else b.append(node('small','成功率 '+Math.round(p*100)+'%\n成功：'+effects(E.delta(run,c,e,true))+'\n失败：'+effects(E.delta(run,c,e,false))));
        b.addEventListener('click',()=>{if(!E.decide(run,i))return;outcome=true;settle();save();renderRun();renderCollection();playSfx('good');});$('choices').append(b);
      });
    }
    if(outcome){const l=run.log.at(-1);$('outcomeTitle').textContent=l.probability===null?'你做出了选择':l.success?'这次，成了！':'这次没成，但人生继续';$('outcomeText').textContent=l.choice+'。'+l.story;$('outcomeDelta').replaceChildren();Object.entries(l.changes).filter(([,v])=>v).forEach(([k,v])=>$('outcomeDelta').append(node('span',names[k]+' '+(v>0?'+':'')+v,'delta-tag'+(v<0?' negative':''))));$('continue').textContent=run.ending?'看看这次人生的结局 →':'继续人生 →';}
    if(run.ending){const e=E.endingInfo(run);$('endingIcon').replaceChildren(GameArt.icon(e.id));$('endingTitle').textContent=e.name;$('endingText').textContent=(run.exhausted?'你暂时耗尽了力气，这段人生在此收束。':'')+e.text;$('endingUnlock').textContent='结局已加入图鉴。'+(library.endings.length===1?'新的候选天赋“捡漏体质”已解锁。':library.endings.length===3?'新的候选天赋“命运亲戚”已解锁。':'下一次，试试另一种活法。');}
    $('history').replaceChildren();run.log.forEach(l=>$('history').append(node('li',(l.type==='road'?'途中':D.stages[l.stage])+' · '+l.title+' → '+l.choice+'（'+effects(l.changes)+'）')));
    syncDesktop(showEvent);
  }
  function showSetup() {
    hide('run',true);hide('setup',false);hide('resumeBox',!run||run.phase==='end');hide('draftBox',!!run&&run.phase!=='end');
    if(run&&run.phase!=='end')$('resumeText').textContent=D.stages[run.stage]+' · 已走过 '+run.log.length+' 步。出身与天赋、已经发生的结果都已保存。';else freshDraft();renderCollection();syncDesktop();
  }
  function reset() {run=null;outcome=false;settled=false;TownScene.reset();save();showSetup();modal('setupDialog');}
  function requestReset() {if(run&&run.phase!=='end')modal('restartLife');else reset();}
  $('begin').addEventListener('click',()=>{
    const next=E.createMapped(seed,origin,talents,library.endings.length);if(!next)return;run=next;settled=false;outcome=false;
    const old=Store.get('life_stats',{count:0,best:''})||{};old.count=(Number(old.count)||0)+1;Store.set('life_stats',old);save();renderRun();playSfx('good');
  });
  $('resume').addEventListener('click',renderRun);for(const id of ['discard','abandon','again'])$(id).addEventListener('click',requestReset);
  $('confirmLife').addEventListener('click',reset);$('cancelLife').addEventListener('click',()=>{closeModal('restartLife');renderRun();});
  $('continue').addEventListener('click',()=>{outcome=false;save();renderRun();});
  $('copy').addEventListener('click',async()=>{
    const text=E.summary(run);try{if(!navigator.clipboard)throw Error();await navigator.clipboard.writeText(text);showToast('人生故事已复制');}
    catch{const dialog=node('dialog',undefined,'game-dialog'),textarea=node('textarea');textarea.value=text;textarea.readOnly=true;textarea.style.cssText='width:100%;height:280px;margin:16px 0';textarea.setAttribute('aria-label','人生故事');const close=node('button','关闭','btn');close.addEventListener('click',()=>dialog.close());dialog.append(node('h2','手动复制人生故事'),textarea,close);dialog.addEventListener('close',()=>dialog.remove());document.body.append(dialog);dialog.showModal();textarea.select();}
  });
  $('download').addEventListener('click',()=>{
    if(!run?.ending)return;const cv=document.createElement('canvas');cv.width=800;cv.height=820;const ctx=cv.getContext('2d'),e=E.endingInfo(run);
    ctx.fillStyle='#f8f6eb';ctx.fillRect(0,0,800,820);ctx.fillStyle='#58774e';ctx.font='18px sans-serif';ctx.fillText('栖迟小镇 · 人生重启研究所',60,70);
    function wrapped(text,y,font,color){ctx.font=font;ctx.fillStyle=color;let line='';for(const char of text){if(ctx.measureText(line+char).width>680){ctx.fillText(line,60,y);y+=44;line='';}line+=char;}ctx.fillText(line,60,y);return y+60;}
    let y=wrapped(e.name,160,'bold 36px sans-serif','#34463c');y=wrapped(e.text,y,'24px sans-serif','#7d8773');y=wrapped('出身：'+D.origins.find(o=>o.id===run.origin).name,y+15,'22px sans-serif','#34463c');y=wrapped('天赋：'+run.talents.map(id=>D.talents.find(t=>t.id===id).name).join('、'),y,'22px sans-serif','#34463c');wrapped(effects(run.resources),y+15,'22px sans-serif','#58774e');ctx.fillStyle='#7d8773';ctx.font='18px sans-serif';ctx.fillText('我来过，也做出了自己的选择。 · 纯属娱乐',60,755);const a=document.createElement('a');a.download='人生结局-'+e.id+'.png';a.href=cv.toDataURL();a.click();
  });
  globalThis.GameUI={residentState:()=>run,residentSave:()=>{settle();save();if(run)renderRun(false);else syncDesktop(false);},residentInitial:saved.living,status:()=>({resources:run?{...run.resources}:null,phase:run?.phase||'idle',outcome,seed:run?.seed,steps:run?E.steps(run):0}),open:modal,close:closeModal,refresh:()=>syncDesktop(false),returnToTown,start:()=>run?renderRun():modal('setupDialog')};
  TownScene.onState(save);TownScene.onJourney(()=>{if(run?.version===2&&run.phase==='route'&&!outcome&&E.journey(run)){save();if(run.phase==='event')renderRun();}});
  if(saved.notice)showToast(saved.notice);
  renderCollection();if(run){if(run.ending){settle();save();}renderRun();}else showSetup();
})();
