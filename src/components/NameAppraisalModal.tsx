import React, { useState } from 'react';
import { X, Search, Sparkles, AlertCircle, CheckCircle2, BookOpen, Volume2, ShieldCheck } from 'lucide-react';
import { NameAppraisalResult, Gender } from '../types';
import { FiveDimensionRadar } from './FiveDimensionRadar';

interface NameAppraisalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToGenerate: (nameSurname: string) => void;
}

export const NameAppraisalModal: React.FC<NameAppraisalModalProps> = ({
  isOpen,
  onClose,
  onJumpToGenerate,
}) => {
  const [fullName, setFullName] = useState('李思齐');
  const [gender, setGender] = useState<Gender>('boy');
  const [birthDate, setBirthDate] = useState('2026-09-03');
  const [birthHour, setBirthHour] = useState('辰时 (07:00-09:00)');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NameAppraisalResult | null>(null);

  if (!isOpen) return null;

  const handleAppraise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/analyze-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          gender,
          birthDate,
          birthHour,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#FCFAF6] rounded-2xl border border-[#D5C4B0] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* 顶部标题栏 */}
        <div className="bg-[#FAF5ED] px-6 py-4 border-b border-[#E8DCCB] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-4 rounded-full bg-[#C23531]" />
            <h3 className="font-serif font-bold text-lg sm:text-xl text-[#2C3437]">
              已有名字 · 深度测名与名理鉴定
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#8C7A6A] hover:text-[#2C3437] p-1 rounded-full hover:bg-black/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 主体滚动区 */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* 输入表单 */}
          <form onSubmit={handleAppraise} className="space-y-4 bg-[#F8F2E7] p-4 rounded-xl border border-[#E5D7C3]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-serif font-semibold text-[#2C3437] mb-1">
                  待测名字（含姓氏）
                </label>
                <input
                  id="input-appraise-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="例如：李思齐、张若初"
                  className="w-full px-3.5 py-2 rounded-lg border border-[#D5C4B0] bg-white font-serif text-sm text-[#2C3437]"
                />
              </div>

              <div>
                <label className="block text-xs font-serif font-semibold text-[#2C3437] mb-1">
                  宝宝性别
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGender('boy')}
                    className={`py-2 text-xs font-serif rounded-lg border transition-colors ${
                      gender === 'boy'
                        ? 'bg-[#C23531] text-white border-[#C23531]'
                        : 'bg-white text-[#564738] border-[#D5C4B0]'
                    }`}
                  >
                    男宝
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('girl')}
                    className={`py-2 text-xs font-serif rounded-lg border transition-colors ${
                      gender === 'girl'
                        ? 'bg-[#C23531] text-white border-[#C23531]'
                        : 'bg-white text-[#564738] border-[#D5C4B0]'
                    }`}
                  >
                    女宝
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              id="btn-submit-appraise"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-[#C23531] hover:bg-[#A82824] text-white font-serif text-sm font-semibold flex items-center justify-center space-x-1.5 shadow-sm transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>多维名理测算鉴定中...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>立即全方位测算打分</span>
                </>
              )}
            </button>
          </form>

          {/* 测算结果展示 */}
          {result && (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* 总分与大字 */}
              <div className="bg-gradient-to-br from-[#FAF5EC] to-[#F3E7D5] p-5 rounded-xl border border-[#DFCBB5] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-serif text-[#876F56]">
                    名字测算评定报告
                  </span>
                  <h4 className="font-serif font-bold text-3xl text-[#1E2224] tracking-widest my-1">
                    {result.fullName}
                  </h4>
                  <div className="flex space-x-1 mt-1">
                    {result.characters.map((c, i) => (
                      <span key={i} className="text-xs font-serif px-1.5 py-0.5 rounded-xs bg-[#EFE4D2] text-[#5A4839]">
                        {c.char} ({c.pinyin}) · 五行属{c.element}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-center sm:text-right">
                  <div className="inline-flex items-baseline space-x-1">
                    <span className="text-xs font-serif text-[#786857]">综合名理分：</span>
                    <span className="text-4xl font-serif font-black text-[#C23531]">
                      {result.overallScore}
                    </span>
                    <span className="text-xs text-[#786857]">/ 100</span>
                  </div>
                  <p className="text-[11px] font-serif text-[#8A7969] mt-0.5">
                    三才格局：{result.sancaiWuge.sancai} ({result.sancaiWuge.sancaiFortune})
                  </p>
                </div>
              </div>

              {/* 五维雷达图与音律 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="bg-white p-3 rounded-xl border border-[#E7DAC7] flex flex-col items-center">
                  <span className="text-xs font-serif font-bold text-[#554335] mb-1">
                    五维名理雷达图
                  </span>
                  <FiveDimensionRadar scores={result.radarScores} size={190} />
                </div>

                <div className="space-y-2.5 text-xs font-serif">
                  {/* 音律 */}
                  <div className="bg-white p-3 rounded-lg border border-[#E8DCCB]">
                    <span className="font-bold text-[#2C3437] block mb-0.5">
                      音律顺口度评分：{result.rhythmAnalysis.flowScore} 分 ({result.rhythmAnalysis.pingze})
                    </span>
                    <p className="text-[#6C5B4B] text-[11px]">
                      {result.rhythmAnalysis.comment}
                    </p>
                  </div>

                  {/* 谐音避雷 */}
                  <div className="bg-white p-3 rounded-lg border border-[#E8DCCB]">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-[#2C3437]">谐音风险检测</span>
                      <span className="text-xs font-bold text-[#2E7D32]">
                        {result.homophoneRisk.level}风险
                      </span>
                    </div>
                    <p className="text-[#6C5B4B] text-[11px]">
                      {result.homophoneRisk.description}
                    </p>
                  </div>

                  {/* 重名预警 */}
                  <div className="bg-white p-3 rounded-lg border border-[#E8DCCB]">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-[#2C3437]">全国重名指数</span>
                      <span className="text-xs font-bold text-[#C5A059]">
                        {result.duplicateIndex.level}
                      </span>
                    </div>
                    <p className="text-[#6C5B4B] text-[11px]">
                      {result.duplicateIndex.comment}
                    </p>
                  </div>
                </div>
              </div>

              {/* 宗师建议与转化引导 */}
              <div className="bg-[#FAF4EB] p-4 rounded-xl border border-[#E5D7C3] space-y-2">
                <span className="text-xs font-serif font-bold text-[#C23531] block">
                  【宗师专家名理建议】
                </span>
                <p className="text-xs font-serif text-[#4D3E31] leading-relaxed">
                  {result.expertAdvice}
                </p>
              </div>

              {/* 引导去智能推演 */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    onJumpToGenerate(result.surname);
                    onClose();
                  }}
                  className="px-5 py-2.5 rounded-lg bg-[#C23531] hover:bg-[#A82824] text-white font-serif text-xs sm:text-sm font-semibold flex items-center space-x-1.5 shadow-md"
                >
                  <Sparkles className="w-4 h-4 text-[#FDE68A]" />
                  <span>为【{result.surname}】姓氏一键推演更优国风吉名 &gt;</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
