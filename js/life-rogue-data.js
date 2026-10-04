(function (root) {
  'use strict';
  const stages = ['童年', '少年', '青年', '中年', '晚年'];
  const origins = [
    { id: 'ordinary', name: '普通人家', icon: '🏡', text: '零花钱一般，精神状态领先同龄人。', resources: { body: 65, money: 25, mood: 70, knowledge: 15 } },
    { id: 'book', name: '书香家庭', icon: '📚', text: '识字比走路早，书包比本人重。', resources: { body: 55, money: 20, mood: 55, knowledge: 35 } },
    { id: 'market', name: '菜市场世家', icon: '🥬', text: '家传技能：砍价，以及判断西瓜熟没熟。', resources: { body: 70, money: 40, mood: 55, knowledge: 10 } }
  ];
  const talents = [
    { id: 'memory', name: '过目不忘', icon: '🧠', text: '学习事件获得的学识额外 +4。' },
    { id: 'night', name: '熬夜不困', icon: '🌙', text: '学习、工作事件的体力消耗减少 3。' },
    { id: 'social', name: '社牛体质', icon: '📣', text: '社交事件的成功率 +20%，财富收益额外 +5。' },
    { id: 'thick', name: '厚脸皮', icon: '🗿', text: '社交失败时免除负面心情变化。' },
    { id: 'save', name: '省钱达人', icon: '🪙', text: '财富支出打七折，向下取整。' },
    { id: 'optimist', name: '精神内耗绝缘体', icon: '☀️', text: '每次负面心情变化减少 4。' },
    { id: 'scavenge', name: '捡漏体质', icon: '🔎', text: '奇遇事件财富额外 +6。', unlock: 1 },
    { id: 'luck', name: '命运亲戚', icon: '🍀', text: '所有概率事件的成功率 +15%。', unlock: 3 }
  ];
  const routes = {
    study: { name: '学习', icon: '📚', text: '脑子变好用，头发暂不保证。' },
    social: { name: '社交', icon: '📣', text: '人脉是资源，尴尬也是。' },
    work: { name: '搞钱', icon: '💼', text: '钱包和体力，通常只能保住一个。' },
    rest: { name: '休息', icon: '🛋️', text: '给人生按一会儿暂停。' },
    adventure: { name: '奇遇', icon: '🧭', text: '可能捡到宝，也可能捡到麻烦。' },
    odd: { name: '整点怪的', icon: '🌀', text: '正常人生的出口，在这里。' }
  };
  const choice = (label, delta, story, extra = {}) => ({ label, delta, story, ...extra });
  const event = (id, stage, tag, title, text, choices, extra = {}) => ({ id, stage, tag, title, text, choices, ...extra });
  const events = [
    event('homework',0,'study','作业成精了','你的练习册说，它也不想上班。',[
      choice('认真写完，给它放个假',{knowledge:12,body:-5},'练习册感动得自己合上了。'),
      choice('和它协商弹性作业制',{mood:8,knowledge:5},'每天少写一道，双方都觉得自己赢了。'),
      choice('说服它自己写自己',{mood:-5},'练习册拒绝了你的外包方案。',{chance:.4,success:{knowledge:18,mood:8},failure:{knowledge:2}})]),
    event('classboss',0,'social','班长竞选','竞选口号是：让每一支粉笔都有尊严。',[
      choice('上台演讲',{body:-3},'你把讲台当成了发布会。',{chance:.55,success:{mood:12,money:8},failure:{mood:-8}}),
      choice('给候选人当气氛组',{mood:8},'你负责鼓掌，大家负责觉得你很专业。'),
      choice('成立反作业联盟',{knowledge:4,mood:5},'联盟的第一项工作，是写联盟作业。')]),
    event('lemonade',0,'work','校门口小生意','隔壁摊开始卖“知识味”的柠檬水。',[
      choice('卖真的柠檬水',{money:12,body:-6},'你赚到了人生第一桶硬币。'),
      choice('研发“努力味”白开水',{money:-4},'瓶身写着：喝完继续努力。',{chance:.45,success:{money:22},failure:{mood:-5}}),
      choice('先研究成本',{knowledge:8},'你发现纸杯比水贵，顿悟了商业。')]),
    event('nap',0,'rest','午睡保卫战','全家都在问：你怎么又困了？',[
      choice('睡到自然醒',{body:15,mood:6},'梦里也没有作业。'),
      choice('边听故事边躺着',{body:9,knowledge:6},'你记住了主角，但忘记了结尾。'),
      choice('偷吃一碗冰淇淋',{money:-6,mood:14,body:4},'人生第一次发现，幸福可以按球计费。')]),
    event('oldradio',0,'adventure','旧货摊的收音机','收音机里播放的是明天的天气。',[
      choice('买下来，研究一下',{money:-8,knowledge:8},'它偶尔会播报你的名字。',{flag:'radio'}),
      choice('帮摊主收摊',{money:8,body:-4},'摊主送了你一袋暂时还不能叫宝的东西。'),
      choice('问它考试答案',{mood:5},'它播放了一首《自己努力》。')]),
    event('pigeon',0,'odd','鸽子选你当领导','广场上的鸽子齐刷刷向你行注目礼。',[
      choice('发表鸟类友好宣言',{mood:10,knowledge:3},'你被任命为代理咕咕。'),
      choice('收取面包屑管理费',{money:10,mood:-3},'鸽子们对财政政策很有意见。'),
      choice('跟它们练广场舞',{body:7,mood:7},'每只鸽子都慢了半拍。',{flag:'dance'})]),
    event('exam',1,'study','考试题认识你','题目说：我们上次见过，只是你没认出来。',[
      choice('通宵复习',{knowledge:17,body:-10,mood:-4},'知识装进去了，眼袋也装满了。'),
      choice('按计划学习',{knowledge:10,body:-3},'你和知识达成了长期合作。'),
      choice('祈祷老师手滑给分',{mood:4},'祈祷暂未接入教务系统。',{chance:.35,success:{knowledge:12},failure:{mood:-7}})]),
    event('club',1,'social','社团缺一个社长','工作内容包括：组织大家讨论下次活动。',[
      choice('我来当',{body:-4},'大家开始喊你总裁。',{chance:.6,success:{mood:14,money:6},failure:{mood:-10}}),
      choice('只负责海报',{knowledge:8,mood:4},'海报比活动先火了。'),
      choice('成立睡眠研究社',{body:12,mood:6},'开会时没人醒着。')]),
    event('delivery',1,'work','兼职送奶茶','顾客说：你能不能把我的焦虑也带走？',[
      choice('多接几单',{money:20,body:-10},'你对这座城的电梯非常熟悉。'),
      choice('开发送单路线',{knowledge:9,money:9,body:-4},'学识终于换成了少爬两层楼。'),
      choice('给顾客写安慰小纸条',{money:8,mood:9},'你收到的好评像一封短情书。')]),
    event('holiday',1,'rest','假期没有计划','朋友问你去哪玩，你说去床的另一边。',[
      choice('认真躺平',{body:16,mood:8},'你完成了床垫的实地考察。'),
      choice('散步到街角',{body:10,mood:10},'世界没有催你交作业。'),
      choice('买一本闲书',{money:-8,knowledge:10,body:6},'这次没有读后感，真好。')]),
    event('signal',1,'adventure','来自未来的广播','收音机说：别丢，我以后值钱。',[
      choice('修好它',{body:-5,knowledge:14},'它说以后一定报答你。',{flag:'radioFixed'}),
      choice('拿去拍短视频',{money:15,mood:6},'评论区说特效不错。'),
      choice('当成白噪音',{body:12,mood:4},'未来的烦恼帮助你现在入睡。')],{requires:'radio'}),
    event('dreammajor',1,'odd','志愿表多了一个专业','专业名称：宇宙售后服务。',[
      choice('就读这个',{knowledge:12,mood:6,money:-8},'课程第一节：如何让水逆客户冷静。'),
      choice('选个好就业的',{knowledge:8,money:10,mood:-5},'老师说前景很好，但没说谁的前景。'),
      choice('先研究招生简章',{knowledge:10},'你找出了五处自相矛盾的地方。')]),
    event('ai',2,'study','全村唯一会用 AI 的人','村长请你让打印机也变得智能。',[
      choice('教大家用新工具',{knowledge:13,money:10,body:-5},'全村正式进入“再问一下 AI”时代。'),
      choice('研究自己的小项目',{knowledge:18,money:-10,body:-6},'项目暂时只有你和三个报错。'),
      choice('先修好打印机',{money:15,mood:6},'智能不智能另说，终于能打印了。')]),
    event('boss',2,'social','公司就是你的家','老板笑着说，家里人不要计较加班费。',[
      choice('那我先睡了',{body:15,mood:5,money:-4},'你第一次在公司感到家的温暖。'),
      choice('家里缺钱，给点',{body:-3},'你向家庭财政部门递交申请。',{chance:.5,success:{money:26,mood:8},failure:{mood:-10}}),
      choice('这房子有我的份吗',{knowledge:5,mood:-3},'老板突然开始认真看你的工牌。',{flag:'board'})]),
    event('startup',2,'work','创业项目：空气罐头','卖点是“家乡最后一口新鲜空气”。',[
      choice('投入积蓄试一试',{money:-20,body:-8},'第一批客户说开罐后什么都没剩。',{chance:.45,success:{money:60,mood:10},failure:{money:-15,mood:-12}}),
      choice('给项目做财务',{money:18,knowledge:7,body:-5},'你是唯一发现罐头成本过高的人。'),
      choice('继续稳定打工',{money:18,body:-5,mood:-3},'你的现金流暂时比老板的梦想可靠。')]),
    event('leave',2,'rest','休假申请被批准','系统居然没有报错，你怀疑这是陷阱。',[
      choice('关机，真的休息',{body:20,mood:10},'没有人能从你这里获得一个“收到”。'),
      choice('花钱去看海',{money:-14,body:12,mood:18},'海浪不检查你的绩效。'),
      choice('在家做一顿饭',{money:-5,body:14,mood:9},'一锅饭解决不了人生，但解决了晚饭。')]),
    event('treasure',2,'adventure','旧广播里的藏宝地址','地址指向一间卖二手椅子的仓库。',[
      choice('去看看',{money:-10,body:-5},'你在椅子里发现了绝版唱片。',{chance:.55,success:{money:35,knowledge:8},failure:{mood:-6},successFlag:'treasure'}),
      choice('买下角落的旧零件',{money:-8,knowledge:12},'这些零件，和童年的收音机似曾相识。'),
      choice('帮老板搬东西',{money:14,body:-6,mood:3},'宝藏没有找到，工资倒是找到了。')]),
    event('catmanager',2,'odd','猫被提拔为主管','理由是它从不在会议上说废话。',[
      choice('给它当秘书',{money:15,mood:8,body:-4},'它的日程只有吃饭和踩键盘。'),
      choice('学习它的管理风格',{knowledge:10,body:5},'你学会了在无意义讨论时离场。'),
      choice('申请成为公司的第二只猫',{mood:12,money:-6},'申请因为不会呼噜而被驳回。')]),
    event('nightclass',3,'study','中年夜校开学了','同桌是你以前不爱学习的班主任。',[
      choice('补上年轻时的遗憾',{knowledge:18,body:-7,money:-8},'这次你终于是为自己上课。'),
      choice('开个经验分享课',{money:16,knowledge:8,body:-4},'你的踩坑经历成了教学资料。'),
      choice('旁听，不交作业',{knowledge:9,mood:6},'知识和你之间少了一份考核表。')]),
    event('boardmeeting',3,'social','股东大会邀请函','你当年的一句“有我的份吗”，居然被当真了。',[
      choice('当场谈分红',{body:-5},'你准备把家庭比喻变成法律事实。',{chance:.5,success:{money:55,knowledge:8},failure:{money:-10,mood:-12},successFlag:'shareholder'}),
      choice('展示自己的成果',{knowledge:14,money:20,body:-6},'PPT 不会分红，但这次有人愿意买单。'),
      choice('拒绝无薪股东身份',{mood:14,body:8},'你夺回了属于自己的周末。')],{requires:'board'}),
    event('promotion',3,'work','升职，加量不加价','职位全名太长，工牌需要折叠。',[
      choice('谈清楚工资再接',{body:-6},'你要求先看数字，再看愿景。',{chance:.6,success:{money:32,mood:8},failure:{mood:-8,money:8}}),
      choice('接下，积累经验',{money:20,knowledge:10,body:-9,mood:-6},'简历更长了，午睡更短了。'),
      choice('留在原岗位',{money:10,body:4,mood:5},'你发现不升职也是一种进步。')]),
    event('checkup',3,'rest','体检报告建议放松','报告里的“请结合临床”比领导还会甩锅。',[
      choice('开始规律生活',{body:22,mood:7,money:-8},'保温杯终于不是装饰品了。'),
      choice('和朋友慢慢散步',{body:14,mood:14},'走得不快，但这一晚没有倒计时。'),
      choice('学会拒绝加班',{body:12,mood:10,money:-5},'“不方便”成了你的新技能。')]),
    event('radioreturn',3,'adventure','收音机真的报恩了','那台破机器变成了收藏圈的热门话题。',[
      choice('把它送上拍卖会',{money:50,mood:6},'它最后播了一句：谢谢保修。'),
      choice('开一间维修小铺',{money:18,knowledge:14,body:-5},'你的生活里多了很多还值得修的东西。'),
      choice('留下，继续听',{mood:18,body:8},'有些回报没法用价格标出来。')],{requires:'radioFixed'}),
    event('dance',3,'odd','广场舞队需要编导','阿姨们说：你看起来很会踩点。',[
      choice('带队出征',{body:-6,mood:18},'你掌握了音响的最高权限。',{flag:'dance'}),
      choice('做一个智能音响',{knowledge:14,money:8,body:-5},'设备支持语音指令“再来一遍”。'),
      choice('负责舞队后勤',{money:12,mood:8},'你成了整条街最懂充电宝的人。')]),
    event('memoir',4,'study','回忆录出版社来信','他们想要你的成功秘诀，你准备写踩坑合集。',[
      choice('整理一生的知识',{knowledge:15,body:-5},'书名叫《报错也是一种答案》。'),
      choice('写得轻松一点',{mood:12,money:10},'读者说你像他们失联的网友。'),
      choice('先教邻居一点东西',{knowledge:10,mood:9},'你的知识终于跑出了书房。')]),
    event('reunion',4,'social','同学会带来一份表格','有人建议按人生资产进行座位排序。',[
      choice('建议按饭量排序',{mood:15},'你被全场一致选为组织委员。'),
      choice('兜售自己的回忆录',{money:18,body:-3},'同学们第一次为你的故事付费。'),
      choice('换一桌聊年轻时候',{mood:12,body:6},'这桌没人问你房子多大。')]),
    event('retirework',4,'work','退休后再就业','岗位要求：会用手机，不乱点广告。',[
      choice('做个社区顾问',{money:18,knowledge:7,body:-4},'你每天解决的问题，比年轻时具体多了。'),
      choice('开一家小摊',{money:22,body:-7,mood:6},'熟客叫你老板，你终于不用回“收到”。'),
      choice('工资够用，早点收摊',{money:10,body:8,mood:10},'关门时间由你自己决定。')]),
    event('sunset',4,'rest','夕阳不催你交周报','今天的主要任务，是找一张舒服的椅子。',[
      choice('晒太阳',{body:16,mood:12},'你和夕阳都准时下班了。'),
      choice('和朋友喝茶',{money:-6,mood:18,body:8},'茶凉了也没人扣绩效。'),
      choice('走一条没走过的小路',{body:10,knowledge:6,mood:9},'新鲜感没有年龄限制。')]),
    event('timeparcel',4,'adventure','年轻的你寄来的快递','包裹里有一张纸：你后来开心吗？',[
      choice('回信说，还挺开心',{mood:20},'你认真写下了最近一次大笑的原因。'),
      choice('整理这些旧东西',{money:15,knowledge:8},'有些东西涨价，有些东西长成了故事。'),
      choice('给下一代写一封信',{mood:12,knowledge:10},'你没有列成功清单，只列了几个好玩的地方。')]),
    event('dancefinal',4,'odd','广场舞决赛','主持人喊出了你的艺名：退休练习生。',[
      choice('让整条街看见我',{body:-8,mood:18},'你站在了音响与夕阳之间。',{flag:'dance'}),
      choice('把舞步交给 AI',{knowledge:14,mood:8},'AI 的动作过于标准，反而没人学会。'),
      choice('坐在台下为朋友鼓掌',{body:8,mood:14},'你的快乐不需要领奖台。')])
  ];
  const endings = [
    { id:'shareholder', name:'把公司过成了自己的家', icon:'🏢', text:'老板再说公司是家时，你开始检查分红到账没有。', hint:'成功拿到股东分红，并在结局保有至少 60 财富。' },
    { id:'scholar', name:'全村最懂 AI 的人', icon:'🧠', text:'你修好了打印机，也学会了修正自己的人生提示词。', hint:'结局学识达到 75。' },
    { id:'wealth', name:'现金流自由人', icon:'🪙', text:'余额终于不再是一道每天都要重算的数学题。', hint:'结局财富达到 120。' },
    { id:'dance', name:'广场舞顶流', icon:'🪩', text:'你退休后的出场费，终于超过了年轻时的加班费。', hint:'参加舞队或鸽子舞，结局心情达到 75。' },
    { id:'debt', name:'欠着钱，也睡得很好', icon:'🛌', text:'你决定认真还钱，也决定不再把每个夜晚赔进去。', hint:'结局财富为负，心情达到 60。' },
    { id:'treasure', name:'旧货市场的传奇', icon:'📻', text:'别人看到一堆旧东西，你看到很多还没结束的故事。', hint:'在藏宝地址成功找到宝物。' },
    { id:'calm', name:'人间松弛感样本', icon:'🍵', text:'你的人生没有总冠军，但有很多很舒服的下午。', hint:'结局体力达到 65、心情达到 65。' },
    { id:'ordinary', name:'普通，但我来过', icon:'🌅', text:'没写进热搜，也没有白活。你的故事由你记得。', hint:'完成一段人生；体力或心情耗尽也会以这一结局收束。' }
  ];

  const eventAreas={homework:'school',classboss:'school',lemonade:'commercial',nap:'residential',oldradio:'outskirts',pigeon:'plaza',exam:'school',club:'school',delivery:'commercial',holiday:'residential',signal:'outskirts',dreammajor:'school',ai:'school',boss:'workplace',startup:'commercial',leave:'park',treasure:'outskirts',catmanager:'workplace',nightclass:'school',boardmeeting:'workplace',promotion:'workplace',checkup:'park',radioreturn:'commercial',dance:'plaza',memoir:'school',reunion:'plaza',retirework:'commercial',sunset:'park',timeparcel:'residential',dancefinal:'plaza'};
  events.forEach(e=>{e.area=eventAreas[e.id];e.type='normal';e.rarity=e.requires?'rare':'normal';e.weight=e.requires?1.5:1;});
  const roadEvents=[
    {id:'road_coin',title:'石缝里的零钱',text:'一枚硬币在旧石板间闪了一下。',choices:[choice('捡起来',{money:3},'零钱装进了口袋。'),choice('留给下一位旅人',{mood:2},'你向下一段旅程挥了挥手。')]},
    {id:'road_rain',title:'一阵小雨',text:'雨点来得突然，路边的屋檐还空着。',choices:[choice('在屋檐下等一会儿',{body:2},'雨停了，路面有了新的颜色。'),choice('继续赶路',{body:-2,mood:2},'今天的风有一点凉。')]},
    {id:'road_friend',title:'路上碰见熟人',text:'有人朝你挥手，问你最近过得怎么样。',choices:[choice('聊两句',{mood:4},'几句闲话，照亮了这条路。'),choice('打个招呼就走',{knowledge:1},'你记下了一个小镇的新消息。')]},
    {id:'road_leaflet',title:'奇怪的传单',text:'纸上画着一条不在导览图里的小路。',choices:[choice('收好传单',{knowledge:2},'传单成为随身的一条线索。',{flag:'leaflet'}),choice('看看就放回去',{mood:1},'未知的故事留在了路边。')]},
    {id:'road_help',title:'散落一地的苹果',text:'推车的轮子卡住了，有人正一颗颗拾起苹果。',choices:[choice('帮忙收拾',{body:-2,mood:5},'对方把谢意装进了笑容里。'),choice('指一下附近的修车铺',{knowledge:2},'你给出了一条有用的路。')]},
    {id:'road_sales',title:'热情的推销员',text:'他说，这是今天最后一枚幸运纽扣。',choices:[choice('花三块钱买一枚',{money:-3,mood:2},'纽扣没有魔法，但可以当作纪念。',{flag:'button'}),choice('笑着说下次吧',{mood:1},'你保住了钱包，也没有伤和气。')]},
    {id:'road_path',title:'藏在花丛里的小路',text:'花丛后露出几块旧石板，像是小时候走过的路。',choices:[choice('看看路边的旧路牌',{knowledge:3},'原来这里曾经是集市的入口。'),choice('在这里深呼吸',{body:2,mood:2},'旅途不总需要一个答案。')]},
    {id:'road_charm',title:'长椅上的小挂件',text:'一个木制挂件被留在了长椅边。',choices:[choice('交到失物招领处',{mood:3},'也许有人正在寻找它。'),choice('收好，遇见失主再归还',{mood:1},'小挂件暂时陪你继续走。',{flag:'charm'})]}
  ].map(e=>({...e,type:'road',tag:'adventure',rarity:'normal'}));
  const data = { stages, origins, talents, routes, events, endings, roadEvents };
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
  else root.LifeRogueData = data;
})(typeof globalThis !== 'undefined' ? globalThis : this);
