(function(){
  'use strict';
  const $=id=>document.getElementById(id),N=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
  const nav=GameNavigation,frame=$('toolFrame');let loadedTool='',atlasCategory='endings';
  function address(tool,panel){const url=new URL(location.href);url.search='';url.hash=panel==='collection'?'tujian':panel==='profile'?'me':panel==='directory'?'lab':'';if(tool)url.searchParams.set('tool',tool);if(url.href!==location.href)history.pushState({},'',url);}
  function tool(input,changeURL=true){
    const split=input.split('#'),target=nav.target(split[0].endsWith('.html')?split[0]:split[0]+'.html',split[1]?'#'+split[1]:'');if(!target)return;
    if(target.panel){panel(target.panel,changeURL);return;}
    const name=target.tool,meta=nav.tools[name];$('toolDialog').dataset.tool=name;$('toolTitle').textContent=meta.title;$('toolSubtitle').textContent=meta.subtitle;$('toolPortrait').src=TownScene.thumbnail(meta.place);$('toolPortrait').alt=meta.title+'的小镇建筑';frame.title=meta.title;
    GameUI.open('toolDialog');if(loadedTool!==name){$('toolLoading').classList.remove('hidden');frame.src=name+'.html?embed=1';loadedTool=name;}if(changeURL)address(name);
  }
  frame.addEventListener('load',()=>$('toolLoading').classList.add('hidden'));
  $('toolBack').addEventListener('click',()=>GameUI.close('toolDialog'));
  window.addEventListener('message',e=>{if(e.source!==frame.contentWindow||e.origin!==location.origin)return;if(e.data?.type==='town:close')GameUI.close('toolDialog');if(e.data?.type==='town:navigate'){const target=nav.target(e.data.file,e.data.hash);if(target?.tool)tool(target.tool);else if(target?.panel)panel(target.panel);}});
  const lifeNames=['颜值担当','智慧担当','铁人三项','财务自由','月光族','破产专家','人生赢家','玻璃人','普通路人'];
  const lifeHints=['结局颜值达到 80','结局智力达到 80','结局体质达到 80','结局财富达到 150','结局财富不高于 20','结局财富不高于 0','结局幸福达到 100','结局体质不高于 30','完成一局且没有其他成就'];
  const zodiacNames=['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
  function indices(key,length){const list=Store.get(key,[]);return Array.isArray(list)?[...new Set(list.filter(i=>Number.isInteger(i)&&i>=0&&i<length))]:[];}
  function groups(){
    const endings=LifeRogue.meta((Store.get('life_rogue_v1',{})||{}).meta).endings,chess=Gomoku.unlocked(Gomoku.stats((Store.get('gomoku_v1',{})||{}).stats));
    return [
      {id:'endings',name:'人生回声',items:LifeRogueData.endings.map(e=>({name:e.name,text:endings.includes(e.id)?e.text:'解锁：'+e.hint,owned:endings.includes(e.id),icon:e.id}))},
      {id:'residents',name:'小镇人物',items:globalThis.ResidentUI?.entries()||[]},
      {id:'qian',name:'签文',items:QIAN.map((q,i)=>({name:'第 '+(i+1)+' 签 · '+q.level,text:indices('tujian_qian',QIAN.length).includes(i)?q.poem+'\n'+q.note:'去杂货铺摇一支签，收集新的签文。',owned:indices('tujian_qian',QIAN.length).includes(i),icon:'scroll',tool:'qian'}))},
      {id:'chess',name:'棋局',items:Gomoku.achievements.map(a=>({name:a.name,text:a.hint,owned:chess.includes(a.id),icon:'coin',tool:'gomoku'}))},
      {id:'zodiac',name:'生肖',items:zodiacNames.map((name,i)=>({name:name+'年',text:'在天文小屋排出这一生肖的生日，即可收集。',owned:nav.collectionIndices(Store.get('tujian_zodiac',[]),zodiacNames).includes(i),icon:'star',tool:'bazi'}))},
      {id:'classic',name:'旧日故事',items:lifeNames.map((name,i)=>({name,text:'经典版解锁条件：'+lifeHints[i],owned:nav.collectionIndices(Store.get('tujian_life',[]),lifeNames).includes(i),icon:'book',tool:'life-classic'}))}
    ];
  }
  function atlas(){
    const all=groups(),count=all.reduce((s,g)=>s+g.items.filter(x=>x.owned).length,0);$('atlasSummary').textContent='已收集 '+count+' / '+all.reduce((sum,g)=>sum+g.items.length,0)+' · 所有旅途，收在同一本手记里。';$('atlasTabs').replaceChildren();
    all.forEach(g=>{const button=N('button',g.name+' '+g.items.filter(x=>x.owned).length+'/'+g.items.length);button.type='button';button.setAttribute('aria-pressed',String(g.id===atlasCategory));button.addEventListener('click',()=>{atlasCategory=g.id;atlas();});$('atlasTabs').append(button);});
    $('endings').classList.toggle('hidden',atlasCategory!=='endings');$('atlasGrid').classList.toggle('hidden',atlasCategory==='endings');$('atlasGrid').replaceChildren();
    for(const item of all.find(g=>g.id===atlasCategory).items){const card=N('div',undefined,'atlas-entry'+(item.owned?'':' locked')),heading=N('h3');heading.append(GameArt.icon(item.owned?item.icon:'lock'),N('span',item.name));card.append(heading,N('p',item.text));if(item.tool){const button=N('button','去'+nav.tools[item.tool].title,'text-button');button.addEventListener('click',()=>tool(item.tool));card.append(button);}$('atlasGrid').append(card);}
  }
  function directory(){
    $('directoryPlaces').replaceChildren();for(const p of TownScene.places){const button=N('button',undefined,'directory-place'),image=N('img'),available=document.querySelector('[data-place="'+p.id+'"]').classList.contains('available');image.src=TownScene.thumbnail(p.id);image.alt='';button.append(image,N('strong',p.name),N('small',available?'今日可选经历':p.action||'休息与启程'));button.classList.toggle('available',available);button.addEventListener('click',()=>TownScene.visit(p.id));$('directoryPlaces').append(button);}
  }
  function profile(){
    $('travellerName').value=Profile.name();Profile.bindBirthday($('travellerBirth'));$('travellerBirth').value=Profile.birth();$('profileFeedback').textContent='';$('profileStats').replaceChildren();
    const life=Store.get('life_stats',{})||{},meta=LifeRogue.meta((Store.get('life_rogue_v1',{})||{}).meta),chess=Gomoku.stats((Store.get('gomoku_v1',{})||{}).stats);
    for(const [label,value] of [['人生重开',Number.isSafeInteger(life.count)?life.count:0],['人生回声',meta.endings.length+' / 8'],['棋局胜场',chess.wins],['最高评级',life.best||'—']]){const box=N('div');box.append(N('small',label),N('strong',String(value)));$('profileStats').append(box);}
  }
  function panel(name,changeURL=true){
    if(name==='town'){GameUI.returnToTown();document.querySelectorAll('dialog[open]').forEach(d=>d.close());if(changeURL)address();return;}
    const id={collection:'collectionDialog',profile:'profileDialog',directory:'directoryDialog'}[name];if(!id)return;
    if(name==='collection')atlas();if(name==='profile')profile();if(name==='directory')directory();GameUI.open(id);if(changeURL)address('',name);
  }
  $('travellerForm').addEventListener('submit',e=>{
    e.preventDefault();const name=$('travellerName').value.trim().slice(0,24),birth=$('travellerBirth').value;
    if(birth&&!Profile.validBirth(birth)){$('profileFeedback').textContent='生日应为 1900 年 1 月 31 日至今天的有效日期。';return;}
    try{localStorage.setItem('profile_name',JSON.stringify(name));if(birth)localStorage.setItem('profile',JSON.stringify(birth));else localStorage.removeItem('profile');const input=Profile.fortuneInput();localStorage.setItem('fortune_input',JSON.stringify({...input,name:name||'无名氏'}));GameUI.refresh();$('profileFeedback').textContent='旅人档案已保存到当前浏览器。';}catch{$('profileFeedback').textContent='当前浏览器未能保存，请保持此页打开。';}
  });
  for(const [id,name] of [['directoryBtn','directory'],['atlasBtn','collection'],['collectionBtn','collection'],['profileBtn','profile']])$(id).addEventListener('click',()=>panel(name));
  document.querySelectorAll('[data-tool]').forEach(button=>button.addEventListener('click',()=>tool(button.dataset.tool)));document.querySelectorAll('[data-panel]').forEach(button=>button.addEventListener('click',()=>panel(button.dataset.panel)));
  document.querySelector('.game-header .brand').addEventListener('click',e=>{e.preventDefault();panel('town');});
  for(const id of ['toolDialog','collectionDialog','profileDialog','directoryDialog'])$(id).addEventListener('close',()=>{if(!document.querySelector('dialog[open]')){const url=new URL(location.href);url.search='';url.hash='';history.replaceState({},'',url);}});
  function applyLocation(){const toolName=new URLSearchParams(location.search).get('tool');if(Object.hasOwn(nav.tools,toolName))tool(toolName,false);else panel(location.hash==='#tujian'?'collection':location.hash==='#me'?'profile':location.hash==='#lab'?'directory':'town',false);}
  window.addEventListener('popstate',applyLocation);globalThis.GamePanels={tool,panel,atlas};
  if(location.search||['#tujian','#me','#lab'].includes(location.hash))applyLocation();
})();
