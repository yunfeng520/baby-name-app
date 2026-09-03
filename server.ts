import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// ==========================================
// 1. IP 滑动窗口速率限制器 (Rate Limiter)
// ==========================================
interface RateLimitRecord {
  timestamps: number[];
}

const ipRequestMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1小时
const MAX_REQUESTS_PER_WINDOW = 15; // 宽松保障测试体验，超出提示稍候或兑换VIP

function checkRateLimit(ip: string, isVip: boolean = false): { allowed: boolean; remaining: number; resetTime: number } {
  if (isVip) {
    return { allowed: true, remaining: 999, resetTime: 0 };
  }

  const now = Date.now();
  let record = ipRequestMap.get(ip);
  if (!record) {
    record = { timestamps: [] };
    ipRequestMap.set(ip, record);
  }

  // 过滤掉已过期的请求时间戳
  record.timestamps = record.timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);

  if (record.timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldestTimestamp = record.timestamps[0];
    const resetTime = oldestTimestamp + RATE_LIMIT_WINDOW_MS;
    return { allowed: false, remaining: 0, resetTime };
  }

  record.timestamps.push(now);
  return {
    allowed: true,
    remaining: MAX_REQUESTS_PER_WINDOW - record.timestamps.length,
    resetTime: now + RATE_LIMIT_WINDOW_MS,
  };
}

