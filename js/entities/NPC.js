import { Entity } from './Entity.js';
import { TILE_SIZE } from '../core/Constants.js';

export class NPC extends Entity {
  constructor(x, y, type) {
    super(x + 0.5, y + 0.5);
    this.type = type;
    this.interactRadius = 2;

    const configs = {
      merchant: {
        name: 'Gheed the Merchant',
        greeting: 'Looking to trade? I have the finest wares.',
        options: ['Buy', 'Sell', 'Close'],
      },
      stash: {
        name: 'Personal Stash',
        greeting: 'Your personal storage chest.',
        options: ['Open Stash', 'Close'],
      },
      healer: {
        name: 'Akara the Healer',
        greeting: 'Let me tend to your wounds, brave warrior.',
        options: ['Heal', 'Close'],
      },
    };

    const cfg = configs[type] || configs.merchant;
    this.name = cfg.name;
    this.greeting = cfg.greeting;
    this.dialogueOptions = cfg.options;
  }

  canInteract(player) {
    return this.distanceTo(player) <= this.interactRadius;
  }

  render(ctx) {
    if (!this.alive) return;

    // Interaction indicator
    ctx.fillStyle = '#d4af3780';
    ctx.beginPath();
    ctx.arc(this.worldX, this.worldY - TILE_SIZE / 2 - 8, 4, 0, Math.PI * 2);
    ctx.fill();

    super.render(ctx);

    // Name
    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.name, this.worldX, this.worldY - TILE_SIZE / 2 - 14);
  }
}
