import {
  TankClassId,
  TankEntity,
  BulletEntity,
  DroneEntity,
  ShapeEntity,
  ParticleEntity,
  DamageNumber,
  KillFeedItem,
  StatKey,
} from '../types/game';
import { TANK_CLASSES, XP_REQUIREMENTS, getTotalXpForLevel, getAvailableUpgrades } from '../data/tankClasses';
import { sound } from '../utils/audio';

export const WORLD_SIZE = 8000;
export const NEST_RADIUS = 1200; // Center nest for Pentagons & Alpha Pentagons

const BOT_NAMES = [
  'Alpha_Hunter',
  'DiepMaster',
  'Tank_King',
  'Shadow_Sniper',
  'Vortex99',
  'NeonBlast',
  'Rammer_God',
  'IronFist',
  'CyberStrike',
  'Phantom_7',
  'BulletStorm',
  'TitanX',
  'Specter',
  'Nova_Zero',
  'Raptor',
  'Echo_Strike',
  'Acrobat',
  'Zephyr',
  'Crusher_9',
  'Oblivion',
  'Goliath',
  'Striker_X',
  'Frostbite',
  'Hyperion',
];

const BOT_COLORS = [
  '#f87171', // red
  '#fb923c', // orange
  '#facc15', // yellow
  '#4ade80', // green
  '#2dd4bf', // teal
  '#c084fc', // purple
  '#e879f9', // pink
];

export class GameEngine {
  public player!: TankEntity;
  public bots: TankEntity[] = [];
  public bullets: BulletEntity[] = [];
  public drones: DroneEntity[] = [];
  public shapes: ShapeEntity[] = [];
  public particles: ParticleEntity[] = [];
  public damageNumbers: DamageNumber[] = [];
  public killFeed: KillFeedItem[] = [];

  public mouseX: number = 0;
  public mouseY: number = 0;
  public isMouseDown: boolean = false;
  public keys: Record<string, boolean> = {};

  public cameraX: number = 2000;
  public cameraY: number = 2000;
  public zoom: number = 1.0;

  public isGameOver: boolean = false;
  public gameTime: number = 0;
  public survivalTime: number = 0;
  public lastTimestamp: number = 0;

  private onStateChange?: () => void;

  constructor(onStateChange?: () => void) {
    this.onStateChange = onStateChange;
    this.initGame();
  }

  public initGame(playerName: string = '플레이어') {
    this.isGameOver = false;
    this.gameTime = 0;
    this.survivalTime = 0;
    this.bullets = [];
    this.drones = [];
    this.shapes = [];
    this.particles = [];
    this.damageNumbers = [];
    this.killFeed = [];

    // Create player tank
    this.player = this.createTank('player', playerName, true, 'basic', 1, '#00b2e1');
    this.cameraX = this.player.x;
    this.cameraY = this.player.y;

    // Spawn neutral shapes (scaled for 8000x8000 arena)
    this.spawnInitialShapes(750);

    // Spawn AI bots
    this.bots = [];
    for (let i = 0; i < 24; i++) {
      this.spawnBot();
    }
  }

  // Returns a random spawn position strictly along the outer edges of the map
  private getRandomEdgePosition(): { x: number; y: number } {
    const edge = Math.floor(Math.random() * 4); // 0: Top, 1: Right, 2: Bottom, 3: Left
    const margin = 120 + Math.random() * 260; // 120 ~ 380px from border
    const along = 350 + Math.random() * (WORLD_SIZE - 700);

    switch (edge) {
      case 0: // Top edge
        return { x: along, y: margin };
      case 1: // Right edge
        return { x: WORLD_SIZE - margin, y: along };
      case 2: // Bottom edge
        return { x: along, y: WORLD_SIZE - margin };
      case 3: // Left edge
      default:
        return { x: margin, y: along };
    }
  }

  private createTank(
    id: string,
    name: string,
    isPlayer: boolean,
    classId: TankClassId,
    level: number,
    colorHex: string
  ): TankEntity {
    // Spawn randomly at map edges
    const spawnPos = this.getRandomEdgePosition();
    const x = spawnPos.x;
    const y = spawnPos.y;

    const baseClass = TANK_CLASSES[classId];
    const clampedLevel = Math.min(45, Math.max(1, level));
    const levelScale = 1 + (clampedLevel - 1) * 0.006;

    return {
      id,
      name,
      isPlayer,
      classId,
      level: clampedLevel,
      xp: 0,
      maxXp: XP_REQUIREMENTS[clampedLevel] || 100,
      skillPoints: 0,
      stats: {
        healthRegen: 0,
        maxHealth: 0,
        bodyDamage: 0,
        bulletSpeed: 0,
        bulletPenetration: 0,
        bulletDamage: 0,
        reload: 0,
        movementSpeed: 0,
      },
      x,
      y,
      vx: 0,
      vy: 0,
      radius: baseClass.bodyRadius * levelScale,
      health: 100,
      maxHealth: 100,
      color: colorHex,
      colorHex,
      angle: 0,
      autoFire: false,
      autoSpin: false,
      score: 0,
      kills: 0,
      lastShotTime: baseClass.barrels.map(() => 0),
      invulnerableTime: 2.0, // 2s spawn invulnerability
    };
  }