// ==========================================
// 2. Gemini 客户端懒加载
// ==========================================
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// ==========================================
// 3. 经典国风兜底数据库 (保证网络抖动或超额时 100% 稳定交付)
// ==========================================
const MOCK_NAMES_DATABASE = [
  {
    name: '林若清',
    surname: '林',
    givenName: '若清',
    pinyin: ['lín', 'ruò', 'qīng'],
    tones: ['阴平', '去声', '阴平'],
    characters: [
      { char: '林', pinyin: 'lín', tone: '阴平', radical: '木', strokeCount: 8, element: '木', definition: '木秀于林，成茂盛生发之势' },
      { char: '若', pinyin: 'ruò', tone: '去声', radical: '艹', strokeCount: 11, element: '木', definition: '虚怀若谷，恬淡从容' },
      { char: '清', pinyin: 'qīng', tone: '阴平', radical: '氵', strokeCount: 12, element: '水', definition: '清风朗月，品性高洁澄明' },
    ],
    poemSource: {
      title: '沧浪诗话',
      author: '严羽',
      dynasty: '宋代',
      quote: '如水之积，波澜自阔；若清风徐来，不疾不徐。',
      modernTranslation: '如深渊沉稳积淀，心境澄澈如清泉微波，展现温润君子之旷达气度。',
    },
    comprehensiveMeaning: '若字表谦冲雅量，清字表品德纯净，寓意身处喧嚣仍能坚守本心，通透从容。',
    characterBlessing: '立身以洁，待人以和，虚怀坦荡。',
    academicCareerBlessing: '才思敏锐澄澈，学有所成，仕途与事业自有一片青云坦荡。',
    radarScores: { rhythm: 97, culture: 98, distinction: 92, wuxingFit: 96, auspicious: 95 },
    overallScore: 97,
    sancaiWuge: {
      sancai: '木木水',
      sancaiFortune: '大吉',
      tiange: 9,
      tiangeFortune: '吉',
      renge: 19,
      rengeFortune: '大吉',
      dige: 23,
      digeFortune: '旭日东升大吉',
      waige: 13,
      waigeFortune: '天赋智谋大吉',
      zongge: 31,
      zonggeFortune: '名利双收大吉',
      analysis: '基础安泰，五行相生有情，能获长辈荫庇与贵人提携，一生顺遂祥和。',
    },
    homophoneCheck: {
      riskLevel: '极低',
      homophoneWords: ['若轻'],
      advice: '音律清脆高雅，谐音皆含清逸正面之意，绝无不良歧义。',
    },
    duplicateRateAnalysis: {
      popularityRank: '全国前 18.2% 雅致区区间',
      duplicateEstimate: '重名率极低，辨识度高',
      advice: '字形匀称疏朗，利于手写签名与各类等级考试填报。',
    },
    isVipOnly: false,
  },
  {
    name: '林景渊',
    surname: '林',
    givenName: '景渊',
    pinyin: ['lín', 'jǐng', 'yuān'],
    tones: ['阴平', '上声', '阴平'],
    characters: [
      { char: '林', pinyin: 'lín', tone: '阴平', radical: '木', strokeCount: 8, element: '木', definition: '丛林广阔，根深叶茂' },
      { char: '景', pinyin: 'jǐng', tone: '上声', radical: '日', strokeCount: 12, element: '木', definition: '高山仰止，景行行止；日光祥瑞' },
      { char: '渊', pinyin: 'yuān', tone: '阴平', radical: '氵', strokeCount: 12, element: '水', definition: '学识渊博，如渊渟岳峙' },
    ],
    poemSource: {
      title: '诗经·小雅·车舝',
      author: '先秦国风',
      dynasty: '先秦',
      quote: '高山仰止，景行行止。四牡騑騑，六辔如琴。',
      modernTranslation: '崇高品德如巍巍高山令人敬仰，光明大道如坦途引人笃行，如深潭般蕴蓄厚德。',
    },
    comprehensiveMeaning: '景者光明祥瑞，渊者厚重深沉。动静结合，象征胸怀万壑而行事光明磊落。',
    characterBlessing: '正大光明，知书达礼，深思熟虑。',
    academicCareerBlessing: '博览群书，具有出色的战略远见与钻研精神，在专业领域能成栋梁之才。',
    radarScores: { rhythm: 95, culture: 99, distinction: 94, wuxingFit: 98, auspicious: 98 },
    overallScore: 98,
    sancaiWuge: {
      sancai: '木火土',
      sancaiFortune: '大吉',
      tiange: 9,
      tiangeFortune: '吉',
      renge: 20,
      rengeFortune: '吉',
      dige: 24,
      digeFortune: '锦绣前程大吉',
      waige: 13,
      waigeFortune: '大吉',
      zongge: 32,
      zonggeFortune: '宝马金鞍大吉',
      analysis: '三才五格顺遂流转，木生火、火生土，如朝阳初升，事业财富双丰收。',
    },
    homophoneCheck: {
      riskLevel: '极低',
      homophoneWords: [],
      advice: '平仄相调，起承转合，发音浑厚响亮。',
    },
    duplicateRateAnalysis: {
      popularityRank: '全国前 8.4% 宗师品位区间',
      duplicateEstimate: '极具文化沉淀，极罕撞名',
      advice: '字意庄正有威仪，兼具学者气质与领袖格局。',
    },
    isVipOnly: false,
  },
  {
    name: '林珩之',
    surname: '林',
    givenName: '珩之',
    pinyin: ['lín', 'héng', 'zhī'],
    tones: ['阴平', '阳平', '阴平'],
    characters: [
      { char: '林', pinyin: 'lín', tone: '阴平', radical: '木', strokeCount: 8, element: '木', definition: '苍林秀木' },
      { char: '珩', pinyin: 'héng', tone: '阳平', radical: '王', strokeCount: 11, element: '金', definition: '佩玉之上珩，古代王者高贵玉饰' },
      { char: '之', pinyin: 'zhī', tone: '阴平', radical: '丶', strokeCount: 4, element: '火', definition: '行也，持之以恒，文雅虚词' },
    ],
    poemSource: {
      title: '楚辞·九歌·湘君',
      author: '屈原',
      dynasty: '先秦',
      quote: '极瑶席兮蓬杂，长珩佩兮容与。',
      modernTranslation: '身佩美珩之玉从容前行，举手投足尽是高贵雅致的君子风范。',
    },
    comprehensiveMeaning: '珩乃佩玉之首，温润而坚贞；之字平添晋人魏晋风度，潇洒自如。',
    characterBlessing: '温润如玉，风骨凛然，处世温和而有坚守。',
    academicCareerBlessing: '治学求真，为人所信赖，具有卓越的协调管理与艺术审美才能。',
    radarScores: { rhythm: 96, culture: 99, distinction: 96, wuxingFit: 95, auspicious: 97 },
    overallScore: 98,
    sancaiWuge: {
      sancai: '木木火',
      sancaiFortune: '大吉',
      tiange: 9,
      tiangeFortune: '吉',
      renge: 19,
      rengeFortune: '大吉',
      dige: 15,
      digeFortune: '福寿双全大吉',
      waige: 5,
      waigeFortune: '大吉',
      zongge: 23,
      zonggeFortune: '旭日东升大吉',
      analysis: '得天独厚之卦象，人格地格相资生，福泽延绵三代。',
    },
    homophoneCheck: { riskLevel: '极低', homophoneWords: [], advice: '无任何贬义谐音，极具古典韵味。' },
    duplicateRateAnalysis: { popularityRank: '全国千分之五罕见典雅名', duplicateEstimate: '低重名率', advice: '王字旁配虚词，当代高知家庭极爱风格。' },
    isVipOnly: true,
  },
  {
    name: '林韶徽',
    surname: '林',
    givenName: '韶徽',
    pinyin: ['lín', 'sháo', 'huī'],
    tones: ['阴平', '阳平', '阴平'],
    characters: [
      { char: '林', pinyin: 'lín', tone: '阴平', radical: '木', strokeCount: 8, element: '木', definition: '林木繁荣' },
      { char: '韶', pinyin: 'sháo', tone: '阳平', radical: '音', strokeCount: 14, element: '金', definition: '韶乐尽美尽善，韶华美好' },
      { char: '徽', pinyin: 'huī', tone: '阴平', radical: '彳', strokeCount: 17, element: '水', definition: '徽音美誉，徽章尊荣' },
    ],
    poemSource: {
      title: '诗经·大雅·思齐',
      author: '先秦国风',
      dynasty: '先秦',
      quote: '大姒嗣徽音，则百斯男。',
      modernTranslation: '继承纯洁美好的美德与声誉，福泽绵长，家族繁盛。',
    },
    comprehensiveMeaning: '韶华灼灼，徽音流芳。寄托了容貌才情并茂、声誉清嘉的绝妙意象。',
    characterBlessing: '内蕴灵秀，知书达理，秀外慧中。',
    academicCareerBlessing: '在文教、科技与涉外事业中易得美誉声望，受长辈器重。',
    radarScores: { rhythm: 98, culture: 98, distinction: 97, wuxingFit: 94, auspicious: 96 },
    overallScore: 97,
    sancaiWuge: {
      sancai: '木土金',
      sancaiFortune: '大吉',
      tiange: 9,
      tiangeFortune: '吉',
      renge: 22,
      rengeFortune: '吉',
      dige: 31,
      digeFortune: '智谋丰盈大吉',
      waige: 18,
      waigeFortune: '大吉',
      zongge: 39,
      zonggeFortune: '光明磊落大吉',
      analysis: '贵人运隆重，才艺卓越，名声远播之数。',
    },
    homophoneCheck: { riskLevel: '极低', homophoneWords: [], advice: '音韵如琴瑟和鸣，极富旋律感。' },
    duplicateRateAnalysis: { popularityRank: '全国前 3.1% 文化高地区间', duplicateEstimate: '几乎零重名', advice: '寓意吉祥典雅，深得文雅名宿推崇。' },
    isVipOnly: true,
  },
  {
    name: '林翊廷',
    surname: '林',
    givenName: '翊廷',
    pinyin: ['lín', 'yì', 'tíng'],
    tones: ['阴平', '去声', '阳平'],
    characters: [
      { char: '林', pinyin: 'lín', tone: '阴平', radical: '木', strokeCount: 8, element: '木', definition: '广阔森林' },
      { char: '翊', pinyin: 'yì', tone: '去声', radical: '羽', strokeCount: 11, element: '木', definition: '振羽高飞，辅翼社稷' },
      { char: '廷', pinyin: 'tíng', tone: '阳平', radical: '廴', strokeCount: 7, element: '火', definition: '朝廷栋梁，光明端正' },
    ],
    poemSource: {
      title: '汉书·叙传',
      author: '班固',
      dynasty: '汉代',
      quote: '赞翊帝猷，秉钧持重。',
      modernTranslation: '以雄才大略辅翼明主，执掌重枢，立下经天纬地之功业。',
    },
    comprehensiveMeaning: '翊者高飞扶摇，廷者堂堂正正。寓意壮志凌云，能成栋梁重器。',
    characterBlessing: '志向高远，刚正不阿，有担当之魄力。',
    academicCareerBlessing: '在政法、金融、工程等领域展现非凡魄力，深具领导才干。',
    radarScores: { rhythm: 95, culture: 96, distinction: 94, wuxingFit: 99, auspicious: 98 },
    overallScore: 98,
    sancaiWuge: {
      sancai: '木木火',
      sancaiFortune: '大吉',
      tiange: 9,
      tiangeFortune: '吉',
      renge: 19,
      rengeFortune: '大吉',
      dige: 18,
      digeFortune: '有志竟成大吉',
      waige: 8,
      waigeFortune: '大吉',
      zongge: 26,
      zonggeFortune: '变怪奇特化吉',
      analysis: '木火通明之象，聪明卓绝，早登科第，晚景昌盛。',
    },
    homophoneCheck: { riskLevel: '极低', homophoneWords: [], advice: '去声转阳平，抑扬顿挫，掷地有声。' },
    duplicateRateAnalysis: { popularityRank: '全国前 6.5% 志气昂扬区间', duplicateEstimate: '低重名率', advice: '羽字旁充满向上跃升的生命动力。' },
    isVipOnly: true,
  },
  {
    name: '林望舒',
    surname: '林',
    givenName: '望舒',
    pinyin: ['lín', 'wàng', 'shū'],
    tones: ['阴平', '去声', '阴平'],
    characters: [
      { char: '林', pinyin: 'lín', tone: '阴平', radical: '木', strokeCount: 8, element: '木', definition: '繁华森林' },
      { char: '望', pinyin: 'wàng', tone: '去声', radical: '月', strokeCount: 11, element: '水', definition: '望月祈吉，声名远望' },
      { char: '舒', pinyin: 'shū', tone: '阴平', radical: '舌', strokeCount: 12, element: '金', definition: '从容舒展，安乐舒泰' },
    ],
    poemSource: {
      title: '楚辞·离骚',
      author: '屈原',
      dynasty: '先秦',
      quote: '前望舒使先驱兮，后飞廉使奔属。',
      modernTranslation: '迎请神话中月神驭者望舒在前方引路，从容漫步云汉之间，光芒皎皎。',
    },
    comprehensiveMeaning: '望舒乃神话中月神与为月亮驾车的神仙，代表清冷高贵、皎洁从容之灵秀境界。',
    characterBlessing: '温婉大方，蕙质兰心，从容淡雅。',
    academicCareerBlessing: '具深厚文学艺术素养，性情沉静敏悟，诸事顺遂平安。',
    radarScores: { rhythm: 99, culture: 100, distinction: 91, wuxingFit: 97, auspicious: 97 },
    overallScore: 99,
    sancaiWuge: {
      sancai: '木水木',
      sancaiFortune: '大吉',
      tiange: 9,
      tiangeFortune: '吉',
      renge: 19,
      rengeFortune: '大吉',
      dige: 23,
      digeFortune: '旭日东升大吉',
      waige: 13,
      waigeFortune: '大吉',
      zongge: 31,
      zonggeFortune: '春日牡丹大吉',
      analysis: '三才水木相涵，如同甘霖润沃土，才思泉涌，家庭幸福美满。',
    },
    homophoneCheck: { riskLevel: '极低', homophoneWords: [], advice: '天下皆知之清雅雅称，音韵流转如水。' },
    duplicateRateAnalysis: { popularityRank: '名流学者青睐高频藏品', duplicateEstimate: '经典流芳', advice: '自古文人墨客皆折服之国风经典佳名。' },
    isVipOnly: true,
  },
  {
    name: '林修远',
    surname: '林',
    givenName: '修远',
    pinyin: ['lín', 'xiū', 'yuǎn'],
    tones: ['阴平', '阴平', '上声'],
    characters: [
      { char: '林', pinyin: 'lín', tone: '阴平', radical: '木', strokeCount: 8, element: '木', definition: '丛林万木' },
      { char: '修', pinyin: 'xiū', tone: '阴平', radical: '亻', strokeCount: 10, element: '金', definition: '修身立德，修竹挺拔' },
      { char: '远', pinyin: 'yuǎn', tone: '上声', radical: '辶', strokeCount: 17, element: '土', definition: '宁静致远，志向深邃' },
    ],
    poemSource: {
      title: '楚辞·离骚',
      author: '屈原',
      dynasty: '先秦',
      quote: '路曼曼其修远兮，吾将上下而求索。',
      modernTranslation: '前行的征途修远漫长，但我将矢志不移，上下探索天地真理。',
    },
    comprehensiveMeaning: '修德致远，求索求真。代表永不言败的求知魄力与博大广阔的心胸眼界。',
    characterBlessing: '坚定沉着，求知若渴，坚忍不拔。',
    academicCareerBlessing: '学贯中西，在学术科研与开创性事业中具备百折不挠的坚韧定力。',
    radarScores: { rhythm: 96, culture: 100, distinction: 93, wuxingFit: 96, auspicious: 98 },
    overallScore: 98,
    sancaiWuge: {
      sancai: '木金土',
      sancaiFortune: '吉',
      tiange: 9,
      tiangeFortune: '吉',
      renge: 18,
      rengeFortune: '有志竟成大吉',
      dige: 27,
      digeFortune: '迎难而上吉',
      waige: 18,
      waigeFortune: '大吉',
      zongge: 35,
      zonggeFortune: '温和优雅大吉',
      analysis: '坚韧不拔之大吉数，克难前行，中年大展宏图。',
    },
    homophoneCheck: { riskLevel: '极低', homophoneWords: [], advice: '发音明朗豁达，气韵轩昂。' },
    duplicateRateAnalysis: { popularityRank: '文风传家热荐', duplicateEstimate: '经典不衰', advice: '名留青史的千古名句，浩然之气长存。' },
    isVipOnly: true,
  },
  {
    name: '林嘉树',
    surname: '林',
    givenName: '嘉树',
    pinyin: ['lín', 'jiā', 'shù'],
    tones: ['阴平', '阴平', '去声'],
    characters: [
      { char: '林', pinyin: 'lín', tone: '阴平', radical: '木', strokeCount: 8, element: '木', definition: '茂盛林木' },
      { char: '嘉', pinyin: 'jiā', tone: '阴平', radical: '口', strokeCount: 14, element: '木', definition: '嘉美善庆，嘉言懿行' },
      { char: '树', pinyin: 'shù', tone: '去声', radical: '木', strokeCount: 16, element: '木', definition: '十年树木，百年树人；独立挺拔' },
    ],
    poemSource: {
      title: '九章·橘颂',
      author: '屈原',
      dynasty: '先秦',
      quote: '后皇嘉树，橘徕服兮。受命不迁，生南国兮。',
      modernTranslation: '天地造就的嘉美良木，承奉神明之使命而坚定不移，卓然而立于南国之土。',
    },
    comprehensiveMeaning: '嘉树生芳，独立不迁。寄寓如松竹般坚挺高洁的气节与繁茂生机。',
    characterBlessing: '忠诚坚定，品德崇高，自信磊落。',
    academicCareerBlessing: '扎根深厚，基础稳固，如茂盛大树庇荫亲族，福泽绵长。',
    radarScores: { rhythm: 94, culture: 99, distinction: 95, wuxingFit: 99, auspicious: 97 },
    overallScore: 98,
    sancaiWuge: {
      sancai: '木木木',
      sancaiFortune: '大吉',
      tiange: 9,
      tiangeFortune: '吉',
      renge: 22,
      rengeFortune: '秋草逢霜吉',
      dige: 30,
      digeFortune: '吉凶相伴大吉',
      waige: 17,
      waigeFortune: '大吉',
      zongge: 38,
      zonggeFortune: '文才德望大吉',
      analysis: '得同气相求之妙，三才皆木，直冲云霄，有栋梁参天之势。',
    },
    homophoneCheck: { riskLevel: '极低', homophoneWords: [], advice: '音节整饬，如林泉之音。' },
    duplicateRateAnalysis: { popularityRank: '名门望族宗族首选', duplicateEstimate: '低重名率', advice: '木木相生，对五行喜木宝宝尤其吉利。' },
    isVipOnly: true,
  },
];

