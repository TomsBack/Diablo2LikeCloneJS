import { Entity } from './Entity.js';
import { TILE_SIZE, MONSTER_AGGRO_RADIUS, MONSTER_LEASH_RADIUS } from '../core/Constants.js';
import { distance, normalize, randomInt, randomRange } from '../utils/MathUtils.js';
import { findPath } from '../pathfinding/AStar.js';
import { events } from '../utils/EventBus.js';

const MONSTER_DEFS = {
  zombie: {
    name: 'Zombie',
    baseHP: 20, baseDamageMin: 2, baseDamageMax: 5,
    speed: 1.5, defense: 2, xpValue: 15,
    attackRange: 1.5, attackSpeed: 0.8,
    color: '#4a6a3a',
  },
  skeleton: {
    name: 'Skeleton',
    baseHP: 15, baseDamageMin: 3, baseDamageMax: 7,
    speed: 2.5, defense: 3, xpValue: 20,
    attackRange: 1.5, attackSpeed: 1.2,
    color: '#c8c8a0',
  },
  skeletonArcher: {
    name: 'Skeleton Archer',
    baseHP: 10, baseDamageMin: 4, baseDamageMax: 8,
    speed: 2, defense: 1, xpValue: 25,
    attackRange: 6, attackSpeed: 1.0,
    isRanged: true,
    color: '#b8b890',
  },
  fallen: {
    name: 'Fallen',
    baseHP: 8, baseDamageMin: 2, baseDamageMax: 4,
    speed: 3.5, defense: 1, xpValue: 10,
    attackRange: 1.3, attackSpeed: 1.5,
    color: '#8b2500',
  },
  ghost: {
    name: 'Ghost',
    baseHP: 12, baseDamageMin: 5, baseDamageMax: 10,
    speed: 2, defense: 0, xpValue: 30,
    attackRange: 1.5, attackSpeed: 0.9,
    phaseWalk: true,
    color: 'rgba(100,150,200,0.6)',
  },
  boss: {
    name: 'Dark Champion',
    baseHP: 100, baseDamageMin: 10, baseDamageMax: 20,
    speed: 2, defense: 10, xpValue: 200,
    attackRange: 2, attackSpeed: 1.0,
    isBoss: true,
    color: '#6a1a1a',
  },
};

const AI_STATE = {
  IDLE: 'idle',
  CHASE: 'chase',
  ATTACK: 'attack',
  FLEE: 'flee',
  DEAD: 'dead',
};

export class Monster extends Entity {
  constructor(x, y, type, level = 1) {
    super(x + 0.5, y + 0.5);
    this.type = type;
    this.level = level;
    const def = MONSTER_DEFS[type] || MONSTER_DEFS.zombie;

    this.name = def.name;
    this.isBoss = def.isBoss || false;
    this.isRanged = def.isRanged || false;
    this.phaseWalk = def.phaseWalk || false;

    // Scale stats by level
    const scale = 1 + (level - 1) * 0.25;
    this.maxHP = Math.floor(def.baseHP * scale);
    this.hp = this.maxHP;
    this.damageMin = Math.floor(def.baseDamageMin * scale);
    this.damageMax = Math.floor(def.baseDamageMax * scale);
    this.speed = def.speed;
    this.defense = Math.floor(def.defense * scale);
    this.attackRange = def.attackRange;
    this.attackSpeed = def.attackSpeed;
    this.xpValue = Math.floor(def.xpValue * scale);
    this.attackRating = 10 + level * 5;

    // AI
    this.aiState = AI_STATE.IDLE;
    this.spawnX = x + 0.5;
    this.spawnY = y + 0.5;
    this.target = null;
    this.path = null;
    this.pathIndex = 0;
    this.pathTimer = 0;
    this.attackCooldown = 0;
    this.idleTimer = 0;
    this.deathTimer = 0;

    // Visual
    this.hitFlash = 0;
  }

  update(dt, tileMap, player) {
    if (!this.alive) {
      this.deathTimer -= dt;
      return;
    }

    this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    this.hitFlash = Math.max(0, this.hitFlash - dt);

    const distToPlayer = this.distanceTo(player);

    switch (this.aiState) {
      case AI_STATE.IDLE:
        this._updateIdle(dt, distToPlayer, player);
        break;
      case AI_STATE.CHASE:
        this._updateChase(dt, tileMap, player, distToPlayer);
        break;
      case AI_STATE.ATTACK:
        this._updateAttack(dt, player, distToPlayer);
        break;
    }
  }

