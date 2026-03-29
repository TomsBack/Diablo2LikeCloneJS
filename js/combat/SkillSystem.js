import { events } from '../utils/EventBus.js';
import { distance, randomInt, normalize } from '../utils/MathUtils.js';
import { TILE_SIZE } from '../core/Constants.js';

const SKILL_DEFS = {
  // Warrior skills
  bash: {
    name: 'Bash', class: 'warrior', branch: 0, tier: 0,
    description: 'A powerful melee strike with bonus damage.',
    manaCost: 3, cooldown: 1.5, type: 'melee',
    damageMultiplier: 1.8, reqLevel: 1,
  },
  whirlwind: {
    name: 'Whirlwind', class: 'warrior', branch: 0, tier: 1,
    description: 'Spin attack hitting all nearby enemies.',
    manaCost: 10, cooldown: 4, type: 'aoe',
    damageMultiplier: 1.2, radius: 2, reqLevel: 6,
    prereq: 'bash',
  },
  warCry: {
    name: 'War Cry', class: 'warrior', branch: 1, tier: 0,
    description: 'Stuns nearby enemies briefly.',
    manaCost: 8, cooldown: 8, type: 'aoe',
    radius: 3, stunDuration: 2, reqLevel: 4,
  },
  battleRage: {
    name: 'Battle Rage', class: 'warrior', branch: 1, tier: 1,
    description: 'Increase damage for a duration.',
    manaCost: 5, cooldown: 15, type: 'buff',
    damageBonus: 30, duration: 10, reqLevel: 8,
    prereq: 'warCry',
  },
  leap: {
    name: 'Leap', class: 'warrior', branch: 2, tier: 0,
    description: 'Jump to target area, damaging enemies on landing.',
    manaCost: 6, cooldown: 5, type: 'leap',
    damageMultiplier: 1.5, radius: 1.5, reqLevel: 3,
  },

  // Mage skills
  fireball: {
    name: 'Fireball', class: 'mage', branch: 0, tier: 0,
    description: 'Launch a fireball that explodes on impact.',
    manaCost: 8, cooldown: 1.2, type: 'projectile',
    projectileType: 'fireball', damageMultiplier: 2.0, aoeRadius: 1.5,
    reqLevel: 1,
  },
  meteorShower: {
    name: 'Meteor Shower', class: 'mage', branch: 0, tier: 1,
    description: 'Rain fire on an area.',
    manaCost: 25, cooldown: 8, type: 'aoe',
    damageMultiplier: 3.0, radius: 3, reqLevel: 10,
    prereq: 'fireball',
  },
  iceBolt: {
    name: 'Ice Bolt', class: 'mage', branch: 1, tier: 0,
    description: 'A bolt of ice that slows the target.',
    manaCost: 5, cooldown: 1, type: 'projectile',
    projectileType: 'icebolt', damageMultiplier: 1.5,
    slowAmount: 50, slowDuration: 3, reqLevel: 1,
  },
  frostNova: {
    name: 'Frost Nova', class: 'mage', branch: 1, tier: 1,
    description: 'Freeze all nearby enemies.',
    manaCost: 15, cooldown: 6, type: 'aoe',
    damageMultiplier: 1.0, radius: 3, freezeDuration: 2, reqLevel: 8,
    prereq: 'iceBolt',
  },
  teleport: {
    name: 'Teleport', class: 'mage', branch: 2, tier: 0,
    description: 'Instantly move to target location.',
    manaCost: 12, cooldown: 3, type: 'teleport',
    range: 8, reqLevel: 5,
  },

  // Rogue skills
  multipleShot: {
    name: 'Multiple Shot', class: 'rogue', branch: 0, tier: 0,
    description: 'Fire multiple arrows in a spread.',
    manaCost: 6, cooldown: 1.5, type: 'multiProjectile',
    projectileType: 'arrow', projectileCount: 3, damageMultiplier: 0.8,
    reqLevel: 1,
  },
  guidedArrow: {
    name: 'Guided Arrow', class: 'rogue', branch: 0, tier: 1,
    description: 'A powerful arrow that always hits.',
    manaCost: 10, cooldown: 2, type: 'projectile',
    projectileType: 'arrow', damageMultiplier: 2.5, autoHit: true,
    reqLevel: 8, prereq: 'multipleShot',
  },
  powerStrike: {
    name: 'Power Strike', class: 'rogue', branch: 1, tier: 0,
    description: 'A charged melee attack with lightning damage.',
    manaCost: 4, cooldown: 2, type: 'melee',
    damageMultiplier: 2.0, elementalType: 'lightning',
    reqLevel: 3,
  },
  poisonArrow: {
    name: 'Poison Arrow', class: 'rogue', branch: 2, tier: 0,
    description: 'An arrow that poisons the target over time.',
    manaCost: 5, cooldown: 2, type: 'projectile',
    projectileType: 'poisonArrow', damageMultiplier: 1.0,
    poisonDamage: 5, poisonDuration: 5, reqLevel: 4,
  },
  shadowStep: {
    name: 'Shadow Step', class: 'rogue', branch: 2, tier: 1,
    description: 'Teleport behind an enemy and strike.',
    manaCost: 15, cooldown: 6, type: 'teleportStrike',
    damageMultiplier: 3.0, reqLevel: 10,
    prereq: 'poisonArrow',
  },
};

