// ==========================================================
// 农历工具（纯 JS，无依赖）
// 提供：公历 → 农历 / 干支纪年 / 生肖 / 当日节气
// 覆盖范围：1900 - 2100 年（表数据）
// ==========================================================

// 每年的农历数据（1900-2100）：用 hex 位编码闰月与大/小月
const lunarInfo = [
  0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,
  0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,
  0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,
  0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,
  0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,
  0x06ca0,0x0b550,0x15355,0x04da0,0x0a5b0,0x14573,0x052b0,0x0a9a8,0x0e950,0x06aa0,
  0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,
  0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b5a0,0x195a6,
  0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,
  0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x055c0,0x0ab60,0x096d5,0x092e0,
  0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,
  0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,
  0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,
  0x05aa0,0x076a3,0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,
  0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0,
  0x14b63,0x09370,0x049f8,0x04970,0x064b0,0x168a6,0x0ea50,0x06b20,0x1a6c4,0x0aae0,
  0x092e0,0x0d2e3,0x0c960,0x0d557,0x0d4a0,0x0da50,0x05d55,0x056a0,0x0a6d0,0x055d4,
  0x052d0,0x0a9b8,0x0a950,0x0b4a0,0x0b6a6,0x0ad50,0x055a0,0x0aba4,0x0a5b0,0x052b0,
  0x0b273,0x06930,0x07337,0x06aa0,0x0ad50,0x14b55,0x04b60,0x0a570,0x054e4,0x0d160,
  0x0e968,0x0d520,0x0daa0,0x16aa6,0x056d0,0x04ae0,0x0a9d4,0x0a2d0,0x0d150,0x0f252,
  0x0d520
];

// 天干 / 地支 / 生肖
const GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const ZODIAC = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];

// 农历月份名 / 日期个数词
const MONTH_CN = ['正','二','三','四','五','六','七','八','九','十','冬','腊'];
const DAY_CN_N = ['日','一','二','三','四','五','六','七','八','九','十'];
const DAY_CN_P = ['初','十','廿','卅'];

// 二十四节气名（按 index 0-23 对应）
const TERMS = ['小寒','大寒','立春','雨水','惊蛰','春分','清明','谷雨','立夏','小满','芒种','夏至','小暑','大暑','立秋','处暑','白露','秋分','寒露','霜降','立冬','小雪','大雪','冬至'];

// ---------- 基础：某年农历总天数 / 闰月 / 某月天数 ----------
function lYearDays(y) {
  let sum = 348;
  const info = lunarInfo[y - 1900];
  for (let i = 0x8000; i > 0x8; i >>= 1) sum += (info & i) ? 1 : 0;
  // 别忘了：加上这一年的闰月天数
  return sum + leapDays(y);
}
function leapMonth(y) { return lunarInfo[y - 1900] & 0xf; }
function leapDays(y) {
  if (!leapMonth(y)) return 0;
  return (lunarInfo[y - 1900] & 0x10000) ? 30 : 29;
}
function monthDays(y, m) {
  return (lunarInfo[y - 1900] & (0x10000 >> m)) ? 30 : 29;
}

// ---------- 公历 → 农历 ----------
function solar2lunar(y, m, d) {
  // 1900-01-31 是农历 1900 年正月初一，以此为基准，offset 表示“距基准多少天”
  // （offset = 0 表示农历初一日）
  let offset = (Date.UTC(y, m - 1, d) - Date.UTC(1900, 0, 31)) / 86400000;

  // 第一步：确定农历年份 —— 一年一年减去整年天数
  let year = 1900;
  while (year < 2101 && offset >= lYearDays(year)) {
    offset -= lYearDays(year);
    year++;
  }

  // 现在 offset 是“当前农历年内的第几-1天”（0 = 初一）
  const leap = leapMonth(year);

  // 第二步：逐月定位 —— 按 1..12 月走，若该年有闰月，则在其后插入闰月
  let month = 1, isLeap = false;
  for (let mi = 1; mi <= 12; mi++) {
    // 普通月
    const mDays = monthDays(year, mi);
    if (offset >= mDays) offset -= mDays;
    else { month = mi; isLeap = false; break; }
    // 若这个月后面跟着闰月
    if (leap === mi) {
      const lDays = leapDays(year);
      if (offset >= lDays) offset -= lDays;
      else { month = mi; isLeap = true; break; }
    }
  }

  const day = offset + 1;
  return { year, month, day, isLeap };
}

// ---------- 农历月 / 日的中文描述 ----------
function monthCn(month) { return MONTH_CN[month - 1] + '月'; }
function dayCn(day) {
  if (day === 10) return '初十';
  if (day === 20) return '二十';
  if (day === 30) return '三十';
  return DAY_CN_P[Math.floor(day / 10)] + DAY_CN_N[day % 10];
}

// ---------- 干支纪年 + 生肖 ----------
function yearGanZhi(lunarYear) {
  const gan = GAN[(lunarYear - 4) % 10];
  const zhi = ZHI[(lunarYear - 4) % 12];
  return { gan, zhi, zodiac: ZODIAC[(lunarYear - 4) % 12] };
}

// ---------- 节气（当日所处的节气） ----------
const TERM_BASE = [0,21208,42467,63836,85337,107014,128867,150921,173149,195551,218072,240693,
  263343,285989,308563,331033,353350,375494,397447,419210,440795,462224,483532,504758];

