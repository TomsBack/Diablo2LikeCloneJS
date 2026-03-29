import { TILE_SIZE } from '../core/Constants.js';

export class Entity {
  constructor(x, y) {
    this.x = x; // tile coordinates (float)
    this.y = y;
    this.alive = true;
    this.sprite = null;
  }

  get worldX() { return this.x * TILE_SIZE + TILE_SIZE / 2; }
  get worldY() { return this.y * TILE_SIZE + TILE_SIZE / 2; }
  get tileX() { return Math.floor(this.x); }
  get tileY() { return Math.floor(this.y); }

  update(dt) {}

  render(ctx) {
    if (!this.alive) return;
    if (this.sprite) {
      ctx.drawImage(
        this.sprite,
        this.worldX - TILE_SIZE / 2,
        this.worldY - TILE_SIZE / 2
      );
    }
  }

  distanceTo(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  renderHealthBar(ctx, current, max, color = '#44cc44', yOffset = -22) {
    if (current >= max) return;
    const barWidth = 32;
    const barHeight = 4;
    const x = this.worldX - barWidth / 2;
    const y = this.worldY - TILE_SIZE / 2 + yOffset;
    const ratio = Math.max(0, current / max);

    ctx.fillStyle = '#111';
    ctx.fillRect(x - 1, y - 1, barWidth + 2, barHeight + 2);
    ctx.fillStyle = ratio > 0.3 ? color : '#cc4444';
    ctx.fillRect(x, y, barWidth * ratio, barHeight);
  }
}