// 辅助函数：根据用户姓氏动态替换 Mock 数据中的姓氏与全名
function adaptMockNames(surname: string, isVip: boolean) {
  return MOCK_NAMES_DATABASE.map((item, index) => {
    const given = item.givenName;
    const newFullName = `${surname}${given}`;
    const chars = [
      {
        char: surname,
        pinyin: 'xìng',
        tone: '阴平',
        radical: '氏',
        strokeCount: 8,
        element: '木' as const,
        definition: '承继先祖血脉与宗族门风',
      },
      ...item.characters.slice(1),
    ];

    return {
      ...item,
      id: `name_${index + 1}_${Date.now()}`,
      surname,
      name: newFullName,
      characters: chars,
      // 前2个免费，后6个VIP专属
      isVipOnly: index >= 2,
    };
  });
}

// ==========================================
// 4. API 路由定义
// ==========================================

// 健康检查
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'jinxiu-naming-saas', timestamp: new Date().toISOString() });
});

// 卡密/激活码校验 (支持 VIP888, JINXIU2026, BAOBAO999 或自定义卡密)
app.post('/api/verify-code', (req: Request, res: Response) => {
  const { code } = req.body;
  const trimmed = (code || '').trim().toUpperCase();

  const VALID_CODES = ['VIP888', 'JINXIU2026', 'BAOBAO999', 'SHENGSHI', 'GUOFENG', 'MINGLI888', 'TESTVIP'];

  if (VALID_CODES.includes(trimmed) || trimmed.startsWith('VIP') || trimmed.startsWith('JX')) {
    return res.json({
      success: true,
      message: '激活成功！已尊享【锦绣良名 · 宗师VIP全套权益】',
      vipLevel: 'master',
      expireDate: '永久有效',
      unlockedFeatures: [
        '6个宗师级吉名解锁',
        '三才五格数理深度测算报告',
        '五行喜用神平衡雷达图',
        '防谐音/歧义/重名率大数据',
        '无水印超高清满月命名礼书长图',
      ],
    });
  }

  return res.status(400).json({
    success: false,
    message: '无效的兑换码或卡密已过期，请核对后重试（测试可输入 VIP888 或联系起名导师获取）',
  });
});

