export type TankClassId =
  | 'basic'
  // Tier 2 (Lv 15)
  | 'twin'
  | 'sniper'
  | 'machine_gun'
  | 'flank_guard'
  // Tier 3 (Lv 30)
  | 'triple_shot'
  | 'quad_tank'
  | 'twin_flank'
  | 'assassin'
  | 'overseer'
  | 'hunter'
  | 'destroyer'
  | 'gunner'
  | 'tri_angle'
  // Tier 4 (Lv 45)
  | 'octo_tank'
  | 'annihilator'
  | 'overlord'
  | 'booster'
  | 'ranger'
  | 'streamliner'
  | 'battleship';

export interface BarrelConfig {
  angle: number; // in radians relative to facing direction
  offsetX: number; // barrel origin offset from center along length
  offsetY: number; // lateral offset
  length: number; // barrel visual length
  width: number; // barrel width
  recoil: number; // knockback recoil applied to tank
  delay: number; // delay offset (0 to 1) for staggered firing
  bulletSpeedMult: number;
  bulletDamageMult: number;
  bulletPenetrationMult: number;
  bulletSizeMult: number;
  spread: number; // random spread angle in radians
  isDroneSpawner?: boolean;
}

export interface TankDefinition {
  id: TankClassId;
  name: string;
  nameKo: string;
  tier: 1 | 2 | 3 | 4;
  reqLevel: number;
  parentClass?: TankClassId[];
  barrels: BarrelConfig[];
  bodyRadius: number;
  color: string;
  fovMultiplier: number;
  reloadMultiplier: number;
  description: string;
  isDroneClass?: boolean;
  maxDrones?: number;
}

export interface StatUpgrades {
  healthRegen: number;     // 1
  maxHealth: number;       // 2
  bodyDamage: number;      // 3
  bulletSpeed: number;     // 4
  bulletPenetration: number;// 5
  bulletDamage: number;    // 6
  reload: number;          // 7
  movementSpeed: number;   // 8
}

export type StatKey = keyof StatUpgrades;

export interface StatMeta {
  key: StatKey;
  label: string;
  labelKo: string;
  color: string;
  hotkey: string;
}

export interface Entity {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  health: number;
  maxHealth: number;
  color: string;
}

export interface TankEntity extends Entity {
  name: string;
  isPlayer: boolean;
  classId: TankClassId;
  level: number;
  xp: number;
  maxXp: number;
  skillPoints: number;
  stats: StatUpgrades;
  angle: number; // facing angle
  autoFire: boolean;
  autoSpin: boolean;
  score: number;
  kills: number;
  lastShotTime: number[];
  invulnerableTime: number;
  colorHex: string;
}

export interface BulletEntity extends Entity {
  ownerId: string;
  isPlayerOwner: boolean;
  damage: number;
  penetration: number; // HP of the bullet
  life: number;
  maxLife: number;
}

export interface DroneEntity extends Entity {
  ownerId: string;
  isPlayerOwner: boolean;
  targetX: number;
  targetY: number;
  damage: number;
  angle: number;
  speed: number;
}

export type ShapeType = 'square' | 'triangle' | 'pentagon' | 'alpha_pentagon' | 'crasher';

export interface ShapeEntity extends Entity {
  type: ShapeType;
  rotation: number;
  rotationSpeed: number;
  xpValue: number;
  scoreValue: number;
  sides: number;
  isAggressive?: boolean;
}

export interface ParticleEntity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  life: number;
  maxLife: number;
  alpha: number;
}

export interface DamageNumber {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  vy: number;
}

export interface KillFeedItem {
  id: string;
  killer: string;
  victim: string;
  isPlayerKill: boolean;
  isPlayerDeath: boolean;
  time: number;
}
