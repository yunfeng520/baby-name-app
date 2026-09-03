import React, { useState, useEffect } from 'react';
import { X, Download, Share2, Sparkles, Crown, Check, AlertCircle } from 'lucide-react';
import { CuratedName, BaziCalculation } from '../types';
import { generateNamingPoster } from '../utils/canvasPoster';

interface PosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  name: CuratedName | null;
  bazi: BaziCalculation | null;
  gender: string;
  isVip: boolean;
  onOpenVipModal: () => void;
}

export const PosterModal: React.FC<PosterModalProps> = ({
  isOpen,
  onClose,
  name,
  bazi,
  gender,
  isVip,
  onOpenVipModal,
}) => {
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    if (isOpen && name && bazi) {
      setGenerating(true);
      generateNamingPoster({
        name,
        bazi,
        babyGender: gender,
        isWatermarked: !isVip,
      })
        .then((url) => {
          setPosterUrl(url);
        })
        .catch((err) => {
          console.error('海报生成失败', err);
        })
        .finally(() => {
          setGenerating(false);
        });
    } else {
      setPosterUrl(null);
    }
  }, [isOpen, name, bazi, gender, isVip]);

  if (!isOpen || !name) return null;

  const handleDownload = () => {
    if (!posterUrl) return;
    const link = document.createElement('a');
    link.href = posterUrl;
    link.download = `锦绣良名_满月命名礼书_${name.name}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#FAF6F0] rounded-2xl border border-[#D5C4B0] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[92vh]">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 text-[#8C7A6A] hover:text-[#2C3437] p-1.5 rounded-full bg-white/80 backdrop-blur-xs shadow-xs"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 左侧：高清海报预览区 */}
        <div className="flex-1 bg-[#2C3437] p-4 flex items-center justify-center overflow-y-auto min-h-[360px] md:min-h-[560px]">
          {generating ? (
            <div className="flex flex-col items-center space-y-3 text-white">
              <div className="w-8 h-8 border-3 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
              <span className="font-serif text-sm text-[#F0E6D8]">
                古法宣纸与朱砂印鉴渲染中...
              </span>
            </div>
          ) : posterUrl ? (
            <div className="relative max-w-[320px] sm:max-w-[340px] shadow-2xl rounded-sm overflow-hidden border border-[#524436]">
              <img
                src={posterUrl}
                alt={`${name.name} 满月命名礼书`}
                className="w-full h-auto object-contain block"
              />
            </div>
          ) : null}
        </div>

        {/* 右侧：操作与自媒体裂变指引 */}
        <div className="w-full md:w-84 p-6 flex flex-col justify-between space-y-4 bg-[#FDFCFA]">
          <div className="space-y-4">
            <div>
              <span className="px-2 py-0.5 rounded-xs text-[10px] font-serif font-bold text-[#8C6D2B] bg-[#C5A059]/15 border border-[#C5A059]/40">
                周朝六礼 · 满月命名仪式
              </span>
              <h3 className="font-serif font-bold text-xl text-[#2C3437] mt-1.5">
                国风满月命名礼书海报
              </h3>
              <p className="text-xs font-serif text-[#786959] mt-1">
                9:16 高清手机壁纸长图 · 支持小红书与微信朋友圈分享
              </p>
            </div>

            {/* 水印与VIP状态 */}
            {!isVip ? (
              <div className="bg-[#FAF2E6] border border-[#E8DCCB] rounded-xl p-3.5 space-y-2">
                <div className="flex items-center space-x-1.5 text-xs font-serif font-bold text-[#A82824]">
                  <Crown className="w-4 h-4 text-[#C5A059]" />
                  <span>当前为免费预览（含优雅水印）</span>
                </div>
                <p className="text-[11px] font-serif text-[#7A6A5A] leading-relaxed">
                  解锁 VIP 可一键导出 1080P 超高清、纯净无水印的满月纪念长图，永久珍藏！
                </p>
                <button
                  onClick={onOpenVipModal}
                  className="w-full py-2 rounded-lg bg-[#C23531] hover:bg-[#A82824] text-white text-xs font-serif font-semibold transition-colors shadow-2xs"
                >
                  输入卡密 / 立即解锁无水印版
                </button>
              </div>
            ) : (
              <div className="bg-[#EEF6F0] border border-[#C6E2CD] rounded-xl p-3 text-xs font-serif text-[#2E7D32] flex items-center space-x-2">
                <Crown className="w-4 h-4 text-[#C5A059] fill-[#C5A059]" />
                <span>您已解锁 VIP 宗师尊享特权，已生成无水印超高清长图！</span>
              </div>
            )}

            {/* 文化亮点 */}
            <div className="space-y-1.5 text-xs font-serif text-[#5E4E40]">
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C23531]" />
                <span>古法生宣宣纸质感底纹</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C23531]" />
                <span>朱砂篆刻印章（御选、上上签）</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C23531]" />
                <span>经典竖排书法字体排版</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C23531]" />
                <span>四柱八字与喜用五行金印备书</span>
              </div>
            </div>
          </div>

          {/* 底部操作按钮 */}
          <div className="space-y-2 pt-2 border-t border-[#E8DCCB]">
            <button
              id="btn-download-poster"
              onClick={handleDownload}
              disabled={generating || !posterUrl}
              className="w-full py-3 rounded-xl bg-[#2C3437] hover:bg-[#1E2528] text-white font-serif text-sm font-semibold flex items-center justify-center space-x-2 shadow-md transition-all active:scale-98 disabled:opacity-50"
            >
              {downloaded ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  <span>礼书海报已开始保存</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-[#C5A059]" />
                  <span>下载保存高清礼书长图</span>
                </>
              )}
            </button>

            <p className="text-center text-[10px] font-serif text-[#9A8978]">
              移动端手机亦可长按上方图片直接“保存到手机相册”
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
