import { TILE, MINIMAP_COLORS } from '../core/Constants.js';

export class Minimap {
  constructor() {
    this.canvas = document.getElementById('minimap');
    this.ctx = this.canvas.getContext('2d');
    this.scale = 2;
  }

  render(tileMap, playerTileX, playerTileY, monsters, lootDrops) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const s = this.scale;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);

    // Center on player
    const offsetX = Math.floor(w / 2) - playerTileX * s;
    const offsetY = Math.floor(h / 2) - playerTileY * s;

    // Draw tiles
    const startTX = Math.max(0, Math.floor(-offsetX / s));
    const startTY = Math.max(0, Math.floor(-offsetY / s));
    const endTX = Math.min(tileMap.width, Math.ceil((w - offsetX) / s));
    const endTY = Math.min(tileMap.height, Math.ceil((h - offsetY) / s));

    for (let ty = startTY; ty < endTY; ty++) {
      for (let tx = startTX; tx < endTX; tx++) {
        if (!tileMap.isExplored(tx, ty)) continue;
        const type = tileMap.get(tx, ty);
        if (type === TILE.VOID) continue;

        ctx.fillStyle = MINIMAP_COLORS[type] || '#333';
        if (!tileMap.isVisible(tx, ty)) {
          ctx.globalAlpha = 0.4;
        }
        ctx.fillRect(offsetX + tx * s, offsetY + ty * s, s, s);
        ctx.globalAlpha = 1;
      }
    }

    // Draw monsters (visible only)
    if (monsters) {
      ctx.fillStyle = '#ff4444';
      for (const m of monsters) {
        if (!m.alive) continue;
        const mtx = Math.floor(m.x);
        const mty = Math.floor(m.y);
        if (!tileMap.isVisible(mtx, mty)) continue;
        ctx.fillRect(offsetX + mtx * s, offsetY + mty * s, s, s);
      }
    }

    // Draw loot
    if (lootDrops) {
      ctx.fillStyle = '#ffff00';
      for (const drop of lootDrops) {
        const dtx = Math.floor(drop.x);
        const dty = Math.floor(drop.y);
        if (!tileMap.isVisible(dtx, dty)) continue;
        ctx.fillRect(offsetX + dtx * s, offsetY + dty * s, s, s);
      }
    }

    // Draw player (white dot)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(offsetX + playerTileX * s - 1, offsetY + playerTileY * s - 1, s + 2, s + 2);

    // Border
    ctx.strokeStyle = '#5a4a2a';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, w, h);
  }
}
