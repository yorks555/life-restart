// Homepage and detail use the same deterministic daily report.
const DailyFortune = (() => {
  const COMMENTS = {
    财运: [
      "今日财库水位平稳，适合积累，别手滑点开购物车。",
      "偏财运微弱闪烁，中奖概率约等于命运开个小差。",
      "财富如潮汐，来得快去得也快，建议先捂住口袋。",
      "不宜盲目投资，宜投资自己——比如补个觉、吃顿好的。"
    ],
    事业: [
      "系统检测到你正在摸鱼，请把窗口切回工作台。",
      "适合开会时语出惊人，说完记得假装一切尽在掌握。",
      "今日产出如涓涓细流，能交差就算赢。",
      "可能被委以重任，也可能被当工具人，全看命运随机。"
    ],
    爱情: [
      "单身样本：今日约有 3% 概率遇见心动对象，其余时间请自娱自乐。",
      "恋爱中的你，今天适合说点真话，或直接发个红包。",
      "缘分信号满格，请珍惜眼前人。",
      "所谓心动，可能是爱情，也可能只是饿了。"
    ],
    健康: [
      "今日建议早睡，虽然大概率做不到。",
      "多喝热水——这句敷衍，但真有用。",
      "颈椎正在求救，请抬头活动一下。",
      "身体是长期资产，别为一时透支。"
    ]
  };

  // 幸运色 / 幸运数字区间 / 幸运方位
  const COLORS = ["五彩斑斓的黑", "透明色", "赛博绿", "落日橙", "高级雾霾蓝", "鸭屎绿", "极光紫", "出厂设置白"];
  const DIRECTIONS = ["西北偏北 30°", "东南方向，靠近奶茶店", "窗边，光线最好处", "老板视线盲区", "冰箱旁 1 米内", "摸鱼区核心地带"];

  // 宜 / 忌（都是抽象版）
  const YI = ["发呆", "喝奶茶", "躺平", "假装努力", "点赞", "做梦"];
  const JI = ["加班", "减肥", "早睡（你做不到）", "立 flag", "开会", "回忆往事"];

  // 一句话预言
  const PROPHECIES = [
    "今日的你，是昨天的你 plus 一杯咖啡因。",
    "别问今天会不会好，问就是会（大概）。",
    "命运系统提示：你已进入好运缓冲期。",
    "低调行事，因为明天你可能会高调。",
    "宇宙的尽头是下班，今天的尽头也是。",
    "如果今天有好事发生，那是我说的；没有也别怪我。",
    "你以为的巧合，其实是命运在后台悄悄改参数。"
  ];

  // ==========================================================
  // 第二部分：种子随机数
  // 重点：同样的“种子”会生成同样的随机序列。
  // 所以我们用【名字+星座+日期】当种子 → 同一天结果固定，这就是“命”。
  // “换一签”则用当前时间当种子 → 等于逆天改命 😂
  // ==========================================================

  // 根据种子生成一个随机函数，每次调用返回 0~1 的小数
  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // 把字符串变成数字（简单的字符串哈希）
  function hashStr(s) {
    let h = 1779033703;
    for (let i = 0; i < s.length; i++) {
      h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return h >>> 0;
  }

  // 今天的日期字符串，例如 "2025年1月1日"
  function todayStr() {
    const d = new Date();
    return d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() + "日";
  }


  function generate(name, zodiac, changeFate = false) {
    // 决定命运的种子
    const seed = changeFate ? Date.now() : hashStr(name + zodiac + todayStr());
    const rand = mulberry32(seed);

    // 两个小工具函数（从 rand 里取值）
    const score = (min, max) => min + Math.floor(rand() * (max - min + 1));
    const pick = arr => arr[Math.floor(rand() * arr.length)];

    // 生成四大项
    const rows = ["财运", "事业", "爱情", "健康"].map(c => ({
      name: c,
      score: score(20, 99),
      comment: pick(COMMENTS[c])
    }));

    // 生成其他玄学信息
    return {
      name, zodiac, rows,
      color: pick(COLORS),
      num: score(1, 99),
      dir: pick(DIRECTIONS),
      yi: pick(YI),
      ji: pick(JI),
      prophecy: pick(PROPHECIES),
      total: Math.round(rows.reduce((s, r) => s + r.score, 0) / rows.length),
      date: todayStr()
    };

  }
  return { generate };
})();