export class SkillSystem {
  constructor(game) {
    this.game = game;
    this.cooldowns = {};
  }

  getSkillsForClass(className) {
    return Object.entries(SKILL_DEFS)
      .filter(([, def]) => def.class === className)
      .map(([id, def]) => ({ id, ...def }));
  }

  getSkillDef(skillId) {
    return SKILL_DEFS[skillId];
  }

  canUseSkill(player, skillId) {
    const def = SKILL_DEFS[skillId];
    if (!def) return false;
    if (player.mana < def.manaCost) return false;
    if (this.cooldowns[skillId] > 0) return false;
    return true;
  }

  useSkill(player, skillId, targetX, targetY, monsters) {
    const def = SKILL_DEFS[skillId];
    if (!def || !this.canUseSkill(player, skillId)) return false;

    player.mana -= def.manaCost;
    this.cooldowns[skillId] = def.cooldown;

    const skillLevel = player.skillLevels[skillId] || 1;
    const levelBonus = 1 + (skillLevel - 1) * 0.15;

    switch (def.type) {
      case 'melee':
        this._useMeleeSkill(player, def, monsters, levelBonus);
        break;
      case 'projectile':
        this._useProjectileSkill(player, def, targetX, targetY, levelBonus);
        break;
      case 'multiProjectile':
        this._useMultiProjectileSkill(player, def, targetX, targetY, levelBonus);
        break;
      case 'aoe':
        this._useAoESkill(player, def, targetX, targetY, monsters, levelBonus);
        break;
      case 'buff':
        this._useBuffSkill(player, def, levelBonus);
        break;
      case 'teleport':
        this._useTeleportSkill(player, targetX, targetY);
        break;
      case 'leap':
        this._useLeapSkill(player, def, targetX, targetY, monsters, levelBonus);
        break;
      case 'teleportStrike':
        this._useTeleportStrike(player, def, monsters, levelBonus);
        break;
    }

    events.emit('skillUsed', { skillId, player });
    return true;
  }

  updateCooldowns(dt) {
    for (const key of Object.keys(this.cooldowns)) {
      this.cooldowns[key] = Math.max(0, this.cooldowns[key] - dt);
    }
  }

  getCooldownRatio(skillId) {
    const def = SKILL_DEFS[skillId];
    if (!def || !this.cooldowns[skillId]) return 0;
    return this.cooldowns[skillId] / def.cooldown;
  }

  _useMeleeSkill(player, def, monsters, levelBonus) {
    for (const m of monsters) {
      if (!m.alive) continue;
      if (player.distanceTo(m) <= 2) {
        const baseDmg = randomInt(player.minDamage, player.maxDamage);
        const damage = Math.floor(baseDmg * def.damageMultiplier * levelBonus);
        const actual = m.takeDamage(damage);
        const cssClass = def.elementalType === 'lightning' ? 'dmg-lightning' : 'dmg-critical';
        this.game.showFloatingText(m.worldX, m.worldY - 10, `${actual}`, null, null, cssClass);
        this.game.camera.addShake(4, 0.12);
        if (!m.alive) {
          player.gainXP(m.xpValue);
        }
        break; // Hit only one target for melee
      }
    }
  }

  _useProjectileSkill(player, def, targetX, targetY, levelBonus) {
    const baseDmg = randomInt(player.minDamage, player.maxDamage);
    const damage = Math.floor(baseDmg * def.damageMultiplier * levelBonus);

    events.emit('spawnProjectile', {
      x: player.x, y: player.y,
      targetX, targetY,
      damage,
      owner: player,
      type: def.projectileType || 'arrow',
      aoeRadius: def.aoeRadius || 0,
    });
  }

