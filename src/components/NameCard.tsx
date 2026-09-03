import React, { useState } from 'react';
import {
  Heart,
  Share2,
  Lock,
  Sparkles,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  TrendingUp,
  Scale,
  FileText,
  Eye,
} from 'lucide-react';
import { CuratedName } from '../types';
import { FiveDimensionRadar } from './FiveDimensionRadar';

interface NameCardProps {
  name: CuratedName;
  index: number;
  isVip: boolean;
  isFavorite: boolean;
  isCompareSelected: boolean;
  onToggleFavorite: () => void;
  onToggleCompare: () => void;
  onOpenPoster: () => void;
  onOpenVipModal: () => void;
}

export const NameCard: React.FC<NameCardProps> = ({
  name,
  index,
  isVip,
  isFavorite,
  isCompareSelected,
  onToggleFavorite,
  onToggleCompare,
  onOpenPoster,
  onOpenVipModal,
}) => {
  const [expanded, setExpanded] = useState(false);

  // VIP 锁定逻辑：如果该名字是 VIP 专属并且用户不是 VIP
  const isLocked = name.isVipOnly && !isVip;

  return (
    <div
      className={`relative bg-[#FDFCFA] rounded-2xl border transition-all duration-200 overflow-hidden ${
        isLocked
          ? 'border-[#E0D1BF] shadow-xs'
          : 'border-[#DFCDB6] hover:border-[#C5A059] shadow-md hover:shadow-lg'
      }`}
    >
      {/* 顶部标签栏 */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-[#F0E6D8] bg-[#FAF6EE]/50">
        <div className="flex items-center space-x-2">
          <span
            className={`px-2 py-0.5 rounded-sm font-serif text-[11px] font-bold ${
              name.isVipOnly
                ? 'bg-gradient-to-r from-[#C5A059] to-[#D8B468] text-white'
                : 'bg-[#C23531] text-white'
            }`}
          >
            {name.isVipOnly ? '宗师级吉名 · VIP' : `优选嘉名 · 序${index + 1}`}
          </span>

          <span className="font-serif text-xs text-[#8A7969]">
            综合评分：<strong className="text-[#C23531] text-sm font-sans">{name.overallScore}</strong> 分
          </span>
        </div>

        {/* 右侧操作区：收藏与对比勾选 */}
        <div className="flex items-center space-x-2.5">
          <label className="flex items-center space-x-1 cursor-pointer select-none text-xs font-serif text-[#6C5B4B] hover:text-[#C23531]">
            <input
              type="checkbox"
              checked={isCompareSelected}
              onChange={onToggleCompare}
              className="rounded text-[#C23531] focus:ring-[#C23531] w-3.5 h-3.5"
            />
            <span>对比PK</span>
          </label>

          <button
            onClick={onToggleFavorite}
            className={`p-1.5 rounded-full transition-colors ${
              isFavorite
                ? 'text-[#C23531] bg-[#FCE8E8]'
                : 'text-[#8C7A6A] hover:text-[#C23531] hover:bg-[#F2E8DC]'
            }`}
            title="加入备选收藏夹"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#C23531]' : ''}`} />
          </button>
        </div>
      </div>

      {/* 名字核心视觉展示区 */}
      <div className="p-5 sm:p-6 relative">
        {/* VIP 遮罩浮层 */}
        {isLocked && (
          <div className="absolute inset-0 z-20 backdrop-blur-md bg-[#FCFAF6]/80 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-[#FAF0DC] border border-[#C5A059] flex items-center justify-center text-[#9E7A31] mb-2 shadow-sm">
              <Lock className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-bold text-base sm:text-lg text-[#2C3437]">
              宗师级高定吉名 (VIP专属)
            </h4>
            <p className="text-xs font-serif text-[#6D5E50] max-w-xs mt-1 mb-4">
              此名由国风大师深度结合八字喜用神与千古诗词精校，三才五格格局大吉。
            </p>
            <button
              onClick={onOpenVipModal}
              className="px-5 py-2 rounded-lg bg-[#C23531] hover:bg-[#A62623] text-white font-serif text-xs sm:text-sm font-semibold shadow-md flex items-center space-x-1.5 transition-transform active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-[#FDE68A]" />
              <span>输入卡密 / 立即解锁全套</span>
            </button>
          </div>
        )}

        {/* 名字大字与注音 */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center sm:items-start">
            {/* 拼音与声调 */}
            <div className="flex items-center space-x-3 text-xs sm:text-sm font-serif text-[#876A4E] mb-1 tracking-wider">
              {name.pinyin.map((p, i) => (
                <span key={i} className="flex flex-col items-center">
                  <span>{p}</span>
                  <span className="text-[10px] text-[#A69584]">({name.tones[i] || '平'})</span>
                </span>
              ))}
            </div>

            {/* 宋体大字 */}
            <h3 className="font-serif font-bold text-3xl sm:text-4xl text-[#1E2224] tracking-widest my-1 flex items-center">
              {name.name}
            </h3>

            {/* 五行与字义标签 */}
            <div className="flex items-center space-x-1.5 mt-2">
              {name.characters.map((c, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-sm bg-[#F5EFE4] border border-[#DFCBB5] text-[11px] font-serif text-[#5B4838]"
                >
                  <strong className="text-[#C23531]">{c.char}</strong> [{c.element} · {c.radical}部 · {c.strokeCount}画]
                </span>
              ))}
            </div>
          </div>

          {/* 满月命名礼书长图生成入口 */}
          <div className="flex sm:flex-col items-center gap-2">
            <button
              onClick={onOpenPoster}
              className="px-4 py-2 rounded-lg bg-[#F8F2E6] hover:bg-[#F2E7D3] border border-[#C5A059] text-[#78591E] font-serif text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition-colors"
            >
              <FileText className="w-4 h-4 text-[#C5A059]" />
              <span>生成满月礼书海报</span>
            </button>
            <span className="text-[10px] font-serif text-[#968677] text-center hidden sm:block">
              支持自媒体长图分享
            </span>
          </div>
        </div>

        {/* 典籍原著溯源卡片 */}
        <div className="mt-4 bg-[#FBF7F0] rounded-xl p-3.5 sm:p-4 border border-[#E9DDCD]">
          <div className="flex items-center space-x-1.5 text-xs font-serif font-bold text-[#C5A059] mb-1.5">
            <BookOpen className="w-4 h-4 text-[#C23531]" />
            <span>典籍溯源：《{name.poemSource.title}》 {name.poemSource.dynasty} · {name.poemSource.author}</span>
          </div>
          <p className="font-serif font-medium text-sm sm:text-base text-[#2C3437] pl-3 border-l-2 border-[#C23531] my-1.5 italic">
            “{name.poemSource.quote}”
          </p>
          <p className="text-xs font-serif text-[#6D5F52] mt-1 leading-relaxed">
            <strong className="text-[#3A2F26]">白话通解：</strong>{name.poemSource.modernTranslation}
          </p>
        </div>

        {/* 寓意与前程祝福 */}
        <div className="mt-3 space-y-1 text-xs font-serif text-[#4A3C30] leading-relaxed">
          <p>
            <strong className="text-[#2C3437]">【名理核心】</strong>{name.comprehensiveMeaning}
          </p>
          <p>
            <strong className="text-[#2C3437]">【前程寄托】</strong>{name.academicCareerBlessing}
          </p>
        </div>

        {/* 展开/收起 深度名理测算详情 */}
        <div className="mt-4 pt-3 border-t border-[#F0E6D8] flex items-center justify-between">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center space-x-1 text-xs font-serif text-[#C23531] hover:underline font-semibold"
          >
            <span>{expanded ? '收起名理深度报告' : '展开五维雷达与三才五格深度测算'}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <span className="text-[11px] font-serif text-[#877868]">
            三才格局：<strong className="text-[#2C3437]">{name.sancaiWuge.sancai}</strong> ({name.sancaiWuge.sancaiFortune})
          </span>
        </div>

        {/* 展开区域：五维雷达图 + 三才五格 + 防谐音/重名率大数据 */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-[#F0E6D8] space-y-5 animate-in fade-in duration-200">
            {/* 五维雷达图与字意拆解 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
              {/* 五维雷达 */}
              <div className="bg-[#FAF5EC] rounded-xl p-3 border border-[#E9DECة] flex flex-col items-center">
                <span className="text-xs font-serif font-bold text-[#554335] mb-1">
                  五维名理综合指数
                </span>
                <FiveDimensionRadar scores={name.radarScores} size={200} />
              </div>

              {/* 字义拆解 */}
              <div className="space-y-2">
                <span className="text-xs font-serif font-bold text-[#554335] block">
                  汉字训诂与生克详解
                </span>
                {name.characters.map((charItem, idx) => (
                  <div
                    key={idx}
                    className="bg-[#FAF6EE] p-2.5 rounded-lg border border-[#EADFCF] text-xs font-serif"
                  >
                    <div className="flex items-center justify-between text-[#2C3437] font-semibold mb-0.5">
                      <span>
                        {charItem.char} ({charItem.pinyin}) · {charItem.tone}
                      </span>
                      <span className="text-[#C23531]">五行属{charItem.element}</span>
                    </div>
                    <p className="text-[#6B5C4D] text-[11px] leading-tight">
                      {charItem.definition}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 三才五格数理深度测算 */}
            <div className="bg-[#F8F2E7] rounded-xl p-4 border border-[#E4D5C2]">
              <div className="flex items-center space-x-1.5 mb-2">
                <Scale className="w-4 h-4 text-[#C23531]" />
                <h5 className="text-xs sm:text-sm font-serif font-bold text-[#2C3437]">
                  三才五格吉凶数理深度测算
                </h5>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-serif mb-2">
                <div className="bg-white p-2 rounded-md border border-[#E2D2BE]">
                  <span className="text-[#8A7969] block text-[10px]">天格 (先祖之运)</span>
                  <span className="font-bold text-[#2C3437]">{name.sancaiWuge.tiange} 数</span>
                  <span className="block text-[10px] text-[#C23531] font-medium">{name.sancaiWuge.tiangeFortune}</span>
                </div>
                <div className="bg-white p-2 rounded-md border border-[#E2D2BE]">
                  <span className="text-[#8A7969] block text-[10px]">人格 (主运核心)</span>
                  <span className="font-bold text-[#2C3437]">{name.sancaiWuge.renge} 数</span>
                  <span className="block text-[10px] text-[#C23531] font-medium">{name.sancaiWuge.rengeFortune}</span>
                </div>
                <div className="bg-white p-2 rounded-md border border-[#E2D2BE]">
                  <span className="text-[#8A7969] block text-[10px]">地格 (前程早运)</span>
                  <span className="font-bold text-[#2C3437]">{name.sancaiWuge.dige} 数</span>
                  <span className="block text-[10px] text-[#C23531] font-medium">{name.sancaiWuge.digeFortune}</span>
                </div>
                <div className="bg-white p-2 rounded-md border border-[#E2D2BE]">
                  <span className="text-[#8A7969] block text-[10px]">外格 (副运人际)</span>
                  <span className="font-bold text-[#2C3437]">{name.sancaiWuge.waige} 数</span>
                  <span className="block text-[10px] text-[#C23531] font-medium">{name.sancaiWuge.waigeFortune}</span>
                </div>
                <div className="bg-white p-2 rounded-md border border-[#E2D2BE] col-span-2 sm:col-span-1">
                  <span className="text-[#8A7969] block text-[10px]">总格 (后运晚景)</span>
                  <span className="font-bold text-[#2C3437]">{name.sancaiWuge.zongge} 数</span>
                  <span className="block text-[10px] text-[#C23531] font-medium">{name.sancaiWuge.zonggeFortune}</span>
                </div>
              </div>

              <p className="text-xs font-serif text-[#5A4B3D] leading-relaxed bg-white/70 p-2.5 rounded-md border border-[#E5D7C5]">
                <strong>数理综断：</strong>{name.sancaiWuge.analysis}
              </p>
            </div>

            {/* 防谐音/歧义/重名率大数据分析 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-serif">
              {/* 谐音避雷 */}
              <div className="bg-[#FAF5EC] p-3 rounded-xl border border-[#E7DAC7]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[#2C3437]">防谐音与绰号筛查</span>
                  <span className="text-[#2E7D32] bg-[#E8F5E9] px-1.5 py-0.5 rounded-xs font-semibold">
                    风险等级：{name.homophoneCheck.riskLevel}
                  </span>
                </div>
                <p className="text-[#6D5D4E] text-[11px] leading-tight">
                  {name.homophoneCheck.advice}
                </p>
              </div>

              {/* 重名率预警 */}
              <div className="bg-[#FAF5EC] p-3 rounded-xl border border-[#E7DAC7]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[#2C3437]">全国重名率大数据</span>
                  <span className="text-[#C5A059] bg-[#FFF8E1] px-1.5 py-0.5 rounded-xs font-semibold">
                    {name.duplicateRateAnalysis.duplicateEstimate}
                  </span>
                </div>
                <p className="text-[#6D5D4E] text-[11px] leading-tight">
                  {name.duplicateRateAnalysis.popularityRank} · {name.duplicateRateAnalysis.advice}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
