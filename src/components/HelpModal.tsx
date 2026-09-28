import React from 'react';
import { X, Keyboard, MousePointer, Crosshair, Zap, Shield, Sparkles } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col">
        
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">게임 조작법 및 공략 가이드</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <h4 className="font-bold text-slate-200 mb-2 flex items-center gap-1.5">
              <MousePointer className="w-4 h-4 text-cyan-400" />
              <span>기본 조작키</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              <div><kbd className="px-1.5 py-0.5 rounded bg-slate-700 font-mono text-cyan-300">W, A, S, D</kbd> 이동</div>
              <div><kbd className="px-1.5 py-0.5 rounded bg-slate-700 font-mono text-cyan-300">마우스</kbd> 조준</div>
              <div><kbd className="px-1.5 py-0.5 rounded bg-slate-700 font-mono text-cyan-300">좌클릭 / Space</kbd> 사격</div>
              <div><kbd className="px-1.5 py-0.5 rounded bg-slate-700 font-mono text-cyan-300">E 키</kbd> 자동 발사 토글</div>
              <div><kbd className="px-1.5 py-0.5 rounded bg-slate-700 font-mono text-cyan-300">C 키</kbd> 자동 회전 토글</div>
              <div><kbd className="px-1.5 py-0.5 rounded bg-slate-700 font-mono text-cyan-300">1 ~ 8 키</kbd> 스탯 강화</div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 mb-2 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>도형 파밍 & 보상</span>
            </h4>
            <div className="space-y-1.5 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2"><span className="w-3 h-3 bg-yellow-400 rounded-sm inline-block"></span> 노란 사각형</span>
                <span className="text-slate-300 font-bold font-mono">45 XP</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2"><span className="w-3 h-3 bg-red-400 rounded-sm inline-block"></span> 빨간 삼각형</span>
                <span className="text-slate-300 font-bold font-mono">135 XP</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-500 rounded-sm inline-block"></span> 파란 오각형</span>
                <span className="text-cyan-400 font-bold font-mono">550 XP (중앙 부근)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2"><span className="w-4 h-4 bg-indigo-600 rounded-sm inline-block"></span> 알파 펜타곤</span>
                <span className="text-amber-400 font-black font-mono">12,000 XP (정중앙 둥지)</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>성장 및 전직 팁</span>
            </h4>
            <p className="text-slate-300 leading-relaxed bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              Lv 15, Lv 30, Lv 45에서 새로운 대포로 전직할 수 있습니다. 
              탄환을 강화하는 <strong className="text-cyan-400">화력형</strong> 또는 이동속도와 체력을 극대화하여 몸통으로 들이받는 <strong className="text-rose-400">람머(Rammer)형</strong> 등 자신만의 빌드를 구성해보세요!
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer"
        >
          확인하고 게임 시작
        </button>

      </div>
    </div>
  );
};
