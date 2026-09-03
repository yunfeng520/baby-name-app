/**
 * 锦绣良名 · 新生儿国风智能臻选工坊 - 类型定义
 */

export type Gender = 'boy' | 'girl' | 'neutral';
export type CalendarType = 'solar' | 'lunar';
export type CharCountPreference = 'single' | 'double' | 'any';
export type WuxingElement = '金' | '木' | '水' | '火' | '土';

export interface BaziCalculation {
  yearStemBranch: string;
  monthStemBranch: string;
  dayStemBranch: string;
  hourStemBranch: string;
  zodiac: string; // 生肖
  solarDate: string;
  lunarDate: string;
  hourName: string; // 时辰，如辰时
  elementsCount: Record<WuxingElement, number>;
  dominantElement: WuxingElement;
  lackingElement: WuxingElement[];
  luckyElements: WuxingElement[];
  baziSummary: string;
}

export interface CharacterDetail {
  char: string;
  pinyin: string;
  tone: string; // 阴平/阳平/上声/去声
  radical: string; // 部首
  strokeCount: number; // 康熙字典笔画
  element: WuxingElement; // 五行属性
  definition: string; // 字义详解
}

export interface PoemSource {
  title: string;
  author: string;
  dynasty: string;
  quote: string; // 出处原句
  modernTranslation: string; // 白话译意
}

export interface SancaiWuge {
  sancai: string; // 三才配置，如：木火土
  sancaiFortune: '大吉' | '吉' | '中吉' | '平' | '凶';
  tiange: number;
  tiangeFortune: string;
  renge: number;
  rengeFortune: string;
  dige: number;
  digeFortune: string;
  waige: number;
  waigeFortune: string;
  zongge: number;
  zonggeFortune: string;
  analysis: string; // 数理综述
}

export interface RadarScores {
  rhythm: number; // 音律之美 (0-100)
  culture: number; // 文化底蕴 (0-100)
  distinction: number; // 辨识度/少重名 (0-100)
  wuxingFit: number; // 五行契合 (0-100)
  auspicious: number; // 吉祥数理 (0-100)
}

export interface HomophoneCheck {
  riskLevel: '极低' | '低' | '中' | '高';
  homophoneWords: string[]; // 潜在同音或谐音词
  advice: string;
}

export interface DuplicateRateAnalysis {
  popularityRank: string; // 如：全国百千分位排名
  duplicateEstimate: string; // 重名预警指数
  advice: string;
}

export interface CuratedName {
  id: string;
  name: string; // 全名
  surname: string;
  givenName: string;
  pinyin: string[]; // ['lín', 'jǐng', 'yuān']
  tones: string[]; // ['平', '仄', '平']
  characters: CharacterDetail[];
  poemSource: PoemSource;
  comprehensiveMeaning: string; // 名字核心寓意
  characterBlessing: string; // 品德性格寄托
  academicCareerBlessing: string; // 学业事业前程寄托
  radarScores: RadarScores;
  overallScore: number; // 综合名理得分 (85-99)
  sancaiWuge: SancaiWuge;
  homophoneCheck: HomophoneCheck;
  duplicateRateAnalysis: DuplicateRateAnalysis;
  isVipOnly: boolean; // 是否专属VIP名字
}

export interface NamingRequestPayload {
  surname: string;
  gender: Gender;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHourIndex: number; // 0-11 对应子丑寅卯...
  calendarType: CalendarType;
  culturalStyles: string[]; // ['诗经典雅', '楚辞芳华', ...]
  familyGenerationChar?: string; // 家族字辈
  familyCharPosition?: 'middle' | 'end';
  charCountPreference: CharCountPreference;
  avoidHarmfulHomophones: boolean;
  vipUnlocked: boolean;
}

export interface NamingResponseData {
  bazi: BaziCalculation;
  names: CuratedName[];
  generatedAt: string;
  quotaRemaining?: number;
}

export interface NameAppraisalRequest {
  fullName: string;
  gender: Gender;
  birthDate?: string;
  birthHour?: string;
}

export interface NameAppraisalResult {
  fullName: string;
  surname: string;
  givenName: string;
  overallScore: number;
  characters: CharacterDetail[];
  radarScores: RadarScores;
  sancaiWuge: SancaiWuge;
  homophoneRisk: {
    level: '极低' | '低' | '中' | '高';
    description: string;
  };
  rhythmAnalysis: {
    pingze: string;
    flowScore: number;
    comment: string;
  };
  wuxingMatch: {
    dominantElements: string[];
    compatibilityScore: number;
    comment: string;
  };
  duplicateIndex: {
    level: string;
    countEstimatePerMillion: number;
    comment: string;
  };
  classicalEcho?: {
    poem: string;
    source: string;
  };
  expertAdvice: string;
}
