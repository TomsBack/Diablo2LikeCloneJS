import { INVENTORY_CELL_SIZE, RARITY_COLORS } from '../core/Constants.js';
import { STAT_DISPLAY_NAMES } from '../items/ItemGenerator.js';

export class InventoryPanel {
  constructor(game) {
    this.game = game;
    this.panel = document.getElementById('inventory-panel');
    this.canvas = document.getElementById('inventory-grid');
    this.ctx = this.canvas.getContext('2d');
    this.goldDisplay = document.getElementById('gold-amount');
    this.equipSlotsEl = document.getElementById('equipment-slots');
    this.isOpen = false;
    this.dragItem = null;
    this.hoveredItem = null;

    this._setupEquipSlots();
    this._bindEvents();
  }

  _setupEquipSlots() {
    const slots = ['weapon', 'helmet', 'armor', 'shield', 'gloves', 'boots', 'belt', 'ring1', 'ring2', 'amulet'];
    const labels = ['Weapon', 'Helm', 'Armor', 'Shield', 'Gloves', 'Boots', 'Belt', 'Ring', 'Ring', 'Amulet'];

    this.equipSlotsEl.innerHTML = '';
    for (let i = 0; i < slots.length; i++) {
      const div = document.createElement('div');
      div.className = 'equip-slot';
      div.dataset.slot = slots[i];
      div.textContent = labels[i];
      div.addEventListener('click', () => this._onEquipSlotClick(slots[i]));
      div.addEventListener('mouseenter', (e) => this._onEquipSlotHover(slots[i], e));
      div.addEventListener('mouseleave', () => this._hideTooltip());
      this.equipSlotsEl.appendChild(div);
    }
  }

