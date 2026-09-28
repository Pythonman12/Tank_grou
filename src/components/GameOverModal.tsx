import React from 'react';
import { TankEntity } from '../types/game';
import { TANK_CLASSES } from '../data/tankClasses';
import { RotateCcw, BookOpen, Trophy, Skull, Target, Clock } from 'lucide-react';

interface GameOverModalProps {
  player: TankEntity;
  gameTime: number;
  onRestart: () => void;
  onOpenGdd: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  player,
  gameTime,
  onRestart,
  onOpenGdd,
}) => {
  const currentClass = TANK_CLASSES[player.classId];
  const minutes = Math.floor(gameTime / 60);
  const seconds = Math.floor(gameTime % 60);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-center flex flex-col items-center">
        
        <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center mb-4 text-red-400">
          <Skull className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-black text-white tracking-tight mb-1">
          전차 파괴됨! (Game Over)
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          치열한 아레나에서 분전하셨습니다.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 w-full mb-6">
          <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700/60 flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-xs text-amber-400 mb-1">
              <Trophy className="w-4 h-4" />
              <span>최종 점수</span>
            </div>
            <span className="text-xl font-bold font-mono text-white">
              {player.score.toLocaleString()}
            </span>
          </div>

          <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700/60 flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-xs text-blue-400 mb-1">
              <Target className="w-4 h-4" />
              <span>도달 레벨</span>
            </div>
            <span className="text-xl font-bold font-mono text-white">
              Lv {player.level}
            </span>
          </div>

          <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700/60 flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-xs text-rose-400 mb-1">
              <Skull className="w-4 h-4" />
              <span>처치 수 (Kills)</span>
            </div>
            <span className="text-xl font-bold font-mono text-white">
              {player.kills} 킬
            </span>
          </div>

          <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700/60 flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 mb-1">
              <Clock className="w-4 h-4" />
              <span>생존 시간</span>
            </div>
            <span className="text-xl font-bold font-mono text-white">
              {minutes}분 {seconds}초
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-400 mb-6 bg-slate-800/50 py-2 px-4 rounded-xl border border-slate-700/40 w-full">
          최종 전차 클래스: <span className="text-cyan-400 font-bold">{currentClass.nameKo}</span> (T{currentClass.tier})
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={onRestart}
            className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40 active:scale-98 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>새로 시작하기 (Respawn)</span>
          </button>

          <button
            onClick={onOpenGdd}
            className="w-full py-2.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>게임 개발 계획서 (GDD) 다운로드 & 열람</span>
          </button>
        </div>

      </div>
    </div>
  );
};
