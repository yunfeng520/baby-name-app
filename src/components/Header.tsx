import React from 'react';
import { Crown, Sparkles, BookOpen, Heart, MessageCircle, Key } from 'lucide-react';

interface HeaderProps {
  isVip: boolean;
  onOpenVipModal: () => void;
  onOpenAppraisalModal: () => void;
  onOpenFavorites: () => void;
  onOpenAdvisorModal: () => void;
  favoriteCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  isVip,
  onOpenVipModal,
  onOpenAppraisalModal,
  onOpenFavorites,
  onOpenAdvisorModal,
  favoriteCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FBF9F5]/95 backdrop-blur-md border-b border-[#E5DFD5] shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        {/* 左侧品牌 Logo 与文化印章 */}
        <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-sm bg-[#C23531] flex items-center justify-center shadow-sm border border-[#A82824]">
            <span className="font-serif font-black text-white text-lg sm:text-xl tracking-tighter">
              良名
            </span>
            {/* 角标小红点 */}
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#C5A059] border border-white" />
          </div>

          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="font-serif font-bold text-lg sm:text-xl tracking-wide text-[#2C3437]">
                锦绣良名
              </h1>
              <span className="px-1.5 py-0.5 rounded-xs text-[10px] sm:text-[11px] font-serif border border-[#C5A059]/50 text-[#8F7038] bg-[#C5A059]/10">
                国风智能工坊
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-[#7A6D60] font-serif hidden sm:block">
              周朝六礼 · 典籍溯源 · 五行命盘 · 承袭千古文脉
            </p>
          </div>
        </div>

        {/* 右侧导航与功能操作 */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* 已有名字深度测名鉴定 */}
          <button
            id="btn-open-appraisal"
            onClick={onOpenAppraisalModal}
            className="flex items-center space-x-1 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-serif text-[#5B4838] hover:text-[#C23531] hover:bg-[#F3EDE2] rounded-md transition-colors border border-[#E5DFD5]"
            title="对已有名字进行全方位测算打分"
          >
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C5A059]" />
            <span>测名鉴定</span>
          </button>

          {/* 收藏夹 */}
          <button
            id="btn-open-favorites"
            onClick={onOpenFavorites}
            className="relative flex items-center space-x-1 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-serif text-[#5B4838] hover:text-[#C23531] hover:bg-[#F3EDE2] rounded-md transition-colors border border-[#E5DFD5]"
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${favoriteCount > 0 ? 'text-[#C23531] fill-[#C23531]' : 'text-[#8A7968]'}`} />
            <span className="hidden sm:inline">我的收藏</span>
            {favoriteCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#C23531] text-white text-[10px] font-bold">
                {favoriteCount}
              </span>
            )}
          </button>

          {/* 导师微信 */}
          <button
            id="btn-header-advisor"
            onClick={onOpenAdvisorModal}
            className="hidden md:flex items-center space-x-1 px-3 py-2 text-xs sm:text-sm font-serif text-[#3E6B48] bg-[#EEF5F0] hover:bg-[#E2EFE5] border border-[#C5DDCB] rounded-md transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-[#2E7D32]" />
            <span>起名导师</span>
          </button>

          {/* VIP 卡密兑换与状态 */}
          {isVip ? (
            <div className="flex items-center space-x-1 px-3 py-1.5 rounded-md bg-gradient-to-r from-[#C5A059]/20 to-[#E8D09A]/30 border border-[#C5A059] text-[#7A5B1E] font-serif text-xs sm:text-sm font-semibold shadow-2xs">
              <Crown className="w-4 h-4 text-[#C5A059] fill-[#C5A059]" />
              <span>宗师VIP尊享</span>
            </div>
          ) : (
            <button
              id="btn-header-vip"
              onClick={onOpenVipModal}
              className="flex items-center space-x-1 px-3 py-1.5 sm:py-2 rounded-md bg-[#C23531] hover:bg-[#A82824] text-white font-serif text-xs sm:text-sm font-medium shadow-sm transition-all transform active:scale-98"
            >
              <Key className="w-3.5 h-3.5 text-[#FEE2E2]" />
              <span>卡密解锁</span>
              <span className="hidden lg:inline text-[11px] opacity-85">/ 兑换VIP</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
