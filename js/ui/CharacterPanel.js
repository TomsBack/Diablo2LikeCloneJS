import { CLASS_STATS, xpForLevel } from '../core/Constants.js';

export class CharacterPanel {
  constructor(game) {
    this.game = game;
    this.panel = document.getElementById('character-panel');
    this.statsEl = document.getElementById('char-stats');
    this.isOpen = false;

    this.panel.querySelector('.panel-close').addEventListener('click', () => this.toggle());
  }

  toggle() {
    this.isOpen = !this.isOpen;
    this.panel.classList.toggle('hidden', !this.isOpen);
    if (this.isOpen) this.render();
  }

  render() {
    if (!this.isOpen) return;
    const p = this.game.player;
    if (!p) return;

    const classDef = CLASS_STATS[p.className];
    const nextXP = xpForLevel(p.level + 1);

    let html = `
      <div class="section-title">${classDef.name} - Level ${p.level}</div>
      <div class="stat-row"><span class="stat-name">Experience</span><span class="stat-value">${p.xp} / ${nextXP}</span></div>
      <div class="stat-row"><span class="stat-name">Stat Points</span><span class="stat-value">${p.statPoints}</span></div>
      <div class="stat-row"><span class="stat-name">Skill Points</span><span class="stat-value">${p.skillPoints}</span></div>

      <div class="section-title">Attributes</div>
      ${this._statRow('Strength', p.str, 'str', p.statPoints > 0)}
      ${this._statRow('Dexterity', p.dex, 'dex', p.statPoints > 0)}
      ${this._statRow('Vitality', p.vit, 'vit', p.statPoints > 0)}
      ${this._statRow('Energy', p.energy, 'energy', p.statPoints > 0)}

      <div class="section-title">Combat</div>
      <div class="stat-row"><span class="stat-name">Life</span><span class="stat-value">${Math.floor(p.hp)} / ${Math.floor(p.maxHP)}</span></div>
      <div class="stat-row"><span class="stat-name">Mana</span><span class="stat-value">${Math.floor(p.mana)} / ${Math.floor(p.maxMana)}</span></div>
      <div class="stat-row"><span class="stat-name">Damage</span><span class="stat-value">${p.minDamage}-${p.maxDamage}</span></div>
      <div class="stat-row"><span class="stat-name">Defense</span><span class="stat-value">${Math.floor(p.defense)}</span></div>
      <div class="stat-row"><span class="stat-name">Attack Rating</span><span class="stat-value">${Math.floor(p.attackRating)}</span></div>
      <div class="stat-row"><span class="stat-name">Crit Chance</span><span class="stat-value">${p.critChance.toFixed(1)}%</span></div>
      <div class="stat-row"><span class="stat-name">HP Regen</span><span class="stat-value">${p.hpRegen.toFixed(1)}/s</span></div>
      <div class="stat-row"><span class="stat-name">Mana Regen</span><span class="stat-value">${p.manaRegen.toFixed(1)}/s</span></div>

      <div class="section-title">Other</div>
      <div class="stat-row"><span class="stat-name">Gold</span><span class="stat-value">${p.gold}</span></div>
    `;

    this.statsEl.innerHTML = html;

    // Bind stat buttons
    this.statsEl.querySelectorAll('.stat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const stat = btn.dataset.stat;
        if (p.allocateStat(stat)) {
          this.game.equipment.applyBonuses(p);
          this.render();
        }
      });
    });
  }

  _statRow(name, value, statKey, canAllocate) {
    const btn = canAllocate
      ? `<button class="stat-btn" data-stat="${statKey}">+</button>`
      : '';
    return `<div class="stat-row">
      <span class="stat-name">${name}</span>
      <span class="stat-value">${value} ${btn}</span>
    </div>`;
  }
}
