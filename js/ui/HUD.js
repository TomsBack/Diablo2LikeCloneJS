import { xpForLevel, CLASS_STATS } from '../core/Constants.js';

export class HUD {
  constructor(game) {
    this.game = game;
    this.healthOrbCtx = document.getElementById('health-orb').getContext('2d');
    this.manaOrbCtx = document.getElementById('mana-orb').getContext('2d');
    this.healthText = document.getElementById('health-text');
    this.manaText = document.getElementById('mana-text');
    this.xpBar = document.getElementById('xp-bar');
    this.xpText = document.getElementById('xp-text');
    this.hudEl = document.getElementById('hud');
  }

  show() {
    this.hudEl.classList.remove('hidden');
  }

  hide() {
    this.hudEl.classList.add('hidden');
  }

  update(player) {
    if (!player) return;

    this._renderOrb(this.healthOrbCtx, player.hp, player.maxHP, '#8b1a1a', '#cc2222', '#ff4444');
    this._renderOrb(this.manaOrbCtx, player.mana, player.maxMana, '#1a1a6b', '#2244aa', '#4466ee');

    this.healthText.textContent = `${Math.floor(player.hp)}/${Math.floor(player.maxHP)}`;
    this.manaText.textContent = `${Math.floor(player.mana)}/${Math.floor(player.maxMana)}`;

    // XP bar
    const currentLevelXP = xpForLevel(player.level);
    const nextLevelXP = xpForLevel(player.level + 1);
    const xpProgress = (player.xp - currentLevelXP) / (nextLevelXP - currentLevelXP);
    this.xpBar.style.width = `${Math.max(0, Math.min(100, xpProgress * 100))}%`;
    this.xpText.textContent = `Level ${player.level} - ${Math.floor(xpProgress * 100)}%`;

    // Update skill slots
    this._updateSkillSlots(player);
    this._updatePotionBelt(player);
  }

  _renderOrb(ctx, current, max, darkColor, midColor, lightColor) {
    const w = 120;
    const h = 120;
    const ratio = Math.max(0, Math.min(1, current / max));

    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 56, 0, Math.PI * 2);
    ctx.fill();

    // Liquid fill
    const fillHeight = ratio * 100;
    const startY = h - 10 - fillHeight;

    ctx.save();
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 54, 0, Math.PI * 2);
    ctx.clip();

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, startY, 0, h);
    gradient.addColorStop(0, lightColor);
    gradient.addColorStop(0.3, midColor);
    gradient.addColorStop(1, darkColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, startY, w, h - startY);

    // Bubble effect
    const time = Date.now() * 0.002;
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    for (let i = 0; i < 5; i++) {
      const bx = 30 + Math.sin(time + i * 1.3) * 20;
      const by = startY + 10 + (i * 18 + time * 10) % fillHeight;
      if (by > startY && by < h) {
        ctx.beginPath();
        ctx.arc(bx, by, 2 + Math.sin(time + i) * 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();

    // Glass reflection
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath();
    ctx.ellipse(w / 2 - 12, h / 2 - 12, 18, 24, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Border ring
    ctx.strokeStyle = '#5a4a2a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 56, 0, Math.PI * 2);
    ctx.stroke();
  }

  _updateSkillSlots(player) {
    const slots = document.querySelectorAll('.skill-slot');
    const skillSystem = this.game.skillSystem;

    slots.forEach((slot, i) => {
      const skillId = player.equippedSkills[i];
      if (skillId) {
        const def = skillSystem.getSkillDef(skillId);
        if (def) {
          slot.title = `${def.name} (${def.manaCost} mana)`;

          // Cooldown overlay
          let overlay = slot.querySelector('.cooldown-overlay');
          const ratio = skillSystem.getCooldownRatio(skillId);
          if (ratio > 0) {
            if (!overlay) {
              overlay = document.createElement('div');
              overlay.className = 'cooldown-overlay';
              slot.appendChild(overlay);
            }
            overlay.style.height = `${ratio * 100}%`;
          } else if (overlay) {
            overlay.remove();
          }
        }
      }
    });
  }

  _updatePotionBelt(player) {
    const slots = document.querySelectorAll('.potion-slot');
    slots.forEach((slot, i) => {
      const potion = player.potionBelt[i];
      if (potion) {
        slot.style.backgroundColor = potion.color || '#333';
        slot.title = potion.name;
      } else {
        slot.style.backgroundColor = '';
        slot.title = '';
      }
    });
  }
}