// 某年第 n 个节气（index 0-23）的公历日期
function termDay(y, n) {
  const off = new Date(31556925974.7 * (y - 1900) + TERM_BASE[n] * 60000 + Date.UTC(1900, 0, 6, 2, 5));
  return off.getUTCDate();
}

// 获取 y 年 m 月 d 日所处的节气名（无则返回 ''）
function getTermName(y, m, d) {
  const today = new Date(y, m - 1, d);
  let found = '', foundDate = null;
  // 遍历今年与上一年的全部 24 个节气，取“最近一次已发生”的那一个
  for (const yy of [y, y - 1]) {
    for (let n = 0; n < 24; n++) {
      const tMonth = Math.floor(n / 2) + 1;
      const tDay = termDay(yy, n);
      const termDate = new Date(yy, tMonth - 1, tDay);
      if (termDate <= today && (!foundDate || termDate > foundDate)) {
        found = TERMS[n];
        foundDate = termDate;
      }
    }
  }
  return found;
}

// ---------- 对外：某个公历日期的农历“一页”信息 ----------
function lunarDate(y, m, d) {
  const l = solar2lunar(y, m, d);
  const gz = yearGanZhi(l.year);
  return {
    y, m, d,
    lunarYear: l.year,
    lunarMonth: l.month,
    lunarDay: l.day,
    isLeap: l.isLeap,
    monthCn: monthCn(l.month),
    dayCn: dayCn(l.day),
    gan: gz.gan,
    zhi: gz.zhi,
    zodiac: gz.zodiac,
    term: getTermName(y, m, d)
  };
}

// ==========================================================
// 八字（四柱）
// 年柱以“立春”为界，月柱以“十二节”为界，日柱用 60 甲子循环，时柱按时辰。
// ==========================================================

// 天干五行 / 地支五行
const GAN_WX = { 甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水' };
const ZHI_WX = { 子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水' };

// 排四柱：y 年 m 月 d 日（公历），hour 可省略（0-23，缺省则不算时柱）
function bazi(y, m, d, hour) {
  // ---- 年柱：以立春（2 月的节气 index=2）为界 ----
  const lichunDay = termDay(y, 2);
  const yearEff = (m < 2 || (m === 2 && d < lichunDay)) ? y - 1 : y;
  const yearGanIdx = (yearEff - 4) % 10;      // 命理年干的索引
  const yearZhiIdx = (yearEff - 4) % 12;      // 命理年支的索引
  const yearPillar = { gan: GAN[yearGanIdx], zhi: ZHI[yearZhiIdx] };

  // ---- 月柱：以“十二节”（偶数序号节气）为界 ----
  // 节的奇数倍：小寒0 立春2 惊蛰4 清明6 立夏8 芒种10 小暑12 立秋14 白露16 寒露18 立冬20 大雪22
  const birth = new Date(y, m - 1, d);
  let jieIdx = 0, got = false;
  for (let yy = y; yy >= y - 1 && !got; yy--) {
    for (let k = 22; k >= 0; k -= 2) {   // 从大雪往回找“最近已过”的节
      const tMonth = Math.floor(k / 2) + 1;
      const tDay = termDay(yy, k);
      const termDate = new Date(yy, tMonth - 1, tDay);
      if (termDate <= birth) { jieIdx = k; got = true; break; }
    }
  }
  const monthZhi = (jieIdx / 2 + 1) % 12;             // 月支索引（0=子）
  const monthStem = ((yearGanIdx * 2 + 2) % 10 + ((monthZhi - 2 + 12) % 12)) % 10; // 五虎遁
  const monthPillar = { gan: GAN[monthStem], zhi: ZHI[monthZhi] };

  // ---- 日柱：1900-01-01 为甲戌日（60 甲子索引 10）----
  const days = (Date.UTC(y, m - 1, d) - Date.UTC(1900, 0, 1)) / 86400000;
  const dayIdx = (((days + 10) % 60) + 60) % 60;
  const dayPillar = { gan: GAN[dayIdx % 10], zhi: ZHI[dayIdx % 12] };

  // ---- 时柱：可选，按“五鼠遁” ----
  let hourPillar = null;
  if (hour !== undefined && hour !== null && hour !== '') {
    const h = Math.floor((hour + 1) / 2) % 12;        // 时序（0=子）
    const hourStem = (dayIdx % 10 * 2 % 10 + h) % 10; // 五鼠遁：子时干=日干*2
    hourPillar = { gan: GAN[hourStem], zhi: ZHI[h] };
  }

  return { year: yearPillar, month: monthPillar, day: dayPillar, hour: hourPillar, zodiac: ZODIAC[yearZhiIdx] };
}

// 四柱 + 五行统计（金木水火土出现次数）
function baziDetail(y, m, d, hour) {
  const p = bazi(y, m, d, hour);
  const chars = [p.year.gan, p.year.zhi, p.month.gan, p.month.zhi, p.day.gan, p.day.zhi];
  if (p.hour) chars.push(p.hour.gan, p.hour.zhi);
  const count = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  for (const ch of chars) {
    if (GAN_WX[ch]) count[GAN_WX[ch]]++;
    if (ZHI_WX[ch]) count[ZHI_WX[ch]]++;
  }
  return { pillars: p, wuxing: count };
}

// 暴露到全局
if (typeof window !== 'undefined') window.lunar = { solar2lunar, monthCn, dayCn, yearGanZhi, getTermName, lunarDate, bazi, baziDetail };
if (typeof module !== 'undefined' && module.exports) module.exports = { solar2lunar, monthCn, dayCn, yearGanZhi, getTermName, lunarDate, bazi, baziDetail };