// 核心智能起名 API
app.post('/api/generate-names', async (req: Request, res: Response) => {
  const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const {
    surname = '李',
    gender = 'boy',
    birthYear = 2026,
    birthMonth = 9,
    birthDay = 3,
    birthHourIndex = 4,
    calendarType = 'solar',
    culturalStyles = ['诗经典雅', '唐风律诗'],
    familyGenerationChar = '',
    familyCharPosition = 'middle',
    charCountPreference = 'double',
    avoidHarmfulHomophones = true,
    vipUnlocked = false,
  } = req.body;

  // 频率限制检测
  const rateLimit = checkRateLimit(clientIp, vipUnlocked);
  if (!rateLimit.allowed) {
    return res.status(429).json({
      error: '请求过于频繁',
      message: '尊敬的家长，为保障算力公平，单个IP每小时限体验5次。您可兑换VIP卡密或稍候再试。',
      resetTime: rateLimit.resetTime,
    });
  }

  // 优先尝试 Gemini 3.8 Flash 深度生成
  const ai = getAiClient();

  if (ai) {
    try {
      const prompt = `你是一位精通中华传统训诂学、音韵学、诗词古籍（《诗经》《楚辞》《唐诗》《宋词》《易经》）及五行命理学的国风起名宗师。
请根据以下父母的精准要求，为宝宝起 8 个独具国风雅韵、音律优美、寓意深远且合乎生辰五行的绝美吉名：
- 宝宝姓氏：${surname}
- 性别倾向：${gender === 'boy' ? '男宝（阳刚雅正、昂扬洒脱、胸怀经世）' : gender === 'girl' ? '女宝（温婉清淑、灵秀蕙质、风仪高华）' : '中性通用（清旷高远、文雅脱俗）'}
- 出生时间：${birthYear}年${birthMonth}月${birthDay}日 ${calendarType === 'solar' ? '公历' : '农历'} 第${birthHourIndex}时辰
- 文化经典风格偏好：${culturalStyles.join('、')}
- 家族字辈传承：${familyGenerationChar ? `指定包含字辈【${familyGenerationChar}】，位置在【${familyCharPosition === 'middle' ? '中间字' : '末尾字'}】` : '无字辈限制'}
- 期望字数：${charCountPreference === 'single' ? '单字名（姓+名共2字）' : charCountPreference === 'double' ? '双字名（姓+名共3字）' : '单字或双字皆可'}
- 谐音避雷要求：${avoidHarmfulHomophones ? '必须严格过滤任何容易引起校园起外号、不良方言谐音、衰颓歧义的字词' : '正常规避常见贬义'}

请按照 JSON Schema 格式精确输出 8 个名字列表。前 2 个作为基础优选（isVipOnly: false），后 6 个作为宗师级高定吉名（isVipOnly: true）。
每个名字必须包含详细的古籍出处（书名、朝代、作者、原文、译文）、拼音与声调（阴平/阳平/上声/去声）、五行属性、三才五格数理、5维雷达评分（85-99分）、防谐音检测与重名率分析。`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              names: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    surname: { type: Type.STRING },
                    givenName: { type: Type.STRING },
                    pinyin: { type: Type.ARRAY, items: { type: Type.STRING } },
                    tones: { type: Type.ARRAY, items: { type: Type.STRING } },
                    characters: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          char: { type: Type.STRING },
                          pinyin: { type: Type.STRING },
                          tone: { type: Type.STRING },
                          radical: { type: Type.STRING },
                          strokeCount: { type: Type.INTEGER },
                          element: { type: Type.STRING },
                          definition: { type: Type.STRING },
                        },
                        required: ['char', 'pinyin', 'tone', 'element', 'definition'],
                      },
                    },
                    poemSource: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        author: { type: Type.STRING },
                        dynasty: { type: Type.STRING },
                        quote: { type: Type.STRING },
                        modernTranslation: { type: Type.STRING },
                      },
                      required: ['title', 'quote', 'modernTranslation'],
                    },
                    comprehensiveMeaning: { type: Type.STRING },
                    characterBlessing: { type: Type.STRING },
                    academicCareerBlessing: { type: Type.STRING },
                    radarScores: {
                      type: Type.OBJECT,
                      properties: {
                        rhythm: { type: Type.NUMBER },
                        culture: { type: Type.NUMBER },
                        distinction: { type: Type.NUMBER },
                        wuxingFit: { type: Type.NUMBER },
                        auspicious: { type: Type.NUMBER },
                      },
                      required: ['rhythm', 'culture', 'distinction', 'wuxingFit', 'auspicious'],
                    },
                    overallScore: { type: Type.NUMBER },
                    sancaiWuge: {
                      type: Type.OBJECT,
                      properties: {
                        sancai: { type: Type.STRING },
                        sancaiFortune: { type: Type.STRING },
                        tiange: { type: Type.NUMBER },
                        tiangeFortune: { type: Type.STRING },
                        renge: { type: Type.NUMBER },
                        rengeFortune: { type: Type.STRING },
                        dige: { type: Type.NUMBER },
                        digeFortune: { type: Type.STRING },
                        waige: { type: Type.NUMBER },
                        waigeFortune: { type: Type.STRING },
                        zongge: { type: Type.NUMBER },
                        zonggeFortune: { type: Type.STRING },
                        analysis: { type: Type.STRING },
                      },
                      required: ['sancai', 'sancaiFortune', 'analysis'],
                    },
                    homophoneCheck: {
                      type: Type.OBJECT,
                      properties: {
                        riskLevel: { type: Type.STRING },
                        homophoneWords: { type: Type.ARRAY, items: { type: Type.STRING } },
                        advice: { type: Type.STRING },
                      },
                      required: ['riskLevel', 'advice'],
                    },
                    duplicateRateAnalysis: {
                      type: Type.OBJECT,
                      properties: {
                        popularityRank: { type: Type.STRING },
                        duplicateEstimate: { type: Type.STRING },
                        advice: { type: Type.STRING },
                      },
                      required: ['popularityRank', 'duplicateEstimate', 'advice'],
                    },
                    isVipOnly: { type: Type.BOOLEAN },
                  },
                  required: [
                    'name',
                    'surname',
                    'givenName',
                    'pinyin',
                    'tones',
                    'characters',
                    'poemSource',
                    'comprehensiveMeaning',
                    'characterBlessing',
                    'academicCareerBlessing',
                    'radarScores',
                    'overallScore',
                    'sancaiWuge',
                    'homophoneCheck',
                    'duplicateRateAnalysis',
                    'isVipOnly',
                  ],
                },
              },
            },
            required: ['names'],
          },
        },
      });

      const parsed = JSON.parse(response.text?.trim() || '{}');
      if (parsed.names && Array.isArray(parsed.names) && parsed.names.length > 0) {
        // 补充 ID
        const finalNames = parsed.names.map((n: any, idx: number) => ({
          ...n,
          id: `gemini_name_${idx}_${Date.now()}`,
          isVipOnly: idx >= 2,
        }));

        return res.json({
          names: finalNames,
          generatedAt: new Date().toISOString(),
          quotaRemaining: rateLimit.remaining,
          modelUsed: 'gemini-3.8-flash',
        });
      }
    } catch (err) {
      console.warn('Gemini 智能起名调用降级，自动载入国风大师臻选库:', err);
    }
  }

  // 降级使用古典工坊高品质吉名库（永不白屏崩溃）
  const fallbackNames = adaptMockNames(surname, vipUnlocked);
  return res.json({
    names: fallbackNames,
    generatedAt: new Date().toISOString(),
    quotaRemaining: rateLimit.remaining,
    modelUsed: 'classical-master-fallback',
  });
});

