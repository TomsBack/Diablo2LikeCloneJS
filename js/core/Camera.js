import { TILE_SIZE } from './Constants.js';
import { lerp } from '../utils/MathUtils.js';

export class Camera {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.smoothing = 8;
    this.shake = 0;
    this.shakeIntensity = 0;
  }

  get width() { return this.canvas.width; }
  get height() { return this.canvas.height; }

  follow(worldX, worldY) {
    this.targetX = worldX - this.width / 2;
    this.targetY = worldY - this.height / 2;
  }

  update(dt) {
    this.x = lerp(this.x, this.targetX, this.smoothing * dt);
    this.y = lerp(this.y, this.targetY, this.smoothing * dt);

    if (this.shake > 0) {
      this.shake -= dt;
    }
  }

  addShake(intensity = 4, duration = 0.15) {
    this.shakeIntensity = intensity;
    this.shake = duration;
  }

  beginFrame(ctx) {
    ctx.save();
    let offsetX = -Math.round(this.x);
    let offsetY = -Math.round(this.y);

    if (this.shake > 0) {
      offsetX += (Math.random() - 0.5) * this.shakeIntensity * 2;
      offsetY += (Math.random() - 0.5) * this.shakeIntensity * 2;
    }

    ctx.translate(offsetX, offsetY);
  }

  endFrame(ctx) {
    ctx.restore();
  }

  screenToWorld(screenX, screenY) {
    return {
      x: screenX + this.x,
      y: screenY + this.y,
    };
  }

  worldToScreen(worldX, worldY) {
    return {
      x: worldX - this.x,
      y: worldY - this.y,
    };
  }

  worldToTile(worldX, worldY) {
    return {
      x: Math.floor(worldX / TILE_SIZE),
      y: Math.floor(worldY / TILE_SIZE),
    };
  }

  tileToWorld(tileX, tileY) {
    return {
      x: tileX * TILE_SIZE + TILE_SIZE / 2,
      y: tileY * TILE_SIZE + TILE_SIZE / 2,
    };
  }

  getVisibleTileRange(mapWidth, mapHeight) {
    const startX = Math.max(0, Math.floor(this.x / TILE_SIZE) - 1);
    const startY = Math.max(0, Math.floor(this.y / TILE_SIZE) - 1);
    const endX = Math.min(mapWidth, Math.ceil((this.x + this.width) / TILE_SIZE) + 1);
    const endY = Math.min(mapHeight, Math.ceil((this.y + this.height) / TILE_SIZE) + 1);
    return { startX, startY, endX, endY };
  }

  clampToMap(mapWidth, mapHeight) {
    const maxX = mapWidth * TILE_SIZE - this.width;
    const maxY = mapHeight * TILE_SIZE - this.height;
    this.targetX = Math.max(0, Math.min(maxX, this.targetX));
    this.targetY = Math.max(0, Math.min(maxY, this.targetY));
  }
}
