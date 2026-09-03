import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Calendar,
  Clock,
  User,
  ShieldAlert,
  Flame,
  Check,
  ChevronDown,
  Info,
} from 'lucide-react';
import { NamingRequestPayload, Gender, CalendarType, CharCountPreference } from '../types';
import { SHICHEN_LIST, calculateBazi, detectSurname } from '../utils/bazi';

interface NamingFormProps {
  onSubmit: (payload: NamingRequestPayload) => void;
  loading: boolean;
}

const CULTURAL_STYLES = [
  { id: '诗经典雅', label: '《诗经》典雅', desc: '周风雅颂，清正纯美' },
  { id: '楚辞芳华', label: '《楚辞》芳华', desc: '香草美人，浪漫超拔' },
  { id: '唐风律诗', label: '唐风律诗', desc: '盛唐气象，豪迈雄浑' },
  { id: '宋词婉约', label: '宋词婉约', desc: '清雅灵秀，词蕴悠扬' },
  { id: '四书五经', label: '四书五经', desc: '经世致用，君子德操' },
  { id: '温润玉石', label: '温润玉石', desc: '金声玉振，风仪高华' },
  { id: '现代文艺', label: '现代文艺', desc: '简洁清新，不落俗套' },
];

export const NamingForm: React.FC<NamingFormProps> = ({ onSubmit, loading }) => {
  const [surname, setSurname] = useState('李');
  const [gender, setGender] = useState<Gender>('boy');
  const [calendarType, setCalendarType] = useState<CalendarType>('solar');

  // 生辰日期
  const today = new Date();
  const [birthYear, setBirthYear] = useState(today.getFullYear());
  const [birthMonth, setBirthMonth] = useState(today.getMonth() + 1);
  const [birthDay, setBirthDay] = useState(today.getDate());
  const [birthHourIndex, setBirthHourIndex] = useState(4); // 默认辰时 (07:00-09:00)

  // 风格偏好
  const [selectedStyles, setSelectedStyles] = useState<string[]>(['诗经典雅', '唐风律诗']);

  // 字辈
  const [hasFamilyChar, setHasFamilyChar] = useState(false);
  const [familyChar, setFamilyChar] = useState('');
  const [familyCharPos, setFamilyCharPos] = useState<'middle' | 'end'>('middle');

  // 期望字数
  const [charCountPref, setCharCountPref] = useState<CharCountPreference>('double');

  // 严苛避雷
  const [avoidHarmfulHomophones, setAvoidHarmfulHomophones] = useState(true);

  // 姓氏单复姓自动检测
  const surnameInfo = useMemo(() => detectSurname(surname), [surname]);

  // 实时八字与五行格局预览
  const baziPreview = useMemo(() => {
    return calculateBazi(birthYear, birthMonth, birthDay, birthHourIndex, calendarType);
  }, [birthYear, birthMonth, birthDay, birthHourIndex, calendarType]);

  const toggleStyle = (styleId: string) => {
    if (selectedStyles.includes(styleId)) {
      if (selectedStyles.length > 1) {
        setSelectedStyles(selectedStyles.filter((s) => s !== styleId));
      }
    } else {
      setSelectedStyles([...selectedStyles, styleId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!surname.trim()) return;

    onSubmit({
      surname: surname.trim(),
      gender,
      birthYear,
      birthMonth,
      birthDay,
      birthHourIndex,
      calendarType,
      culturalStyles: selectedStyles,
      familyGenerationChar: hasFamilyChar ? familyChar.trim() : undefined,
      familyCharPosition: familyCharPos,
      charCountPreference: charCountPref,
      avoidHarmfulHomophones,
      vipUnlocked: false,
    });
  };

  return (
    <div className="bg-[#FCFAF6] rounded-2xl border border-[#DECDB8] shadow-md p-5 sm:p-8 relative overflow-hidden">
      {/* 顶部中式花纹点缀 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#C5A059]/15 via-transparent to-transparent pointer-events-none" />

      {/* 表单标题区 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E8DCCB] pb-4 mb-6 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-4 rounded-full bg-[#C23531]" />
            <h2 className="font-serif font-bold text-lg sm:text-xl text-[#2C3437]">
              多维精准起名信息录入
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-serif text-[#786857] mt-1">
            融合生辰八字推算、古籍音韵、五行生克与家族传承
          </p>
        </div>

        {/* 智能八字徽章 */}
        <div className="bg-[#F5EDE0] border border-[#DFCBB5] rounded-lg px-3 py-2 text-xs font-serif text-[#5E4C3C] flex items-center space-x-2">
          <Flame className="w-4 h-4 text-[#C23531] shrink-0" />
          <div>
            <span className="font-semibold text-[#2C3437]">
              【{baziPreview.yearStemBranch} {baziPreview.monthStemBranch} {baziPreview.dayStemBranch} {baziPreview.hourStemBranch}】
            </span>
            <span className="ml-1 text-[11px] text-[#7A6A59]">
              属相：{baziPreview.zodiac} · 喜用五行：{baziPreview.luckyElements.join('、')}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. 姓氏与性别 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* 姓氏 */}
          <div>
            <label className="block text-xs sm:text-sm font-serif font-semibold text-[#2C3437] mb-2 flex items-center justify-between">
              <span>宝宝姓氏 <span className="text-[#C23531]">*</span></span>
              {surnameInfo.isCompound && (
                <span className="text-[11px] font-serif text-[#C5A059] bg-[#C5A059]/10 px-1.5 py-0.5 rounded-xs">
                  识别为经典复姓
                </span>
              )}
            </label>
            <div className="relative">
              <input
                id="input-baby-surname"
                type="text"
                required
                maxLength={4}
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                placeholder="例如：李、王、欧阳、司马"
                className="w-full px-4 py-2.5 rounded-lg border border-[#D5C4B0] bg-white focus:outline-none focus:ring-2 focus:ring-[#C23531] font-serif text-base text-[#2C3437]"
              />
            </div>
          </div>

          {/* 性别倾向 */}
          <div>
            <label className="block text-xs sm:text-sm font-serif font-semibold text-[#2C3437] mb-2">
              性别倾向
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                id="btn-gender-boy"
                onClick={() => setGender('boy')}
                className={`py-2 px-3 rounded-lg border text-xs sm:text-sm font-serif flex items-center justify-center space-x-1 transition-all ${
                  gender === 'boy'
                    ? 'bg-[#C23531] text-white border-[#C23531] shadow-xs'
                    : 'bg-white text-[#564738] border-[#D5C4B0] hover:bg-[#F7F2E9]'
                }`}
              >
                <span>男宝 (阳刚雅正)</span>
              </button>

              <button
                type="button"
                id="btn-gender-girl"
                onClick={() => setGender('girl')}
                className={`py-2 px-3 rounded-lg border text-xs sm:text-sm font-serif flex items-center justify-center space-x-1 transition-all ${
                  gender === 'girl'
                    ? 'bg-[#C23531] text-white border-[#C23531] shadow-xs'
                    : 'bg-white text-[#564738] border-[#D5C4B0] hover:bg-[#F7F2E9]'
                }`}
              >
                <span>女宝 (温婉清淑)</span>
              </button>

              <button
                type="button"
                id="btn-gender-neutral"
                onClick={() => setGender('neutral')}
                className={`py-2 px-3 rounded-lg border text-xs sm:text-sm font-serif flex items-center justify-center space-x-1 transition-all ${
                  gender === 'neutral'
                    ? 'bg-[#C23531] text-white border-[#C23531] shadow-xs'
                    : 'bg-white text-[#564738] border-[#D5C4B0] hover:bg-[#F7F2E9]'
                }`}
              >
                <span>通用中性</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. 生辰八字与历法选择 */}
        <div className="bg-[#F8F3EA] rounded-xl p-4 sm:p-5 border border-[#E3D4C0]">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs sm:text-sm font-serif font-semibold text-[#2C3437] flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-[#C5A059]" />
              <span>生辰八字（自动推算五行流转）</span>
            </label>

            {/* 公历 / 农历切换 */}
            <div className="flex rounded-md bg-[#EDE1D1] p-0.5 text-xs font-serif">
              <button
                type="button"
                onClick={() => setCalendarType('solar')}
                className={`px-2.5 py-1 rounded-sm transition-colors ${
                  calendarType === 'solar'
                    ? 'bg-white text-[#2C3437] font-semibold shadow-2xs'
                    : 'text-[#6D5E50] hover:text-[#2C3437]'
                }`}
              >
                公历 (新历)
              </button>
              <button
                type="button"
                onClick={() => setCalendarType('lunar')}
                className={`px-2.5 py-1 rounded-sm transition-colors ${
                  calendarType === 'lunar'
                    ? 'bg-white text-[#2C3437] font-semibold shadow-2xs'
                    : 'text-[#6D5E50] hover:text-[#2C3437]'
                }`}
              >
                农历 (阴历)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* 年 */}
            <div>
              <span className="text-[11px] font-serif text-[#786959] block mb-1">出生年份</span>
              <select
                id="select-birth-year"
                value={birthYear}
                onChange={(e) => setBirthYear(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-md border border-[#D5C4B0] bg-white font-serif text-sm text-[#2C3437]"
              >
                {Array.from({ length: 15 }, (_, i) => 2020 + i).map((y) => (
                  <option key={y} value={y}>
                    {y} 年
                  </option>
                ))}
              </select>
            </div>

            {/* 月 */}
            <div>
              <span className="text-[11px] font-serif text-[#786959] block mb-1">出生月份</span>
              <select
                id="select-birth-month"
                value={birthMonth}
                onChange={(e) => setBirthMonth(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-md border border-[#D5C4B0] bg-white font-serif text-sm text-[#2C3437]"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {m} 月
                  </option>
                ))}
              </select>
            </div>

            {/* 日 */}
            <div>
              <span className="text-[11px] font-serif text-[#786959] block mb-1">出生日期</span>
              <select
                id="select-birth-day"
                value={birthDay}
                onChange={(e) => setBirthDay(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-md border border-[#D5C4B0] bg-white font-serif text-sm text-[#2C3437]"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {d} 日
                  </option>
                ))}
              </select>
            </div>

            {/* 时辰 */}
            <div>
              <span className="text-[11px] font-serif text-[#786959] block mb-1">出生时辰 (十二时辰)</span>
              <select
                id="select-birth-hour"
                value={birthHourIndex}
                onChange={(e) => setBirthHourIndex(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-md border border-[#D5C4B0] bg-white font-serif text-sm text-[#2C3437]"
              >
                {SHICHEN_LIST.map((s) => (
                  <option key={s.index} value={s.index}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 3. 文化风格偏好 (多选标签) */}
        <div>
          <label className="block text-xs sm:text-sm font-serif font-semibold text-[#2C3437] mb-2 flex items-center justify-between">
            <span>文化风格偏好（可多选）</span>
            <span className="text-[11px] font-serif text-[#7A6D60]">已选 {selectedStyles.length} 项</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {CULTURAL_STYLES.map((style) => {
              const isSelected = selectedStyles.includes(style.id);
              return (
                <button
                  type="button"
                  key={style.id}
                  onClick={() => toggleStyle(style.id)}
                  className={`p-2.5 rounded-lg border text-left transition-all relative ${
                    isSelected
                      ? 'bg-[#FCF5EE] border-[#C23531] text-[#912421] shadow-2xs ring-1 ring-[#C23531]'
                      : 'bg-white border-[#DECDB8] text-[#554637] hover:bg-[#F9F5EE]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-semibold text-xs sm:text-sm">
                      {style.label}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#C23531]" />}
                  </div>
                  <span className="text-[10px] font-serif text-[#877868] mt-0.5 block leading-tight">
                    {style.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. 家族字辈传承 & 期望字数 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
          {/* 家族字辈 */}
          <div className="bg-[#F8F4EC] rounded-xl p-3.5 border border-[#E3D6C4]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-serif font-semibold text-[#2C3437] flex items-center space-x-1">
                <span>家族字辈传承（可选）</span>
              </label>
              <label className="flex items-center space-x-1 text-xs font-serif text-[#655546] cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasFamilyChar}
                  onChange={(e) => setHasFamilyChar(e.target.checked)}
                  className="rounded text-[#C23531] focus:ring-[#C23531]"
                />
                <span>指定辈分字</span>
              </label>
            </div>

            {hasFamilyChar ? (
              <div className="flex space-x-2 animate-in fade-in duration-150">
                <input
                  type="text"
                  maxLength={1}
                  value={familyChar}
                  onChange={(e) => setFamilyChar(e.target.value)}
                  placeholder="字辈，如：宏"
                  className="w-24 px-3 py-1.5 rounded-md border border-[#D5C4B0] bg-white font-serif text-sm text-center"
                />
                <select
                  value={familyCharPos}
                  onChange={(e) => setFamilyCharPos(e.target.value as 'middle' | 'end')}
                  className="px-3 py-1.5 rounded-md border border-[#D5C4B0] bg-white font-serif text-xs"
                >
                  <option value="middle">指定在中间字 (如：李宏*)</option>
                  <option value="end">指定在末尾字 (如：李*宏)</option>
                </select>
              </div>
            ) : (
              <p className="text-[11px] font-serif text-[#8C7C6B]">
                未开启字辈限制，将由大师模型从诗词典籍中自由臻选双字或单字吉名。
              </p>
            )}
          </div>

          {/* 期望字数 & 谐音排雷开关 */}
          <div className="bg-[#F8F4EC] rounded-xl p-3.5 border border-[#E3D6C4] flex flex-col justify-between">
            <div>
              <span className="text-xs font-serif font-semibold text-[#2C3437] block mb-2">
                期望字数倾向
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(['double', 'single', 'any'] as CharCountPreference[]).map((pref) => (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => setCharCountPref(pref)}
                    className={`py-1.5 text-xs font-serif rounded-md border transition-all ${
                      charCountPref === pref
                        ? 'bg-[#C23531] text-white border-[#C23531]'
                        : 'bg-white text-[#554637] border-[#D5C4B0] hover:bg-[#F9F5EE]'
                    }`}
                  >
                    {pref === 'double' ? '双字名 (推荐)' : pref === 'single' ? '单字名' : '皆可'}
                  </button>
                ))}
              </div>
            </div>

            {/* 谐音避雷开关 */}
            <div className="mt-3 pt-2.5 border-t border-[#E3D6C4] flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <ShieldAlert className="w-4 h-4 text-[#C23531]" />
                <span className="text-xs font-serif font-medium text-[#2C3437]">
                  开启严格谐音避雷过滤
                </span>
              </div>
              <input
                type="checkbox"
                checked={avoidHarmfulHomophones}
                onChange={(e) => setAvoidHarmfulHomophones(e.target.checked)}
                className="rounded text-[#C23531] focus:ring-[#C23531] w-4 h-4"
              />
            </div>
          </div>
        </div>

        {/* 提交按钮 (吸睛尊贵中式红金色) */}
        <div className="pt-2">
          <button
            type="submit"
            id="btn-submit-naming"
            disabled={loading}
            className="w-full py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-[#B92B27] via-[#C23531] to-[#A3201D] hover:opacity-95 text-white font-serif font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 transform active:scale-99 border border-[#EACFA2]/40"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>国风大师模型推演吉名中...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-[#FEE29D]" />
                <span>智能推演臻选良名 · 开启名理图鉴</span>
              </>
            )}
          </button>
          <p className="text-center text-[11px] font-serif text-[#8F7D6B] mt-2">
            免费生成 2 款精选良名 · 支持深度五维雷达、诗经典故溯源与命名礼书长图
          </p>
        </div>
      </form>
    </div>
  );
};
