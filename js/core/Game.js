import { TILE_SIZE, TILE, MAX_DUNGEON_FLOOR, mapSizeForFloor } from './Constants.js';
import { Camera } from './Camera.js';
import { InputManager } from './InputManager.js';
import { AssetGenerator } from './AssetGenerator.js';
import { AudioManager } from './AudioManager.js';
import { SaveManager } from './SaveManager.js';
import { DungeonGenerator } from '../world/DungeonGenerator.js';
import { FogOfWar } from '../world/FogOfWar.js';
import { Minimap } from '../world/Minimap.js';
import { Player } from '../entities/Player.js';
import { Monster } from '../entities/Monster.js';
import { NPC } from '../entities/NPC.js';
import { Projectile } from '../entities/Projectile.js';
import { LootDrop } from '../entities/LootDrop.js';
import { CombatResolver } from '../combat/CombatResolver.js';
import { SkillSystem } from '../combat/SkillSystem.js';
import { ItemGenerator } from '../items/ItemGenerator.js';
import { Inventory } from '../items/Inventory.js';
import { Equipment } from '../items/Equipment.js';
import { HUD } from '../ui/HUD.js';
import { InventoryPanel } from '../ui/InventoryPanel.js';
import { CharacterPanel } from '../ui/CharacterPanel.js';
import { SkillPanel } from '../ui/SkillPanel.js';
import { events } from '../utils/EventBus.js';
import { randomInt, distance } from '../utils/MathUtils.js';

