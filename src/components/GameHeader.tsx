import React from 'react';
import { TankEntity } from '../types/game';
import { TANK_CLASSES } from '../data/tankClasses';
import { BookOpen, Volume2, VolumeX, Shield, Crosshair, RefreshCw, HelpCircle, FileText, Download } from 'lucide-react';
import { sound } from '../utils/audio';

interface GameHeaderProps {
  player: TankEntity;
  onOpenGdd: () => void;
  onOpenHelp: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({ player, onOpenGdd, onOpenHelp }) => {
  const [isMuted, setIsMuted] = React.useState(sound.getMuted());

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const currentClass = TANK_CLASSES[player.classId];
  const xpPercent = Math.min(100, Math.max(0, (player.xp / Math.max(1, player.maxXp)) * 100));

  return (
    <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-2.5 bg-gradient-to-b from-slate-950/80 to-transparent pointer-events-none select-none">
      
      {/* Left: Brand & Class Info */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-sm shadow-md shadow-blue-500/30">
            IO
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm text-white tracking-tight">대포 키우기</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                Diep.io Style
              </span>
            </div>
            <div className="text-[11px] text-cyan-400 font-medium">
              {currentClass.nameKo} <span className="text-slate-500">· T{currentClass.tier}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Center: XP & Score Bar */}
      <div className="flex flex-col items-center w-72 sm:w-96 pointer-events-auto">
        <div className="flex items-center justify-between w-full text-[11px] font-bold px-1 mb-0.5">
          <span className="text-amber-400 font-mono">점수: {player.score.toLocaleString()}</span>
          <span className={`font-mono ${player.level >= 45 ? 'text-amber-400 font-extrabold' : 'text-blue-400'}`}>
            {player.level >= 45 ? 'Lv 45 (MAX)' : `Lv ${player.level} / 45`}
          </span>
        </div>
        <div className="w-full h-3 bg-slate-800/90 rounded-full border border-slate-700/80 p-0.5 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-150"
            style={{ width: `${player.level >= 45 ? 100 : xpPercent}%` }}
          />
        </div>
      </div>

      {/* Right: GDD Download & Utilities */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Auto-fire / Auto-spin status badges */}
        <div className="hidden md:flex items-center gap-1 text-[10px] font-mono mr-1">
          <span
            className={`px-2 py-0.5 rounded border transition-all ${
              player.autoFire
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                : 'bg-slate-800/60 text-slate-500 border-slate-700/50'
            }`}
            title="E 키로 토글"
          >
            [E] 자동발사 {player.autoFire ? 'ON' : 'OFF'}
          </span>
          <span
            className={`px-2 py-0.5 rounded border transition-all ${
              player.autoSpin
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                : 'bg-slate-800/60 text-slate-500 border-slate-700/50'
            }`}
            title="C 키로 토글"
          >
            [C] 자동회전 {player.autoSpin ? 'ON' : 'OFF'}
          </span>
        </div>

        {/* Big Highlighted Button for GDD (한글 / PDF) */}
        <button
          onClick={onOpenGdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-900/30 transition-all active:scale-95 cursor-pointer border border-blue-400/30"
          title="게임 개발 계획서(GDD) 열람 및 HWP/PDF 문서 다운로드"
        >
          <BookOpen className="w-3.5 h-3.5 text-blue-200" />
          <span>게임 개발 계획서 (한글/PDF)</span>
        </button>

        <button
          onClick={handleToggleSound}
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
          title={isMuted ? '음소거 해제' : '음소거'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        <button
          onClick={onOpenHelp}
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
          title="조작법 안내"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
