export class FogOfWar {
  constructor(tileMap) {
    this.map = tileMap;
    this.radius = 8;
  }

  update(playerTileX, playerTileY) {
    this.map.clearVisible();
    this._castLight(playerTileX, playerTileY);
  }

  _castLight(cx, cy) {
    const r = this.radius;
    // Simple raycasting FOV
    const steps = 360;
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      const dx = Math.cos(angle);
      const dy = Math.sin(angle);

      let x = cx + 0.5;
      let y = cy + 0.5;

      for (let d = 0; d < r; d++) {
        const tileX = Math.floor(x);
        const tileY = Math.floor(y);

        if (tileX < 0 || tileX >= this.map.width || tileY < 0 || tileY >= this.map.height) break;

        this.map.setVisible(tileX, tileY, true);
        this.map.setExplored(tileX, tileY);

        if (!this.map.isTransparent(tileX, tileY)) break;

        x += dx;
        y += dy;
      }
    }
  }
}
