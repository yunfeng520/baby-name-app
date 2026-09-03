import { BaziCalculation, WuxingElement } from '../types';

export const SHICHEN_LIST = [
  { index: 0, name: '子时 (23:00-01:00)', branch: '子', timeDesc: '夜半子水' },
  { index: 1, name: '丑时 (01:00-03:00)', branch: '丑', timeDesc: '鸡鸣丑土' },
  { index: 2, name: '寅时 (03:00-05:00)', branch: '寅', timeDesc: '平旦寅木' },
  { index: 3, name: '卯时 (05:00-07:00)', branch: '卯', timeDesc: '日出卯木' },
  { index: 4, name: '辰时 (07:00-09:00)', branch: '辰', timeDesc: '食时辰土' },
  { index: 5, name: '巳时 (09:00-11:00)', branch: '巳', timeDesc: '隅中巳火' },
  { index: 6, name: '午时 (11:00-13:00)', branch: '午', timeDesc: '日中午火' },
  { index: 7, name: '未时 (13:00-15:00)', branch: '未', timeDesc: '日昳未土' },
  { index: 8, name: '申时 (15:00-17:00)', branch: '申', timeDesc: '哺时申金' },
  { index: 9, name: '酉时 (17:00-19:00)', branch: '酉', timeDesc: '日入酉金' },
  { index: 10, name: '戌时 (19:00-21:00)', branch: '戌', timeDesc: '黄昏戌土' },
  { index: 11, name: '亥时 (21:00-23:00)', branch: '亥', timeDesc: '人定亥水' },
];

export const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
export const ZODIAC_ANIMALS = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

// 常见复姓列表
export const COMPOUND_SURNAMES = [
  '欧阳', '太史', '端木', '上官', '司马', '东方', '独孤', '南宫', '万俟', '闻人', 
  '夏侯', '诸葛', '尉迟', '公羊', '赫连', '澹台', '皇甫', '宗政', '濮阳', '淳于', 
  '单于', '太叔', '申屠', '公孙', '仲孙', '轩辕', '令狐', '钟离', '宇文', '长孙', 
  '慕容', '鲜于', '闾丘', '司徒', '司空', '亓官', '司寇', '仉督', '子车', '颛孙', 
  '端木', '巫马', '公西', '漆雕', '乐正', '壤驷', '公良', '拓跋', '夹谷', '宰父'
];

export function detectSurname(input: string): { surname: string; remainingName: string; isCompound: boolean } {
  const trimmed = input.trim();
  if (!trimmed) return { surname: '', remainingName: '', isCompound: false };
  for (const compound of COMPOUND_SURNAMES) {
    if (trimmed.startsWith(compound)) {
      return {
        surname: compound,
        remainingName: trimmed.slice(compound.length),
        isCompound: true
      };
    }
  }
  return {
    surname: trimmed.charAt(0),
    remainingName: trimmed.slice(1),
    isCompound: false
  };
}

const STEM_ELEMENT_MAP: Record<string, WuxingElement> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
};

const BRANCH_ELEMENT_MAP: Record<string, WuxingElement> = {
  '子': '水', '丑': '土',
  '寅': '木', '卯': '木',
  '辰': '土', '巳': '火',
  '午': '火', '未': '土',
  '申': '金', '酉': '金',
  '戌': '土', '亥': '水',
};

