import React from 'react';
import { TankClassId, TankDefinition } from '../types/game';
import { getAvailableUpgrades } from '../data/tankClasses';
import { Sparkles } from 'lucide-react';

interface EvolutionCardsProps {
  currentClassId: TankClassId;
  level: number;
  onSelectClass: (classId: TankClassId) => void;
}

export const EvolutionCards: React.FC<EvolutionCardsProps> = ({
  currentClassId,
  level,
  onSelectClass,
}) => {
  const available = getAvailableUpgrades(currentClassId, level);

  if (available.length === 0) return null;

  return (
    <div className="absolute top-16 left-4 z-30 max-w-sm bg-slate-900/90 backdrop-blur-md rounded-2xl border-2 border-amber-500/80 p-3.5 shadow-2xl animate-in slide-in-from-left duration-300 select-none">
      <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-700/80 text-amber-400">
        <Sparkles className="w-4 h-4 animate-spin" />
        <span className="text-xs font-bold uppercase tracking-wider">
          전직 가능! (Lv {level} 달성)
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
        {available.map((tankDef: TankDefinition) => (
          <button
            key={tankDef.id}
            onClick={() => onSelectClass(tankDef.id)}
            className="flex flex-col text-left p-2.5 rounded-xl bg-slate-800/90 hover:bg-blue-600/30 border border-slate-700 hover:border-blue-400 transition-all cursor-pointer group active:scale-95"
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-xs font-bold text-white group-hover:text-blue-300 truncate">
                {tankDef.nameKo}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">
                T{tankDef.tier}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
              {tankDef.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
