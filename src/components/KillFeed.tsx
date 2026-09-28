import React from 'react';
import { KillFeedItem } from '../types/game';
import { Skull } from 'lucide-react';

interface KillFeedProps {
  items: KillFeedItem[];
}

export const KillFeed: React.FC<KillFeedProps> = ({ items }) => {
  if (items.length === 0) return null;

  return (
    <div className="absolute top-52 right-4 z-20 flex flex-col items-end gap-1.5 pointer-events-none select-none">
      {items.map((item) => (
        <div
          key={item.id}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold backdrop-blur-md shadow-lg border animate-in slide-in-from-right duration-200 ${
            item.isPlayerKill
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
              : item.isPlayerDeath
              ? 'bg-rose-950/80 border-rose-500/50 text-rose-300'
              : 'bg-slate-900/70 border-slate-700/60 text-slate-300'
          }`}
        >
          <span className={item.isPlayerKill ? 'text-emerald-400 font-bold' : ''}>
            {item.killer}
          </span>
          <Skull className="w-3.5 h-3.5 opacity-70" />
          <span className={item.isPlayerDeath ? 'text-rose-400 font-bold' : ''}>
            {item.victim}
          </span>
        </div>
      ))}
    </div>
  );
};