export function calculateBazi(
  year: number,
  month: number,
  day: number,
  hourIndex: number,
  calendarType: 'solar' | 'lunar' = 'solar'
): BaziCalculation {
  // 年干支计算
  const yearOffset = (year - 4) % 60;
  const yearStem = HEAVENLY_STEMS[(year - 4) % 10];
  const yearBranch = EARTHLY_BRANCHES[(year - 4) % 12];
  const zodiac = ZODIAC_ANIMALS[(year - 4) % 12];

  // 月干支计算（五虎遁）
  // 简易历法计算
  const monthBranchIndex = (month + 1) % 12;
  const monthBranch = EARTHLY_BRANCHES[monthBranchIndex];
  const yearStemIndex = (year - 4) % 10;
  const monthStemBase = ((yearStemIndex % 5) * 2 + 2) % 10;
  const monthStem = HEAVENLY_STEMS[(monthStemBase + month - 1) % 10];

  // 日干支计算（高精度算法）
  // 以2000年1月1日为戊午日（索引）基准
  const baseDate = new Date(2000, 0, 1).getTime();
  const targetDate = new Date(year, month - 1, day).getTime();
  const dayDiff = Math.floor((targetDate - baseDate) / (1000 * 60 * 60 * 24));
  const dayOffset = ((dayDiff + 54) % 60 + 60) % 60;
  const dayStem = HEAVENLY_STEMS[dayOffset % 10];
  const dayBranch = EARTHLY_BRANCHES[dayOffset % 12];

  // 时干支计算（五鼠遁）
  const hourBranch = EARTHLY_BRANCHES[hourIndex % 12];
  const dayStemIndex = HEAVENLY_STEMS.indexOf(dayStem);
  const hourStemBase = ((dayStemIndex % 5) * 2) % 10;
  const hourStem = HEAVENLY_STEMS[(hourStemBase + (hourIndex % 12)) % 10];

  const yearStemBranch = `${yearStem}${yearBranch}`;
  const monthStemBranch = `${monthStem}${monthBranch}`;
  const dayStemBranch = `${dayStem}${dayBranch}`;
  const hourStemBranch = `${hourStem}${hourBranch}`;

  // 统计五行频次 (四柱八字共8个字)
  const elementsCount: Record<WuxingElement, number> = {
    '金': 0,
    '木': 0,
    '水': 0,
    '火': 0,
    '土': 0,
  };

  const stems = [yearStem, monthStem, dayStem, hourStem];
  const branches = [yearBranch, monthBranch, dayBranch, hourBranch];

  for (const s of stems) {
    const el = STEM_ELEMENT_MAP[s];
    if (el) elementsCount[el]++;
  }
  for (const b of branches) {
    const el = BRANCH_ELEMENT_MAP[b];
    if (el) elementsCount[el]++;
  }

  // 判定最旺与最缺
  let maxCount = -1;
  let dominantElement: WuxingElement = '木';
  const lackingElement: WuxingElement[] = [];

  const allElements: WuxingElement[] = ['金', '木', '水', '火', '土'];
  for (const el of allElements) {
    if (elementsCount[el] > maxCount) {
      maxCount = elementsCount[el];
      dominantElement = el;
    }
    if (elementsCount[el] === 0) {
      lackingElement.push(el);
    }
  }

  // 计算喜用神（缺什么补什么，或者耗泄过旺之五行）
  let luckyElements: WuxingElement[] = [];
  if (lackingElement.length > 0) {
    luckyElements = [...lackingElement];
  } else {
    // 找出最弱的一个或两个
    const sorted = [...allElements].sort((a, b) => elementsCount[a] - elementsCount[b]);
    luckyElements = [sorted[0], sorted[1]];
  }

  const hourInfo = SHICHEN_LIST[hourIndex] || SHICHEN_LIST[0];

  const summary = `乾坤纳吉，生辰八字为【${yearStemBranch}年 ${monthStemBranch}月 ${dayStemBranch}日 ${hourStemBranch}时】，五行格局以【${dominantElement}】气最盛，${
    lackingElement.length > 0
      ? `命盘偏缺【${lackingElement.join('、')}】`
      : `五行俱全，需调和【${luckyElements.join('、')}】`
  }。取名当以字根辅弼，达到生克流转、阴阳圆融之境。`;

  return {
    yearStemBranch,
    monthStemBranch,
    dayStemBranch,
    hourStemBranch,
    zodiac,
    solarDate: `${year}年${month}月${day}日`,
    lunarDate: calendarType === 'lunar' ? `农历 ${year}年${month}月${day}日` : `公历 ${year}年${month}月${day}日`,
    hourName: hourInfo.name,
    elementsCount,
    dominantElement,
    lackingElement,
    luckyElements,
    baziSummary: summary,
  };
}
