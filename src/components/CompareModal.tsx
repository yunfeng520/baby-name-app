import React, { useState } from 'react';
import { X, Scale, ThumbsUp, Heart, BookOpen, Trash2 } from 'lucide-react';
import { CuratedName } from '../types';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNames: CuratedName[];
  onRemoveFromCompare: (id: string) => void;
  onSelectPoster: (name: CuratedName) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  selectedNames,
  onRemoveFromCompare,
  onSelectPoster,
}) => {
  // 模拟全家投票计数
  const [votes, setVotes] = useState<Record<string, number>>({});

  if (!isOpen) return null;

  const handleVote = (id: string) => {
    setVotes((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-[#FCFAF6] rounded-2xl border border-[#D5C4B0] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* 顶部标题栏 */}
        <div className="bg-[#FAF5ED] px-6 py-4 border-b border-[#E8DCCB] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-[#C23531]" />
            <h3 className="font-serif font-bold text-lg sm:text-xl text-[#2C3437]">
              备选良名横向对比表 (多名PK与全家表决)
            </h3>
            <span className="text-xs font-serif text-[#877868] hidden sm:inline">
              已选 {selectedNames.length} 个备选名字
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-[#8C7A6A] hover:text-[#2C3437] p-1 rounded-full hover:bg-black/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 主体对比表滚动区 */}
        <div className="p-6 overflow-x-auto overflow-y-auto">
          {selectedNames.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Scale className="w-12 h-12 text-[#D0C0AC] mx-auto" />
              <p className="font-serif text-sm text-[#786959]">
                您尚未勾选需要对比的名字。请在名字卡片右上角勾选【对比PK】（推荐 2~3 个）。
              </p>
            </div>
          ) : (
            <div className="min-w-[640px]">
              <table className="w-full border-collapse border border-[#E5D7C5] text-xs sm:text-sm font-serif">
                <thead>
                  <tr className="bg-[#F6EFE3] text-[#2C3437]">
                    <th className="p-3 border border-[#E5D7C5] w-28 text-center">对比维度</th>
                    {selectedNames.map((n) => (
                      <th key={n.id} className="p-3 border border-[#E5D7C5] text-center relative">
                        <div className="font-bold text-lg sm:text-xl text-[#1E2224]">
                          {n.name}
                        </div>
                        <div className="text-xs text-[#876A4E] font-normal tracking-wider mt-0.5">
                          {n.pinyin.join(' ')}
                        </div>
                        <button
                          onClick={() => onRemoveFromCompare(n.id)}
                          className="absolute top-2 right-2 text-[#A89887] hover:text-[#C23531]"
                          title="移出对比"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E5D7C5]">
                  {/* 全家表决投票行 */}
                  <tr className="bg-[#FAF2E5]/50">
                    <td className="p-3 font-semibold text-[#8C6D2B] bg-[#F5ECDC] text-center">
                      全家投票表决
                    </td>
                    {selectedNames.map((n) => (
                      <td key={n.id} className="p-3 text-center border border-[#E5D7C5]">
                        <button
                          onClick={() => handleVote(n.id)}
                          className="px-3 py-1.5 rounded-full bg-[#C23531] hover:bg-[#A82824] text-white text-xs font-serif flex items-center space-x-1.5 mx-auto transition-transform active:scale-95 shadow-2xs"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>投一票 ({votes[n.id] || 0})</span>
                        </button>
                      </td>
                    ))}
                  </tr>

                  {/* 综合名理得分 */}
                  <tr>
                    <td className="p-3 font-semibold text-[#5B4838] bg-[#F8F2E7] text-center">
                      综合名理分
                    </td>
                    {selectedNames.map((n) => (
                      <td key={n.id} className="p-3 text-center border border-[#E5D7C5]">
                        <span className="text-2xl font-black text-[#C23531] font-sans">
                          {n.overallScore}
                        </span>
                        <span className="text-xs text-[#8A7868]"> 分</span>
                      </td>
                    ))}
                  </tr>

                  {/* 汉字与五行属性 */}
                  <tr>
                    <td className="p-3 font-semibold text-[#5B4838] bg-[#F8F2E7] text-center">
                      汉字五行
                    </td>
                    {selectedNames.map((n) => (
                      <td key={n.id} className="p-3 border border-[#E5D7C5] text-center space-x-1">
                        {n.characters.map((c, i) => (
                          <span
                            key={i}
                            className="inline-block px-1.5 py-0.5 rounded-xs bg-[#F0E5D4] text-[#4A3C30] text-xs"
                          >
                            {c.char} [{c.element}]
                          </span>
                        ))}
                      </td>
                    ))}
                  </tr>

                  {/* 声调韵律 */}
                  <tr>
                    <td className="p-3 font-semibold text-[#5B4838] bg-[#F8F2E7] text-center">
                      音调韵律
                    </td>
                    {selectedNames.map((n) => (
                      <td key={n.id} className="p-3 border border-[#E5D7C5] text-center text-[#554536]">
                        {n.tones.join(' · ')}
                        <span className="block text-[11px] text-[#8C7A6A] mt-0.5">
                          音律分：{n.radarScores.rhythm}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* 典籍出处原句 */}
                  <tr>
                    <td className="p-3 font-semibold text-[#5B4838] bg-[#F8F2E7] text-center">
                      典籍溯源
                    </td>
                    {selectedNames.map((n) => (
                      <td key={n.id} className="p-3 border border-[#E5D7C5] text-[#332A23] leading-relaxed">
                        <div className="font-semibold text-[#8C6D2B] mb-0.5">
                          《{n.poemSource.title}》
                        </div>
                        <div className="italic text-xs text-[#554536]">
                          “{n.poemSource.quote}”
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* 三才五格格局 */}
                  <tr>
                    <td className="p-3 font-semibold text-[#5B4838] bg-[#F8F2E7] text-center">
                      三才数理
                    </td>
                    {selectedNames.map((n) => (
                      <td key={n.id} className="p-3 border border-[#E5D7C5] text-center">
                        <span className="font-bold text-[#2C3437]">{n.sancaiWuge.sancai}</span>
                        <span className="ml-1 text-xs text-[#C23531]">({n.sancaiWuge.sancaiFortune})</span>
                      </td>
                    ))}
                  </tr>

                  {/* 核心寓意寄托 */}
                  <tr>
                    <td className="p-3 font-semibold text-[#5B4838] bg-[#F8F2E7] text-center">
                      核心寓意
                    </td>
                    {selectedNames.map((n) => (
                      <td key={n.id} className="p-3 border border-[#E5D7C5] text-[#4D3F32] leading-relaxed">
                        {n.comprehensiveMeaning}
                      </td>
                    ))}
                  </tr>

                  {/* 操作行 */}
                  <tr>
                    <td className="p-3 font-semibold text-[#5B4838] bg-[#F8F2E7] text-center">
                      海报生成
                    </td>
                    {selectedNames.map((n) => (
                      <td key={n.id} className="p-3 border border-[#E5D7C5] text-center">
                        <button
                          onClick={() => {
                            onSelectPoster(n);
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-lg border border-[#C5A059] text-[#78591E] bg-[#FAF5EB] hover:bg-[#F2E7D3] text-xs font-serif font-medium transition-colors"
                        >
                          生成礼书海报
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
