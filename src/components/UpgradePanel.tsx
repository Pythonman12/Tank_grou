import React from 'react';
import { TankEntity, StatKey } from '../types/game';
import { STAT_METAS } from '../data/tankClasses';
import { Plus } from 'lucide-react';

interface UpgradePanelProps {
  player: TankEntity;
  onUpgrade: (stat: StatKey) => void;
}

export const UpgradePanel: React.FC<UpgradePanelProps> = ({ player, onUpgrade }) => {
  const hasPoints = player.skillPoints > 0;

  return (
    <div className="absolute bottom-4 left-4 z-20 w-72 bg-slate-900/85 backdrop-blur-md rounded-xl border border-slate-700/80 p-3 shadow-xl select-none">
      <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-700/60">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">스탯 업그레이드</span>
        {hasPoints ? (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse font-mono">
            +{player.skillPoints} 포인트
          </span>
        ) : (
          <span className="text-[10px] text-slate-500 font-mono">단축키 [1~8]</span>
        )}
      </div>

      <div className="space-y-1.5">
        {STAT_METAS.map((stat) => {
          const currentVal = player.stats[stat.key];
          const isMax = currentVal >= 7;

          return (
            <div key={stat.key} className="flex items-center gap-2 text-xs">
              {/* Hotkey badge */}
              <button
                onClick={() => onUpgrade(stat.key)}
                disabled={!hasPoints || isMax}
                className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[11px] font-mono transition-all ${
                  hasPoints && !isMax
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md cursor-pointer active:scale-90'
                    : 'bg-slate-800 text-slate-500 cursor-default opacity-75'
                }`}
                title={`[${stat.hotkey}] 키로 업그레이드`}
              >
                {hasPoints && !isMax ? <Plus className="w-3.5 h-3.5" /> : stat.hotkey}
              </button>

              {/* Stat Name */}
              <div className="w-20 text-[11px] font-semibold text-slate-300 truncate">
                {stat.labelKo}
              </div>

              {/* 7 Segments Bar */}
              <div className="flex-1 flex gap-0.5 h-4 bg-slate-800/90 p-0.5 rounded border border-slate-700">
                {[...Array(7)].map((_, idx) => {
                  const filled = idx < currentVal;
                  return (
                    <div
                      key={idx}
                      className="flex-1 rounded-[1.5px] transition-all"
                      style={{
                        backgroundColor: filled ? stat.color : 'transparent',
                        opacity: filled ? 1 : 0.2,
                      }}
                    />
                  );
                })}
              </div>

              {/* Number indicator */}
              <span className="w-4 text-right font-mono text-[10px] text-slate-400">
                {currentVal}/7
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
