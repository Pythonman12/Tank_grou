import React from 'react';
import { TankEntity } from '../types/game';
import { Trophy } from 'lucide-react';

interface LeaderboardProps {
  leaders: TankEntity[];
  playerId: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ leaders, playerId }) => {
  const maxScore = leaders[0]?.score || 1000;

  return (
    <div className="absolute top-4 right-4 z-20 w-64 bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-700/80 p-3 shadow-xl pointer-events-none select-none">
      <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-700/60 text-slate-300">
        <Trophy className="w-4 h-4 text-amber-400" />
        <span className="text-xs font-bold tracking-wider uppercase">Leaderboard</span>
      </div>

      <div className="space-y-1.5">
        {leaders.map((tank, idx) => {
          const isPlayer = tank.id === playerId;
          const scorePercent = Math.min(100, Math.max(10, (tank.score / Math.max(1, maxScore)) * 100));

          return (
            <div key={tank.id} className="relative flex items-center justify-between text-[11px] font-medium py-0.5 px-2 rounded-md overflow-hidden">
              {/* Background score bar */}
              <div
                className="absolute inset-0 opacity-25 rounded-md transition-all"
                style={{
                  width: `${scorePercent}%`,
                  backgroundColor: tank.colorHex,
                }}
              />

              <div className="relative z-10 flex items-center gap-1.5 truncate max-w-[150px]">
                <span className={`font-mono text-[10px] w-3.5 ${idx === 0 ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
                  {idx + 1}
                </span>
                <span className={`truncate ${isPlayer ? 'text-cyan-400 font-bold' : 'text-slate-200'}`}>
                  {tank.name}
                </span>
              </div>

              <div className="relative z-10 font-mono text-[10px] text-slate-400 ml-2">
                {tank.score.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
