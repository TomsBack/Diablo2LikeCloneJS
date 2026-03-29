import { Entity } from './Entity.js';
import { TILE_SIZE, PLAYER_SPEED, CLASS_STATS, xpForLevel, MAX_LEVEL, STAT_POINTS_PER_LEVEL, SKILL_POINTS_PER_LEVEL } from '../core/Constants.js';
import { distance, normalize, clamp } from '../utils/MathUtils.js';
import { findPath } from '../pathfinding/AStar.js';
import { events } from '../utils/EventBus.js';

export class Player extends Entity {
  constructor(x, y, className) {
    super(x, y);
    this.className = className;
    const stats = CLASS_STATS[className];

    // Base stats
    this.baseStr = stats.baseStr;
    this.baseDex = stats.baseDex;
    this.baseVit = stats.baseVit;
    this.baseEnergy = stats.baseEnergy;

    // Added stats from level ups
    this.addedStr = 0;
    this.addedDex = 0;
    this.addedVit = 0;
    this.addedEnergy = 0;

    // Bonus stats from equipment
    this.bonusStr = 0;
    this.bonusDex = 0;
    this.bonusVit = 0;
    this.bonusEnergy = 0;
    this.bonusHP = 0;
    this.bonusMana = 0;
    this.bonusDamageMin = 0;
    this.bonusDamageMax = 0;
    this.bonusDefense = 0;
    this.bonusAttackSpeed = 0;
    this.bonusMoveSpeed = 0;
    this.bonusHPRegen = 0;
    this.bonusManaRegen = 0;
    this.bonusFireDamage = 0;
    this.bonusColdDamage = 0;
    this.bonusLightningDamage = 0;
    this.bonusPoisonDamage = 0;

    // Level
    this.level = 1;
    this.xp = 0;
    this.statPoints = 0;
    this.skillPoints = 0;

    // Movement
    this.path = null;
    this.pathIndex = 0;
    this.speed = PLAYER_SPEED;

    // Combat
    this.attackTarget = null;
    this.attackCooldown = 0;
    this.attackSpeed = 1.5; // attacks per second base

    // Calculated (must come after speed/attackSpeed are set)
    this.recalcStats();

    // Current values
    this.hp = this.maxHP;
    this.mana = this.maxMana;

    // Gold
    this.gold = 0;

    // Skills
    this.skills = {};
    this.equippedSkills = new Array(8).fill(null);
    this.skillLevels = {};

    // State
    this.isAttacking = false;
    this.lastHitTime = 0;
    this.invulnTime = 0;

    // Potions on belt
    this.potionBelt = [null, null, null, null];
  }

  get str() { return this.baseStr + this.addedStr + this.bonusStr; }
  get dex() { return this.baseDex + this.addedDex + this.bonusDex; }
  get vit() { return this.baseVit + this.addedVit + this.bonusVit; }
  get energy() { return this.baseEnergy + this.addedEnergy + this.bonusEnergy; }

  recalcStats() {
    const cs = CLASS_STATS[this.className];
    const levelHP = (cs.hpPerLevel || 0) * (this.level - 1);
    const levelMana = (cs.manaPerLevel || 0) * (this.level - 1);
    this.maxHP = cs.baseHP + this.vit * cs.hpPerVit + levelHP + this.bonusHP;
    this.maxMana = cs.baseMana + this.energy * cs.manaPerEnergy + levelMana + this.bonusMana;
    this.hpRegen = this.vit * 0.08 + this.bonusHPRegen;
    this.manaRegen = this.energy * 0.12 + this.bonusManaRegen;
    this.attackRating = this.dex * 2 + this.level * 5;
    this.defense = this.dex * 0.5 + this.bonusDefense;

    // Damage
    const strBonus = this.className === 'warrior' ? this.str * 0.6 : this.str * 0.3;
    const dexBonus = this.className === 'rogue' ? this.dex * 0.5 : this.dex * 0.2;
    this.minDamage = Math.max(1, Math.floor(1 + strBonus + dexBonus + this.bonusDamageMin));
    this.maxDamage = Math.max(2, Math.floor(4 + strBonus + dexBonus + this.bonusDamageMax));

    this.critChance = clamp(this.dex / 20, 1, 50);
    this.effectiveSpeed = this.speed * (1 + this.bonusMoveSpeed / 100);
    this.effectiveAttackSpeed = this.attackSpeed * (1 + this.bonusAttackSpeed / 100);
  }

  update(dt, tileMap) {
    // Regen
    this.hp = Math.min(this.maxHP, this.hp + this.hpRegen * dt);
    this.mana = Math.min(this.maxMana, this.mana + this.manaRegen * dt);

    // Invulnerability frames
    if (this.invulnTime > 0) this.invulnTime -= dt;

    // Attack cooldown
    if (this.attackCooldown > 0) this.attackCooldown -= dt;

    // Follow path
    if (this.path && this.pathIndex < this.path.length) {
      const target = this.path[this.pathIndex];
      const dx = target.x + 0.5 - this.x;
      const dy = target.y + 0.5 - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 0.1) {
        this.x = target.x + 0.5;
        this.y = target.y + 0.5;
        this.pathIndex++;
      } else {
        const n = normalize(dx, dy);
        const moveAmount = this.effectiveSpeed * dt;
        this.x += n.x * Math.min(moveAmount, dist);
        this.y += n.y * Math.min(moveAmount, dist);
      }
    } else {
      this.path = null;
    }

