import React, { useRef, useEffect } from 'react';
import { GameEngine, WORLD_SIZE, NEST_RADIUS } from '../game/GameEngine';

interface MinimapProps {
  engine: GameEngine;
}

export const Minimap: React.FC<MinimapProps> = ({ engine }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animId: number;

    const renderMinimap = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = canvas.width;
      const scale = size / WORLD_SIZE;

      ctx.clearRect(0, 0, size, size);

      // Arena background
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, size, size);

      // Center nest
      ctx.fillStyle = 'rgba(59, 130, 246, 0.18)';
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, NEST_RADIUS * scale, 0, Math.PI * 2);
      ctx.fill();

      // Draw Bots (small dots)
      for (const bot of engine.bots) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
        ctx.beginPath();
        ctx.arc(bot.x * scale, bot.y * scale, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw #1 Leader (Gold dot)
      const topLeader = engine.getLeaderboard()[0];
      if (topLeader) {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(topLeader.x * scale, topLeader.y * scale, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Player (Cyan bright dot)
      if (!engine.isGameOver) {
        ctx.fillStyle = '#00f0ff';
        ctx.beginPath();
        ctx.arc(engine.player.x * scale, engine.player.y * scale, 4, 0, Math.PI * 2);
        ctx.fill();

        // White border for player
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      animId = requestAnimationFrame(renderMinimap);
    };

    renderMinimap();
    return () => cancelAnimationFrame(animId);
  }, [engine]);

  return (
    <div className="absolute bottom-4 right-4 z-20 bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-700/80 p-2 shadow-xl pointer-events-none select-none flex flex-col items-center">
      <canvas
        ref={canvasRef}
        width={130}
        height={130}
        className="rounded-lg border border-slate-700/60"
      />
      <div className="text-[10px] text-slate-400 font-mono mt-1 flex justify-between w-full px-1">
        <span>레이더</span>
        <span>{Math.round(engine.player?.x || 0)}, {Math.round(engine.player?.y || 0)}</span>
      </div>
    </div>
  );
};
