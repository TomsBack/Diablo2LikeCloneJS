import { randomInt, randomRange, clamp } from '../utils/MathUtils.js';
import { events } from '../utils/EventBus.js';

export class CombatResolver {
  constructor(game) {
    this.game = game;
    this._bindEvents();
  }

  _bindEvents() {
    events.on('playerAttack', (data) => this.resolvePlayerAttack(data));
    events.on('monsterAttack', (data) => this.resolveMonsterAttack(data));
  }

  resolvePlayerAttack({ attacker, target }) {
    const hitChance = clamp(
      (attacker.attackRating / (attacker.attackRating + target.defense * 2)) * 100,
      5, 95
    );

    if (Math.random() * 100 > hitChance) {
      this.game.showFloatingText(target.worldX, target.worldY, 'Miss', '#888', 14);
      return;
    }

    let damage = randomInt(attacker.minDamage, attacker.maxDamage);
    let isCrit = false;

    // Critical hit
    if (Math.random() * 100 < attacker.critChance) {
      damage = Math.floor(damage * 1.5);
      isCrit = true;
    }

    // Elemental bonuses
    let totalDamage = damage;
    if (attacker.bonusFireDamage > 0) totalDamage += randomInt(1, attacker.bonusFireDamage);
    if (attacker.bonusColdDamage > 0) totalDamage += randomInt(1, attacker.bonusColdDamage);
    if (attacker.bonusLightningDamage > 0) totalDamage += randomInt(1, attacker.bonusLightningDamage);
    if (attacker.bonusPoisonDamage > 0) totalDamage += randomInt(1, attacker.bonusPoisonDamage);

    const actualDamage = target.takeDamage(totalDamage);

    const cssClass = isCrit ? 'dmg-critical' : 'dmg-physical';
    const text = isCrit ? `${actualDamage}!` : `${actualDamage}`;
    this.game.showFloatingText(
      target.worldX + randomRange(-10, 10),
      target.worldY - 10,
      text,
      null,
      null,
      cssClass
    );

    // Particle effects on hit
    this.game.particles.bloodSplat(target.worldX, target.worldY);
    if (attacker.bonusFireDamage > 0) this.game.particles.elementalHit(target.worldX, target.worldY, 'fire');
    if (attacker.bonusColdDamage > 0) this.game.particles.elementalHit(target.worldX, target.worldY, 'cold');
    if (attacker.bonusLightningDamage > 0) this.game.particles.elementalHit(target.worldX, target.worldY, 'lightning');

    this.game.camera.addShake(isCrit ? 5 : 2, 0.1);

    if (!target.alive) {
      attacker.gainXP(target.xpValue);
      this.game.showFloatingText(
        target.worldX, target.worldY - 30,
        `+${target.xpValue} XP`, null, null, 'text-xp'
      );
    }
  }

  resolveMonsterAttack({ attacker, target, damage }) {
    const hitChance = clamp(
      (attacker.attackRating / (attacker.attackRating + target.defense * 2)) * 100,
      10, 90
    );

    if (Math.random() * 100 > hitChance) {
      this.game.showFloatingText(target.worldX, target.worldY, 'Miss', '#888', 14);
      return;
    }

    const actualDamage = target.takeDamage(damage);

    this.game.showFloatingText(
      target.worldX + randomRange(-10, 10),
      target.worldY - 10,
      `${actualDamage}`, null, null, 'dmg-physical'
    );

    this.game.camera.addShake(3, 0.08);
  }

  processProjectileCollisions(projectiles, monsters, player) {
    for (const proj of projectiles) {
      if (!proj.active) continue;

      if (proj.owner === player) {
        // Player projectile hitting monsters
        for (const monster of monsters) {
          if (proj.checkHit(monster)) {
            const actualDamage = monster.takeDamage(proj.damage);
            this.game.showFloatingText(
              monster.worldX + randomRange(-10, 10),
              monster.worldY - 10,
              `${actualDamage}`, null, null, 'dmg-physical'
            );
            if (!monster.alive) {
              player.gainXP(monster.xpValue);
              this.game.showFloatingText(
                monster.worldX, monster.worldY - 30,
                `+${monster.xpValue} XP`, null, null, 'text-xp'
              );
            }

            // AoE
            if (proj.aoeRadius > 0) {
              for (const m2 of monsters) {
                if (m2 === monster || !m2.alive) continue;
                const dist = Math.sqrt((m2.x - proj.x) ** 2 + (m2.y - proj.y) ** 2);
                if (dist <= proj.aoeRadius) {
                  const aoeDmg = Math.floor(proj.damage * 0.6);
                  const actualAoeDmg = m2.takeDamage(aoeDmg);
                  this.game.showFloatingText(
                    m2.worldX, m2.worldY - 10,
                    `${actualAoeDmg}`, null, null, 'dmg-fire'
                  );
                }
              }
            }
          }
        }
      } else {
        // Monster projectile hitting player
        if (proj.checkHit(player)) {
          const actualDamage = player.takeDamage(proj.damage);
          this.game.showFloatingText(
            player.worldX, player.worldY - 10,
            `${actualDamage}`, null, null, 'dmg-physical'
          );
        }
      }
    }
  }
}
