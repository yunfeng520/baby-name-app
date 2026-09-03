import React, { useState } from 'react';
import { X, Crown, CheckCircle2, ShieldCheck, Copy, Check, MessageSquareCode, Sparkles } from 'lucide-react';

interface VipUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockSuccess: () => void;
}

export const VipUnlockModal: React.FC<VipUnlockModalProps> = ({
  isOpen,
  onClose,
  onUnlockSuccess,
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async (inputCode?: string) => {
    const targetCode = (inputCode || code).trim();
    if (!targetCode) {
      setErrorMsg('请输入卡密或激活码');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: targetCode }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        onUnlockSuccess();
        onClose();
      } else {
        setErrorMsg(data.message || '卡密无效或已失效');
      }
    } catch (err) {
      setErrorMsg('网络校验繁忙，请稍候重试');
    } finally {
      setLoading(false);
    }
  };

  const copyWeChatId = () => {
    navigator.clipboard.writeText('daoshi_mingli_888');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#FDFBF7] rounded-xl border border-[#D8C7B0] shadow-2xl overflow-hidden">
        {/* 顶部古风祥云与朱砂缎带 */}
        <div className="bg-gradient-to-r from-[#9C201D] via-[#C23531] to-[#B32B27] text-white px-6 py-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 mb-1">
            <Crown className="w-6 h-6 text-[#F9D77E] fill-[#F9D77E]" />
            <span className="font-serif text-xs uppercase tracking-widest text-[#F9D77E] font-bold">
              VIP MASTER SELECTION
            </span>
          </div>
          <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#FFF8E7]">
            解锁宗师级吉名 · 享名理全套特权
          </h3>
          <p className="text-xs sm:text-sm text-[#FFE8D6] mt-1 font-serif">
            已有 12,480+ 位宝爸宝妈在此为宝宝择得良名，好评率 99.4%
          </p>
        </div>

        {/* 核心特权清单 */}
        <div className="p-6 space-y-5">
          <div className="bg-[#F6F0E4] rounded-lg p-4 border border-[#E8DCCB] space-y-2.5">
            <h4 className="font-serif font-semibold text-sm text-[#5B4636] flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-[#C5A059]" />
              <span>VIP 尊享全方位名理特权：</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-serif text-[#3E342B]">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#C23531] shrink-0" />
                <span>额外解锁 6 个宗师级吉名</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#C23531] shrink-0" />
                <span>三才五格数理深度测算</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#C23531] shrink-0" />
                <span>五行喜用神平衡雷达图</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#C23531] shrink-0" />
                <span>防谐音/歧义/重名率分析</span>
              </div>
              <div className="flex items-center space-x-1.5 sm:col-span-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#C23531] shrink-0" />
                <span>无水印高清满月命名礼书海报长图导出</span>
              </div>
            </div>
          </div>

          {/* 卡密激活区 */}
          <div className="space-y-3">
            <label className="block text-xs sm:text-sm font-serif font-medium text-[#2C3437]">
              输入卡密 / 激活码立即兑换：
            </label>
            <div className="flex space-x-2">
              <input
                id="input-vip-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="例如：VIP888 或 JINXIU2026"
                className="flex-1 px-3.5 py-2.5 rounded-lg border border-[#D5C7B4] bg-white focus:outline-none focus:ring-2 focus:ring-[#C23531] font-mono text-sm uppercase tracking-wider"
              />
              <button
                id="btn-verify-vip"
                onClick={() => handleVerify()}
                disabled={loading}
                className="px-5 py-2.5 rounded-lg bg-[#C23531] hover:bg-[#A82824] text-white font-serif font-medium text-sm transition-colors disabled:opacity-50 shrink-0 shadow-xs"
              >
                {loading ? '校验中...' : '立即激活'}
              </button>
            </div>

            {errorMsg && (
              <p className="text-xs text-[#C23531] font-serif">{errorMsg}</p>
            )}

            {/* 快速体验快捷填入按钮 */}
            <div className="flex items-center justify-between text-[11px] font-serif text-[#8A7969]">
              <span>体验测试演示卡密：</span>
              <button
                onClick={() => {
                  setCode('VIP888');
                  handleVerify('VIP888');
                }}
                className="text-[#C23531] hover:underline font-bold"
              >
                点此一键填入 VIP888 解锁测试 &gt;
              </button>
            </div>
          </div>

          <div className="border-t border-[#E8DFC8] pt-4">
            {/* 导师微信引流区 */}
            <div className="bg-[#FAF5EC] border border-[#EADFCF] rounded-lg p-3.5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* 微信二维码占位 */}
                <div className="w-16 h-16 rounded-md bg-white border border-[#D8C7B0] p-1 flex flex-col items-center justify-center shrink-0 shadow-2xs">
                  <div className="w-full h-full bg-[#344047] rounded-xs flex items-center justify-center text-white text-[9px] font-serif text-center leading-tight">
                    起名导师<br/>微信扫码
                  </div>
                </div>

                <div>
                  <h5 className="font-serif font-bold text-xs sm:text-sm text-[#2C3437]">
                    未获得卡密？添加起名导师微信
                  </h5>
                  <p className="text-[11px] font-serif text-[#786959] mt-0.5">
                    一对一起名答疑 · 赠送专属激活卡密
                  </p>
                  <p className="text-[11px] font-mono text-[#544336] mt-1 font-semibold">
                    微信号：daoshi_mingli_888
                  </p>
                </div>
              </div>

              <button
                id="btn-copy-wechat-vip"
                onClick={copyWeChatId}
                className="px-3 py-1.5 rounded-md bg-white border border-[#C5A059] text-[#8C6D2B] hover:bg-[#F6EEDC] text-xs font-serif flex items-center space-x-1 shrink-0 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-green-600">已复制</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>复制微信号</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 底部安全承诺 */}
        <div className="bg-[#F5EFE4] px-6 py-3 border-t border-[#E8DCCB] flex items-center justify-center space-x-2 text-[11px] font-serif text-[#877868]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>中华传统音韵古籍与智能名理保障 · 一次解锁本会话永久享用</span>
        </div>
      </div>
    </div>
  );
};
