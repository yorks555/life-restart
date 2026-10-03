(function(root){
  const tools={
    gomoku:{place:'chess',title:'树下棋摊',subtitle:'黑白之间，输赢之外。人机对弈或同屏双人，棋局自动保存。'},
    qian:{place:'market',title:'杂货铺 · 抽一支签',subtitle:'心里想一件事，让一支签给今天添一点故事。'},
    fortune:{place:'cafe',title:'巷口茶馆 · 今日命运',subtitle:'和茶馆老板聊聊今天。同一天、同一个你，结果保持一致。'},
    bazi:{place:'observatory',title:'天文小屋 · 命运排盘',subtitle:'翻开星图，看看另一种关于自己的解读。仅供娱乐。'},
    progress:{place:'station',title:'旧站台 · 人生刻度',subtitle:'看看已经走过多少日子，下一站，仍由你决定。'},
    'life-classic':{place:'home',title:'旅人之家 · 旧日故事',subtitle:'保留的经典随机人生。这里的记录会继续进入图鉴。'},
    privacy:{place:'library',title:'小镇公约',subtitle:'关于本地存档、个人信息与娱乐内容的说明。'}
  };
  function target(file,hash=''){
    if(typeof file!=='string'||/[/:?\\]/.test(file))return null;
    if(file==='archive.html'||['index.html','life.html','pixel-town.html'].includes(file))return {panel:hash==='#tujian'?'collection':hash==='#me'?'profile':hash==='#lab'||file==='archive.html'?'directory':'town'};
    const name=file.replace(/\.html$/,'');return Object.hasOwn(tools,name)&&file===name+'.html'?{tool:name}:null;
  }
  function collectionIndices(values,names){
    if(!Array.isArray(values))return [];
    const normalized=value=>value.replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu,'').trim();
    return [...new Set(values.map(value=>typeof value==='string'?names.indexOf(normalized(value)):value).filter(i=>Number.isInteger(i)&&i>=0&&i<names.length))];
  }
  const api={tools,target,collectionIndices};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GameNavigation=api;
})(typeof globalThis!=='undefined'?globalThis:this);