  private spawnBot() {
    const id = 'bot_' + Math.random().toString(36).substring(2, 9);
    const name = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)] + '_' + Math.floor(Math.random() * 90 + 10);
    const color = BOT_COLORS[Math.floor(Math.random() * BOT_COLORS.length)];

    // Some bots start at higher levels to populate the arena ecosystem
    const startLevel = Math.random() < 0.25 ? Math.floor(Math.random() * 25 + 15) : Math.random() < 0.1 ? 45 : Math.floor(Math.random() * 8 + 1);
    
    // Choose appropriate class based on level
    let chosenClass: TankClassId = 'basic';
    if (startLevel >= 45) {
      const t4s: TankClassId[] = ['octo_tank', 'annihilator', 'overlord', 'booster', 'ranger', 'streamliner', 'battleship'];
      chosenClass = t4s[Math.floor(Math.random() * t4s.length)];
    } else if (startLevel >= 30) {
      const t3s: TankClassId[] = ['triple_shot', 'quad_tank', 'twin_flank', 'assassin', 'overseer', 'hunter', 'destroyer', 'gunner', 'tri_angle'];
      chosenClass = t3s[Math.floor(Math.random() * t3s.length)];
    } else if (startLevel >= 15) {
      const t2s: TankClassId[] = ['twin', 'sniper', 'machine_gun', 'flank_guard'];
      chosenClass = t2s[Math.floor(Math.random() * t2s.length)];
    }

    const bot = this.createTank(id, name, false, chosenClass, startLevel, color);
    bot.score = getTotalXpForLevel(startLevel) + Math.floor(Math.random() * (startLevel * 120 + 300));

    // Distribute skill points for bot
    const availablePoints = Math.min(33, startLevel);
    const statKeys: StatKey[] = ['healthRegen', 'maxHealth', 'bodyDamage', 'bulletSpeed', 'bulletPenetration', 'bulletDamage', 'reload', 'movementSpeed'];
    for (let p = 0; p < availablePoints; p++) {
      const rndStat = statKeys[Math.floor(Math.random() * statKeys.length)];
      if (bot.stats[rndStat] < 7) {
        bot.stats[rndStat]++;
      }
    }
    this.recomputeTankMaxHealth(bot);
    bot.health = bot.maxHealth;

    this.bots.push(bot);
  }

  private spawnInitialShapes(count: number) {
    // Center nest has dense Pentagons and 4 Alpha Pentagons in the 1200-radius Nest
    this.spawnAlphaPentagon(WORLD_SIZE / 2, WORLD_SIZE / 2);
    this.spawnAlphaPentagon(WORLD_SIZE / 2 + 350, WORLD_SIZE / 2 - 250);
    this.spawnAlphaPentagon(WORLD_SIZE / 2 - 350, WORLD_SIZE / 2 + 250);
    this.spawnAlphaPentagon(WORLD_SIZE / 2 - 200, WORLD_SIZE / 2 - 350);

    for (let i = 0; i < 75; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * NEST_RADIUS;
      const x = WORLD_SIZE / 2 + Math.cos(angle) * dist;
      const y = WORLD_SIZE / 2 + Math.sin(angle) * dist;
      this.spawnShapeAt(x, y, 'pentagon');
    }

    // Spawn Crashers in nest
    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * NEST_RADIUS;
      const x = WORLD_SIZE / 2 + Math.cos(angle) * dist;
      const y = WORLD_SIZE / 2 + Math.sin(angle) * dist;
      this.spawnShapeAt(x, y, 'crasher');
    }

    // Random field shapes across the 8000x8000 arena
    for (let i = 0; i < count; i++) {
      const x = 80 + Math.random() * (WORLD_SIZE - 160);
      const y = 80 + Math.random() * (WORLD_SIZE - 160);
      const rand = Math.random();
      const type = rand < 0.6 ? 'square' : rand < 0.9 ? 'triangle' : 'pentagon';
      this.spawnShapeAt(x, y, type);
    }
  }

  private spawnAlphaPentagon(x: number, y: number) {
    this.shapes.push({
      id: 'alpha_' + Math.random().toString(36).substring(2, 9),
      x,
      y,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      radius: 90,
      health: 3000,
      maxHealth: 3000,
      color: '#5269eb',
      type: 'alpha_pentagon',
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: 0.002,
      xpValue: 12000,
      scoreValue: 12000,
      sides: 5,
    });
  }

  private spawnShapeAt(x: number, y: number, type: ShapeEntity['type']) {
    let radius = 16;
    let hp = 10;
    let xp = 45; // yellow square: 10 -> 45 (4.5x boost)
    let color = '#ffe869'; // yellow square
    let sides = 4;
    let isAggressive = false;

    if (type === 'triangle') {
      radius = 18;
      hp = 30;
      xp = 135; // red triangle: 25 -> 135 (5.4x boost)
      color = '#fc7677'; // red triangle
      sides = 3;
    } else if (type === 'pentagon') {
      radius = 28;
      hp = 100;
      xp = 550; // blue pentagon: 130 -> 550 (4.2x boost)
      color = '#768dfc'; // blue pentagon
      sides = 5;
    } else if (type === 'crasher') {
      radius = 14;
      hp = 25;
      xp = 75; // pink crasher: 15 -> 75 (5x boost)
      color = '#f177dd'; // pink crasher
      sides = 3;
      isAggressive = true;
    }

    this.shapes.push({
      id: 'shape_' + Math.random().toString(36).substring(2, 9),
      x,
      y,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius,
      health: hp,
      maxHealth: hp,
      color,
      type,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.03,
      xpValue: xp,
      scoreValue: xp,
      sides,
      isAggressive,
    });
  }

  public update(timestamp: number) {
    if (!this.lastTimestamp) this.lastTimestamp = timestamp;
    const dt = Math.min((timestamp - this.lastTimestamp) / 1000, 0.1);
    this.lastTimestamp = timestamp;
    this.gameTime += dt;

    if (!this.isGameOver) {
      this.survivalTime += dt;
      this.updatePlayer(dt);
    }
    this.updateBots(dt);
    this.updateDrones(dt);
    this.updateBullets(dt);
    this.updateShapes(dt);
    this.updateParticles(dt);
    this.updateDamageNumbers(dt);
    this.handleCollisions();
    this.maintainEcosystem();

    // Camera follow
    if (!this.isGameOver) {
      const def = TANK_CLASSES[this.player.classId];
      const targetZoom = 1.0 / (def.fovMultiplier || 1.0);
      this.zoom += (targetZoom - this.zoom) * 0.05;
      this.cameraX += (this.player.x - this.cameraX) * 0.1;
      this.cameraY += (this.player.y - this.cameraY) * 0.1;
    }
  }

  private updatePlayer(dt: number) {
    const p = this.player;
    if (p.invulnerableTime > 0) {
      p.invulnerableTime -= dt;
    }

    // Health Regen
    this.applyHealthRegen(p, dt);

    // Movement Controls
    let moveX = 0;
    let moveY = 0;
    if (this.keys['KeyW'] || this.keys['ArrowUp']) moveY -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) moveY += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveX -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) moveX += 1;

    if (moveX !== 0 && moveY !== 0) {
      moveX *= 0.7071;
      moveY *= 0.7071;
    }

    // Level slowdown curve: gentle weight scaling for high-level tanks (Lv 1: 1.0x -> Lv 45: ~0.88x)
    // Avoids sluggishness at high levels while preserving tank solidity & satisfying agility
    const levelSlowdown = Math.max(0.88, 1.0 - (p.level - 1) * 0.0028);
    const moveSpeed = 1.62 * levelSlowdown * (1 + p.stats.movementSpeed * 0.075);
    const accel = 7.0;
    p.vx += moveX * moveSpeed * accel * dt;
    p.vy += moveY * moveSpeed * accel * dt;

    // Friction
    p.vx *= Math.pow(0.895, dt * 60);
    p.vy *= Math.pow(0.895, dt * 60);

    p.x += p.vx;
    p.y += p.vy;

    // Arena boundary clamp
    p.x = Math.max(p.radius, Math.min(WORLD_SIZE - p.radius, p.x));
    p.y = Math.max(p.radius, Math.min(WORLD_SIZE - p.radius, p.y));

    // Turret rotation
    if (p.autoSpin) {
      p.angle += 1.8 * dt;
    } else {
      p.angle = Math.atan2(this.mouseY - p.y, this.mouseX - p.x);
    }

    // Shooting
    const shouldFire = this.isMouseDown || p.autoFire;
    this.fireGuns(p, shouldFire, dt);
  }

  private updateBots(dt: number) {
    // Gather all alive tanks in arena for multi-agent bot AI
    const allTanks: TankEntity[] = [];
    if (!this.isGameOver) allTanks.push(this.player);
    for (const b of this.bots) allTanks.push(b);

    for (const bot of this.bots) {
      if (bot.invulnerableTime > 0) bot.invulnerableTime -= dt;
      this.applyHealthRegen(bot, dt);

      // AI Decision Logic:
      // 1. Scan for nearest opposing tank within local sight (420px) - whether Player OR other Bot!
      let nearestEnemy: TankEntity | null = null;
      let minEnemyDist = 420;

      for (const other of allTanks) {
        if (other.id === bot.id) continue;
        const d = Math.hypot(other.x - bot.x, other.y - bot.y);
        if (d < minEnemyDist) {
          minEnemyDist = d;
          nearestEnemy = other;
        }
      }

      // 2. Scan for nearest neutral shape (520px)
      let nearestShape: ShapeEntity | null = null;
      let minShapeDist = 520;
      for (const s of this.shapes) {
        const d = Math.hypot(s.x - bot.x, s.y - bot.y);
        if (d < minShapeDist) {
          minShapeDist = d;
          nearestShape = s;
        }
      }

      let targetX = bot.x + Math.cos(bot.angle) * 200;
      let targetY = bot.y + Math.sin(bot.angle) * 200;
      let shouldFire = false;
      let desiredMoveX = 0;
      let desiredMoveY = 0;

      const isLowHealth = bot.health < bot.maxHealth * 0.35;

      if (nearestEnemy && (isLowHealth || minEnemyDist < 280 || (bot.classId === 'booster' || bot.stats.bodyDamage >= 4))) {
        // Combat state against this specific enemy (could be another bot or player)
        if (isLowHealth) {
          // Evade: flee away from enemy and fire defensively
          desiredMoveX = bot.x - nearestEnemy.x;
          desiredMoveY = bot.y - nearestEnemy.y;
          targetX = nearestEnemy.x;
          targetY = nearestEnemy.y;
          shouldFire = true;
        } else {
          // Attack enemy
          desiredMoveX = nearestEnemy.x - bot.x;
          desiredMoveY = nearestEnemy.y - bot.y;

          const def = TANK_CLASSES[bot.classId];
          const isRammer = bot.classId === 'booster' || bot.stats.bodyDamage >= 5;
          const keepDist = isRammer ? 0 : def.tier >= 3 ? 300 : 180;

          if (minEnemyDist < keepDist) {
            desiredMoveX = -desiredMoveX;
            desiredMoveY = -desiredMoveY;
          }

          // Predictive lead shot
          targetX = nearestEnemy.x + nearestEnemy.vx * 10;
          targetY = nearestEnemy.y + nearestEnemy.vy * 10;
          shouldFire = true;
        }
      } else if (nearestShape) {
        // Farming Mode: approach and shoot neutral shape
        desiredMoveX = nearestShape.x - bot.x;
        desiredMoveY = nearestShape.y - bot.y;
        targetX = nearestShape.x;
        targetY = nearestShape.y;
        shouldFire = true;
      } else {
        // Peaceful Patrol / Roam: smoothly drift around arena
        const seed = (bot.name.charCodeAt(0) * 17 + bot.level * 31) % 100;
        const roamAngle = Math.sin(this.gameTime * 0.2 + seed) * Math.PI * 2;
        desiredMoveX = Math.cos(roamAngle);
        desiredMoveY = Math.sin(roamAngle);
        targetX = bot.x + desiredMoveX * 200;
        targetY = bot.y + desiredMoveY * 200;
        shouldFire = Math.random() < 0.05;
      }

      // Smooth turning towards target - gentle and human-like
      const targetAngle = Math.atan2(targetY - bot.y, targetX - bot.x);
      let angleDiff = targetAngle - bot.angle;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      bot.angle += angleDiff * Math.min(1, 3.5 * dt);

      // Normalize movement
      const moveLen = Math.hypot(desiredMoveX, desiredMoveY);
      if (moveLen > 0.001) {
        desiredMoveX /= moveLen;
        desiredMoveY /= moveLen;
      }

      // Apply gentle level slowdown for bots as well (Lv 1: 1.0x -> Lv 45: ~0.85x)
      const botLevelSlowdown = Math.max(0.85, 1.0 - (bot.level - 1) * 0.0032);
      const moveSpeed = 0.95 * botLevelSlowdown * (1 + bot.stats.movementSpeed * 0.05);
      const accel = 4.6;
      bot.vx += desiredMoveX * moveSpeed * accel * dt;
      bot.vy += desiredMoveY * moveSpeed * accel * dt;

      bot.vx *= Math.pow(0.885, dt * 60);
      bot.vy *= Math.pow(0.885, dt * 60);

      bot.x += bot.vx;
      bot.y += bot.vy;

      bot.x = Math.max(bot.radius, Math.min(WORLD_SIZE - bot.radius, bot.x));
      bot.y = Math.max(bot.radius, Math.min(WORLD_SIZE - bot.radius, bot.y));

      this.fireGuns(bot, shouldFire, dt);
    }
  }

  private applyHealthRegen(tank: TankEntity, dt: number) {
    const regenStat = tank.stats.healthRegen;
    const regenRate = (0.25 + regenStat * 0.8) * dt;
    if (tank.health < tank.maxHealth) {
      tank.health = Math.min(tank.maxHealth, tank.health + regenRate);
    }
  }

  private fireGuns(tank: TankEntity, shouldFire: boolean, dt: number) {
    const def = TANK_CLASSES[tank.classId];
    if (tank.lastShotTime.length !== def.barrels.length) {
      tank.lastShotTime = def.barrels.map(() => 0);
    }

    const baseReloadTime = 0.5 / (def.reloadMultiplier || 1.0);
    const reloadFactor = Math.max(0.2, 1 - tank.stats.reload * 0.08);
    const actualReload = baseReloadTime * reloadFactor;

    def.barrels.forEach((b, bIdx) => {
      tank.lastShotTime[bIdx] = (tank.lastShotTime[bIdx] || 0) + dt;

      // Handle Drone Spawner Barrels
      if (b.isDroneSpawner) {
        if (tank.lastShotTime[bIdx] >= actualReload * 1.5) {
          const currentDrones = this.drones.filter((d) => d.ownerId === tank.id);
          const maxDrones = def.maxDrones || 8;
          if (currentDrones.length < maxDrones) {
            this.spawnDrone(tank, b);
            tank.lastShotTime[bIdx] = 0;
          }
        }
        return;
      }

      // Standard Bullet Barrels
      if (shouldFire && tank.lastShotTime[bIdx] >= actualReload) {
        this.spawnBullet(tank, b);
        tank.lastShotTime[bIdx] = 0;

        // Recoil kickback - balanced so it feels tangible without rocketing the tank uncontrollably
        const shootAngle = tank.angle + b.angle;
        const recoilPwr = tank.isPlayer ? b.recoil * 0.85 : b.recoil * 0.60;
        tank.vx -= Math.cos(shootAngle) * recoilPwr;
        tank.vy -= Math.sin(shootAngle) * recoilPwr;

        // Sound effect (for player or nearby bots)
        if (tank.isPlayer) {
          const soundType =
            b.bulletDamageMult >= 3.5 ? 'heavy' : def.id === 'sniper' || def.id === 'assassin' || def.id === 'ranger' ? 'sniper' : def.id === 'machine_gun' || def.id === 'streamliner' ? 'fast' : 'normal';
          sound.playShoot(soundType);
        }
      }
    });
  }

  private spawnBullet(tank: TankEntity, barrel: (typeof TANK_CLASSES)[TankClassId]['barrels'][0]) {
    const def = TANK_CLASSES[tank.classId];
    const totalAngle = tank.angle + barrel.angle + (Math.random() - 0.5) * barrel.spread;

    // Bullet origin at the tip of the barrel
    const forwardX = Math.cos(tank.angle);
    const forwardY = Math.sin(tank.angle);
    const perpX = -forwardY;
    const perpY = forwardX;

    const startX = tank.x + forwardX * (tank.radius + barrel.length) + perpX * barrel.offsetY;
    const startY = tank.y + forwardY * (tank.radius + barrel.length) + perpY * barrel.offsetY;

    // Punchy, satisfying bullet speeds for responsive tactical combat
    const baseSpeed = 3.8 * (1 + tank.stats.bulletSpeed * 0.12) * barrel.bulletSpeedMult;
    const vx = Math.cos(totalAngle) * baseSpeed + tank.vx * 0.15;
    const vy = Math.sin(totalAngle) * baseSpeed + tank.vy * 0.15;

    const baseDamage = (12 + tank.stats.bulletDamage * 9) * barrel.bulletDamageMult;
    const basePenetration = (15 + tank.stats.bulletPenetration * 14) * barrel.bulletPenetrationMult;
    const bulletRadius = 7 * barrel.bulletSizeMult;

    this.bullets.push({
      id: 'b_' + Math.random().toString(36).substring(2, 9),
      ownerId: tank.id,
      isPlayerOwner: tank.isPlayer,
      x: startX,
      y: startY,
      vx,
      vy,
      radius: bulletRadius,
      damage: baseDamage,
      penetration: basePenetration,
      health: basePenetration,
      maxHealth: basePenetration,
      life: 0,
      maxLife: 4.8,
      color: tank.colorHex,
    });
  }

  private spawnDrone(tank: TankEntity, barrel: (typeof TANK_CLASSES)[TankClassId]['barrels'][0]) {
    const spawnAngle = tank.angle + barrel.angle;
    const startX = tank.x + Math.cos(spawnAngle) * (tank.radius + 15);
    const startY = tank.y + Math.sin(spawnAngle) * (tank.radius + 15);

    const dmg = (14 + tank.stats.bulletDamage * 8) * barrel.bulletDamageMult;
    const hp = 25 + tank.stats.bulletPenetration * 12;

    this.drones.push({
      id: 'drone_' + Math.random().toString(36).substring(2, 9),
      ownerId: tank.id,
      isPlayerOwner: tank.isPlayer,
      x: startX,
      y: startY,
      vx: Math.cos(spawnAngle) * 1.2,
      vy: Math.sin(spawnAngle) * 1.2,
      radius: 12,
      health: hp,
      maxHealth: hp,
      damage: dmg,
      angle: spawnAngle,
      speed: 2.2 * (1 + tank.stats.bulletSpeed * 0.08),
      targetX: tank.x,
      targetY: tank.y,
      color: tank.colorHex,
    });
  }

  private updateDrones(dt: number) {
    for (let i = this.drones.length - 1; i >= 0; i--) {
      const drone = this.drones[i];
      const owner = drone.isPlayerOwner ? this.player : this.bots.find((b) => b.id === drone.ownerId);

      if (!owner || drone.health <= 0) {
        this.createExplosionParticles(drone.x, drone.y, drone.color, 5);
        this.drones.splice(i, 1);
        continue;
      }

      // Drone Target: for player, mouse cursor; for bots, the direction they are aiming/facing
      let tx = owner.x;
      let ty = owner.y;

      if (owner.isPlayer) {
        tx = this.mouseX;
        ty = this.mouseY;
      } else {
        tx = owner.x + Math.cos(owner.angle) * 350;
        ty = owner.y + Math.sin(owner.angle) * 350;
      }

      // Fly towards target with smooth acceleration
      const angle = Math.atan2(ty - drone.y, tx - drone.x);
      drone.angle = angle;
      const targetVx = Math.cos(angle) * drone.speed;
      const targetVy = Math.sin(angle) * drone.speed;

      drone.vx += (targetVx - drone.vx) * 0.08;
      drone.vy += (targetVy - drone.vy) * 0.08;

      drone.x += drone.vx;
      drone.y += drone.vy;
    }
  }

  private updateBullets(dt: number) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx;
      b.y += b.vy;
      b.life += dt;

      // Friction
      b.vx *= 0.995;
      b.vy *= 0.995;

      if (b.life >= b.maxLife || b.health <= 0 || b.x < 0 || b.x > WORLD_SIZE || b.y < 0 || b.y > WORLD_SIZE) {
        this.bullets.splice(i, 1);
      }
    }
  }

  private updateShapes(dt: number) {
    for (let i = this.shapes.length - 1; i >= 0; i--) {
      const s = this.shapes[i];
      s.rotation += s.rotationSpeed;

      // Crasher aggressive AI: if a tank comes near, crashers swarm it!
      if (s.isAggressive) {
        let nearestTank: TankEntity | null = null;
        let minDist = 400;

        if (!this.isGameOver && Math.hypot(this.player.x - s.x, this.player.y - s.y) < minDist) {
          nearestTank = this.player;
          minDist = Math.hypot(this.player.x - s.x, this.player.y - s.y);
        }

        for (const b of this.bots) {
          const d = Math.hypot(b.x - s.x, b.y - s.y);
          if (d < minDist) {
            minDist = d;
            nearestTank = b;
          }
        }

        if (nearestTank) {
          const angle = Math.atan2(nearestTank.y - s.y, nearestTank.x - s.x);
          s.vx += Math.cos(angle) * 0.04;
          s.vy += Math.sin(angle) * 0.04;
          s.rotationSpeed = 0.03;
        }
      }

      s.vx *= 0.95;
      s.vy *= 0.95;
      s.x += s.vx;
      s.y += s.vy;

      // Bounce on world bounds
      if (s.x < s.radius) {
        s.x = s.radius;
        s.vx = -s.vx;
      }
      if (s.x > WORLD_SIZE - s.radius) {
        s.x = WORLD_SIZE - s.radius;
        s.vx = -s.vx;
      }
      if (s.y < s.radius) {
        s.y = s.radius;
        s.vy = -s.vy;
      }
      if (s.y > WORLD_SIZE - s.radius) {
        s.y = WORLD_SIZE - s.radius;
        s.vy = -s.vy;
      }
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.94;
      p.vy *= 0.94;
      p.life += dt;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  private updateDamageNumbers(dt: number) {
    for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
      const dn = this.damageNumbers[i];
      dn.y += dn.vy;
      dn.life += dt;
      if (dn.life >= dn.maxLife) {
        this.damageNumbers.splice(i, 1);
      }
    }
  }

  private handleCollisions() {
    const allTanks = (!this.isGameOver ? [this.player] : []).concat(this.bots);

    // 1. Bullets vs Shapes
    for (let bIdx = this.bullets.length - 1; bIdx >= 0; bIdx--) {
      const b = this.bullets[bIdx];

      for (let sIdx = this.shapes.length - 1; sIdx >= 0; sIdx--) {
        const s = this.shapes[sIdx];
        const dist = Math.hypot(b.x - s.x, b.y - s.y);

        if (dist < b.radius + s.radius) {
          // Push shape
          const pushAngle = Math.atan2(s.y - b.y, s.x - b.x);
          s.vx += Math.cos(pushAngle) * 1.5;
          s.vy += Math.sin(pushAngle) * 1.5;

          const dmgToShape = Math.min(s.health, b.damage);
          const dmgToBullet = s.health;

          s.health -= b.damage;
          b.health -= dmgToBullet;

          this.createDamageNumber(s.x, s.y, Math.round(dmgToShape), '#ffffff');
          this.createHitSparks(b.x, b.y, s.color);

          if (b.isPlayerOwner) sound.playHit();

          if (s.health <= 0) {
            this.handleShapeDestroyed(s, b.ownerId, b.isPlayerOwner);
            this.shapes.splice(sIdx, 1);
          }

          if (b.health <= 0) {
            this.bullets.splice(bIdx, 1);
            break;
          }
        }
      }
    }

    // 2. Bullets vs Tanks
    for (let bIdx = this.bullets.length - 1; bIdx >= 0; bIdx--) {
      const b = this.bullets[bIdx];

      for (let tIdx = allTanks.length - 1; tIdx >= 0; tIdx--) {
        const t = allTanks[tIdx];
        if (t.id === b.ownerId || t.invulnerableTime > 0) continue;

        const dist = Math.hypot(b.x - t.x, b.y - t.y);
        if (dist < b.radius + t.radius) {
          // Push tank
          const pushAngle = Math.atan2(t.y - b.y, t.x - b.x);
          t.vx += Math.cos(pushAngle) * 1.8;
          t.vy += Math.sin(pushAngle) * 1.8;

          t.health -= b.damage;
          b.health = 0;

          this.createDamageNumber(t.x, t.y, Math.round(b.damage), '#ef4444');
          this.createHitSparks(b.x, b.y, t.colorHex);

          if (t.isPlayer || b.isPlayerOwner) sound.playHit();

          if (t.health <= 0) {
            this.handleTankDestroyed(t, b.ownerId, b.isPlayerOwner);
          }

          this.bullets.splice(bIdx, 1);
          break;
        }
      }
    }

    // 3. Drones vs Shapes & Tanks
    for (let dIdx = this.drones.length - 1; dIdx >= 0; dIdx--) {
      const d = this.drones[dIdx];

      // Drones vs Shapes
      for (let sIdx = this.shapes.length - 1; sIdx >= 0; sIdx--) {
        const s = this.shapes[sIdx];
        if (Math.hypot(d.x - s.x, d.y - s.y) < d.radius + s.radius) {
          s.health -= d.damage;
          d.health -= 15;
          this.createHitSparks(d.x, d.y, s.color);
          if (s.health <= 0) {
            this.handleShapeDestroyed(s, d.ownerId, d.isPlayerOwner);
            this.shapes.splice(sIdx, 1);
          }
          if (d.health <= 0) break;
        }
      }

      if (d.health <= 0) continue;

      // Drones vs Tanks
      for (let tIdx = allTanks.length - 1; tIdx >= 0; tIdx--) {
        const t = allTanks[tIdx];
        if (t.id === d.ownerId || t.invulnerableTime > 0) continue;

        if (Math.hypot(d.x - t.x, d.y - t.y) < d.radius + t.radius) {
          t.health -= d.damage;
          d.health -= 25;
          this.createDamageNumber(t.x, t.y, Math.round(d.damage), '#ef4444');
          this.createHitSparks(d.x, d.y, t.colorHex);

          if (t.health <= 0) {
            this.handleTankDestroyed(t, d.ownerId, d.isPlayerOwner);
          }
          if (d.health <= 0) break;
        }
      }
    }

    // 4. Tank vs Shape Body Ramming
    for (const t of allTanks) {
      if (t.health <= 0) continue;
      const bodyDmg = 20 + t.stats.bodyDamage * 12;

      for (let sIdx = this.shapes.length - 1; sIdx >= 0; sIdx--) {
        const s = this.shapes[sIdx];
        const dist = Math.hypot(t.x - s.x, t.y - s.y);

        if (dist < t.radius + s.radius) {
          // Bounce off each other with measured impulse
          const angle = Math.atan2(s.y - t.y, s.x - t.x);
          t.vx -= Math.cos(angle) * 1.6;
          t.vy -= Math.sin(angle) * 1.6;
          s.vx += Math.cos(angle) * 1.6;
          s.vy += Math.sin(angle) * 1.6;

          const shapeDmg = s.type === 'alpha_pentagon' ? 50 : s.type === 'pentagon' ? 20 : 10;
          if (t.invulnerableTime <= 0) {
            t.health -= shapeDmg;
          }
          s.health -= bodyDmg;

          this.createHitSparks(s.x, s.y, s.color);

          if (s.health <= 0) {
            this.handleShapeDestroyed(s, t.id, t.isPlayer);
            this.shapes.splice(sIdx, 1);
          }

          if (t.health <= 0) {
            this.handleTankDestroyed(t, 'neutral_shape', false);
            break;
          }
        }
      }
    }

    // 5. Tank vs Tank Ramming
    for (let i = 0; i < allTanks.length; i++) {
      for (let j = i + 1; j < allTanks.length; j++) {
        const t1 = allTanks[i];
        const t2 = allTanks[j];
        if (t1.health <= 0 || t2.health <= 0) continue;

        const dist = Math.hypot(t1.x - t2.x, t1.y - t2.y);
        if (dist < t1.radius + t2.radius) {
          const angle = Math.atan2(t2.y - t1.y, t2.x - t1.x);
          const push = 2.2;
          t1.vx -= Math.cos(angle) * push;
          t1.vy -= Math.sin(angle) * push;
          t2.vx += Math.cos(angle) * push;
          t2.vy += Math.sin(angle) * push;

          const dmg1 = 20 + t1.stats.bodyDamage * 12;
          const dmg2 = 20 + t2.stats.bodyDamage * 12;

          if (t1.invulnerableTime <= 0) t1.health -= dmg2;
          if (t2.invulnerableTime <= 0) t2.health -= dmg1;

          this.createHitSparks((t1.x + t2.x) / 2, (t1.y + t2.y) / 2, '#ffffff');

          if (t1.health <= 0) this.handleTankDestroyed(t1, t2.id, t2.isPlayer);
          if (t2.health <= 0) this.handleTankDestroyed(t2, t1.id, t1.isPlayer);
        }
      }
    }
  }

  private handleShapeDestroyed(shape: ShapeEntity, killerId: string, isPlayerKiller: boolean) {
    this.createExplosionParticles(shape.x, shape.y, shape.color, shape.type === 'alpha_pentagon' ? 45 : 12);
    if (isPlayerKiller) {
      sound.playShapePop();
    }

    const killer = isPlayerKiller ? this.player : this.bots.find((b) => b.id === killerId);
    if (killer) {
      this.rewardTank(killer, shape.xpValue, shape.scoreValue);
    }
  }

  private handleTankDestroyed(victim: TankEntity, killerId: string, isKillerPlayer: boolean) {
    this.createExplosionParticles(victim.x, victim.y, victim.colorHex, 35);
    sound.playExplode();

    const killer = isKillerPlayer ? this.player : this.bots.find((b) => b.id === killerId);
    const killerName = killer ? killer.name : '중립 오브젝트';

    if (killer) {
      killer.kills++;

      // High-level AI bounty: defeating high-level tanks rewards massive XP & levels!
      const victimLevelValue = getTotalXpForLevel(victim.level);

      // Higher tier victims yield a massive percentage of their cumulative XP
      let levelXpRatio = 0.65;
      if (victim.level >= 45) {
        levelXpRatio = 0.92; // ~685,000 XP! Propels Lv 1 directly to Lv 42-43!
      } else if (victim.level >= 35) {
        levelXpRatio = 0.88;
      } else if (victim.level >= 25) {
        levelXpRatio = 0.82;
      } else if (victim.level >= 15) {
        levelXpRatio = 0.75;
      }

      const levelXpGrant = Math.floor(victimLevelValue * levelXpRatio);
      const scoreXpGrant = Math.floor(victim.score * 0.85);
      const xpReward = Math.max(levelXpGrant, scoreXpGrant) + victim.level * 300 + 600;
      const scoreReward = Math.max(Math.floor(victimLevelValue * 0.90), Math.floor(victim.score * 0.90)) + victim.level * 300 + 600;

      this.rewardTank(killer, xpReward, scoreReward);

      // Show floating notification text on kill
      if (killer.isPlayer) {
        const text = victim.level >= 15
          ? `+${xpReward.toLocaleString()} XP (Lv ${victim.level} 처치!)`
          : `+${xpReward.toLocaleString()} XP`;
        const color = victim.level >= 40 ? '#f59e0b' : victim.level >= 25 ? '#38bdf8' : '#4ade80';
        this.createFloatingNotification(victim.x, victim.y - 18, text, color);
      }
    }

    // Add kill feed with tank levels
    this.killFeed.unshift({
      id: Math.random().toString(),
      killer: `${killerName} [Lv ${killer ? killer.level : '?'}]`,
      victim: `${victim.name} [Lv ${victim.level}]`,
      isPlayerKill: isKillerPlayer,
      isPlayerDeath: victim.isPlayer,
      time: this.gameTime,
    });
    if (this.killFeed.length > 5) this.killFeed.pop();

    if (victim.isPlayer) {
      this.isGameOver = true;
      if (this.onStateChange) this.onStateChange();
    } else {
      // Remove bot from list and respawn after delay
      const botIdx = this.bots.findIndex((b) => b.id === victim.id);
      if (botIdx !== -1) {
        this.bots.splice(botIdx, 1);
        setTimeout(() => {
          this.spawnBot();
        }, 3000);
      }
    }
  }

  private rewardTank(tank: TankEntity, xpAmount: number, scoreAmount: number) {
    tank.score += scoreAmount;

    // Hard cap at max level 45
    if (tank.level >= 45) {
      tank.level = 45;
      tank.xp = tank.maxXp;
      return;
    }

    tank.xp += xpAmount;

    let gainedLevels = 0;

    // Level up check (capped at 45)
    while (tank.level < 45 && tank.xp >= tank.maxXp) {
      tank.xp -= tank.maxXp;
      tank.level++;
      tank.skillPoints++;
      gainedLevels++;
      tank.maxXp = XP_REQUIREMENTS[tank.level] || 999999;
    }

    if (gainedLevels > 0) {
      const def = TANK_CLASSES[tank.classId];
      const levelScale = 1 + (tank.level - 1) * 0.006;
      tank.radius = def.bodyRadius * levelScale;

      this.recomputeTankMaxHealth(tank);
      tank.health = Math.min(tank.maxHealth, tank.health + gainedLevels * 30);

      if (tank.isPlayer) {
        sound.playLevelUp();
        if (this.onStateChange) this.onStateChange();
      } else {
        // Auto upgrade bot stats
        const statKeys: StatKey[] = ['healthRegen', 'maxHealth', 'bodyDamage', 'bulletSpeed', 'bulletPenetration', 'bulletDamage', 'reload', 'movementSpeed'];
        const upgradesCount = Math.min(tank.skillPoints, gainedLevels);
        for (let i = 0; i < upgradesCount; i++) {
          const rndKey = statKeys[Math.floor(Math.random() * statKeys.length)];
          if (tank.stats[rndKey] < 7) {
            tank.stats[rndKey]++;
            tank.skillPoints--;
          }
        }
        // Auto evolve bot
        const available = getAvailableUpgrades(tank.classId, tank.level);
        if (available.length > 0) {
          tank.classId = available[Math.floor(Math.random() * available.length)].id;
          const newDef = TANK_CLASSES[tank.classId];
          tank.radius = newDef.bodyRadius * (1 + (tank.level - 1) * 0.006);
          tank.lastShotTime = newDef.barrels.map(() => 0);
        }
      }
    }

    // Clamp at level 45
    if (tank.level >= 45) {
      tank.level = 45;
      tank.xp = tank.maxXp;
    }
  }

  public upgradeStat(key: StatKey) {
    if (this.isGameOver || this.player.skillPoints <= 0) return;
    if (this.player.stats[key] >= 7) return;

    this.player.stats[key]++;
    this.player.skillPoints--;
    sound.playUpgradeStat();

    if (key === 'maxHealth') {
      this.recomputeTankMaxHealth(this.player);
      this.player.health += 25;
    }

    if (this.onStateChange) this.onStateChange();
  }

  public evolveTank(newClassId: TankClassId) {
    const available = getAvailableUpgrades(this.player.classId, this.player.level);
    const target = available.find((a) => a.id === newClassId);
    if (!target) return;

    this.player.classId = newClassId;
    const levelScale = 1 + (this.player.level - 1) * 0.006;
    this.player.radius = target.bodyRadius * levelScale;
    this.player.lastShotTime = target.barrels.map(() => 0);
    sound.playLevelUp();

    if (this.onStateChange) this.onStateChange();
  }

  private recomputeTankMaxHealth(tank: TankEntity) {
    tank.maxHealth = 100 + tank.stats.maxHealth * 25;
  }

  private maintainEcosystem() {
    // Keep ~650 shapes in the world
    if (this.shapes.length < 650) {
      const type = Math.random() < 0.65 ? 'square' : Math.random() < 0.88 ? 'triangle' : 'pentagon';
      const x = 80 + Math.random() * (WORLD_SIZE - 160);
      const y = 80 + Math.random() * (WORLD_SIZE - 160);
      this.spawnShapeAt(x, y, type);
    }

    // Keep Alpha Pentagons alive in center nest (maintain 3~4)
    const alphaCount = this.shapes.filter((s) => s.type === 'alpha_pentagon').length;
    if (alphaCount < 3) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * (NEST_RADIUS * 0.65);
      this.spawnAlphaPentagon(WORLD_SIZE / 2 + Math.cos(angle) * dist, WORLD_SIZE / 2 + Math.sin(angle) * dist);
    }

    // Keep Crashers in nest
    const crasherCount = this.shapes.filter((s) => s.type === 'crasher').length;
    if (crasherCount < 28) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * NEST_RADIUS;
      this.spawnShapeAt(WORLD_SIZE / 2 + Math.cos(angle) * dist, WORLD_SIZE / 2 + Math.sin(angle) * dist, 'crasher');
    }
  }

  private createHitSparks(x: number, y: number, color: string) {
    for (let i = 0; i < 4; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 1;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 2.5 + 1.5,
        color,
        life: 0,
        maxLife: 0.3,
        alpha: 1,
      });
    }
  }

  private createExplosionParticles(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4.5 + 1.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 4 + 2,
        color,
        life: 0,
        maxLife: Math.random() * 0.4 + 0.4,
        alpha: 1,
      });
    }
  }

  private createDamageNumber(x: number, y: number, damage: number, color: string) {
    if (damage <= 0) return;
    this.damageNumbers.push({
      id: Math.random().toString(),
      x: x + (Math.random() - 0.5) * 16,
      y: y - 10,
      text: '-' + damage,
      color,
      life: 0,
      maxLife: 0.6,
      vy: -1.2,
    });
  }

  private createFloatingNotification(x: number, y: number, text: string, color: string) {
    this.damageNumbers.push({
      id: Math.random().toString(),
      x: x + (Math.random() - 0.5) * 12,
      y: y - 14,
      text,
      color,
      life: 0,
      maxLife: 1.4,
      vy: -0.8,
    });
  }

  public getLeaderboard() {
    const list = (!this.isGameOver ? [this.player] : []).concat(this.bots);
    return list
      .slice()
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }
}
