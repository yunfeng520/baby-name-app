import React, { useState } from 'react';
import { ShieldCheck, Info, X } from 'lucide-react';

export const LegalDisclaimer: React.FC = () => {
  const [showAgreementModal, setShowAgreementModal] = useState(false);

  return (
    <footer className="mt-16 border-t border-[#E8DCCB] bg-[#F8F4EC] py-8 px-4 text-center font-serif text-xs text-[#786858]">
      <div className="max-w-4xl mx-auto space-y-3">
        {/* 常驻温情合规提示 */}
        <div className="flex items-center justify-center space-x-1.5 text-[#5C4D40] font-medium">
          <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
          <span>合规与文化声明</span>
        </div>

        <p className="max-w-2xl mx-auto leading-relaxed text-[#6E5E50]">
          本工具依托中华传统典籍（《诗经》《楚辞》《唐诗》《宋词》《易经》等）与现代人工智能语言模型提供文化灵感，旨在传承汉字音韵之美与美好寄托，名理测算结果仅供文化参详与起名灵感，请结合家庭喜好与长辈期许自行择选。
        </p>

        <div className="flex items-center justify-center space-x-4 pt-1 text-[11px] text-[#8C7A6A]">
          <button
            onClick={() => setShowAgreementModal(true)}
            className="hover:text-[#C23531] underline decoration-[#C5A059]"
          >
            《锦绣良名用户服务协议与隐私政策》
          </button>
          <span>·</span>
          <span>© 2026 锦绣良名工坊 保留所有权利</span>
        </div>
      </div>

      {/* 用户协议弹窗 */}
      {showAgreementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-[#FCFAF6] rounded-2xl border border-[#D5C4B0] p-6 shadow-2xl text-left space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#E8DCCB] pb-3">
              <h4 className="font-serif font-bold text-base text-[#2C3437]">
                锦绣良名 · 用户服务协议与文化声明
              </h4>
              <button
                onClick={() => setShowAgreementModal(false)}
                className="text-[#8C7A6A] hover:text-[#2C3437] p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 text-xs font-serif text-[#554536] leading-relaxed pr-1">
              <p>
                <strong>一、服务宗旨：</strong>
                “锦绣良名 · 新生儿国风智能臻选工坊”致力于推广中华优秀传统汉字文化与古典文学音律。所有名字生成均依托经史子集文献库与前沿语言模型。
              </p>
              <p>
                <strong>二、知识产权与内容合规：</strong>
                用户基于本平台生成导出的满月命名礼书海报，可用于家庭纪念、自媒体朋友圈与小红书分享。严禁用于任何违法违规宣传。
              </p>
              <p>
                <strong>三、隐私与数据保护：</strong>
                本工坊严格保障用户隐私，生辰信息仅用于单次推算逻辑，在本地浏览器通过 LocalStorage 保障您的个人收藏与历史记录安全，绝不泄露给任何第三方机构。
              </p>
              <p>
                <strong>四、民俗与科学理念：</strong>
                名字是父母给予宝宝的第一份厚礼。本平台提供的八字五行平衡雷达与三才五格数理属于传统民俗文化探究范畴，请理性看待，以爱与文化滋养孩子健康成长。
              </p>
            </div>

            <div className="pt-2 border-t border-[#E8DCCB] flex justify-end">
              <button
                onClick={() => setShowAgreementModal(false)}
                className="px-5 py-2 rounded-lg bg-[#C23531] text-white text-xs font-serif font-semibold"
              >
                我已阅读并知悉
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
