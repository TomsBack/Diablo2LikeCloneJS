import { TILE_SIZE, ELEMENT_COLORS } from './Constants.js';

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.life = 0;
    this.maxLife = 0;
    this.size = 2;
    this.color = '#fff';
    this.gravity = 0;
    this.friction = 1;
    this.fadeOut = true;
    this.shrink = false;
    this.active = false;
  }
}

export class ParticleSystem {
  constructor(maxParticles = 500) {
    this.particles = [];
    for (let i = 0; i < maxParticles; i++) {
      this.particles.push(new Particle());
    }
  }

  _acquire() {
    for (const p of this.particles) {
      if (!p.active) {
        p.active = true;
        return p;
      }
    }
    return null;
  }

  // Burst of particles from a point
  burst(worldX, worldY, count, color, options = {}) {
    const {
      speed = 60,
      size = 3,
      life = 0.5,
      gravity = 0,
      spread = Math.PI * 2,
      angle = 0,
      shrink = true,
      friction = 0.95,
    } = options;

    for (let i = 0; i < count; i++) {
      const p = this._acquire();
      if (!p) break;

      const a = angle + (Math.random() - 0.5) * spread;
      const spd = speed * (0.5 + Math.random() * 0.5);

      p.x = worldX;
      p.y = worldY;
      p.vx = Math.cos(a) * spd;
      p.vy = Math.sin(a) * spd;
      p.life = life * (0.7 + Math.random() * 0.6);
      p.maxLife = p.life;
      p.size = size * (0.6 + Math.random() * 0.8);
      p.color = color;
      p.gravity = gravity;
      p.friction = friction;
      p.shrink = shrink;
      p.fadeOut = true;
    }
  }

  // Blood splatter on hit
  bloodSplat(worldX, worldY) {
    this.burst(worldX, worldY, 8, '#aa2222', {
      speed: 40, size: 3, life: 0.4, gravity: 80, shrink: true,
    });
  }

  // Fire effect
  fireEffect(worldX, worldY, count = 12) {
    this.burst(worldX, worldY, count, '#ff6622', {
      speed: 50, size: 5, life: 0.6, gravity: -30, spread: Math.PI * 2,
    });
    this.burst(worldX, worldY, count / 2, '#ffcc22', {
      speed: 30, size: 3, life: 0.4, gravity: -40,
    });
  }

  // Ice/frost effect
  frostEffect(worldX, worldY, count = 10) {
    this.burst(worldX, worldY, count, '#88ccff', {
      speed: 40, size: 4, life: 0.8, gravity: 0, friction: 0.92,
    });
    this.burst(worldX, worldY, count / 2, '#ffffff', {
      speed: 25, size: 2, life: 1.0, gravity: 0, friction: 0.9,
    });
  }

  // Lightning spark effect
  lightningEffect(worldX, worldY, count = 8) {
    this.burst(worldX, worldY, count, '#ffff44', {
      speed: 100, size: 2, life: 0.2, gravity: 0, friction: 0.85,
    });
    this.burst(worldX, worldY, 4, '#ffffff', {
      speed: 60, size: 3, life: 0.15,
    });
  }

  // Poison cloud
  poisonEffect(worldX, worldY, count = 8) {
    this.burst(worldX, worldY, count, '#44aa44', {
      speed: 20, size: 6, life: 1.2, gravity: -10, friction: 0.98,
    });
  }

  // Level up sparkle
  levelUpEffect(worldX, worldY) {
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      const p = this._acquire();
      if (!p) break;
      p.x = worldX;
      p.y = worldY;
      p.vx = Math.cos(angle) * 80;
      p.vy = Math.sin(angle) * 80 - 30;
      p.life = 1.0;
      p.maxLife = 1.0;
      p.size = 4;
      p.color = i % 2 === 0 ? '#d4af37' : '#ffffff';
      p.gravity = -20;
      p.friction = 0.96;
      p.shrink = true;
      p.fadeOut = true;
      p.active = true;
    }
  }

  // Item drop glow
  itemGlow(worldX, worldY, color) {
    this.burst(worldX, worldY, 4, color, {
      speed: 15, size: 2, life: 0.8, gravity: -20, friction: 0.95,
    });
  }

  // Heal effect
  healEffect(worldX, worldY) {
    this.burst(worldX, worldY, 10, '#44ff44', {
      speed: 30, size: 3, life: 0.6, gravity: -40, friction: 0.95,
    });
  }

  // Death explosion
  deathEffect(worldX, worldY, color = '#aa2222') {
    this.burst(worldX, worldY, 20, color, {
      speed: 60, size: 4, life: 0.6, gravity: 50, shrink: true,
    });
  }

  // Elemental hit based on element type
  elementalHit(worldX, worldY, elemType) {
    const color = ELEMENT_COLORS[elemType] || '#ffffff';
    switch (elemType) {
      case 'fire': this.fireEffect(worldX, worldY, 8); break;
      case 'cold': this.frostEffect(worldX, worldY, 6); break;
      case 'lightning': this.lightningEffect(worldX, worldY, 6); break;
      case 'poison': this.poisonEffect(worldX, worldY, 5); break;
      default: this.burst(worldX, worldY, 6, color, { speed: 40, size: 3, life: 0.4 });
    }
  }

  update(dt) {
    for (const p of this.particles) {
      if (!p.active) continue;

      p.life -= dt;
      if (p.life <= 0) {
        p.active = false;
        continue;
      }

      p.vy += p.gravity * dt;
      p.vx *= p.friction;
      p.vy *= p.friction;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
  }

  render(ctx) {
    for (const p of this.particles) {
      if (!p.active) continue;

      const lifeRatio = p.life / p.maxLife;
      const alpha = p.fadeOut ? lifeRatio : 1;
      const size = p.shrink ? p.size * lifeRatio : p.size;

      if (alpha <= 0 || size <= 0) continue;

      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}
