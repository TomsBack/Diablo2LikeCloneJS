import { TILE_SIZE, TILE } from '../core/Constants.js';

export class TileMap {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.tiles = new Uint8Array(width * height);
    this.rooms = [];
    this.explored = new Uint8Array(width * height); // 0 = unexplored, 1 = explored
    this.visible = new Uint8Array(width * height);  // 0 = not visible, 1 = visible now
  }

  get(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return TILE.VOID;
    return this.tiles[y * this.width + x];
  }

  set(x, y, type) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    this.tiles[y * this.width + x] = type;
  }

  isWalkable(x, y) {
    const t = this.get(x, y);
    return t === TILE.FLOOR || t === TILE.DOOR || t === TILE.STAIRS_DOWN ||
           t === TILE.STAIRS_UP || t === TILE.TOWN_FLOOR;
  }

  isTransparent(x, y) {
    const t = this.get(x, y);
    return t !== TILE.WALL && t !== TILE.VOID && t !== TILE.TOWN_BUILDING;
  }

  isExplored(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
    return this.explored[y * this.width + x] === 1;
  }

  isVisible(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
    return this.visible[y * this.width + x] === 1;
  }

  setExplored(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    this.explored[y * this.width + x] = 1;
  }

  setVisible(x, y, val) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    this.visible[y * this.width + x] = val ? 1 : 0;
  }

  clearVisible() {
    this.visible.fill(0);
  }

  findTile(type) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.get(x, y) === type) return { x, y };
      }
    }
    return null;
  }

  findAllTiles(type) {
    const results = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.get(x, y) === type) results.push({ x, y });
      }
    }
    return results;
  }

  render(ctx, camera, assets) {
    const { startX, startY, endX, endY } = camera.getVisibleTileRange(this.width, this.height);

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const type = this.get(x, y);
        if (type === TILE.VOID) continue;

        const explored = this.isExplored(x, y);
        const visible = this.isVisible(x, y);

        if (!explored) continue;

        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;

        const tileCanvas = assets.getTileCanvas(type, x, y);
        if (tileCanvas) {
          ctx.drawImage(tileCanvas, px, py);
        }

        // Fog of war darkening for explored but not visible tiles
        if (!visible) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        }
      }
    }
  }
}
