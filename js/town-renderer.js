// Original storybook art. Rendering has no access to Run, storage, or game RNG.
(function(root){
  const palette={grass:'#bfd2a7',grassLight:'#d1dfb8',paper:'#f6eddb',ink:'#61715c',wood:'#a38a68',road:'#e4ceb0',water:'#89b9c5',shadow:'#53695426'};
  const looks=[
    {name:'童年',scale:.78,coat:'#c38c67',hair:'#57483c',bag:'#b98b69',student:false,elder:false},
    {name:'少年',scale:.93,coat:'#748f9d',hair:'#51463d',bag:'#ad8560',student:true,elder:false},
    {name:'青年',scale:1,coat:'#658574',hair:'#52483e',bag:'#bb926a',student:false,elder:false},
    {name:'中年',scale:1,coat:'#7e8171',hair:'#645b50',bag:'#a48a6d',student:false,elder:false},
    {name:'晚年',scale:.94,coat:'#a2917b',hair:'#d5d0c4',bag:'#a99073',student:false,elder:true}
  ];
  function appearance(stage){const i=Number.isInteger(stage)?Math.max(0,Math.min(4,stage)):2;return {...looks[i],stage:i};}
  const specs={home:'住宅',library:'书屋',market:'商铺',cafe:'茶馆',station:'车站',observatory:'观星屋',workshop:'工坊',archive:'档案馆',shrine:'签亭',chess:'棋摊',park:'长椅'};
  const api={palette,appearance,buildingKinds:specs};if(typeof module!=='undefined'&&module.exports){module.exports=api;return;}root.TownRenderer=api;
  function path(c,points,fill,stroke=palette.ink,width=1.2){c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
  function box(c,x,y,w,h,fill,stroke=null,r=2){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=1.3;c.stroke();}}
  function oval(c,x,y,rx,ry,fill,stroke=null){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.2;c.stroke();}}
  function line(c,points,color=palette.ink,width=1.3){c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}
  function shadow(c,x,y,w=42,h=10){oval(c,x+12,y+7,w,h,palette.shadow);}
  function character(c,x,y,stage=2,facing='down',stride=0,style={}){const a={...appearance(stage),...style};c.save();c.translate(x,y);c.scale(a.scale,a.scale);if(facing==='left')c.scale(-1,1);shadow(c,0,0,15,5);
    const back=facing==='up',side=facing==='left'||facing==='right';
    if(a.sitting){line(c,[[-5,-12],[-11,-6],[-11,0]],'#697367',6);line(c,[[5,-12],[11,-6],[11,0]],'#697367',6);}else{line(c,[[-5,-12],[-5+stride,0]],'#697367',6);line(c,[[5,-12],[5-stride,0]],'#697367',6);}
    oval(c,-5+stride,1,4.5,2.3,'#675d51');oval(c,5-stride,1,4.5,2.3,'#675d51');
    path(c,[[-8,-34],[8,-34],[11,-13],[-10,-13]],a.coat,'#657065',1.2);line(c,[[-4,-32],[-2,-16]],'#ffffff35',2);
    line(c,[[-8,-30],[-12,-18+stride]],a.coat,6);line(c,[[8,-30],[12,-18-stride]],a.coat,6);oval(c,-12,-16+stride,2.4,3,'#dfb795');oval(c,12,-16-stride,2.4,3,'#dfb795');
    box(c,side?4:6,-29,9,14,a.bag,'#8b795f',2);line(c,[[3,-34],[8,-19]],'#cdb391',1.5);
    oval(c,0,-40,8.8,10.3,'#e8c2a2','#9e8b76');
    c.beginPath();c.moveTo(-8,-39);c.bezierCurveTo(-13,-53,6,-56,9,-43);c.lineTo(6,-43);c.quadraticCurveTo(1,-48,-7,-42);c.closePath();c.fillStyle=a.hair;c.fill();
    if(back)oval(c,0,-40,8,9,a.hair);else{oval(c,side?4:-3,-39,0.8,1.1,'#696052');if(!side)oval(c,3,-39,.8,1.1,'#696052');line(c,[[0,-34],[3,-34]],'#b58b75',.8);}
    if(a.student){path(c,[[-4,-33],[0,-28],[4,-33]],'#eae3d2',null);line(c,[[0,-28],[0,-23]],'#a48566',2);}
    if(a.elder&&!back){line(c,[[-6,-40],[-1,-40],[1,-40],[6,-40]],'#857e71',.7);line(c,[[13,-23],[16,3]],'#99866a',2);}
    c.restore();
  }
  api.character=character;
  api.portrait=(stage,style={})=>{const cv=document.createElement('canvas');cv.width=224;cv.height=224;const c=cv.getContext('2d');box(c,0,0,224,224,'#eee9d9');oval(c,115,126,73,77,'#dce3ce');line(c,[[31,183],[195,183]],'#bdcbb1',1);c.save();c.translate(112,188);c.scale(2.7,2.7);character(c,0,0,stage,'down',0,style);c.restore();return cv.toDataURL();};
  function tree(c,x,y,type=0,s=1){c.save();c.translate(x,y);c.scale(s,s);shadow(c,0,0,33,10);line(c,[[0,0],[0,-57]],'#94836b',8);line(c,[[-1,-8],[-1,-54]],'#b19b79',2);
    if(type===2){for(let level=0;level<3;level++){const top=-102+level*23,w=19+level*9,bottom=top+45;c.beginPath();c.moveTo(-2,top);c.bezierCurveTo(-9,top+11,-w+8,bottom-15,-w,bottom-4);c.quadraticCurveTo(-w-3,bottom+1,-w+8,bottom);c.quadraticCurveTo(0,bottom+7,w,bottom-3);c.bezierCurveTo(w-5,bottom-17,9,top+13,-2,top);c.closePath();c.fillStyle=['#9aad8b','#8ba17e','#78936f'][level];c.fill();c.strokeStyle='#748d6b70';c.lineWidth=1;c.stroke();line(c,[[-7,top+17],[-w+10,bottom-6]],'#b6c39a70',2);}}
    else if(type===3){oval(c,0,-63,37,28,'#9cba94');for(let i=-3;i<=3;i++){c.beginPath();c.moveTo(i*9,-73);c.quadraticCurveTo(i*14,-50,i*11,-17-Math.abs(i)*3);c.strokeStyle=i%2?'#91ad83':'#a9c49b';c.lineWidth=7;c.lineCap='round';c.stroke();}line(c,[[0,-51],[18,-70]],'#8b806a',2);}
    else {const colors=type===1?['#d1c383','#ded098']:type===4?['#c7b9ad','#e0cabe']:['#93ac81','#abc195'];
      for(const [px,py,rx,ry] of [[-19,-53,24,22],[16,-58,27,26],[-5,-77,27,29],[0,-43,30,23]])oval(c,px,py,rx,ry,colors[0],'#7f937354');oval(c,-12,-76,22,22,colors[1]);oval(c,12,-68,18,19,colors[1]);
      if(type===4)for(let i=0;i<7;i++)oval(c,-22+(i*13)%48,-48-(i*17)%39,2,2,'#f6e6d7');
    }c.restore();
  }
  function shrub(c,x,y){shadow(c,x,y,20,5);for(let i=0;i<3;i++)oval(c,x-12+i*13,y-8-i%2*5,12,9,i%2?'#a6bb92':'#91ab82');}
  function flowers(c,x,y){for(let i=0;i<5;i++){const xx=x+(i*9)%31,yy=y+(i*7)%11;line(c,[[xx,yy],[xx,yy-6]],'#8caa77',1);oval(c,xx,yy-8,2.6,2.5,i%2?'#e2b69b':'#f3deb0');}}
  function roof(c,x,y,color,flat=false){if(flat){path(c,[[x-76,y-70],[x-62,y-111],[x+60,y-111],[x+76,y-70]],color);line(c,[[x-60,y-108],[x+57,y-108]],'#ece6d088',2);}
    else{path(c,[[x-80,y-69],[x-47,y-126],[x+48,y-126],[x+80,y-69]],color);line(c,[[x-44,y-122],[x+46,y-122]],'#f3ead38c',3);for(let j=0;j<4;j++)line(c,[[x-48-j*7,y-116+j*11],[x+48+j*7,y-116+j*11]],'#e4dec548',1);}
    line(c,[[x-78,y-68],[x+78,y-68]],'#716d5a',3);
  }
  function window(c,x,y,w=25,h=26){box(c,x,y,w,h,'#a8c5c9','#837f6c',1);line(c,[[x+w/2,y],[x+w/2,y+h]],'#e6dcc5',2);line(c,[[x,y+h*.55],[x+w,y+h*.55]],'#e6dcc5',2);line(c,[[x+3,y+3],[x+w*.45,y+3]],'#e4efea',2);box(c,x-2,y+h,w+4,3,'#b59d78');}
  function door(c,x,y){box(c,x-13,y-40,26,40,'#a58d6c','#81785f',2);box(c,x-9,y-36,18,21,'#bdd0cb',null,1);oval(c,x+8,y-11,1.4,1.4,'#eadab7');box(c,x-22,y,44,5,'#ccc0a5');}
  function building(c,p){const {x,y,id}=p;shadow(c,x,y,79,15);
    if(id==='shrine'){path(c,[[x-51,y-11],[x-41,y-75],[x+41,y-75],[x+51,y-11]],'#eee0c5');box(c,x-43,y-68,6,67,'#9c8163');box(c,x+37,y-68,6,67,'#9c8163');path(c,[[x-64,y-69],[x-32,y-117],[x+32,y-117],[x+64,y-69]],'#9a826b');line(c,[[x-60,y-69],[x+60,y-69]],'#796d5d',3);box(c,x-30,y-31,60,22,'#b29370','#8c795f');box(c,x-21,y-66,42,17,'#f4e7c9','#a69170');c.fillStyle='#8c795f';c.font='10px serif';c.textAlign='center';c.fillText('今日签',x,y-54);return;}
    box(c,x-65,y-70,130,66,'#eee0c5','#998f78',2);path(c,[[x+56,y-70],[x+65,y-70],[x+65,y-4],[x+56,y-4]],'#d5c5a6',null);box(c,x-65,y-16,130,12,'#dfc9a7');
    const colors={home:'#ba8f79',library:'#8d9b93',market:'#bd9b75',cafe:'#9ba68a',station:'#8b9e9a',observatory:'#8b99a8',workshop:'#97988c',archive:'#a69782'};
    roof(c,x,y,colors[id]||'#9b9d88',['library','workshop','archive'].includes(id));
    if(id==='home'){window(c,x-49,y-56);window(c,x+25,y-56);door(c,x,y-4);box(c,x+33,y-133,12,22,'#c0a890','#927f67');line(c,[[x+29,y-132],[x+49,y-132]],'#927f67',3);}
    if(id==='library'||id==='archive'){window(c,x-53,y-57,36,34);window(c,x+17,y-57,36,34);door(c,x,y-4);for(let i=0;i<6;i++)box(c,x-48+i*5,y-39,3,12,['#b89978','#c4b184','#829d8e'][i%3]);box(c,x-35,y-95,70,14,'#ede2c8','#8e947e');c.fillStyle='#68766a';c.font='10px serif';c.textAlign='center';c.fillText(id==='library'?'栖迟书屋':'旅途档案',x,y-85);}
    if(id==='market'){window(c,x-54,y-51,40,31);door(c,x+25,y-4);path(c,[[x-70,y-59],[x+70,y-59],[x+78,y-39],[x-78,y-39]],'#efe1c6');for(let i=0;i<9;i++)path(c,[[x-68+i*16,y-59],[x-60+i*16,y-59],[x-56+i*16,y-39],[x-64+i*16,y-39]],'#c69c7d',null);box(c,x-54,y-18,34,16,'#ab9472','#8a8065');for(let i=0;i<5;i++)oval(c,x-49+i*6,y-18,3,3,i%2?'#d5aa69':'#a7ba85');}
    if(id==='cafe'){window(c,x-51,y-53,35,28);door(c,x+15,y-4);box(c,x-75,y-32,150,4,'#a99473');for(const xx of [-70,69])box(c,x+xx,y-62,4,60,'#a99473');line(c,[[x-75,y-65],[x+75,y-65]],'#b9a47d',5);oval(c,x+48,y-50,7,11,'#d3a786','#af8d70');line(c,[[x+48,y-62],[x+48,y-38]],'#eed4af',1);}
    if(id==='station'){window(c,x-50,y-57,32,24);door(c,x+20,y-4);oval(c,x,y-92,10,10,'#eee8d4','#737d70');line(c,[[x,y-99],[x,y-92],[x+5,y-90]],'#737d70');box(c,x-80,y-31,160,6,'#89978c');for(const xx of [-74,72])box(c,x+xx,y-31,4,28,'#919789');}
    if(id==='observatory'){oval(c,x,y-109,38,27,'#91a5b7','#6c7f8e');line(c,[[x,y-135],[x+8,y-113],[x+8,y-87]],'#c2d0ce',2);window(c,x-45,y-48,26,22);door(c,x+17,y-4);line(c,[[x+22,y-123],[x+62,y-145]],'#a8b4b2',8);}
    if(id==='workshop'){for(let i=0;i<3;i++)path(c,[[x-65+i*42,y-79],[x-40+i*42,y-108],[x-23+i*42,y-79]],'#90958a');box(c,x-47,y-42,45,36,'#aaa492','#807d6c');for(let i=0;i<4;i++)line(c,[[x-45,y-36+i*8],[x-5,y-36+i*8]],'#c4bc9e',1);door(c,x+32,y-4);box(c,x+55,y-137,11,48,'#bbb7a5','#8e8e7f');}
    // Street-facing details give each shop a use, rather than just a roof colour.
    if(id==='home'){for(const xx of [-53,51]){box(c,x+xx,y-55,5,23,'#9da98a','#7f8c73');line(c,[[x+xx+1,y-52],[x+xx+3,y-52]],'#c1cbb0');}line(c,[[x-62,y-16],[x-37,y-16]],'#b2a080',1);box(c,x-53,y-24,30,7,'#b7a080','#91846d');flowers(c,x-49,y-25);}
    if(id==='market'){box(c,x+34,y-99,24,18,'#ede3c7','#9b896e');c.fillStyle='#7f795f';c.font='8px serif';c.textAlign='center';c.fillText('杂货',x+46,y-87);box(c,x+48,y-21,19,20,'#738b7f','#657a6a');line(c,[[x+51,y-16],[x+63,y-16]],'#dddcc5',1);box(c,x-63,y-10,18,8,'#c1ad86');}
    if(id==='library'){box(c,x+39,y-26,21,22,'#baa587','#92876c');for(let i=0;i<4;i++)box(c,x+42+i*4,y-22,2,11,['#7f9a8a','#b28e72','#c3ad79'][i%3]);line(c,[[x+41,y-10],[x+57,y-10]],'#e9dfc6',1);}
    shrub(c,x-79,y-5);flowers(c,x+75,y-10);
  }
  function bench(c,x,y){shadow(c,x,y,29,7);box(c,x-27,y-18,54,7,'#c0a480','#968565');box(c,x-27,y-8,54,8,'#b99e78','#968565');for(const xx of [-22,22])line(c,[[x+xx,y-14],[x+xx,y+6]],'#858b7a',3);}
  function lamp(c,x,y){shadow(c,x,y,8,4);line(c,[[x,y],[x,y-52],[x+9,y-55]],'#899287',3);box(c,x+3,y-57,15,11,'#eae0be','#969e87',3);}
  function bike(c,x,y){for(const xx of [-13,16])oval(c,x+xx,y-6,9,9,'#ffffff08','#8f9584');line(c,[[x-13,y-6],[x-3,y-20],[x+6,y-5],[x-13,y-6],[x+10,y-17],[x+16,y-6]],'#a38f77',2);line(c,[[x+7,y-21],[x+14,y-22]],'#7c8272',2);}
  api.createWorld=W=>{
    const ground=document.createElement('canvas');ground.width=W.width*2;ground.height=W.height*2;const c=ground.getContext('2d');c.scale(2,2);c.lineCap='round';c.lineJoin='round';box(c,0,0,W.width,W.height,palette.grass);
    for(const a of W.areas){const grad=c.createRadialGradient(a.x+a.w/2,a.y+a.h/2,10,a.x+a.w/2,a.y+a.h/2,a.w*.8);grad.addColorStop(0,a.id==='park'?'#d2dfb640':'#e7e3bf24');grad.addColorStop(1,'#d2dfb600');c.fillStyle=grad;c.fillRect(a.x,a.y,a.w,a.h);}
    for(let y=8;y<W.height;y+=18)for(let x=8;x<W.width;x+=19){const n=(Math.imul(x,13)^Math.imul(y,71))>>>0;if(n%7===0)line(c,[[x,y],[x-1,y-3]],'#78976b25',1);if(n%11===0)oval(c,x,y,1.7,1,'#f4e8c535');}
    const roads=[[[90,348],[1520,348]],[[489,150],[489,809]],[[228,809],[1390,809]],[[1050,350],[1050,945]],[[1380,350],[1380,680]],[[1260,809],[1260,942]]];
    for(const road of roads){line(c,road,'#b2b391',49);line(c,road,palette.road,44);line(c,road,'#f1dfc442',26);}
    for(const p of W.places){if(p.id==='archive')line(c,[[p.x,p.y+12],[489,p.y+12]],palette.road,28);else if(p.tag&&p.x<1000)line(c,[[p.x,p.y+12],[p.x,348]],palette.road,25);}
    for(let x=110;x<1500;x+=45)line(c,[[x,330],[x+1,366]],'#c5b59638',.8);
    // Authored street edges: small stone forecourts, imperfect joints and grass.
    for(const [x,y,w] of [[165,294,150],[410,270,150],[680,293,147]]){box(c,x,y,w,30,'#dcd8bc',null,5);for(let i=0;i<5;i++){line(c,[[x+9+i*29,y+3],[x+10+i*29,y+27]],'#b9b8a044',.8);line(c,[[x+3,y+15],[x+w-3,y+15]],'#b9b8a044',.8);}}
    for(const [x,y] of [[160,291],[352,292],[575,279],[832,292],[392,403]]){c.beginPath();c.moveTo(x-26,y);c.bezierCurveTo(x-39,y-16,x-18,y-34,x+1,y-27);c.bezierCurveTo(x+26,y-33,x+38,y-12,x+24,y+1);c.quadraticCurveTo(x,y+10,x-26,y);c.fillStyle='#a5bb8b';c.fill();for(let i=0;i<9;i++)flowers(c,x-20+(i*17)%43,y-7-(i*13)%20);}
    // Small courtyards anchor the buildings; the park has its own walking loop.
    for(const p of W.places.filter(p=>p.kind!=='landmark'))box(c,p.x-73,p.y-4,146,30,'#d6cfac70',null,8);
    c.beginPath();c.ellipse(1030,919,105,66,0,.15,Math.PI*1.85);c.strokeStyle='#dfcfad';c.lineWidth=16;c.stroke();
    box(c,1178,925,170,38,'#d8ccad70',null,6);

    for(const r of W.water){box(c,r.x-6,r.y-6,r.w+12,r.h+12,'#acba99',null,20);box(c,r.x,r.y,r.w,r.h,palette.water,'#779fa6',16);box(c,r.x+8,r.y+7,r.w-18,r.h-16,'#9bc9cf',null,14);for(let y=r.y+24;y<r.y+r.h-10;y+=25)line(c,[[r.x+15+(y%29),y],[r.x+54+(y%29),y+1]],'#e3eee6a0',1.4);for(let y=r.y+25;y<r.y+r.h;y+=43){line(c,[[r.x-10,y],[r.x-13,y-15]],'#829b71',2);line(c,[[r.x-4,y],[r.x-2,y-12]],'#829b71',1.4);}}
    for(const r of W.forest)box(c,r.x,r.y,r.w,r.h,'#a7bf95',null,15);
    // Railroad is a visible boundary, separate from the traversable streets.
    for(let x=1140;x<1520;x+=18)line(c,[[x,710],[x,736]],'#baa383',3);line(c,[[1130,716],[1520,716]],'#9d9e8e',2);line(c,[[1130,730],[1520,730]],'#9d9e8e',2);
    const objects=[];
    function add(x,y,paint,w=210,h=190){const sprite=document.createElement('canvas');sprite.width=w*2;sprite.height=h*2;const s=sprite.getContext('2d');s.scale(2,2);s.lineCap='round';s.lineJoin='round';s.translate(w/2,h-25);paint(s);s.setTransform(2,0,0,2,0,0);s.globalCompositeOperation='source-atop';for(let yy=0;yy<h;yy+=5)for(let xx=0;xx<w;xx+=5){const n=(xx*37+yy*19)%53;if(n<9){s.fillStyle=n%2?'#fff3d512':'#6b78630a';s.fillRect(xx,yy,2,1);}}objects.push({x,y,canvas:sprite,width:w,height:h,offsetX:w/2,offsetY:h-25});}
    for(const p of W.places){if(p.id==='chess')add(p.x,p.y,s=>{shadow(s,0,0,36,10);box(s,-21,-29,42,24,'#e7dcc3','#9c8b70');for(let i=0;i<5;i++){line(s,[[-17+i*8,-26],[-17+i*8,-8]],'#b8ac90',.7);line(s,[[-17,-26+i*4],[17,-26+i*4]],'#b8ac90',.7);}oval(s,-4,-18,2,2,'#657365');oval(s,7,-14,2,2,'#faf1dd');line(s,[[-16,-5],[-16,7]],'#a38a68',4);line(s,[[16,-5],[16,7]],'#a38a68',4);box(s,-45,-12,15,10,'#b8a280','#8d8369');box(s,31,-12,15,10,'#b8a280','#8d8369');});else if(p.id==='park')add(p.x,p.y,s=>bench(s,0,0));else add(p.x,p.y,s=>building(s,{...p,x:0,y:0}));}
    const trees=[[110,190,0],[336,170,4],[620,187,1],[898,203,2],[93,472,0],[361,476,4],[620,543,1],[685,652,0],[972,488,3],[1150,276,2],[1500,536,2],[1190,615,0],[1480,743,2],[859,968,3],[1127,1009,3],[1380,996,1],[325,900,4],[589,930,0]];
    for(const [x,y,t] of trees)add(x,y,s=>tree(s,0,0,t));for(const r of W.forest)for(let x=r.x+25;x<r.x+r.w;x+=57)for(let y=r.y+65;y<r.y+r.h+20;y+=60)add(x,y,s=>tree(s,0,0,2,.9));
    for(const [x,y] of [[173,310],[824,317],[290,550],[561,309],[918,870],[1100,874]])add(x,y,s=>{shrub(s,0,0);flowers(s,-15,-8);},100,70);
    for(const [x,y] of [[362,412],[594,412],[1130,887]])add(x,y,s=>bench(s,0,0),100,80);
    for(const [x,y] of [[140,321],[563,321],[866,321],[1312,382],[1008,838]])add(x,y,s=>lamp(s,0,0),90,110);
    add(312,282,s=>{line(s,[[0,0],[0,-28]],'#9a8b72',4);box(s,-10,-38,20,14,'#b18b70','#887f66');line(s,[[-7,-33],[6,-33]],'#e8d8b7');},75,100);
    add(391,297,s=>{bench(s,0,0);box(s,9,-29,11,10,'#d9c7a4','#94886c');oval(s,15,-27,4,2,'#eee2c8');},110,90);
    add(812,302,s=>{box(s,-15,-24,30,24,'#c0a381','#94886c');line(s,[[-15,-18],[15,-18]],'#e0c6a6',1);for(let i=0;i<5;i++)oval(s,-10+i*5,-25,3,4,i%2?'#d1ae76':'#a6b686');},80,100);
    add(207,274,s=>{box(s,-12,-8,24,8,'#aa9071','#8d8068');for(let i=0;i<5;i++)line(s,[[-9+i*5,-9],[-8+i*5,-19-i%2*4]],'#86a07a',2);},70,75);
    add(422,287,s=>bike(s,0,0),100,90);add(1331,937,s=>{box(s,-17,-22,34,22,'#bea17d','#978365');line(s,[[-17,-22],[17,0]],'#e0c6a4');},90,80);
    add(566,286,s=>{line(s,[[-15,0],[-15,-37]],'#99876a',3);line(s,[[15,0],[15,-37]],'#99876a',3);box(s,-24,-51,48,28,'#e3d5b9','#9e9278');line(s,[[-18,-44],[16,-44]],'#9eaa8c');line(s,[[-18,-38],[4,-38]],'#bda383');},100,110);

    objects.sort((a,b)=>a.y-b.y);const base=document.createElement('canvas');base.width=W.width*2;base.height=W.height*2;const bc=base.getContext('2d');bc.scale(2,2);bc.drawImage(ground,0,0,W.width,W.height);for(const o of objects)bc.drawImage(o.canvas,o.x-o.offsetX,o.y-o.offsetY,o.width,o.height);return {ground,objects,base,width:W.width,height:W.height,rasterScale:2};
  };
  api.render=(world,c,actor,options)=>{c.drawImage(world.ground,0,0,world.width,world.height);const camera=options.camera,visible=(x,y,w=150,h=200)=>!camera||(x+w>camera.x&&x-w<camera.x+camera.width&&y+30>camera.y&&y-h<camera.y+camera.height);const actors=[{...actor,stage:options.stage,facing:options.idleFacing||options.facing,stride:options.stride,style:{sitting:options.sitting}},...(options.residents||[]).filter(a=>!a.away).map(a=>({...a,stage:a.age,stride:a.behavior==='walking'?Math.sin(a.gait)*2:0,style:{coat:a.coat,sitting:['playing','resting'].includes(a.behavior)&&['park','chess','cafe'].includes(a.goal?.place)}}))];const entries=[...world.objects.filter(o=>visible(o.x,o.y)),...actors.filter(a=>visible(a.x,a.y,25,65))].sort((a,b)=>a.y-b.y);for(const o of entries){if(o.canvas)c.drawImage(o.canvas,o.x-o.offsetX,o.y-o.offsetY,o.width,o.height);else character(c,o.x,o.y,o.stage,o.facing,o.stride,o.style);}};
  api.study=canvas=>{const c=canvas.getContext('2d');box(c,0,0,800,400,'#eae8d9');box(c,20,20,760,360,palette.grass,null,12);line(c,[[35,300],[765,300]],palette.road,48);box(c,570,100,170,155,palette.water,'#779fa6',18);for(let y=122;y<240;y+=28)line(c,[[590,y],[626,y+1]],'#dcece6',1.3);building(c,{id:'home',x:300,y:263});tree(c,140,260,0,1.2);character(c,430,300,2);flowers(c,190,281);};
})(typeof globalThis!=='undefined'?globalThis:this);
