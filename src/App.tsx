import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/GameEngine';
import { CanvasRenderer } from './game/CanvasRenderer';
import { GameHeader } from './components/GameHeader';
import { Leaderboard } from './components/Leaderboard';
import { Minimap } from './components/Minimap';
import { UpgradePanel } from './components/UpgradePanel';
import { EvolutionCards } from './components/EvolutionCards';
import { GameOverModal } from './components/GameOverModal';
import { GddModal } from './components/GddModal';
import { HelpModal } from './components/HelpModal';
import { KillFeed } from './components/KillFeed';
import { TankClassId, StatKey } from './types/game';
import confetti from 'canvas-confetti';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);

  // React state for HUD updates
  const [, setTick] = useState(0);
  const [isGddOpen, setIsGddOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [playerName, setPlayerName] = useState('에이스대포');
  const [isStarted, setIsStarted] = useState(false);

  const forceUpdate = useCallback(() => {
    setTick((t) => (t + 1) % 10000);
  }, []);

  // Initialize engine
  useEffect(() => {
    const engine = new GameEngine(() => {
      forceUpdate();
    });
    engineRef.current = engine;

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        rendererRef.current = new CanvasRenderer(ctx);
      }
    }

    // Resize handler
    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (rendererRef.current) {
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Game loop
    let animId: number;
    const loop = (timestamp: number) => {
      if (engineRef.current && rendererRef.current) {
        engineRef.current.update(timestamp);
        rendererRef.current.render(engineRef.current);
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    // Periodic HUD refresh for leaderboards, scores, XP
    const hudInterval = setInterval(() => {
      forceUpdate();
    }, 150);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(hudInterval);
      window.removeEventListener('resize', handleResize);
    };
  }, [forceUpdate]);

  // Input listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      engine.keys[e.code] = true;

      // Hotkey: Auto fire
      if (e.code === 'KeyE') {
        engine.player.autoFire = !engine.player.autoFire;
        forceUpdate();
      }

      // Hotkey: Auto spin
      if (e.code === 'KeyC') {
        engine.player.autoSpin = !engine.player.autoSpin;
        forceUpdate();
      }

      // Hotkeys: Stat upgrades (1 to 8)
      const statMap: Record<string, StatKey> = {
        Digit1: 'healthRegen',
        Digit2: 'maxHealth',
        Digit3: 'bodyDamage',
        Digit4: 'bulletSpeed',
        Digit5: 'bulletPenetration',
        Digit6: 'bulletDamage',
        Digit7: 'reload',
        Digit8: 'movementSpeed',
      };

      if (statMap[e.code]) {
        engine.upgradeStat(statMap[e.code]);
        forceUpdate();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (engineRef.current) {
        engineRef.current.keys[e.code] = false;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const engine = engineRef.current;
      if (!engine || !canvasRef.current) return;

      // Convert screen coords to world coords taking camera and zoom into account
      const screenX = e.clientX;
      const screenY = e.clientY;
      const halfW = canvasRef.current.width / 2;
      const halfH = canvasRef.current.height / 2;

      engine.mouseX = engine.cameraX + (screenX - halfW) / engine.zoom;
      engine.mouseY = engine.cameraY + (screenY - halfH) / engine.zoom;
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0 && engineRef.current) {
        engineRef.current.isMouseDown = true;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0 && engineRef.current) {
        engineRef.current.isMouseDown = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [forceUpdate]);

  const handleStartGame = () => {
    if (engineRef.current) {
      engineRef.current.initGame(playerName.trim() || '에이스대포');
      setIsStarted(true);
      forceUpdate();
    }
  };

  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.initGame(playerName.trim() || '에이스대포');
      forceUpdate();
    }
  };

  const handleStatUpgrade = (stat: StatKey) => {
    if (engineRef.current) {
      engineRef.current.upgradeStat(stat);
      forceUpdate();
    }
  };

  const handleSelectEvolution = (classId: TankClassId) => {
    if (engineRef.current) {
      engineRef.current.evolveTank(classId);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.2 },
      });
      forceUpdate();
    }
  };

  const engine = engineRef.current;
  const player = engine?.player;
  const leaderboard = engine ? engine.getLeaderboard() : [];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* Primary Rendering Canvas */}
      <canvas ref={canvasRef} className="block w-full h-full cursor-crosshair" />

      {/* Start Welcome Screen Overlay */}
      {!isStarted && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-8 shadow-2xl text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-cyan-500/20 mb-4">
              IO
            </div>

            <h1 className="text-3xl font-black text-white tracking-tight mb-2">
              대포 키우기 IO
            </h1>
            <p className="text-xs text-slate-400 mb-6">
              도형을 파괴하여 레벨업하고, 4단계 전직 트리를 거쳐 최강의 대포로 아레나를 지배하세요!
            </p>

            <div className="w-full space-y-4 mb-6">
              <div className="text-left">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  대포 닉네임 입력
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  maxLength={12}
                  placeholder="닉네임을 입력하세요"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm font-semibold transition-colors"
                />
              </div>

              <button
                onClick={handleStartGame}
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm tracking-wide shadow-lg shadow-blue-600/30 transition-all active:scale-98 cursor-pointer"
              >
                전장 참가 (Game Start)
              </button>

              <button
                onClick={() => setIsGddOpen(true)}
                className="w-full py-2.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>게임 개발 계획서 (PDF / 한글 문서 다운로드)</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-500">
              WASD: 이동 | 마우스: 조준 및 사격 | 1~8: 스탯 업그레이드
            </div>
          </div>
        </div>
      )}

      {/* Main Game In-HUD Elements (When Started) */}
      {isStarted && player && (
        <>
          <GameHeader
            player={player}
            onOpenGdd={() => setIsGddOpen(true)}
            onOpenHelp={() => setIsHelpOpen(true)}
          />

          <Leaderboard leaders={leaderboard} playerId={player.id} />

          {engine && <KillFeed items={engine.killFeed} />}

          {engine && <Minimap engine={engine} />}

          {!engine.isGameOver && (
            <>
              <UpgradePanel player={player} onUpgrade={handleStatUpgrade} />
              <EvolutionCards
                currentClassId={player.classId}
                level={player.level}
                onSelectClass={handleSelectEvolution}
              />
            </>
          )}

          {engine.isGameOver && (
            <GameOverModal
              player={player}
              gameTime={engine.survivalTime}
              onRestart={handleRestart}
              onOpenGdd={() => setIsGddOpen(true)}
            />
          )}
        </>
      )}

      {/* Game Development Plan (GDD) Modal with PDF / HWP Exporters */}
      <GddModal isOpen={isGddOpen} onClose={() => setIsGddOpen(false)} />

      {/* Controls & Strategy Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