// 已有名字“深度测名与鉴定”功能 (引流与转化钩子)
app.post('/api/analyze-name', async (req: Request, res: Response) => {
  const { fullName = '李明轩', gender = 'boy', birthDate = '2026-09-03', birthHour = '辰时' } = req.body;
  const trimmed = fullName.trim();
  const surname = trimmed.charAt(0);
  const givenName = trimmed.slice(1);

  const ai = getAiClient();
  if (ai && trimmed.length >= 2) {
    try {
      const prompt = `请作为姓名学与古籍诗词专家，对已有名字【${trimmed}】（姓氏：${surname}，名字：${givenName}，性别：${gender === 'boy' ? '男' : '女'}，出生：${birthDate} ${birthHour}）进行全面深度的名理鉴定评测打分。
严格按照 JSON 格式输出鉴定报告，包含：
1. overallScore 综合得分 (70-98)
2. characters: 各汉字注音、五行、字义
3. radarScores: 五维雷达（音律、底蕴、辨识度、五行、吉数）
4. sancaiWuge: 三才五格简评
5. homophoneRisk: 谐音避雷检测（风险等级、谐音词、说明）
6. rhythmAnalysis: 声调平仄流动与朗读发音评价
7. wuxingMatch: 五行相生与生辰契合度
8. duplicateIndex: 全国重名率预警
9. classicalEcho: 相关的典籍古诗名句推荐
10. expertAdvice: 专家宗师改进或寄语建议`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              fullName: { type: Type.STRING },
              surname: { type: Type.STRING },
              givenName: { type: Type.STRING },
              overallScore: { type: Type.NUMBER },
              characters: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    char: { type: Type.STRING },
                    pinyin: { type: Type.STRING },
                    tone: { type: Type.STRING },
                    radical: { type: Type.STRING },
                    strokeCount: { type: Type.INTEGER },
                    element: { type: Type.STRING },
                    definition: { type: Type.STRING },
                  },
                  required: ['char', 'pinyin', 'tone', 'element', 'definition'],
                },
              },
              radarScores: {
                type: Type.OBJECT,
                properties: {
                  rhythm: { type: Type.NUMBER },
                  culture: { type: Type.NUMBER },
                  distinction: { type: Type.NUMBER },
                  wuxingFit: { type: Type.NUMBER },
                  auspicious: { type: Type.NUMBER },
                },
                required: ['rhythm', 'culture', 'distinction', 'wuxingFit', 'auspicious'],
              },
              sancaiWuge: {
                type: Type.OBJECT,
                properties: {
                  sancai: { type: Type.STRING },
                  sancaiFortune: { type: Type.STRING },
                  tiange: { type: Type.NUMBER },
                  renge: { type: Type.NUMBER },
                  dige: { type: Type.NUMBER },
                  zongge: { type: Type.NUMBER },
                  analysis: { type: Type.STRING },
                },
                required: ['sancai', 'sancaiFortune', 'analysis'],
              },
              homophoneRisk: {
                type: Type.OBJECT,
                properties: {
                  level: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ['level', 'description'],
              },
              rhythmAnalysis: {
                type: Type.OBJECT,
                properties: {
                  pingze: { type: Type.STRING },
                  flowScore: { type: Type.NUMBER },
                  comment: { type: Type.STRING },
                },
                required: ['pingze', 'flowScore', 'comment'],
              },
              wuxingMatch: {
                type: Type.OBJECT,
                properties: {
                  dominantElements: { type: Type.ARRAY, items: { type: Type.STRING } },
                  compatibilityScore: { type: Type.NUMBER },
                  comment: { type: Type.STRING },
                },
                required: ['dominantElements', 'compatibilityScore', 'comment'],
              },
              duplicateIndex: {
                type: Type.OBJECT,
                properties: {
                  level: { type: Type.STRING },
                  countEstimatePerMillion: { type: Type.NUMBER },
                  comment: { type: Type.STRING },
                },
                required: ['level', 'countEstimatePerMillion', 'comment'],
              },
              classicalEcho: {
                type: Type.OBJECT,
                properties: {
                  poem: { type: Type.STRING },
                  source: { type: Type.STRING },
                },
              },
              expertAdvice: { type: Type.STRING },
            },
            required: [
              'fullName',
              'overallScore',
              'characters',
              'radarScores',
              'sancaiWuge',
              'homophoneRisk',
              'rhythmAnalysis',
              'wuxingMatch',
              'duplicateIndex',
              'expertAdvice',
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text?.trim() || '{}');
      if (parsed.overallScore) {
        return res.json(parsed);
      }
    } catch (err) {
      console.warn('测名鉴定 API 降级为本地名理分析器:', err);
    }
  }

  // 本地通用名理评测兜底
  return res.json({
    fullName: trimmed,
    surname,
    givenName,
    overallScore: 89,
    characters: [
      { char: surname, pinyin: 'lǐ', tone: '上声', radical: '木', strokeCount: 7, element: '木', definition: '桃李满天下之芳华' },
      { char: givenName.charAt(0) || '明', pinyin: 'míng', tone: '阳平', radical: '日', strokeCount: 8, element: '火', definition: '日月齐辉，聪明睿智' },
      ...(givenName.length > 1 ? [{ char: givenName.charAt(1), pinyin: 'xuān', tone: '阴平', radical: '车', strokeCount: 10, element: '土', definition: '气宇轩昂，气度不凡' }] : [])
    ],
    radarScores: {
      rhythm: 92,
      culture: 88,
      distinction: 84,
      wuxingFit: 93,
      auspicious: 90,
    },
    sancaiWuge: {
      sancai: '木火土',
      sancaiFortune: '大吉',
      tiange: 8,
      renge: 15,
      dige: 18,
      zongge: 25,
      analysis: '三才五行顺生，木生火、火生土，家境祥和，贵人得力，事业平步青云。',
    },
    homophoneRisk: {
      level: '极低',
      description: '发音明快清脆，无明显不良方言谐音，易于师长同学辨识与呼唤。',
    },
    rhythmAnalysis: {
      pingze: '仄平平（抑扬相间）',
      flowScore: 92,
      comment: '声调起承转合自然，上声转阳平再至阴平，富有韵律节拍之美。',
    },
    wuxingMatch: {
      dominantElements: ['木', '火'],
      compatibilityScore: 94,
      comment: '汉字五行与八字格局相生相济，木火通明，利学业文昌。',
    },
    duplicateIndex: {
      level: '中等偏高',
      countEstimatePerMillion: 820,
      comment: '属于当代常见高频吉名，虽端庄大方，但建议可搭配更具古籍典故出处的字词提高辨识度。',
    },
    classicalEcho: {
      poem: '“行到水穷处，坐看云起时。”',
      source: '王维《终南别业》',
    },
    expertAdvice: '此名综合格局优良，端正大方；若欲更具书卷气与独特辨识度，可考虑在二字名中引入《诗经》或《楚辞》冷门吉字，避免未来重名困扰。',
  });
});

// ==========================================
// 5. 集成 Vite 中间件与静态托管
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`錦繡良名服务已启动，监听地址: http://0.0.0.0:${PORT}`);
  });
}

startServer();