  _bindEvents() {
    this.canvas.addEventListener('click', (e) => this._onGridClick(e));
    this.canvas.addEventListener('mousemove', (e) => this._onGridHover(e));
    this.canvas.addEventListener('mouseleave', () => this._hideTooltip());
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this._onGridRightClick(e);
    });

    this.panel.querySelector('.panel-close').addEventListener('click', () => this.toggle());
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

    const inventory = this.game.inventory;
    const equipment = this.game.equipment;
    const ctx = this.ctx;
    const cs = INVENTORY_CELL_SIZE;

    // Update canvas size
    this.canvas.width = inventory.width * cs;
    this.canvas.height = inventory.height * cs;

    // Clear
    ctx.fillStyle = '#1a1005';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid
    ctx.strokeStyle = '#3a2a1a';
    ctx.lineWidth = 1;
    for (let y = 0; y <= inventory.height; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cs);
      ctx.lineTo(inventory.width * cs, y * cs);
      ctx.stroke();
    }
    for (let x = 0; x <= inventory.width; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cs, 0);
      ctx.lineTo(x * cs, inventory.height * cs);
      ctx.stroke();
    }

    // Draw items
    for (const [, { item, x, y }] of inventory.items) {
      const px = x * cs;
      const py = y * cs;
      const pw = item.gridW * cs;
      const ph = item.gridH * cs;

      // Item background
      const rarityColor = RARITY_COLORS[item.rarity] || '#666';
      ctx.fillStyle = `${rarityColor}22`;
      ctx.fillRect(px + 1, py + 1, pw - 2, ph - 2);

      // Border
      ctx.strokeStyle = rarityColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 1, py + 1, pw - 2, ph - 2);

      // Item icon (simple representation)
      const sprite = this.game.assets.getItemSprite(item);
      if (sprite) {
        const iconSize = Math.min(pw, ph) - 8;
        ctx.drawImage(sprite, px + (pw - iconSize) / 2, py + (ph - iconSize) / 2, iconSize, iconSize);
      }

      // Name (for small items)
      if (item.gridW <= 1 && item.gridH <= 1) {
        ctx.fillStyle = rarityColor;
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(item.name.substring(0, 5), px + pw / 2, py + ph - 3);
      }
    }

    // Update equipment slots
    for (const slotDiv of this.equipSlotsEl.children) {
      const slotName = slotDiv.dataset.slot;
      const equipped = equipment.getItem(slotName);
      if (equipped) {
        slotDiv.classList.add('occupied');
        slotDiv.style.borderColor = RARITY_COLORS[equipped.rarity] || '#5a4a2a';
        slotDiv.textContent = equipped.name.substring(0, 8);
        slotDiv.style.color = RARITY_COLORS[equipped.rarity] || '#ccc';
        slotDiv.style.fontSize = '9px';
      } else {
        slotDiv.classList.remove('occupied');
        slotDiv.style.borderColor = '';
        const labels = { weapon: 'Weapon', helmet: 'Helm', armor: 'Armor', shield: 'Shield',
          gloves: 'Gloves', boots: 'Boots', belt: 'Belt', ring1: 'Ring', ring2: 'Ring', amulet: 'Amulet' };
        slotDiv.textContent = labels[slotName] || slotName;
        slotDiv.style.color = '';
        slotDiv.style.fontSize = '';
      }
    }

    // Gold
    this.goldDisplay.textContent = player.gold;
  }

  _getGridPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / INVENTORY_CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / INVENTORY_CELL_SIZE);
    return { x, y };
  }

  _onGridClick(e) {
    const { x, y } = this._getGridPos(e);
    const item = this.game.inventory.getItemAt(x, y);
    if (item && item.slot !== 'potion') {
      // Equip the item
      this._equipItem(item);
    } else if (item && item.slot === 'potion') {
      // Add to potion belt
      this._addToPotionBelt(item);
    }
  }

  _onGridRightClick(e) {
    const { x, y } = this._getGridPos(e);
    const item = this.game.inventory.getItemAt(x, y);
    if (item) {
      // Drop the item
      this.game.inventory.removeItem(item.id);
      this.render();
    }
  }

  _onGridHover(e) {
    const { x, y } = this._getGridPos(e);
    const item = this.game.inventory.getItemAt(x, y);
    if (item) {
      this._showTooltip(item, e.clientX, e.clientY);
    } else {
      this._hideTooltip();
    }
  }

  _onEquipSlotClick(slot) {
    const item = this.game.equipment.unequip(slot);
    if (item) {
      if (!this.game.inventory.addItem(item)) {
        // No space, re-equip
        this.game.equipment.equip(item, slot);
      } else {
        this.game.equipment.applyBonuses(this.game.player);
      }
    }
    this.render();
  }

  _onEquipSlotHover(slot, e) {
    const item = this.game.equipment.getItem(slot);
    if (item) {
      this._showTooltip(item, e.clientX, e.clientY);
    }
  }

  _equipItem(item) {
    this.game.inventory.removeItem(item.id);
    const slot = this.game.equipment.getSlotForItem(item);
    const previous = this.game.equipment.equip(item, slot);
    if (previous) {
      this.game.inventory.addItem(previous);
    }
    this.game.equipment.applyBonuses(this.game.player);
    this.render();
  }

  _addToPotionBelt(item) {
    const player = this.game.player;
    for (let i = 0; i < 4; i++) {
      if (!player.potionBelt[i]) {
        player.potionBelt[i] = item;
        this.game.inventory.removeItem(item.id);
        this.render();
        return;
      }
    }
  }

  _showTooltip(item, mouseX, mouseY) {
    const tooltip = document.getElementById('tooltip');
    tooltip.classList.remove('hidden');

    let html = `<div class="item-name rarity-${item.rarity}">${item.name}</div>`;
    html += `<div class="item-type">${item.slot}</div>`;

    if (item.damageMin > 0) {
      html += `<div>Damage: ${item.damageMin}-${item.damageMax}</div>`;
    }
    if (item.defense > 0) {
      html += `<div>Defense: ${item.defense}</div>`;
    }
    if (item.blockChance) {
      html += `<div>Block: ${item.blockChance}%</div>`;
    }
    if (item.healAmount) {
      html += `<div style="color:#44ff44">${item.subType === 'health' ? 'Heals' : 'Restores'} ${item.healAmount}</div>`;
    }

    // Affix stats
    if (item.stats) {
      for (const [stat, value] of Object.entries(item.stats)) {
        const template = STAT_DISPLAY_NAMES[stat];
        if (template) {
          html += `<div class="item-stat">${template.replace('%d', value)}</div>`;
        }
      }
    }

    // Requirements
    if (item.reqLevel > 1) html += `<div class="item-req">Required Level: ${item.reqLevel}</div>`;
    if (item.reqStr > 0) html += `<div class="item-req">Required Strength: ${item.reqStr}</div>`;
    if (item.reqDex > 0) html += `<div class="item-req">Required Dexterity: ${item.reqDex}</div>`;

    tooltip.innerHTML = html;

    // Position tooltip
    const tooltipRect = tooltip.getBoundingClientRect();
    let left = mouseX + 15;
    let top = mouseY - 10;
    if (left + tooltipRect.width > window.innerWidth) left = mouseX - tooltipRect.width - 15;
    if (top + tooltipRect.height > window.innerHeight) top = window.innerHeight - tooltipRect.height - 10;
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  _hideTooltip() {
    document.getElementById('tooltip').classList.add('hidden');
  }
}