  _updateIdle(dt, distToPlayer, player) {
    if (distToPlayer <= MONSTER_AGGRO_RADIUS && player.alive) {
      this.aiState = AI_STATE.CHASE;
      this.target = player;
    }
    // Small random movement
    this.idleTimer -= dt;
    if (this.idleTimer <= 0) {
      this.idleTimer = randomRange(2, 5);
    }
  }

  _updateChase(dt, tileMap, player, distToPlayer) {
    if (!player.alive || distToPlayer > MONSTER_LEASH_RADIUS) {
      this.aiState = AI_STATE.IDLE;
      this.path = null;
      // Walk back to spawn
      return;
    }

    if (distToPlayer <= this.attackRange) {
      this.aiState = AI_STATE.ATTACK;
      this.path = null;
      return;
    }

    // Repath periodically
    this.pathTimer -= dt * 1000;
    if (this.pathTimer <= 0 || !this.path) {
      this.pathTimer = 500;
      const path = findPath(tileMap, this.tileX, this.tileY, player.tileX, player.tileY);
      if (path && path.length > 0) {
        this.path = path;
        this.pathIndex = 0;
      }
    }

    // Follow path
    if (this.path && this.pathIndex < this.path.length) {
      const wp = this.path[this.pathIndex];
      const dx = wp.x + 0.5 - this.x;
      const dy = wp.y + 0.5 - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 0.15) {
        this.pathIndex++;
      } else {
        const n = normalize(dx, dy);
        const moveAmount = this.speed * dt;
        this.x += n.x * Math.min(moveAmount, dist);
        this.y += n.y * Math.min(moveAmount, dist);
      }
    } else {
      // Direct movement toward player if no path
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const n = normalize(dx, dy);
      this.x += n.x * this.speed * dt;
      this.y += n.y * this.speed * dt;
    }
  }

  _updateAttack(dt, player, distToPlayer) {
    if (!player.alive) {
      this.aiState = AI_STATE.IDLE;
      return;
    }

    if (distToPlayer > this.attackRange * 1.5) {
      this.aiState = AI_STATE.CHASE;
      return;
    }

    if (this.attackCooldown <= 0) {
      this.attackCooldown = 1 / this.attackSpeed;
      const damage = randomInt(this.damageMin, this.damageMax);
      events.emit('monsterAttack', {
        attacker: this,
        target: player,
        damage,
      });
    }
  }

  takeDamage(amount) {
    const actualDamage = Math.max(1, Math.floor(amount - this.defense * 0.2));
    this.hp -= actualDamage;
    this.hitFlash = 0.15;

    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
      this.aiState = AI_STATE.DEAD;
      this.deathTimer = 0.5;
      events.emit('monsterDeath', { monster: this });
    }

    // Aggro on hit
    if (this.aiState === AI_STATE.IDLE) {
      this.aiState = AI_STATE.CHASE;
    }

    return actualDamage;
  }

  render(ctx) {
    if (!this.alive && this.deathTimer <= 0) return;

    if (!this.alive) {
      // Death fade
      ctx.globalAlpha = Math.max(0, this.deathTimer * 2);
    }

    if (this.hitFlash > 0) {
      ctx.globalAlpha = 0.5;
    }

    // Selection circle
    const circleColor = this.isBoss ? '#ff4400' : '#cc4444';
    ctx.strokeStyle = circleColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(this.worldX, this.worldY + 12, 14, 7, 0, 0, Math.PI * 2);
    ctx.stroke();

    super.render(ctx);
    ctx.globalAlpha = 1;

    if (this.alive) {
      // Health bar
      this.renderHealthBar(ctx, this.hp, this.maxHP, this.isBoss ? '#ff6600' : '#cc4444');

      // Name
      ctx.fillStyle = this.isBoss ? '#ff6600' : '#cc4444';
      ctx.font = this.isBoss ? 'bold 12px Arial' : '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        `${this.name} Lv.${this.level}`,
        this.worldX,
        this.worldY - TILE_SIZE / 2 - 26
      );
    }
  }
}

export { MONSTER_DEFS };