const STATE = {
  MENU: 'menu',
  PLAYING: 'playing',
  DEAD: 'dead',
};

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = STATE.MENU;
    this.lastTime = 0;
    this.autoSaveTimer = 0;
    this.footstepTimer = 0;

    // Resize canvas to fill window
    this._resize();
    window.addEventListener('resize', () => this._resize());

    // Core systems
    this.camera = new Camera(canvas);
    this.input = new InputManager(canvas);
    this.assets = new AssetGenerator();
    this.audio = new AudioManager();
    this.minimap = new Minimap();

    // UI
    this.hud = new HUD(this);
    this.inventoryPanel = new InventoryPanel(this);
    this.characterPanel = new CharacterPanel(this);
    this.skillPanel = new SkillPanel(this);

    // Game state
    this.player = null;
    this.monsters = [];
    this.npcs = [];
    this.projectiles = [];
    this.lootDrops = [];
    this.aoeEffects = [];
    this.currentMap = null;
    this.fogOfWar = null;
    this.currentFloor = 0;
    this.dungeonSeed = Date.now();
    this.inventory = new Inventory();
    this.equipment = new Equipment();

    // Combat
    this.combatResolver = new CombatResolver(this);
    this.skillSystem = new SkillSystem(this);

    // Events
    this._bindEvents();

    // Menu setup
    this._setupMenu();
  }

  _resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  _bindEvents() {
    events.on('monsterDeath', ({ monster }) => {
      this.audio.playMonsterDeath();
      const drops = ItemGenerator.generateLoot(monster.level, monster.isBoss);
      for (const drop of drops) {
        if (drop.type === 'gold') {
          this.lootDrops.push(LootDrop.createGold(monster.x, monster.y, drop.amount));
        } else {
          const loot = LootDrop.createItem(
            monster.x + (Math.random() - 0.5) * 0.5,
            monster.y + (Math.random() - 0.5) * 0.5,
            drop.item
          );
          loot.sprite = this.assets.getItemSprite(drop.item);
          this.lootDrops.push(loot);
        }
      }
    });

    events.on('playerDeath', () => {
      this.state = STATE.DEAD;
      setTimeout(() => {
        this.showFloatingText(
          this.canvas.width / 2, this.canvas.height / 2,
          'YOU HAVE DIED', '#ff0000', 32, 'text-levelup', true
        );
        // Respawn in town after 3 seconds
        setTimeout(() => {
          this.player.alive = true;
          this.player.hp = this.player.maxHP / 2;
          this.player.mana = this.player.maxMana / 2;
          this.player.gold = Math.floor(this.player.gold * 0.8); // Lose 20% gold
          this._goToFloor(0);
          this.state = STATE.PLAYING;
        }, 3000);
      }, 500);
    });

    events.on('levelUp', ({ level }) => {
      this.audio.playLevelUp();
      this.showFloatingText(
        this.player.worldX, this.player.worldY - 50,
        `LEVEL UP! (${level})`, null, null, 'text-levelup'
      );
    });

    events.on('potionUsed', () => {
      this.audio.playPotionUse();
    });

    events.on('spawnProjectile', (data) => {
      const proj = new Projectile();
      proj.init(data.x, data.y, data.targetX, data.targetY, data.damage, data.owner, data.type);
      if (data.aoeRadius) proj.aoeRadius = data.aoeRadius;
      this.projectiles.push(proj);

      if (data.type === 'fireball') this.audio.playFireball();
      else if (data.type === 'icebolt') this.audio.playIceBolt();
      else if (data.type === 'lightning') this.audio.playLightning();
    });

    events.on('aoeEffect', (data) => {
      this.aoeEffects.push({
        x: data.x, y: data.y,
        radius: data.radius,
        color: data.color,
        duration: data.duration,
        maxDuration: data.duration,
      });
    });

    events.on('skillUsed', ({ skillId }) => {
      const def = this.skillSystem.getSkillDef(skillId);
      if (def && def.type === 'teleport') this.audio.playTeleport();
    });
  }

  _setupMenu() {
    const menuScreen = document.getElementById('menu-screen');
    const newGameBtn = document.getElementById('new-game-btn');
    const continueBtn = document.getElementById('continue-btn');
    const classSelect = document.getElementById('class-select');
    let selectedClass = null;

    if (SaveManager.hasSave()) {
      continueBtn.classList.remove('hidden');
    }

    newGameBtn.addEventListener('click', () => {
      if (classSelect.classList.contains('hidden')) {
        classSelect.classList.remove('hidden');
        newGameBtn.textContent = 'Start Game';
      } else if (selectedClass) {
        this._startNewGame(selectedClass);
        menuScreen.classList.add('hidden');
      }
    });

    continueBtn.addEventListener('click', () => {
      const save = SaveManager.load();
      if (save) {
        this._loadGame(save);
        menuScreen.classList.add('hidden');
      }
    });

    document.querySelectorAll('.class-option').forEach(el => {
      el.addEventListener('click', () => {
        document.querySelectorAll('.class-option').forEach(o => o.classList.remove('selected'));
        el.classList.add('selected');
        selectedClass = el.dataset.class;
      });
    });
  }

  _startNewGame(className) {
    this.dungeonSeed = Date.now();
    this.inventory = new Inventory();
    this.equipment = new Equipment();

    // Generate town
    const dunGen = new DungeonGenerator(this.dungeonSeed);
    this.currentMap = dunGen.generateTown();
    this.currentFloor = 0;
    this.fogOfWar = new FogOfWar(this.currentMap);

    // Create player
    const start = this.currentMap.playerStart;
    this.player = new Player(start.x + 0.5, start.y + 0.5, className);
    this.player.sprite = this.assets.getPlayerSprite(className);

    // Set initial skill
    const startSkill = this.player.className === 'warrior' ? 'bash' :
                       this.player.className === 'mage' ? 'fireball' : 'multipleShot';
    this.player.skillLevels[startSkill] = 1;
    this.player.equippedSkills[0] = startSkill;

    // Give starting potions
    const hp1 = ItemGenerator.generatePotion(1);
    const hp2 = ItemGenerator.generatePotion(1);
    this.player.potionBelt[0] = hp1.subType === 'health' ? hp1 : hp2;
    this.player.potionBelt[1] = hp1.subType === 'mana' ? hp1 : hp2;

    // Spawn town NPCs
    this._spawnTownNPCs();

    this.monsters = [];
    this.projectiles = [];
    this.lootDrops = [];

    this.state = STATE.PLAYING;
    this.hud.show();

    this.camera.follow(this.player.worldX, this.player.worldY);
    this.camera.x = this.player.worldX - this.canvas.width / 2;
    this.camera.y = this.player.worldY - this.canvas.height / 2;
  }

  _loadGame(save) {
    const p = save.player;
    this.dungeonSeed = save.dungeonSeed;
    this.currentFloor = save.currentFloor;
    this.inventory = Inventory.deserialize(save.inventory);
    this.equipment = Equipment.deserialize(save.equipment);

    // Create player
    this.player = new Player(0, 0, p.className);
    Object.assign(this.player, {
      level: p.level, xp: p.xp, hp: p.hp, mana: p.mana,
      baseStr: p.baseStr, baseDex: p.baseDex, baseVit: p.baseVit, baseEnergy: p.baseEnergy,
      addedStr: p.addedStr, addedDex: p.addedDex, addedVit: p.addedVit, addedEnergy: p.addedEnergy,
      statPoints: p.statPoints, skillPoints: p.skillPoints,
      gold: p.gold, skillLevels: p.skillLevels || {},
      equippedSkills: p.equippedSkills || new Array(8).fill(null),
      potionBelt: p.potionBelt || [null, null, null, null],
    });
    this.equipment.applyBonuses(this.player);
    this.player.sprite = this.assets.getPlayerSprite(p.className);

    // Generate the floor
    this._goToFloor(this.currentFloor);
    this.state = STATE.PLAYING;
    this.hud.show();
  }

  _goToFloor(floor) {
    this.currentFloor = floor;
    this.monsters = [];
    this.projectiles = [];
    this.lootDrops = [];
    this.aoeEffects = [];
    this.npcs = [];

    if (floor === 0) {
      // Town
      const dunGen = new DungeonGenerator(this.dungeonSeed);
      this.currentMap = dunGen.generateTown();
      this.fogOfWar = new FogOfWar(this.currentMap);

      const start = this.currentMap.playerStart;
      this.player.x = start.x + 0.5;
      this.player.y = start.y + 0.5;
      this.player.path = null;

      this._spawnTownNPCs();
    } else {
      // Dungeon floor
      const floorSeed = this.dungeonSeed + floor * 10000;
      const dunGen = new DungeonGenerator(floorSeed);
      const size = mapSizeForFloor(floor);
      this.currentMap = dunGen.generate(size, size, floor);
      this.fogOfWar = new FogOfWar(this.currentMap);

      // Place player at stairs up
      const stairs = this.currentMap.stairsUp;
      if (stairs) {
        this.player.x = stairs.x + 0.5;
        this.player.y = stairs.y + 0.5;
      }
      this.player.path = null;

      // Spawn monsters
      this._spawnMonsters(floor);
    }

    this.camera.follow(this.player.worldX, this.player.worldY);
    this.camera.x = this.player.worldX - this.canvas.width / 2;
    this.camera.y = this.player.worldY - this.canvas.height / 2;

    this.audio.playStairs();
    SaveManager.save(this);
  }

  _spawnTownNPCs() {
    if (!this.currentMap.npcPositions) return;
    for (const [type, pos] of Object.entries(this.currentMap.npcPositions)) {
      const npc = new NPC(pos.x, pos.y, type);
      npc.sprite = this.assets.getNPCSprite(type);
      this.npcs.push(npc);
    }
  }

  _spawnMonsters(floor) {
    const spawnPoints = this.currentMap.spawnPoints;
    if (!spawnPoints || spawnPoints.length === 0) return;

    const monsterTypes = ['zombie', 'skeleton', 'fallen', 'skeletonArcher', 'ghost'];
    const monsterCount = Math.min(spawnPoints.length / 4, 20 + floor * 3);
    const usedPoints = new Set();

    for (let i = 0; i < monsterCount; i++) {
      let attempts = 0;
      let idx;
      do {
        idx = randomInt(0, spawnPoints.length - 1);
        attempts++;
      } while (usedPoints.has(idx) && attempts < 50);

      if (usedPoints.has(idx)) continue;
      usedPoints.add(idx);

      const sp = spawnPoints[idx];
      // Don't spawn on stairs
      if (this.currentMap.get(sp.x, sp.y) !== TILE.FLOOR) continue;
      // Don't spawn near stairs up
      const stairsUp = this.currentMap.stairsUp;
      if (stairsUp && distance(sp.x, sp.y, stairsUp.x, stairsUp.y) < 5) continue;

      const typeIdx = randomInt(0, Math.min(monsterTypes.length - 1, Math.floor(floor / 2)));
      const type = monsterTypes[typeIdx];
      const monsterLevel = Math.max(1, floor + randomInt(-1, 1));
      const monster = new Monster(sp.x, sp.y, type, monsterLevel);
      monster.sprite = this.assets.getMonsterSprite(type);
      this.monsters.push(monster);
    }

    // Boss on every 4th floor
    if (this.currentMap.bossRoom) {
      const room = this.currentMap.bossRoom;
      const bx = Math.floor(room.x + room.w / 2);
      const by = Math.floor(room.y + room.h / 2);
      const boss = new Monster(bx, by, 'boss', floor + 2);
      boss.sprite = this.assets.getMonsterSprite('boss');
      this.monsters.push(boss);
    }
  }

  start() {
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this._loop(t));
  }

  _loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;

    this.input.update(this.camera);
    this._handleInput();

    if (this.state === STATE.PLAYING) {
      this._update(dt);
    }

    this._render();
    requestAnimationFrame((t) => this._loop(t));
  }

  _handleInput() {
    if (this.state !== STATE.PLAYING) return;

    // Panel toggles
    if (this.input.wasKeyPressed('KeyI')) {
      this.inventoryPanel.toggle();
      this.audio.playUIOpen();
    }
    if (this.input.wasKeyPressed('KeyC')) {
      this.characterPanel.toggle();
      this.audio.playUIOpen();
    }
    if (this.input.wasKeyPressed('KeyS') && !this.input.isKeyDown('ControlLeft')) {
      this.skillPanel.toggle();
      this.audio.playUIOpen();
    }
    if (this.input.wasKeyPressed('KeyM')) {
      this.audio.toggle();
    }
    if (this.input.wasKeyPressed('Escape')) {
      if (this.inventoryPanel.isOpen) this.inventoryPanel.toggle();
      if (this.characterPanel.isOpen) this.characterPanel.toggle();
      if (this.skillPanel.isOpen) this.skillPanel.toggle();
      this._closeDialogue();
    }

    // Potion keys
    for (let i = 0; i < 4; i++) {
      if (this.input.wasKeyPressed(`Digit${i + 1}`) && this.input.isKeyDown('ShiftLeft')) {
        this.player.usePotion(i);
      }
    }

    // Skill keys (1-8 without shift)
    if (!this.input.isKeyDown('ShiftLeft')) {
      for (let i = 0; i < 8; i++) {
        if (this.input.wasKeyPressed(`Digit${i + 1}`)) {
          const skillId = this.player.equippedSkills[i];
          if (skillId) {
            const worldTile = this.camera.worldToTile(this.input.mouseWorldX, this.input.mouseWorldY);
            this.skillSystem.useSkill(
              this.player, skillId,
              worldTile.x + 0.5, worldTile.y + 0.5,
              this.monsters
            );
          }
        }
      }
    }

    // Left click - move / attack / interact
    if (this.input.leftClick) {
      // Don't process if clicking on UI panels
      if (this._isClickOnUI(this.input.leftClick.x, this.input.leftClick.y)) return;

      const worldPos = this.camera.screenToWorld(this.input.leftClick.x, this.input.leftClick.y);
      const tilePos = this.camera.worldToTile(worldPos.x, worldPos.y);

      // Check for NPC interaction
      const npc = this._findNPCAt(tilePos.x, tilePos.y);
      if (npc && npc.canInteract(this.player)) {
        this._openDialogue(npc);
        return;
      }

      // Check for loot pickup
      const loot = this._findLootAt(tilePos.x, tilePos.y);
      if (loot) {
        this._pickupLoot(loot);
        return;
      }

      // Check for monster to attack
      const monster = this._findMonsterAt(tilePos.x, tilePos.y);
      if (monster) {
        this.player.setAttackTarget(monster, this.currentMap);
        return;
      }

      // Check for stairs
      const tile = this.currentMap.get(tilePos.x, tilePos.y);
      if (tile === TILE.STAIRS_DOWN) {
        if (distance(this.player.tileX, this.player.tileY, tilePos.x, tilePos.y) < 2) {
          this._goToFloor(Math.min(this.currentFloor + 1, MAX_DUNGEON_FLOOR));
          return;
        }
      }
      if (tile === TILE.STAIRS_UP) {
        if (distance(this.player.tileX, this.player.tileY, tilePos.x, tilePos.y) < 2) {
          this._goToFloor(Math.max(this.currentFloor - 1, 0));
          return;
        }
      }

      // Move
      this.player.moveTo(tilePos.x, tilePos.y, this.currentMap);
    }

    // Right click - use primary skill
    if (this.input.rightClick) {
      if (this._isClickOnUI(this.input.rightClick.x, this.input.rightClick.y)) return;
      const skillId = this.player.equippedSkills[0];
      if (skillId) {
        const worldPos = this.camera.screenToWorld(this.input.rightClick.x, this.input.rightClick.y);
        const tilePos = this.camera.worldToTile(worldPos.x, worldPos.y);
        this.skillSystem.useSkill(
          this.player, skillId,
          tilePos.x + 0.5, tilePos.y + 0.5,
          this.monsters
        );
      }
    }
  }

  _isClickOnUI(x, y) {
    const panels = ['inventory-panel', 'character-panel', 'skill-panel', 'dialogue-panel', 'hud-bottom'];
    for (const id of panels) {
      const el = document.getElementById(id);
      if (el && !el.classList.contains('hidden')) {
        const rect = el.getBoundingClientRect();
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
          return true;
        }
      }
    }
    return false;
  }

  _findMonsterAt(tileX, tileY) {
    for (const m of this.monsters) {
      if (!m.alive) continue;
      if (Math.abs(m.tileX - tileX) <= 1 && Math.abs(m.tileY - tileY) <= 1) {
        return m;
      }
    }
    return null;
  }

  _findNPCAt(tileX, tileY) {
    for (const npc of this.npcs) {
      if (Math.abs(npc.tileX - tileX) <= 1 && Math.abs(npc.tileY - tileY) <= 1) {
        return npc;
      }
    }
    return null;
  }

  _findLootAt(tileX, tileY) {
    for (const drop of this.lootDrops) {
      if (Math.floor(drop.x) === tileX && Math.floor(drop.y) === tileY) {
        return drop;
      }
    }
    return null;
  }

  _pickupLoot(loot) {
    if (distance(this.player.tileX, this.player.tileY, Math.floor(loot.x), Math.floor(loot.y)) > 2) {
      this.player.moveTo(Math.floor(loot.x), Math.floor(loot.y), this.currentMap);
      return;
    }

    if (loot.isGold) {
      this.player.gold += loot.goldAmount;
      this.audio.playGoldPickup();
      this.showFloatingText(
        loot.x * TILE_SIZE + TILE_SIZE / 2,
        loot.y * TILE_SIZE,
        `+${loot.goldAmount} Gold`, null, null, 'text-pickup'
      );
    } else {
      if (this.inventory.addItem(loot.item)) {
        this.audio.playItemPickup();
        this.showFloatingText(
          loot.x * TILE_SIZE + TILE_SIZE / 2,
          loot.y * TILE_SIZE,
          loot.item.name, null, null, 'text-pickup'
        );
      } else {
        this.showFloatingText(
          this.player.worldX, this.player.worldY - 30,
          'Inventory Full!', '#ff4444', 14
        );
        return;
      }
    }

    const idx = this.lootDrops.indexOf(loot);
    if (idx !== -1) this.lootDrops.splice(idx, 1);

    if (this.inventoryPanel.isOpen) this.inventoryPanel.render();
  }

  _openDialogue(npc) {
    const panel = document.getElementById('dialogue-panel');
    document.getElementById('dialogue-npc-name').textContent = npc.name;
    document.getElementById('dialogue-text').textContent = npc.greeting;

    const optionsEl = document.getElementById('dialogue-options');
    optionsEl.innerHTML = '';

    for (const option of npc.dialogueOptions) {
      const btn = document.createElement('button');
      btn.className = 'dialogue-btn';
      btn.textContent = option;
      btn.addEventListener('click', () => this._handleDialogueOption(npc, option));
      optionsEl.appendChild(btn);
    }

    panel.classList.remove('hidden');
  }

  _closeDialogue() {
    document.getElementById('dialogue-panel').classList.add('hidden');
  }

  _handleDialogueOption(npc, option) {
    if (option === 'Close') {
      this._closeDialogue();
      return;
    }

    if (option === 'Heal') {
      this.player.hp = this.player.maxHP;
      this.player.mana = this.player.maxMana;
      this.showFloatingText(this.player.worldX, this.player.worldY - 30, 'Fully Healed!', '#44ff44', 16);
      this.audio.playPotionUse();
      this._closeDialogue();
      return;
    }

    if (option === 'Buy') {
      // Generate some items for sale
      const items = [];
      for (let i = 0; i < 5; i++) {
        items.push(ItemGenerator.generateItem(this.player.level));
      }
      // For now, add a few potions to inventory for free (simplified shop)
      for (let i = 0; i < 3; i++) {
        const potion = ItemGenerator.generatePotion(this.player.level);
        this.inventory.addItem(potion);
      }
      this.showFloatingText(this.player.worldX, this.player.worldY - 30, 'Potions added!', '#d4af37', 14);
      if (this.inventoryPanel.isOpen) this.inventoryPanel.render();
      this._closeDialogue();
      return;
    }

    if (option === 'Sell') {
      // Sell all normal rarity items
      let gold = 0;
      const items = this.inventory.getAllItems();
      for (const item of items) {
        if (item.rarity === 'normal' && item.slot !== 'potion') {
          gold += (item.reqLevel || 1) * 5;
          this.inventory.removeItem(item.id);
        }
      }
      if (gold > 0) {
        this.player.gold += gold;
        this.showFloatingText(this.player.worldX, this.player.worldY - 30, `+${gold} Gold`, '#d4af37', 14);
        this.audio.playGoldPickup();
      }
      if (this.inventoryPanel.isOpen) this.inventoryPanel.render();
      this._closeDialogue();
      return;
    }

    if (option === 'Open Stash') {
      this.inventoryPanel.isOpen = false;
      this.inventoryPanel.toggle();
      this._closeDialogue();
      return;
    }

    this._closeDialogue();
  }

  _update(dt) {
    if (!this.player || !this.player.alive) return;

    // Player
    this.player.update(dt, this.currentMap);
    this.camera.follow(this.player.worldX, this.player.worldY);
    this.camera.clampToMap(this.currentMap.width, this.currentMap.height);
    this.camera.update(dt);

    // Fog of war
    if (this.fogOfWar) {
      this.fogOfWar.update(this.player.tileX, this.player.tileY);
    }

    // Monsters
    for (const m of this.monsters) {
      m.update(dt, this.currentMap, this.player);
    }
    // Remove dead monsters after their death animation
    this.monsters = this.monsters.filter(m => m.alive || m.deathTimer > 0);

    // Projectiles
    for (const p of this.projectiles) {
      p.update(dt);
    }
    this.combatResolver.processProjectileCollisions(this.projectiles, this.monsters, this.player);
    this.projectiles = this.projectiles.filter(p => p.active);

    // Loot drops
    for (const drop of this.lootDrops) {
      drop.update(dt);
      // Auto-pickup gold when walking over it
      if (drop.isGold && distance(this.player.x, this.player.y, drop.x, drop.y) < 1.5) {
        this._pickupLoot(drop);
        break; // One per frame to prevent issues
      }
    }
    this.lootDrops = this.lootDrops.filter(d => !d.expired);

    // AoE effects
    for (const fx of this.aoeEffects) {
      fx.duration -= dt;
    }
    this.aoeEffects = this.aoeEffects.filter(fx => fx.duration > 0);

    // Skills cooldowns
    this.skillSystem.updateCooldowns(dt);

    // Footstep sounds
    if (this.player.path && this.player.path.length > 0) {
      this.footstepTimer -= dt;
      if (this.footstepTimer <= 0) {
        this.audio.playFootstep();
        this.footstepTimer = 0.35;
      }
    }

    // Auto-save
    this.autoSaveTimer += dt;
    if (this.autoSaveTimer >= 60) {
      this.autoSaveTimer = 0;
      SaveManager.save(this);
    }

    // Update UI panels
    this.hud.update(this.player);
    if (this.inventoryPanel.isOpen) this.inventoryPanel.render();
    if (this.characterPanel.isOpen) this.characterPanel.render();
  }

  _render() {
    const ctx = this.ctx;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.state === STATE.MENU) return;
    if (!this.currentMap) return;

    this.camera.beginFrame(ctx);

    // Tile map
    this.currentMap.render(ctx, this.camera, this.assets);

    // Loot drops
    for (const drop of this.lootDrops) {
      drop.render(ctx, this.assets);
    }

    // NPCs
    for (const npc of this.npcs) {
      npc.render(ctx);
    }

    // Collect all entities for y-sort rendering
    const entities = [];
    if (this.player && this.player.alive) entities.push(this.player);
    for (const m of this.monsters) {
      if (this.currentMap.isVisible(m.tileX, m.tileY)) {
        entities.push(m);
      }
    }

    // Sort by Y for depth
    entities.sort((a, b) => a.y - b.y);
    for (const entity of entities) {
      entity.render(ctx);
    }

    // Projectiles
    for (const p of this.projectiles) {
      p.render(ctx);
    }

    // AoE effects
    for (const fx of this.aoeEffects) {
      const alpha = fx.duration / fx.maxDuration;
      ctx.globalAlpha = alpha * 0.4;
      ctx.fillStyle = fx.color;
      ctx.beginPath();
      ctx.arc(
        fx.x * TILE_SIZE + TILE_SIZE / 2,
        fx.y * TILE_SIZE + TILE_SIZE / 2,
        fx.radius * TILE_SIZE,
        0, Math.PI * 2
      );
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    this.camera.endFrame(ctx);

    // Floor indicator
    ctx.fillStyle = '#c0a875';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    const floorText = this.currentFloor === 0 ? 'Town' : `Dungeon Level ${this.currentFloor}`;
    ctx.fillText(floorText, 10, 25);

    // Minimap
    if (this.currentMap) {
      this.minimap.render(
        this.currentMap,
        this.player.tileX, this.player.tileY,
        this.monsters, this.lootDrops
      );
    }
  }

  showFloatingText(worldX, worldY, text, color, fontSize, cssClass, isScreenCoord = false) {
    const container = document.getElementById('floating-texts');

    let screenX, screenY;
    if (isScreenCoord) {
      screenX = worldX;
      screenY = worldY;
    } else {
      const screen = this.camera.worldToScreen(worldX, worldY);
      screenX = screen.x;
      screenY = screen.y;
    }

    const el = document.createElement('div');
    el.className = `floating-text ${cssClass || 'dmg-physical'}`;
    el.textContent = text;
    if (color) el.style.color = color;
    if (fontSize) el.style.fontSize = `${fontSize}px`;
    el.style.left = `${screenX}px`;
    el.style.top = `${screenY}px`;

    container.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }
}
