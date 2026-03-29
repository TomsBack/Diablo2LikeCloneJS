import { TILE_SIZE, TILE, TILE_COLORS } from './Constants.js';
import { tileNoise } from '../utils/MathUtils.js';

export class AssetGenerator {
  constructor() {
    this.tileCache = new Map();
    this.entityCache = new Map();
    this._generateTileVariants();
  }

  _createCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }

  _generateTileVariants() {
    for (const [type, color] of Object.entries(TILE_COLORS)) {
      const variants = [];
      for (let v = 0; v < 4; v++) {
        const canvas = this._createCanvas(TILE_SIZE, TILE_SIZE);
        const ctx = canvas.getContext('2d');
        this._drawTile(ctx, parseInt(type), color, v);
        variants.push(canvas);
      }
      this.tileCache.set(parseInt(type), variants);
    }
  }

  _drawTile(ctx, type, baseColor, variant) {
    const s = TILE_SIZE;

    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, s, s);

    if (type === TILE.FLOOR || type === TILE.TOWN_FLOOR) {
      // Add noise texture
      for (let i = 0; i < 12; i++) {
        const rx = ((variant * 37 + i * 13) % s);
        const ry = ((variant * 23 + i * 17) % s);
        const brightness = ((variant + i) % 3 === 0) ? 15 : -10;
        ctx.fillStyle = `rgba(${brightness > 0 ? 255 : 0}, ${brightness > 0 ? 255 : 0}, ${brightness > 0 ? 255 : 0}, ${Math.abs(brightness) / 255})`;
        ctx.fillRect(rx, ry, 2, 2);
      }
      // Subtle grid lines
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, s - 1, s - 1);
    }

    if (type === TILE.WALL) {
      // 3D effect
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(0, 0, s, 4);
      ctx.fillRect(0, 0, 4, s);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(0, s - 4, s, 4);
      ctx.fillRect(s - 4, 0, 4, s);
      // Brick pattern
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 1;
      const brickH = s / 3;
      for (let row = 0; row < 3; row++) {
        const y = row * brickH;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(s, y);
        ctx.stroke();
        const offset = row % 2 === 0 ? 0 : s / 2;
        ctx.beginPath();
        ctx.moveTo(offset, y);
        ctx.lineTo(offset, y + brickH);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(offset + s / 2, y);
        ctx.lineTo(offset + s / 2, y + brickH);
        ctx.stroke();
      }
    }

    if (type === TILE.STAIRS_DOWN) {
      ctx.fillStyle = '#1a3a5a';
      ctx.fillRect(0, 0, s, s);
      // Step pattern
      for (let i = 0; i < 4; i++) {
        const stepY = (s / 4) * i;
        const shade = 0.6 + i * 0.1;
        ctx.fillStyle = `rgba(40, 80, 120, ${shade})`;
        ctx.fillRect(4, stepY + 2, s - 8, s / 4 - 2);
      }
      // Down arrow
      ctx.fillStyle = '#88bbee';
      ctx.beginPath();
      ctx.moveTo(s / 2, s - 8);
      ctx.lineTo(s / 2 - 8, s - 18);
      ctx.lineTo(s / 2 + 8, s - 18);
      ctx.fill();
    }

    if (type === TILE.STAIRS_UP) {
      ctx.fillStyle = '#5a3a1a';
      ctx.fillRect(0, 0, s, s);
      for (let i = 3; i >= 0; i--) {
        const stepY = (s / 4) * i;
        const shade = 0.9 - i * 0.1;
        ctx.fillStyle = `rgba(120, 80, 40, ${shade})`;
        ctx.fillRect(4, stepY + 2, s - 8, s / 4 - 2);
      }
      // Up arrow
      ctx.fillStyle = '#ddaa66';
      ctx.beginPath();
      ctx.moveTo(s / 2, 8);
      ctx.lineTo(s / 2 - 8, 18);
      ctx.lineTo(s / 2 + 8, 18);
      ctx.fill();
    }

    if (type === TILE.DOOR) {
      ctx.fillStyle = '#6a5a40';
      ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = '#8a7a5a';
      ctx.fillRect(8, 4, s - 16, s - 8);
      ctx.fillStyle = '#aa9a6a';
      ctx.fillRect(s / 2 - 2, s / 2 - 2, 4, 4);
    }
  }

  getTileCanvas(type, tileX, tileY) {
    const variants = this.tileCache.get(type);
    if (!variants) return null;
    const variantIdx = Math.abs(tileX * 7 + tileY * 13) % variants.length;
    return variants[variantIdx];
  }

  generateEntitySprite(key, width, height, drawFn) {
    if (this.entityCache.has(key)) return this.entityCache.get(key);
    const canvas = this._createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    drawFn(ctx, width, height);
    this.entityCache.set(key, canvas);
    return canvas;
  }

  getPlayerSprite(className, frame = 0) {
    const key = `player_${className}_${frame}`;
    return this.generateEntitySprite(key, TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
      const colors = {
        warrior: { body: '#8b4513', accent: '#cd853f' },
        mage: { body: '#4a3ab5', accent: '#8a7aee' },
        rogue: { body: '#2a6a3a', accent: '#5aba5a' },
      };
      const c = colors[className] || colors.warrior;

      // Body
      ctx.fillStyle = c.body;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2 + 2, 14, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.fillStyle = '#dbb080';
      ctx.beginPath();
      ctx.arc(w / 2, h / 2 - 10, 8, 0, Math.PI * 2);
      ctx.fill();

      // Class indicator
      ctx.fillStyle = c.accent;
      if (className === 'warrior') {
        // Sword
        ctx.fillRect(w / 2 + 10, h / 2 - 14, 3, 20);
        ctx.fillRect(w / 2 + 6, h / 2 - 4, 11, 3);
      } else if (className === 'mage') {
        // Staff glow
        ctx.fillRect(w / 2 - 14, h / 2 - 16, 3, 24);
        ctx.fillStyle = '#ffcc44';
        ctx.beginPath();
        ctx.arc(w / 2 - 13, h / 2 - 18, 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Bow
        ctx.strokeStyle = c.accent;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(w / 2 + 12, h / 2, 12, -Math.PI * 0.6, Math.PI * 0.6);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(w / 2 + 12, h / 2 - 10);
        ctx.lineTo(w / 2 + 12, h / 2 + 10);
        ctx.stroke();
      }

      // Outline
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2 + 2, 15, 0, Math.PI * 2);
      ctx.stroke();
    });
  }

  getMonsterSprite(type, frame = 0) {
    const key = `monster_${type}_${frame}`;
    return this.generateEntitySprite(key, TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
      const configs = {
        zombie: { color: '#4a6a3a', size: 14, eyes: '#ff0' },
        hungryDead: { color: '#3a5a2a', size: 14, eyes: '#ff0' },
        ghoul: { color: '#2a4a1a', size: 15, eyes: '#0f0' },
        skeleton: { color: '#c8c8a0', size: 12, eyes: '#f00' },
        returned: { color: '#b8b890', size: 12, eyes: '#f00' },
        boneWarrior: { color: '#d8d8b0', size: 13, eyes: '#f00' },
        skeletonArcher: { color: '#b8b890', size: 12, eyes: '#f00' },
        fallen: { color: '#8b2500', size: 10, eyes: '#ff0' },
        fallenShaman: { color: '#aa4422', size: 11, eyes: '#ff0' },
        foulCrow: { color: '#2a2a2a', size: 8, eyes: '#ff0' },
        leaper: { color: '#8a7a4a', size: 11, eyes: '#ff0' },
        scarab: { color: '#1a3a1a', size: 13, eyes: '#0f0' },
        mummy: { color: '#8a7a5a', size: 14, eyes: '#ff0' },
        fetish: { color: '#4a2a1a', size: 9, eyes: '#ff0' },
        willOWisp: { color: 'rgba(200,200,100,0.6)', size: 10, eyes: '#fff' },
        ghost: { color: 'rgba(100,150,200,0.6)', size: 14, eyes: '#fff' },
        venom_lord: { color: '#6a1a0a', size: 18, eyes: '#ff4400' },
        oblivionKnight: { color: '#3a1a3a', size: 16, eyes: '#cc66ff' },
        boss: { color: '#6a1a1a', size: 20, eyes: '#ff4400' },
        andariel: { color: '#4a0a2a', size: 22, eyes: '#ff00ff' },
        duriel: { color: '#2a3a5a', size: 24, eyes: '#66bbff' },
        diablo: { color: '#8a1a0a', size: 26, eyes: '#ff2200' },
      };
      const cfg = configs[type] || configs.zombie;

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(w / 2, h / 2 + cfg.size, cfg.size, cfg.size / 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body
      ctx.fillStyle = cfg.color;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, cfg.size, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = cfg.eyes;
      ctx.beginPath();
      ctx.arc(w / 2 - 4, h / 2 - 3, 2, 0, Math.PI * 2);
      ctx.arc(w / 2 + 4, h / 2 - 3, 2, 0, Math.PI * 2);
      ctx.fill();

      if (type === 'skeleton' || type === 'skeletonArcher') {
        // Bone texture lines
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(w / 2 - 6, h / 2 + 4);
        ctx.lineTo(w / 2 + 6, h / 2 + 4);
        ctx.moveTo(w / 2, h / 2 + 2);
        ctx.lineTo(w / 2, h / 2 + 8);
        ctx.stroke();
      }

      if (type === 'skeletonArcher') {
        ctx.strokeStyle = '#a0a080';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(w / 2 + 14, h / 2, 10, -Math.PI * 0.5, Math.PI * 0.5);
        ctx.stroke();
      }

      if (type === 'boss') {
        // Crown/horns
        ctx.fillStyle = '#aa3300';
        ctx.beginPath();
        ctx.moveTo(w / 2 - 10, h / 2 - 16);
        ctx.lineTo(w / 2 - 6, h / 2 - 24);
        ctx.lineTo(w / 2 - 2, h / 2 - 16);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(w / 2 + 2, h / 2 - 16);
        ctx.lineTo(w / 2 + 6, h / 2 - 24);
        ctx.lineTo(w / 2 + 10, h / 2 - 16);
        ctx.fill();
      }

      if (type === 'ghost') {
        // Wavy bottom
        ctx.fillStyle = cfg.color;
        for (let i = 0; i < 5; i++) {
          const bx = w / 2 - 12 + i * 6;
          ctx.beginPath();
          ctx.arc(bx + 3, h / 2 + 12, 4, 0, Math.PI);
          ctx.fill();
        }
      }

      // Outline
      ctx.strokeStyle = 'rgba(0,0,0,0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, cfg.size + 0.5, 0, Math.PI * 2);
      ctx.stroke();
    });
  }

  getNPCSprite(type) {
    const key = `npc_${type}`;
    return this.generateEntitySprite(key, TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
      const colors = {
        merchant: { body: '#6a5a2a', accent: '#d4af37' },
        stash: { body: '#5a3a1a', accent: '#8b7355' },
        healer: { body: '#2a4a6a', accent: '#66aadd' },
      };
      const c = colors[type] || colors.merchant;

      // Body
      ctx.fillStyle = c.body;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2 + 2, 14, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.fillStyle = '#dbb080';
      ctx.beginPath();
      ctx.arc(w / 2, h / 2 - 10, 8, 0, Math.PI * 2);
      ctx.fill();

      // Type indicator
      ctx.fillStyle = c.accent;
      if (type === 'merchant') {
        // Gold coin
        ctx.beginPath();
        ctx.arc(w / 2, h / 2 + 6, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('$', w / 2, h / 2 + 9);
      } else if (type === 'stash') {
        // Chest
        ctx.fillRect(w / 2 - 8, h / 2 + 2, 16, 10);
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(w / 2 - 2, h / 2 + 5, 4, 4);
      }

      // Name plate indicator
      ctx.fillStyle = '#d4af37';
      ctx.beginPath();
      ctx.arc(w / 2, h / 2 - 20, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  getItemSprite(item) {
    const key = `item_${item.baseType}_${item.rarity}`;
    if (this.entityCache.has(key)) return this.entityCache.get(key);

    const size = 32;
    return this.generateEntitySprite(key, size, size, (ctx, w, h) => {
      const rarityGlow = {
        normal: null,
        magic: '#4169ff',
        rare: '#ffff00',
        unique: '#c78428',
      };

      // Glow
      const glow = rarityGlow[item.rarity];
      if (glow) {
        ctx.shadowColor = glow;
        ctx.shadowBlur = 6;
      }

      // Draw based on slot type
      ctx.fillStyle = item.color || '#aaa';
      const slot = item.slot;

      if (slot === 'weapon') {
        // Sword/staff shape
        ctx.fillRect(w / 2 - 2, 4, 4, h - 8);
        ctx.fillRect(w / 2 - 6, h / 2, 12, 3);
      } else if (slot === 'helmet') {
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 10, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(w / 2 - 10, h / 2, 20, 6);
      } else if (slot === 'armor') {
        ctx.beginPath();
        ctx.moveTo(w / 2, 4);
        ctx.lineTo(w - 4, h / 2);
        ctx.lineTo(w - 6, h - 4);
        ctx.lineTo(6, h - 4);
        ctx.lineTo(4, h / 2);
        ctx.closePath();
        ctx.fill();
      } else if (slot === 'shield') {
        ctx.beginPath();
        ctx.moveTo(w / 2, 4);
        ctx.lineTo(w - 4, h / 3);
        ctx.lineTo(w / 2, h - 4);
        ctx.lineTo(4, h / 3);
        ctx.closePath();
        ctx.fill();
      } else if (slot === 'boots') {
        ctx.fillRect(4, h / 2, w / 2 - 2, h / 2 - 4);
        ctx.fillRect(w / 2 + 2, h / 2, w / 2 - 6, h / 2 - 4);
      } else if (slot === 'ring') {
        ctx.strokeStyle = item.color || '#d4af37';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 8, 0, Math.PI * 2);
        ctx.stroke();
      } else if (slot === 'amulet') {
        ctx.strokeStyle = item.color || '#d4af37';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2 - 4, 6, 0.2, Math.PI - 0.2);
        ctx.stroke();
        ctx.fillStyle = item.color || '#d4af37';
        ctx.beginPath();
        ctx.arc(w / 2, h / 2 + 6, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (slot === 'potion') {
        ctx.fillStyle = item.color || '#f00';
        ctx.beginPath();
        ctx.arc(w / 2, h / 2 + 4, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ddd';
        ctx.fillRect(w / 2 - 3, 4, 6, 10);
      } else {
        // Generic
        ctx.fillRect(4, 4, w - 8, h - 8);
      }

      ctx.shadowBlur = 0;
    });
  }
}
