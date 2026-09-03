import React, { useState } from 'react';
import { MessageCircle, X, Copy, Check, Sparkles, UserCheck } from 'lucide-react';

interface WeChatFloatingButtonProps {
  onOpenConsult?: () => void;
}

export const WeChatFloatingButton: React.FC<WeChatFloatingButtonProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('daoshi_mingli_888');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed bottom-6 right-5 z-40 flex flex-col items-end">
      {/* 展开的弹窗卡片 */}
      {isOpen && (
        <div className="mb-3 w-76 sm:w-84 bg-[#FCFAF6] rounded-xl border border-[#D5C4AC] shadow-xl p-4 text-[#2C3437] animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between border-b border-[#E8DCCB] pb-2 mb-3">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2E7D32]" />
              <span className="font-serif font-bold text-sm text-[#3E2E20]">起名导师在线咨询</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#8C7B6B] hover:text-[#2C3437] p-0.5 rounded-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-3 mb-3">
            {/* 二维码占位 */}
            <div className="w-20 h-20 bg-white border border-[#D0BFAB] rounded-md p-1.5 flex flex-col items-center justify-center shrink-0 shadow-2xs">
              <div className="w-full h-full bg-[#2E3B32] rounded-xs flex flex-col items-center justify-center text-white text-[9px] font-serif p-1 text-center leading-tight">
                <span className="font-bold text-[#E2C792] mb-0.5">名理宗师</span>
                微信扫码添加
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-serif font-medium text-[#2C3437]">
                一对一专家高定八字起名
              </p>
              <p className="text-[11px] font-serif text-[#786959] leading-tight">
                人工精批 · 辈分融汇 · 音律核定
              </p>
              <p className="text-[11px] font-mono text-[#C23531] font-bold">
                daoshi_mingli_888
              </p>
            </div>
          </div>

          {/* 转化公信力引语 */}
          <div className="bg-[#F5ECE0] rounded-md p-2 text-[11px] font-serif text-[#6C5B4B] mb-3 flex items-start space-x-1.5">
            <UserCheck className="w-3.5 h-3.5 text-[#C5A059] shrink-0 mt-0.5" />
            <span>已有 12,480+ 位宝爸宝妈在此为宝宝择得良名，好评率 99.4%</span>
          </div>

          {/* 复制微信号按钮 */}
          <button
            id="btn-copy-wechat-float"
            onClick={handleCopy}
            className="w-full py-2 rounded-lg bg-[#2E7D32] hover:bg-[#256628] text-white text-xs font-serif font-medium flex items-center justify-center space-x-1.5 transition-colors shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>已复制微信号，可直接前往微信添加</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>一键复制导师微信号</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* 常驻悬浮按钮 */}
      <button
        id="btn-float-advisor"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center space-x-2 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-[#C23531] to-[#A3221E] text-white shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-[#E5C992] transform hover:scale-105 active:scale-95"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FCE38A] opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FCE38A]" />
        </span>
        <MessageCircle className="w-4 h-4 text-[#FFF2D6]" />
        <span className="font-serif text-xs font-bold tracking-wide">
          导师一对一咨询
        </span>
      </button>
    </div>
  );
};
