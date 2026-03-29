import { INVENTORY_WIDTH, INVENTORY_HEIGHT } from '../core/Constants.js';

export class Inventory {
  constructor(width = INVENTORY_WIDTH, height = INVENTORY_HEIGHT) {
    this.width = width;
    this.height = height;
    this.grid = new Array(width * height).fill(null); // stores item id or null
    this.items = new Map(); // id -> { item, x, y }
  }

  addItem(item) {
    const pos = this._findSpace(item.gridW, item.gridH);
    if (!pos) return false;
    this._placeItem(item, pos.x, pos.y);
    return true;
  }

  removeItem(itemId) {
    const entry = this.items.get(itemId);
    if (!entry) return null;

    this._clearCells(entry.x, entry.y, entry.item.gridW, entry.item.gridH);
    this.items.delete(itemId);
    return entry.item;
  }

  getItemAt(gridX, gridY) {
    if (gridX < 0 || gridX >= this.width || gridY < 0 || gridY >= this.height) return null;
    const id = this.grid[gridY * this.width + gridX];
    if (id === null) return null;
    const entry = this.items.get(id);
    return entry ? entry.item : null;
  }

  canPlace(item, x, y) {
    for (let dy = 0; dy < item.gridH; dy++) {
      for (let dx = 0; dx < item.gridW; dx++) {
        const gx = x + dx;
        const gy = y + dy;
        if (gx >= this.width || gy >= this.height) return false;
        const cellId = this.grid[gy * this.width + gx];
        if (cellId !== null && cellId !== item.id) return false;
      }
    }
    return true;
  }

  placeAt(item, x, y) {
    if (!this.canPlace(item, x, y)) return false;
    // Remove from old position first
    this.removeItem(item.id);
    this._placeItem(item, x, y);
    return true;
  }

  getAllItems() {
    return Array.from(this.items.values()).map(e => e.item);
  }

  isFull() {
    return !this._findSpace(1, 1);
  }

  _findSpace(w, h) {
    for (let y = 0; y <= this.height - h; y++) {
      for (let x = 0; x <= this.width - w; x++) {
        if (this._isSpaceFree(x, y, w, h)) {
          return { x, y };
        }
      }
    }
    return null;
  }

  _isSpaceFree(x, y, w, h) {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        if (this.grid[(y + dy) * this.width + (x + dx)] !== null) return false;
      }
    }
    return true;
  }

  _placeItem(item, x, y) {
    for (let dy = 0; dy < item.gridH; dy++) {
      for (let dx = 0; dx < item.gridW; dx++) {
        this.grid[(y + dy) * this.width + (x + dx)] = item.id;
      }
    }
    this.items.set(item.id, { item, x, y });
  }

  _clearCells(x, y, w, h) {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        this.grid[(y + dy) * this.width + (x + dx)] = null;
      }
    }
  }

  serialize() {
    return {
      width: this.width,
      height: this.height,
      items: Array.from(this.items.entries()).map(([id, { item, x, y }]) => ({
        item, x, y,
      })),
    };
  }

  static deserialize(data) {
    const inv = new Inventory(data.width, data.height);
    for (const { item, x, y } of data.items) {
      inv._placeItem(item, x, y);
    }
    return inv;
  }
}