    // Attack target
    if (this.attackTarget && this.attackTarget.alive) {
      const dist = this.distanceTo(this.attackTarget);
      const attackRange = this.className === 'rogue' ? 5 : 1.5;

      if (dist <= attackRange) {
        this.path = null;
        if (this.attackCooldown <= 0) {
          this._performAttack();
        }
      } else if (!this.path) {
        // Move toward target
        this.moveTo(Math.floor(this.attackTarget.x), Math.floor(this.attackTarget.y), tileMap);
      }
    } else {
      this.attackTarget = null;
      this.isAttacking = false;
    }
  }

  moveTo(tileX, tileY, tileMap) {
    const path = findPath(tileMap, this.tileX, this.tileY, tileX, tileY);
    if (path) {
      this.path = path;
      this.pathIndex = 0;
      this.attackTarget = null;
      this.isAttacking = false;
    }
  }

  setAttackTarget(entity, tileMap) {
    this.attackTarget = entity;
    this.isAttacking = true;
    const dist = this.distanceTo(entity);
    const attackRange = this.className === 'rogue' ? 5 : 1.5;
    if (dist > attackRange) {
      this.moveTo(Math.floor(entity.x), Math.floor(entity.y), tileMap);
    }
  }

  _performAttack() {
    if (!this.attackTarget || !this.attackTarget.alive) return;

    this.attackCooldown = 1 / this.effectiveAttackSpeed;
    this.isAttacking = true;

    events.emit('playerAttack', {
      attacker: this,
      target: this.attackTarget,
    });
  }

  takeDamage(amount) {
    if (this.invulnTime > 0) return 0;

    const actualDamage = Math.max(1, Math.floor(amount - this.defense * 0.3));
    this.hp -= actualDamage;
    this.invulnTime = 0.2;
    this.lastHitTime = performance.now();

    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
      events.emit('playerDeath', { player: this });
    }

    return actualDamage;
  }

  heal(amount) {
    this.hp = Math.min(this.maxHP, this.hp + amount);
  }

  restoreMana(amount) {
    this.mana = Math.min(this.maxMana, this.mana + amount);
  }

  gainXP(amount) {
    this.xp += amount;
    events.emit('xpGain', { amount, total: this.xp });

    while (this.level < MAX_LEVEL && this.xp >= xpForLevel(this.level + 1)) {
      this.levelUp();
    }
  }

  levelUp() {
    this.level++;
    this.statPoints += STAT_POINTS_PER_LEVEL;
    if (this.level >= 2) this.skillPoints += SKILL_POINTS_PER_LEVEL;
    this.recalcStats();
    this.hp = this.maxHP;
    this.mana = this.maxMana;
    events.emit('levelUp', { level: this.level });
  }

  allocateStat(stat) {
    if (this.statPoints <= 0) return false;
    switch (stat) {
      case 'str': this.addedStr++; break;
      case 'dex': this.addedDex++; break;
      case 'vit': this.addedVit++; break;
      case 'energy': this.addedEnergy++; break;
      default: return false;
    }
    this.statPoints--;
    this.recalcStats();
    return true;
  }

  usePotion(slotIndex) {
    const potion = this.potionBelt[slotIndex];
    if (!potion) return;

    if (potion.subType === 'health') {
      this.heal(potion.healAmount || 50);
      events.emit('potionUsed', { type: 'health' });
    } else if (potion.subType === 'mana') {
      this.restoreMana(potion.healAmount || 30);
      events.emit('potionUsed', { type: 'mana' });
    }

    this.potionBelt[slotIndex] = null;
  }

  render(ctx) {
    if (!this.alive) return;

    // Selection circle
    ctx.strokeStyle = '#44cc44';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(this.worldX, this.worldY + 12, 16, 8, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Flash on hit
    if (this.invulnTime > 0) {
      ctx.globalAlpha = 0.5 + Math.sin(performance.now() * 0.02) * 0.3;
    }

    super.render(ctx);
    ctx.globalAlpha = 1;

    // Health bar
    this.renderHealthBar(ctx, this.hp, this.maxHP);

    // Mana bar below health
    if (this.mana < this.maxMana) {
      const barWidth = 32;
      const barHeight = 3;
      const bx = this.worldX - barWidth / 2;
      const by = this.worldY - TILE_SIZE / 2 - 16;
      const ratio = this.mana / this.maxMana;
      ctx.fillStyle = '#111';
      ctx.fillRect(bx - 1, by - 1, barWidth + 2, barHeight + 2);
      ctx.fillStyle = '#4466cc';
      ctx.fillRect(bx, by, barWidth * ratio, barHeight);
    }

    // Name
    ctx.fillStyle = '#44cc44';
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Lv.${this.level} ${CLASS_STATS[this.className].name}`, this.worldX, this.worldY - TILE_SIZE / 2 - 26);
  }
}
