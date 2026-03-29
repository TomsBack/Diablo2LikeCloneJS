import { SKILL_DEFS } from '../combat/SkillSystem.js';

export class SkillPanel {
  constructor(game) {
    this.game = game;
    this.panel = document.getElementById('skill-panel');
    this.canvas = document.getElementById('skill-tree-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.isOpen = false;
    this.hoveredSkill = null;

    this.panel.querySelector('.panel-close').addEventListener('click', () => this.toggle());
    this.canvas.addEventListener('click', (e) => this._onClick(e));
    this.canvas.addEventListener('mousemove', (e) => this._onHover(e));
    this.canvas.addEventListener('mouseleave', () => this._onLeave());
  }

  toggle() {
    this.isOpen = !this.isOpen;
    this.panel.classList.toggle('hidden', !this.isOpen);
    if (this.isOpen) this.render();
  }

  render() {
    if (!this.isOpen) return;
    const player = this.game.player;
    if (!player) return;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.fillStyle = '#1a1005';
    ctx.fillRect(0, 0, w, h);

    const skills = Object.entries(SKILL_DEFS)
      .filter(([, def]) => def.class === player.className);

    // Layout: 3 columns (branches), rows by tier
    const colWidth = w / 3;
    const rowHeight = 80;
    const nodeSize = 30;
    const startY = 40;

    // Header
    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Skill Points: ${player.skillPoints}`, w / 2, 20);

    // Branch labels
    const branchNames = ['Combat', 'Utility', 'Special'];
    for (let b = 0; b < 3; b++) {
      ctx.fillStyle = '#8a7a5a';
      ctx.font = '11px Arial';
      ctx.fillText(branchNames[b], colWidth * b + colWidth / 2, 35);
    }

    this._skillPositions = [];

    for (const [id, def] of skills) {
      const col = def.branch;
      const row = def.tier;
      const cx = colWidth * col + colWidth / 2;
      const cy = startY + row * rowHeight + rowHeight / 2;

      const level = player.skillLevels[id] || 0;
      const isLearned = level > 0;
      const canLearn = player.skillPoints > 0 && player.level >= def.reqLevel &&
        (!def.prereq || (player.skillLevels[def.prereq] || 0) > 0);

      // Draw prereq line
      if (def.prereq) {
        const prereqDef = SKILL_DEFS[def.prereq];
        if (prereqDef) {
          const pcx = colWidth * prereqDef.branch + colWidth / 2;
          const pcy = startY + prereqDef.tier * rowHeight + rowHeight / 2;
          ctx.strokeStyle = isLearned ? '#d4af37' : '#3a2a1a';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(pcx, pcy + nodeSize / 2);
          ctx.lineTo(cx, cy - nodeSize / 2);
          ctx.stroke();
        }
      }

      // Node
      ctx.fillStyle = isLearned ? '#3a5a2a' : (canLearn ? '#3a3a2a' : '#1a1a15');
      ctx.strokeStyle = isLearned ? '#5aba5a' : (canLearn ? '#8a7a4a' : '#3a2a1a');
      ctx.lineWidth = 2;
      ctx.fillRect(cx - nodeSize / 2, cy - nodeSize / 2, nodeSize, nodeSize);
      ctx.strokeRect(cx - nodeSize / 2, cy - nodeSize / 2, nodeSize, nodeSize);

      // Level indicator
      if (isLearned) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${level}`, cx, cy + 4);
      }

      // Skill name
      ctx.fillStyle = isLearned ? '#d4af37' : (canLearn ? '#c0a875' : '#5a4a2a');
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(def.name, cx, cy + nodeSize / 2 + 14);

      // Required level
      ctx.fillStyle = '#666';
      ctx.font = '9px Arial';
      ctx.fillText(`Lv.${def.reqLevel}`, cx, cy + nodeSize / 2 + 26);

      this._skillPositions.push({
        id, def, cx, cy, nodeSize, isLearned, canLearn,
      });
    }
  }

  _getSkillAt(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    for (const sp of this._skillPositions || []) {
      if (Math.abs(mx - sp.cx) < sp.nodeSize && Math.abs(my - sp.cy) < sp.nodeSize) {
        return sp;
      }
    }
    return null;
  }

  _onClick(e) {
    const sp = this._getSkillAt(e);
    if (!sp || !sp.canLearn) return;

    const player = this.game.player;
    const currentLevel = player.skillLevels[sp.id] || 0;

    player.skillLevels[sp.id] = currentLevel + 1;
    player.skillPoints--;

    // Auto-equip to first empty skill slot
    if (currentLevel === 0) {
      for (let i = 0; i < 8; i++) {
        if (!player.equippedSkills[i]) {
          player.equippedSkills[i] = sp.id;
          break;
        }
      }
    }

    this.render();
  }

  _onHover(e) {
    const sp = this._getSkillAt(e);
    if (sp) {
      const tooltip = document.getElementById('tooltip');
      tooltip.classList.remove('hidden');

      const level = this.game.player.skillLevels[sp.id] || 0;
      let html = `<div class="item-name" style="color:#d4af37">${sp.def.name}</div>`;
      html += `<div style="color:#888">${sp.def.description}</div>`;
      html += `<div>Mana Cost: ${sp.def.manaCost}</div>`;
      html += `<div>Cooldown: ${sp.def.cooldown}s</div>`;
      if (level > 0) html += `<div style="color:#5aba5a">Level: ${level}</div>`;
      html += `<div class="item-req">Required Level: ${sp.def.reqLevel}</div>`;
      if (sp.def.prereq) {
        html += `<div class="item-req">Requires: ${SKILL_DEFS[sp.def.prereq].name}</div>`;
      }

      tooltip.innerHTML = html;
      tooltip.style.left = `${e.clientX + 15}px`;
      tooltip.style.top = `${e.clientY - 10}px`;
    } else {
      this._onLeave();
    }
  }

  _onLeave() {
    document.getElementById('tooltip').classList.add('hidden');
  }
}
