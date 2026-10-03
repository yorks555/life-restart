// Authored town layout: fixed streets, buildings, park and waterfront.
(function(root){
  const locations=[
    {name:'家',x:9,y:11,label:'出发去体验另一段人生',href:'life.html'},
    {name:'图书馆',x:17,y:11,label:'查看人生与棋局图鉴',href:'index.html#tujian'},
    {name:'签铺',x:30,y:11,label:'抽一支签',href:'qian.html'},
    {name:'棋摊',x:9,y:24,label:'来下一局五子棋',href:'gomoku.html'},
    {name:'研究所',x:17,y:24,label:'看看今日命运',href:'fortune.html'},
    {name:'档案室',x:30,y:24,label:'查看个人档案',href:'index.html#me'},
    {name:'观景台',x:38,y:24,label:'看看已经走过多少天',href:'progress.html'}
  ];
  function map(){
    const g=Array.from({length:36},()=>Array(48).fill(0));
    const rect=(x,y,w,h,type)=>{for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)g[yy][xx]=type;};
    rect(3,3,42,30,1);rect(5,5,38,26,2);
    rect(5,17,38,2,3);rect(23,5,2,26,3);
    rect(5,13,38,1,3);rect(5,26,38,1,3);
    rect(34,6,8,7,0);rect(33,6,1,7,1);
    for(const l of locations){rect(l.x-1,l.y-1,3,2,5);rect(l.x,l.y+1,1,l.y<17?2:1,3);}
    for(const [x,y] of [[6,6],[8,6],[10,6],[6,8],[14,6],[16,6],[18,6],[28,6],[30,6],[6,28],[9,29],[13,29],[17,29],[20,29],[27,29],[30,29],[34,29],[40,29],[41,15],[38,15],[36,15],[6,20],[12,20],[19,20],[28,20],[33,20],[39,20]])g[y][x]=4;
    return g;
  }
  const api={map,locations};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.FixedTown=api;
})(typeof globalThis!=='undefined'?globalThis:this);
