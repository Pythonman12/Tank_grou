import { GameEngine, WORLD_SIZE, NEST_RADIUS } from './GameEngine';
import { TANK_CLASSES } from '../data/tankClasses';
import { TankEntity, ShapeEntity } from '../types/game';

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number = 0;
  private height: number = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public setSize(w: number, h: number) {
    this.width = w;
    this.height = h;
  }

  public render(engine: GameEngine) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();

    // Camera transform: translate center to screen center, scale by zoom, translate by -camera
    ctx.translate(this.width / 2, this.height / 2);
    ctx.scale(engine.zoom, engine.zoom);
    ctx.translate(-engine.cameraX, -engine.cameraY);

    // 1. Draw World Grid & Bounds
    this.drawBackground(ctx, engine);

    // 2. Draw Shapes (Squares, Triangles, Pentagons, Alpha)
    for (const shape of engine.shapes) {
      if (this.isInViewport(shape.x, shape.y, shape.radius + 50, engine)) {
        this.drawShape(ctx, shape);
      }
    }

    // 3. Draw Bullets
    for (const bullet of engine.bullets) {
      if (this.isInViewport(bullet.x, bullet.y, bullet.radius + 20, engine)) {
        this.drawBullet(ctx, bullet);
      }
    }

    // 4. Draw Drones
    for (const drone of engine.drones) {
      if (this.isInViewport(drone.x, drone.y, drone.radius + 20, engine)) {
        this.drawDrone(ctx, drone);
      }
    }

    // 5. Draw Tanks (Bots first, then Player on top)
    for (const bot of engine.bots) {
      if (this.isInViewport(bot.x, bot.y, bot.radius + 100, engine)) {
        this.drawTank(ctx, bot);
      }
    }

    if (!engine.isGameOver) {
      this.drawTank(ctx, engine.player);
    }

    // 6. Draw Particles
    for (const p of engine.particles) {
      if (this.isInViewport(p.x, p.y, p.radius + 10, engine)) {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // 7. Draw Damage Numbers
    for (const dn of engine.damageNumbers) {
      if (this.isInViewport(dn.x, dn.y, 50, engine)) {
        ctx.save();
        ctx.font = 'bold 15px Pretendard, sans-serif';
        ctx.fillStyle = dn.color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        ctx.strokeText(dn.text, dn.x, dn.y);
        ctx.fillText(dn.text, dn.x, dn.y);
        ctx.restore();
      }
    }

    ctx.restore();

    // 8. Draw Compass / Pointer to Leader (if player is not #1)
    this.drawLeaderPointer(ctx, engine);
  }

  private isInViewport(x: number, y: number, r: number, engine: GameEngine): boolean {
    const halfW = (this.width / 2) / engine.zoom + r;
    const halfH = (this.height / 2) / engine.zoom + r;
    return (
      x >= engine.cameraX - halfW &&
      x <= engine.cameraX + halfW &&
      y >= engine.cameraY - halfH &&
      y <= engine.cameraY + halfH
    );
  }

  private drawBackground(ctx: CanvasRenderingContext2D, engine: GameEngine) {
    // Fill arena background
    ctx.fillStyle = '#1e293b'; // modern dark theme slate-800
    ctx.fillRect(0, 0, WORLD_SIZE, WORLD_SIZE);

    // Draw grid
    const gridSize = 50;
    ctx.strokeStyle = '#334155'; // slate-700
    ctx.lineWidth = 1;
    ctx.beginPath();

    const startX = Math.max(0, Math.floor((engine.cameraX - (this.width / engine.zoom) / 2) / gridSize) * gridSize);
    const endX = Math.min(WORLD_SIZE, Math.ceil((engine.cameraX + (this.width / engine.zoom) / 2) / gridSize) * gridSize);
    const startY = Math.max(0, Math.floor((engine.cameraY - (this.height / engine.zoom) / 2) / gridSize) * gridSize);
    const endY = Math.min(WORLD_SIZE, Math.ceil((engine.cameraY + (this.height / engine.zoom) / 2) / gridSize) * gridSize);

    for (let x = startX; x <= endX; x += gridSize) {
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
    }
    for (let y = startY; y <= endY; y += gridSize) {
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
    }
    ctx.stroke();

    // Center Nest zone
    ctx.fillStyle = 'rgba(59, 130, 246, 0.07)';
    ctx.beginPath();
    ctx.arc(WORLD_SIZE / 2, WORLD_SIZE / 2, NEST_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.25)';
    ctx.lineWidth = 4;
    ctx.stroke();

    // World Outer Border
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 14;
    ctx.strokeRect(0, 0, WORLD_SIZE, WORLD_SIZE);
  }

  private drawShape(ctx: CanvasRenderingContext2D, shape: ShapeEntity) {
    ctx.save();
    ctx.translate(shape.x, shape.y);
    ctx.rotate(shape.rotation);

    ctx.fillStyle = shape.color;
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = shape.type === 'alpha_pentagon' ? 6 : 3.5;
    ctx.lineJoin = 'round';

    ctx.beginPath();
    const sides = shape.sides;
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides;
      const x = Math.cos(angle) * shape.radius;
      const y = Math.sin(angle) * shape.radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    // Health bar if damaged
    if (shape.health < shape.maxHealth) {
      this.drawHealthBar(ctx, shape.x, shape.y + shape.radius + 12, shape.radius * 2, shape.health, shape.maxHealth);
    }

    // Alpha Pentagon label
    if (shape.type === 'alpha_pentagon') {
      ctx.save();
      ctx.font = 'bold 16px Pretendard, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.textAlign = 'center';
      ctx.strokeText('Alpha Pentagon', shape.x, shape.y - shape.radius - 12);
      ctx.fillText('Alpha Pentagon', shape.x, shape.y - shape.radius - 12);
      ctx.restore();
    }
  }

  private drawBullet(ctx: CanvasRenderingContext2D, b: (typeof GameEngine.prototype.bullets)[0]) {
    ctx.save();
    ctx.fillStyle = b.color;
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawDrone(ctx: CanvasRenderingContext2D, d: (typeof GameEngine.prototype.drones)[0]) {
    ctx.save();
    ctx.translate(d.x, d.y);
    ctx.rotate(d.angle);

    ctx.fillStyle = d.color;
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(d.radius * 1.3, 0);
    ctx.lineTo(-d.radius * 0.8, d.radius * 0.9);
    ctx.lineTo(-d.radius * 0.8, -d.radius * 0.9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  private drawTank(ctx: CanvasRenderingContext2D, tank: TankEntity) {
    const def = TANK_CLASSES[tank.classId];

    ctx.save();
    ctx.translate(tank.x, tank.y);
    ctx.rotate(tank.angle);

    // 1. Draw Barrels
    for (const b of def.barrels) {
      ctx.save();
      ctx.rotate(b.angle);

      ctx.fillStyle = '#94a3b8'; // slate-400
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3.5;

      if (b.isDroneSpawner) {
        // Trapezoid spawner opening
        ctx.beginPath();
        const startX = 0;
        const endX = b.length;
        const wBase = b.width * 0.55;
        const wOpen = b.width;
        ctx.moveTo(startX, -wBase / 2);
        ctx.lineTo(endX, -wOpen / 2);
        ctx.lineTo(endX, wOpen / 2);
        ctx.lineTo(startX, wBase / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        // Standard barrel rectangle
        const x = 0;
        const y = b.offsetY - b.width / 2;
        ctx.beginPath();
        ctx.rect(x, y, b.length, b.width);
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    }

    // 2. Draw Body
    ctx.fillStyle = tank.colorHex;
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, 0, tank.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Spawn Invulnerability Shield
    if (tank.invulnerableTime > 0) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, tank.radius + 6, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();

    // 3. Name & Level & Health Bar
    ctx.save();
    ctx.font = 'bold 12px Pretendard, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;

    const label = `${tank.name} [Lv ${tank.level}]`;
    ctx.strokeText(label, tank.x, tank.y - tank.radius - 12);
    ctx.fillText(label, tank.x, tank.y - tank.radius - 12);

    // Health bar (always on for damaged tanks)
    if (tank.health < tank.maxHealth) {
      this.drawHealthBar(ctx, tank.x, tank.y + tank.radius + 14, tank.radius * 2 + 10, tank.health, tank.maxHealth);
    }

    ctx.restore();
  }

  private drawHealthBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, hp: number, maxHp: number) {
    const h = 5;
    const pct = Math.max(0, Math.min(1, hp / maxHp));

    ctx.save();
    // Background
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - w / 2, y, w, h);
    ctx.fillRect(x - w / 2, y, w, h);

    // Fill
    ctx.fillStyle = pct > 0.5 ? '#22c55e' : pct > 0.25 ? '#eab308' : '#ef4444';
    ctx.fillRect(x - w / 2, y, w * pct, h);
    ctx.restore();
  }

  private drawLeaderPointer(ctx: CanvasRenderingContext2D, engine: GameEngine) {
    if (engine.isGameOver) return;
    const topLeader = engine.getLeaderboard()[0];
    if (!topLeader || topLeader.id === engine.player.id) return;

    // Angle to leader
    const angle = Math.atan2(topLeader.y - engine.player.y, topLeader.x - engine.player.x);
    const arrowDist = 140;
    const cx = this.width / 2;
    const cy = this.height / 2;
    const ax = cx + Math.cos(angle) * arrowDist;
    const ay = cy + Math.sin(angle) * arrowDist;

    ctx.save();
    ctx.translate(ax, ay);
    ctx.rotate(angle);

    // Triangle arrow pointing to leader
    ctx.fillStyle = '#fbbf24'; // amber/gold
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(14, 0);
    ctx.lineTo(-8, 8);
    ctx.lineTo(-4, 0);
    ctx.lineTo(-8, -8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }
}