  _useMultiProjectileSkill(player, def, targetX, targetY, levelBonus) {
    const count = def.projectileCount || 3;
    const baseAngle = Math.atan2(targetY - player.y, targetX - player.x);
    const spread = Math.PI / 8;

    for (let i = 0; i < count; i++) {
      const angle = baseAngle + (i - (count - 1) / 2) * spread;
      const range = 8;
      const tx = player.x + Math.cos(angle) * range;
      const ty = player.y + Math.sin(angle) * range;

      const baseDmg = randomInt(player.minDamage, player.maxDamage);
      const damage = Math.floor(baseDmg * def.damageMultiplier * levelBonus);

      events.emit('spawnProjectile', {
        x: player.x, y: player.y,
        targetX: tx, targetY: ty,
        damage,
        owner: player,
        type: def.projectileType || 'arrow',
      });
    }
  }

  _useAoESkill(player, def, targetX, targetY, monsters, levelBonus) {
    const centerX = def.radius <= 3 ? player.x : targetX;
    const centerY = def.radius <= 3 ? player.y : targetY;

    for (const m of monsters) {
      if (!m.alive) continue;
      const dist = Math.sqrt((m.x - centerX) ** 2 + (m.y - centerY) ** 2);
      if (dist <= def.radius) {
        const baseDmg = randomInt(player.minDamage, player.maxDamage);
        const damage = Math.floor(baseDmg * def.damageMultiplier * levelBonus);
        const actual = m.takeDamage(damage);
        this.game.showFloatingText(m.worldX, m.worldY - 10, `${actual}`, null, null, 'dmg-fire');
        if (!m.alive) player.gainXP(m.xpValue);
      }
    }

    this.game.camera.addShake(6, 0.2);

    // Visual effect
    events.emit('aoeEffect', {
      x: centerX, y: centerY,
      radius: def.radius,
      color: def.freezeDuration ? '#88ccff' : '#ff4400',
      duration: 0.5,
    });
  }

  _useBuffSkill(player, def, levelBonus) {
    events.emit('applyBuff', {
      target: player,
      type: 'damageBonus',
      value: def.damageBonus * levelBonus,
      duration: def.duration,
    });
    this.game.showFloatingText(player.worldX, player.worldY - 30, def.name, '#44ff44', 16);
  }

  _useTeleportSkill(player, targetX, targetY) {
    const tileMap = this.game.currentMap;
    const tx = Math.floor(targetX);
    const ty = Math.floor(targetY);
    if (tileMap.isWalkable(tx, ty)) {
      player.x = tx + 0.5;
      player.y = ty + 0.5;
      player.path = null;
      events.emit('aoeEffect', {
        x: player.x, y: player.y,
        radius: 1, color: '#8a7aee', duration: 0.3,
      });
    }
  }

  _useLeapSkill(player, def, targetX, targetY, monsters, levelBonus) {
    const tileMap = this.game.currentMap;
    const tx = Math.floor(targetX);
    const ty = Math.floor(targetY);
    if (tileMap.isWalkable(tx, ty)) {
      player.x = tx + 0.5;
      player.y = ty + 0.5;
      player.path = null;

      // Damage on landing
      for (const m of monsters) {
        if (!m.alive) continue;
        if (player.distanceTo(m) <= def.radius) {
          const baseDmg = randomInt(player.minDamage, player.maxDamage);
          const damage = Math.floor(baseDmg * def.damageMultiplier * levelBonus);
          const actual = m.takeDamage(damage);
          this.game.showFloatingText(m.worldX, m.worldY - 10, `${actual}`, null, null, 'dmg-physical');
          if (!m.alive) player.gainXP(m.xpValue);
        }
      }
      this.game.camera.addShake(5, 0.15);
    }
  }

  _useTeleportStrike(player, def, monsters, levelBonus) {
    // Find nearest enemy
    let nearest = null;
    let nearestDist = Infinity;
    for (const m of monsters) {
      if (!m.alive) continue;
      const d = player.distanceTo(m);
      if (d < nearestDist && d < 8) {
        nearest = m;
        nearestDist = d;
      }
    }

    if (nearest) {
      // Teleport behind
      const angle = Math.atan2(player.y - nearest.y, player.x - nearest.x);
      player.x = nearest.x - Math.cos(angle) * 1;
      player.y = nearest.y - Math.sin(angle) * 1;
      player.path = null;

      const baseDmg = randomInt(player.minDamage, player.maxDamage);
      const damage = Math.floor(baseDmg * def.damageMultiplier * levelBonus);
      const actual = nearest.takeDamage(damage);
      this.game.showFloatingText(nearest.worldX, nearest.worldY - 10, `${actual}!`, null, null, 'dmg-critical');
      this.game.camera.addShake(5, 0.15);
      if (!nearest.alive) player.gainXP(nearest.xpValue);
    }
  }
}

export { SKILL_DEFS };
