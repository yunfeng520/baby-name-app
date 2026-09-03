import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Crown,
  Heart,
  Scale,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Key,
  Flame,
  Award,
} from 'lucide-react';

import { CuratedName, BaziCalculation, NamingRequestPayload } from './types';
import { calculateBazi } from './utils/bazi';
import { Header } from './components/Header';
import { NamingForm } from './components/NamingForm';
import { NameCard } from './components/NameCard';
import { VipUnlockModal } from './components/VipUnlockModal';
import { NameAppraisalModal } from './components/NameAppraisalModal';
import { PosterModal } from './components/PosterModal';
import { CompareModal } from './components/CompareModal';
import { FavoritesDrawer } from './components/FavoritesDrawer';
import { WeChatFloatingButton } from './components/WeChatFloatingButton';
import { LegalDisclaimer } from './components/LegalDisclaimer';

export default function App() {
  // VIP 状态持久化
  const [isVip, setIsVip] = useState<boolean>(() => {
    return localStorage.getItem('jinxiu_vip_unlocked') === 'true';
  });

  // 收藏夹持久化
  const [favorites, setFavorites] = useState<CuratedName[]>(() => {
    try {
      const saved = localStorage.getItem('jinxiu_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 对比选中名单 (最多3个)
  const [compareIds, setCompareIds] = useState<string[]>([]);

  // 弹窗状态管理
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [isAppraisalModalOpen, setIsAppraisalModalOpen] = useState(false);
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);
  const [activePosterName, setActivePosterName] = useState<CuratedName | null>(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);

  // 名字生成结果与状态
  const [loading, setLoading] = useState(false);
  const [names, setNames] = useState<CuratedName[]>([]);
  const [currentBazi, setCurrentBazi] = useState<BaziCalculation>(() => {
    const today = new Date();
    return calculateBazi(today.getFullYear(), today.getMonth() + 1, today.getDate(), 4, 'solar');
  });
  const [currentGender, setCurrentGender] = useState('boy');
  const [filterTab, setFilterTab] = useState<'all' | 'free' | 'vip'>('all');
  const [sortBy, setSortBy] = useState<'score' | 'rhythm' | 'culture'>('score');

  // 保存收藏夹到本地存储
  useEffect(() => {
    localStorage.setItem('jinxiu_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // 初次加载自动发起一次默认推演（李姓，男宝）展示精美落地效果
  useEffect(() => {
    handleGenerateNames({
      surname: '李',
      gender: 'boy',
      birthYear: 2026,
      birthMonth: 9,
      birthDay: 3,
      birthHourIndex: 4,
      calendarType: 'solar',
      culturalStyles: ['诗经典雅', '唐风律诗'],
      charCountPreference: 'double',
      avoidHarmfulHomophones: true,
      vipUnlocked: isVip,
    });
  }, []);

  // 触发起名生成 API
  const handleGenerateNames = async (payload: NamingRequestPayload) => {
    setLoading(true);
    setCurrentGender(payload.gender);

    // 实时计算八字
    const bazi = calculateBazi(
      payload.birthYear,
      payload.birthMonth,
      payload.birthDay,
      payload.birthHourIndex,
      payload.calendarType
    );
    setCurrentBazi(bazi);

    try {
      const res = await fetch('/api/generate-names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          vipUnlocked: isVip,
        }),
      });
      const data = await res.json();
      if (data.names && Array.isArray(data.names)) {
        setNames(data.names);
      }
    } catch (err) {
      console.error('起名请求失败', err);
    } finally {
      setLoading(false);
      // 平滑滚动至名字结果区域
      const resultsEl = document.getElementById('section-names-results');
      if (resultsEl) {
        resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // VIP 解锁成功处理
  const handleUnlockSuccess = () => {
    setIsVip(true);
    localStorage.setItem('jinxiu_vip_unlocked', 'true');
    // 如果当前有名字，解除VIP锁定
    setNames((prev) =>
      prev.map((n) => ({
        ...n,
        // VIP解锁后所有卡片皆可查看
      }))
    );
  };

  // 切换收藏
  const toggleFavorite = (name: CuratedName) => {
    if (favorites.some((f) => f.id === name.id)) {
      setFavorites(favorites.filter((f) => f.id !== name.id));
    } else {
      setFavorites([...favorites, name]);
    }
  };

  // 切换对比
  const toggleCompare = (name: CuratedName) => {
    if (compareIds.includes(name.id)) {
      setCompareIds(compareIds.filter((id) => id !== name.id));
    } else {
      if (compareIds.length >= 3) {
        alert('最多支持同时对比 3 个备选名字');
        return;
      }
      setCompareIds([...compareIds, name.id]);
    }
  };

  // 打开海报生成
  const openPoster = (name: CuratedName) => {
    setActivePosterName(name);
    setIsPosterModalOpen(true);
  };

  // 过滤与排序名字
  const filteredAndSortedNames = names
    .filter((n) => {
      if (filterTab === 'free') return !n.isVipOnly;
      if (filterTab === 'vip') return n.isVipOnly;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'score') return b.overallScore - a.overallScore;
      if (sortBy === 'rhythm') return b.radarScores.rhythm - a.radarScores.rhythm;
      if (sortBy === 'culture') return b.radarScores.culture - a.radarScores.culture;
      return 0;
    });

  const selectedCompareNames = names.filter((n) => compareIds.includes(n.id));

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#2C3437] font-serif flex flex-col selection:bg-[#C23531]/15 selection:text-[#C23531]">
      {/* 1. 顶部全局导航 */}
      <Header
        isVip={isVip}
        onOpenVipModal={() => setIsVipModalOpen(true)}
        onOpenAppraisalModal={() => setIsAppraisalModalOpen(true)}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenAdvisorModal={() => setIsVipModalOpen(true)}
        favoriteCount={favorites.length}
      />

      {/* 2. 核心 Hero 典雅横额与公信力转化 */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F4EFE6] via-[#F8F4EC] to-[#FBF9F5] border-b border-[#E8DCCB] pt-8 pb-12 sm:pt-12 sm:pb-16 px-4">
        {/* 背景传统纹样与水印 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full flex items-center justify-between opacity-5 pointer-events-none select-none">
          <span className="text-9xl font-black font-serif">诗经</span>
          <span className="text-9xl font-black font-serif">楚辞</span>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-4">
          {/* 顶部篆刻微章 */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#EFE3D3] border border-[#D5C2AD] text-xs text-[#6B543D] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#C23531]" />
            <span className="font-semibold tracking-wider">新中式国风起名与名理测算工坊</span>
            <span className="text-[#C5A059]">・</span>
            <span className="text-[11px] text-[#8C7661]">传承三千年华夏文脉</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1C2022] leading-tight sm:leading-snug">
            赐子千金，不如教子一艺<br />
            <span className="text-[#C23531] font-normal">教子一艺，不如赐子良名</span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-[#685848] max-w-2xl mx-auto leading-relaxed">
            严循《诗经》《楚辞》《唐诗》《宋词》与先秦古籍，辅以五行八字喜用神生克与三才五格数理，为新生儿量身定制音律清正、意蕴深远的高格调雅名。
          </p>

          {/* 公信力与好评背书横幅 */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs text-[#7A6A5A]">
            <div className="flex items-center space-x-1 bg-white/80 px-3 py-1.5 rounded-md border border-[#E5D7C5]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span>已有 <strong>12,480+</strong> 位父母择得良名</span>
            </div>
            <div className="flex items-center space-x-1 bg-white/80 px-3 py-1.5 rounded-md border border-[#E5D7C5]">
              <Award className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>好评率 <strong>99.4%</strong></span>
            </div>
            <div className="flex items-center space-x-1 bg-white/80 px-3 py-1.5 rounded-md border border-[#E5D7C5]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C23531]" />
              <span>智能避雷 0 谐音歧义</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 主体工作区 (两栏/纵深布局) */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6 sm:-mt-8 relative z-20 space-y-12">
        {/* 模块一：多维精准信息录入表单 */}
        <NamingForm onSubmit={handleGenerateNames} loading={loading} />

        {/* 模块二：名字臻选卡片与名理深度报告展示区 */}
        <section id="section-names-results" className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E5D7C5] pb-4 gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-5 rounded-full bg-[#C23531]" />
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#2C3437]">
                  大师臻选良名鉴赏 (共 {names.length} 款)
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-[#786857] mt-1">
                包含 2 个免费精选与 6 个宗师级高定吉名 · 均附带典籍原文与五维雷达
              </p>
            </div>

            {/* 筛选与排序工具栏 */}
            <div className="flex flex-wrap items-center gap-2">
              {/* 分层过滤 */}
              <div className="flex rounded-lg bg-[#EFE4D4] p-0.5 text-xs">
                <button
                  onClick={() => setFilterTab('all')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    filterTab === 'all'
                      ? 'bg-white font-bold text-[#2C3437] shadow-2xs'
                      : 'text-[#6C5B4B]'
                  }`}
                >
                  全部 ({names.length})
                </button>
                <button
                  onClick={() => setFilterTab('free')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    filterTab === 'free'
                      ? 'bg-white font-bold text-[#2C3437] shadow-2xs'
                      : 'text-[#6C5B4B]'
                  }`}
                >
                  免费优选 (2)
                </button>
                <button
                  onClick={() => setFilterTab('vip')}
                  className={`px-3 py-1 rounded-md transition-colors flex items-center space-x-1 ${
                    filterTab === 'vip'
                      ? 'bg-[#C5A059] font-bold text-white shadow-2xs'
                      : 'text-[#7A5A1C]'
                  }`}
                >
                  <Crown className="w-3 h-3" />
                  <span>宗师VIP (6)</span>
                </button>
              </div>

              {/* 排序方式 */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1 text-xs rounded-lg border border-[#D5C4B0] bg-white text-[#5B493A]"
              >
                <option value="score">综合评分最高</option>
                <option value="rhythm">音律之美优先</option>
                <option value="culture">文化底蕴优先</option>
              </select>

              {/* 对比浮动唤起按钮 */}
              {compareIds.length > 0 && (
                <button
                  onClick={() => setIsCompareModalOpen(true)}
                  className="px-3 py-1 bg-[#C23531] text-white text-xs rounded-lg flex items-center space-x-1 shadow-xs animate-bounce"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>对比所选 ({compareIds.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* 商业化卡密提示条 (若未解锁 VIP) */}
          {!isVip && (
            <div className="bg-gradient-to-r from-[#F7EFE0] via-[#FAF3E8] to-[#F5EBDA] border border-[#DFCBB5] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center space-x-3 text-left">
                <div className="w-10 h-10 rounded-lg bg-[#C5A059]/20 flex items-center justify-center text-[#8C6D2B] shrink-0 border border-[#C5A059]/40">
                  <Key className="w-5 h-5 text-[#8C6D2B]" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#3E2E20]">
                    宗师级吉名与名理深度测算特权待解锁
                  </h4>
                  <p className="text-xs text-[#7A6A58] mt-0.5">
                    额外解锁 6 个宗师吉名、三才五格数理、五行喜用神雷达及无水印高清满月礼书海报
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsVipModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-[#C23531] hover:bg-[#A82824] text-white text-xs sm:text-sm font-semibold flex items-center space-x-1.5 shrink-0 transition-transform active:scale-95 shadow-sm"
              >
                <Crown className="w-4 h-4 text-[#FDE68A]" />
                <span>输入卡密 / 立即解锁全套</span>
              </button>
            </div>
          )}

          {/* 名字卡片网格列表 */}
          <div className="grid grid-cols-1 gap-6">
            {filteredAndSortedNames.map((nameItem, idx) => (
              <NameCard
                key={nameItem.id}
                name={nameItem}
                index={idx}
                isVip={isVip}
                isFavorite={favorites.some((f) => f.id === nameItem.id)}
                isCompareSelected={compareIds.includes(nameItem.id)}
                onToggleFavorite={() => toggleFavorite(nameItem)}
                onToggleCompare={() => toggleCompare(nameItem)}
                onOpenPoster={() => openPoster(nameItem)}
                onOpenVipModal={() => setIsVipModalOpen(true)}
              />
            ))}
          </div>
        </section>

        {/* 商业引流与导师定制起名专栏 */}
        <section className="bg-gradient-to-br from-[#F5EEE0] via-[#FAF5EB] to-[#F1E5D3] rounded-2xl border border-[#D5C2AC] p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center space-x-1 text-xs font-serif text-[#C23531] bg-[#C23531]/10 px-2 py-0.5 rounded-xs">
                <span>名师堂一对一精批</span>
              </div>
              <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#2C3437]">
                需要更高维度的家族祖训、辈分或特殊字义定制？
              </h3>
              <p className="text-xs sm:text-sm font-serif text-[#6C5C4D] max-w-xl leading-relaxed">
                添加起名导师微信，由资深易学名理导师亲自复核把关，考据族谱脉络，为您出具八字与三才五格详批建议书。
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <button
                onClick={() => setIsVipModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-[#C23531] hover:bg-[#A82824] text-white text-xs sm:text-sm font-semibold shadow-md flex items-center space-x-2 transition-transform active:scale-95"
              >
                <span>获取激活卡密</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsAppraisalModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-[#F9F5EE] border border-[#C5A059] text-[#7A5A1C] text-xs sm:text-sm font-semibold shadow-2xs transition-colors"
              >
                <span>已有名字鉴定打分</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* 4. 底部法律声明与文化规范 */}
      <LegalDisclaimer />

      {/* 5. 常驻悬浮微信导师引流组件 */}
      <WeChatFloatingButton />

      {/* 6. 各类功能弹窗 */}
      {/* VIP 解锁与卡密兑换弹窗 */}
      <VipUnlockModal
        isOpen={isVipModalOpen}
        onClose={() => setIsVipModalOpen(false)}
        onUnlockSuccess={handleUnlockSuccess}
      />

      {/* 已有名字深度测名鉴定弹窗 */}
      <NameAppraisalModal
        isOpen={isAppraisalModalOpen}
        onClose={() => setIsAppraisalModalOpen(false)}
        onJumpToGenerate={(sname) => {
          // 填入姓氏并触发
          handleGenerateNames({
            surname: sname,
            gender: 'boy',
            birthYear: 2026,
            birthMonth: 9,
            birthDay: 3,
            birthHourIndex: 4,
            calendarType: 'solar',
            culturalStyles: ['诗经典雅', '唐风律诗'],
            charCountPreference: 'double',
            avoidHarmfulHomophones: true,
            vipUnlocked: isVip,
          });
        }}
      />

      {/* 满月命名礼书海报长图预览与导出弹窗 */}
      <PosterModal
        isOpen={isPosterModalOpen}
        onClose={() => setIsPosterModalOpen(false)}
        name={activePosterName}
        bazi={currentBazi}
        gender={currentGender}
        isVip={isVip}
        onOpenVipModal={() => {
          setIsPosterModalOpen(false);
          setIsVipModalOpen(true);
        }}
      />

      {/* 多名字横向并排对比表与全家投票弹窗 */}
      <CompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        selectedNames={selectedCompareNames}
        onRemoveFromCompare={(id) => setCompareIds(compareIds.filter((cid) => cid !== id))}
        onSelectPoster={(n) => {
          setIsCompareModalOpen(false);
          openPoster(n);
        }}
      />

      {/* 收藏夹侧边抽屉 */}
      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        onRemoveFavorite={(id) => setFavorites(favorites.filter((f) => f.id !== id))}
        onSelectPoster={(n) => {
          setIsFavoritesOpen(false);
          openPoster(n);
        }}
        onSelectCompare={(n) => {
          if (!compareIds.includes(n.id)) {
            setCompareIds([...compareIds, n.id]);
          }
          setIsFavoritesOpen(false);
          setIsCompareModalOpen(true);
        }}
      />
    </div>
  );
}
