import { TILE_SIZE } from '../core/Constants.js';
import { distance, normalize } from '../utils/MathUtils.js';

export class Projectile {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.speed = 10;
    this.damage = 0;
    this.owner = null;
    this.active = false;
    this.color = '#ffcc00';
    this.size = 4;
    this.type = 'arrow'; // arrow, fireball, icebolt, lightning
    this.lifetime = 3;
    this.piercing = false;
    this.aoeRadius = 0;
    this.hitEntities = new Set();
    this.trail = [];
  }

  init(x, y, targetX, targetY, damage, owner, type = 'arrow') {
    this.x = x;
    this.y = y;
    this.targetX = targetX;
    this.targetY = targetY;
    this.damage = damage;
    this.owner = owner;
    this.active = true;
    this.type = type;
    this.lifetime = 3;
    this.hitEntities.clear();
    this.trail = [];

    const configs = {
      arrow: { color: '#c8a060', size: 3, speed: 12 },
      fireball: { color: '#ff4400', size: 6, speed: 8, aoeRadius: 1.5 },
      icebolt: { color: '#88ccff', size: 5, speed: 10 },
      lightning: { color: '#ffff44', size: 3, speed: 15, piercing: true },
      poisonArrow: { color: '#44ff44', size: 4, speed: 11 },
    };
    const cfg = configs[type] || configs.arrow;
    Object.assign(this, cfg);
  }

  update(dt) {
    if (!this.active) return;

    this.lifetime -= dt;
    if (this.lifetime <= 0) {
      this.active = false;
      return;
    }

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 0.3) {
      this.active = false;
      return;
    }

    const n = normalize(dx, dy);
    this.x += n.x * this.speed * dt;
    this.y += n.y * this.speed * dt;

    // Store trail
    this.trail.push({ x: this.x, y: this.y, age: 0 });
    if (this.trail.length > 8) this.trail.shift();
    for (const t of this.trail) t.age += dt;
  }

  checkHit(entity) {
    if (!this.active || !entity.alive) return false;
    if (this.hitEntities.has(entity)) return false;
    if (entity === this.owner) return false;

    const dist = Math.sqrt(
      (this.x - entity.x) ** 2 + (this.y - entity.y) ** 2
    );

    if (dist < 1) {
      this.hitEntities.add(entity);
      if (!this.piercing) this.active = false;
      return true;
    }
    return false;
  }

  render(ctx) {
    if (!this.active) return;

    const wx = this.x * TILE_SIZE + TILE_SIZE / 2;
    const wy = this.y * TILE_SIZE + TILE_SIZE / 2;

    // Trail
    for (let i = 0; i < this.trail.length; i++) {
      const t = this.trail[i];
      const alpha = (1 - i / this.trail.length) * 0.4;
      ctx.fillStyle = this.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(
        t.x * TILE_SIZE + TILE_SIZE / 2,
        t.y * TILE_SIZE + TILE_SIZE / 2,
        this.size * 0.5, 0, Math.PI * 2
      );
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Main projectile
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(wx, wy, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}
