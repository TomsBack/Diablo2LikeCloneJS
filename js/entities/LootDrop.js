import { TILE_SIZE, RARITY_COLORS } from '../core/Constants.js';

export class LootDrop {
  constructor(x, y, item) {
    this.x = x;
    this.y = y;
    this.item = item; // null for gold
    this.isGold = item === null;
    this.goldAmount = 0;
    this.bobOffset = Math.random() * Math.PI * 2;
    this.lifetime = 300; // 5 minutes
    this.sprite = null;
  }

  static createGold(x, y, amount) {
    const drop = new LootDrop(x, y, null);
    drop.isGold = true;
    drop.goldAmount = amount;
    return drop;
  }

  static createItem(x, y, item) {
    return new LootDrop(x, y, item);
  }

  update(dt) {
    this.lifetime -= dt;
    this.bobOffset += dt * 2;
  }

  get expired() {
    return this.lifetime <= 0;
  }

  render(ctx, assets) {
    const wx = this.x * TILE_SIZE + TILE_SIZE / 2;
    const wy = this.y * TILE_SIZE + TILE_SIZE / 2;
    const bob = Math.sin(this.bobOffset) * 2;

    if (this.isGold) {
      // Gold pile
      ctx.fillStyle = '#d4af37';
      ctx.shadowColor = '#d4af37';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(wx, wy + bob - 4, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#aa8a2e';
      ctx.beginPath();
      ctx.arc(wx - 3, wy + bob - 2, 3, 0, Math.PI * 2);
      ctx.arc(wx + 3, wy + bob - 1, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Amount text
      ctx.fillStyle = '#d4af37';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${this.goldAmount}g`, wx, wy + bob - 14);
    } else {
      // Item
      const rarityColor = RARITY_COLORS[this.item.rarity] || '#fff';

      // Glow
      ctx.shadowColor = rarityColor;
      ctx.shadowBlur = 6;

      if (this.sprite) {
        ctx.drawImage(this.sprite, wx - 16, wy - 16 + bob);
      } else {
        // Fallback shape
        ctx.fillStyle = rarityColor;
        ctx.fillRect(wx - 6, wy - 6 + bob, 12, 12);
      }

      ctx.shadowBlur = 0;

      // Name label
      ctx.fillStyle = rarityColor;
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(this.item.name, wx, wy + bob - 14);
    }
  }
}
