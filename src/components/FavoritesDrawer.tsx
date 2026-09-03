import React from 'react';
import { X, Heart, FileText, Scale, Trash2 } from 'lucide-react';
import { CuratedName } from '../types';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: CuratedName[];
  onRemoveFavorite: (id: string) => void;
  onSelectPoster: (name: CuratedName) => void;
  onSelectCompare: (name: CuratedName) => void;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  favorites,
  onRemoveFavorite,
  onSelectPoster,
  onSelectCompare,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-2xs animate-in fade-in duration-150">
      <div className="w-full max-w-md h-full bg-[#FCFAF6] border-l border-[#D5C4B0] shadow-2xl flex flex-col">
        {/* 顶部标题栏 */}
        <div className="p-5 border-b border-[#E8DCCB] bg-[#FAF5ED] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-[#C23531] fill-[#C23531]" />
            <h3 className="font-serif font-bold text-lg text-[#2C3437]">
              心仪良名收藏夹
            </h3>
            <span className="text-xs font-serif text-[#877868]">
              ({favorites.length})
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-[#8C7A6A] hover:text-[#2C3437] p-1 rounded-full hover:bg-black/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 列表区 */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {favorites.length === 0 ? (
            <div className="text-center py-20 text-[#8C7B6B] space-y-2">
              <Heart className="w-10 h-10 mx-auto text-[#D5C4B0]" />
              <p className="font-serif text-sm">暂无收藏的名字</p>
              <p className="text-xs text-[#A89887]">点击卡片右上角的红心可快速存入</p>
            </div>
          ) : (
            favorites.map((name) => (
              <div
                key={name.id}
                className="bg-white rounded-xl p-4 border border-[#E5D7C5] shadow-2xs space-y-2.5 relative"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-2xl text-[#1E2224] tracking-wide">
                      {name.name}
                    </h4>
                    <p className="text-xs font-serif text-[#856C53] mt-0.5">
                      {name.pinyin.join(' ')} · {name.tones.join(' ')}
                    </p>
                  </div>

                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-sans font-bold text-[#C23531]">
                      {name.overallScore}
                    </span>
                    <span className="text-[10px] text-[#8C7A6A]">分</span>
                    <button
                      onClick={() => onRemoveFavorite(name.id)}
                      className="text-[#B5A595] hover:text-[#C23531] p-1 ml-1"
                      title="移除收藏"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs font-serif text-[#554536] line-clamp-2">
                  <strong className="text-[#8C6D2B]">《{name.poemSource.title}》</strong> {name.poemSource.quote}
                </p>

                <div className="flex items-center space-x-2 pt-1 border-t border-[#F2E8DC]">
                  <button
                    onClick={() => {
                      onSelectPoster(name);
                      onClose();
                    }}
                    className="flex-1 py-1.5 rounded-md bg-[#FAF5EB] hover:bg-[#F2E7D3] border border-[#C5A059] text-[#78591E] text-xs font-serif flex items-center justify-center space-x-1 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>命名礼书海报</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectCompare(name);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-md bg-white border border-[#D5C4B0] hover:bg-[#F8F4EC] text-xs font-serif text-[#4D3F32] flex items-center space-x-1 transition-colors"
                  >
                    <Scale className="w-3.5 h-3.5 text-[#C23531]" />
                    <span>去对比</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
