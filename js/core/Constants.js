export const TILE_SIZE = 48;
export const MAP_MIN_SIZE = 80;
export const MAP_MAX_SIZE = 120;
export const MAP_SIZE_PER_FLOOR = 5;

export const PLAYER_SPEED = 4; // tiles per second
export const MONSTER_AGGRO_RADIUS = 8;
export const MONSTER_PATHFIND_INTERVAL = 500;
export const MONSTER_LEASH_RADIUS = 16;

export const MAX_LEVEL = 50;
export const STAT_POINTS_PER_LEVEL = 5;
export const SKILL_POINTS_PER_LEVEL = 1;
export const MAX_DUNGEON_FLOOR = 16;

export const INVENTORY_WIDTH = 10;
export const INVENTORY_HEIGHT = 4;
export const INVENTORY_CELL_SIZE = 40;

export const RARITY = {
  NORMAL: 'normal',
  MAGIC: 'magic',
  RARE: 'rare',
  SET: 'set',
  UNIQUE: 'unique',
};

export const RARITY_COLORS = {
  normal: '#cccccc',
  magic: '#4169ff',
  rare: '#ffff00',
  set: '#00cc00',
  unique: '#c78428',
};

export const RARITY_DROP_WEIGHTS = {
  normal: 55,
  magic: 25,
  rare: 12,
  set: 4,
  unique: 4,
};

// D2-accurate element types (from ElemTypes.txt)
export const ELEMENT = {
  PHYSICAL: 'physical',
  FIRE: 'fire',
  LIGHTNING: 'lightning',
  COLD: 'cold',
  POISON: 'poison',
  MAGIC: 'magic',
};

export const ELEMENT_COLORS = {
  physical: '#ffffff',
  fire: '#ff6622',
  lightning: '#ffff44',
  cold: '#66bbff',
  poison: '#44ff44',
  magic: '#cc66ff',
};

// Difficulty system (from D2 DifficultyLevels.txt)
export const DIFFICULTY = {
  NORMAL: 0,
  NIGHTMARE: 1,
  HELL: 2,
};

export const DIFFICULTY_SCALING = {
  [DIFFICULTY.NORMAL]: {
    name: 'Normal',
    resistPenalty: 0,
    monsterSkillBonus: 0,
    hpMultiplier: 1.0,
    damageMultiplier: 1.0,
    xpMultiplier: 1.0,
    dropBonus: 0,
  },
  [DIFFICULTY.NIGHTMARE]: {
    name: 'Nightmare',
    resistPenalty: -40,
    monsterSkillBonus: 3,
    hpMultiplier: 2.5,
    damageMultiplier: 2.0,
    xpMultiplier: 2.5,
    dropBonus: 20,
  },
  [DIFFICULTY.HELL]: {
    name: 'Hell',
    resistPenalty: -100,
    monsterSkillBonus: 7,
    hpMultiplier: 5.0,
    damageMultiplier: 3.5,
    xpMultiplier: 4.0,
    dropBonus: 40,
  },
};

export const TILE = {
  VOID: 0,
  FLOOR: 1,
  WALL: 2,
  DOOR: 3,
  STAIRS_DOWN: 4,
  STAIRS_UP: 5,
  TOWN_FLOOR: 6,
  TOWN_BUILDING: 7,
  WATER: 8,
  SHRINE: 9,
};

export const TILE_COLORS = {
  [TILE.VOID]: '#000000',
  [TILE.FLOOR]: '#3a3025',
  [TILE.WALL]: '#5a4a35',
  [TILE.DOOR]: '#6a5a40',
  [TILE.STAIRS_DOWN]: '#2a4a6a',
  [TILE.STAIRS_UP]: '#6a4a2a',
  [TILE.TOWN_FLOOR]: '#4a5a3a',
  [TILE.TOWN_BUILDING]: '#5a4a35',
  [TILE.WATER]: '#1a3a5a',
  [TILE.SHRINE]: '#5a3a6a',
};

export const MINIMAP_COLORS = {
  [TILE.VOID]: '#000',
  [TILE.FLOOR]: '#554a3a',
  [TILE.WALL]: '#887755',
  [TILE.DOOR]: '#997766',
  [TILE.STAIRS_DOWN]: '#4488bb',
  [TILE.STAIRS_UP]: '#bb8844',
  [TILE.TOWN_FLOOR]: '#558844',
  [TILE.TOWN_BUILDING]: '#886644',
  [TILE.WATER]: '#2255aa',
  [TILE.SHRINE]: '#aa55cc',
};

// D2-inspired class stats (based on D2 Barbarian, Sorceress, Amazon)
export const CLASS_STATS = {
  warrior: {
    name: 'Warrior',
    baseStr: 30, baseDex: 20, baseVit: 25, baseEnergy: 10,
    baseHP: 55, baseMana: 10,
    hpPerVit: 4, manaPerEnergy: 1,
    hpPerLevel: 2, manaPerLevel: 1,
    startSkills: ['bash'],
  },
  mage: {
    name: 'Mage',
    baseStr: 10, baseDex: 25, baseVit: 10, baseEnergy: 35,
    baseHP: 40, baseMana: 35,
    hpPerVit: 2, manaPerEnergy: 2,
    hpPerLevel: 1, manaPerLevel: 2,
    startSkills: ['fireball'],
  },
  rogue: {
    name: 'Rogue',
    baseStr: 20, baseDex: 25, baseVit: 20, baseEnergy: 15,
    baseHP: 50, baseMana: 15,
    hpPerVit: 3, manaPerEnergy: 1.5,
    hpPerLevel: 2, manaPerLevel: 1.5,
    startSkills: ['multipleShot'],
  },
};

// D2-inspired XP curve (from Experience.txt: 500, 1500, 3750, 7875...)
// Simplified version that captures the exponential feel
const D2_XP_TABLE = [
  0, 0, 500, 1500, 3750, 7875, 14175, 22680, 32886, 44396,
  57715, 72144, 90180, 112725, 140906, 176132, 220165, 275207,
  344008, 430010, 537513, 671891, 839864, 1049830, 1312287,
  1640359, 2050449, 2563061, 3203826, 3902260, 4663553,
  5493363, 6397855, 7383752, 8458379, 9629723, 10906488,
  12298162, 13815086, 15468534, 17270791, 19235252, 21376515,
  23710491, 26254525, 29027522, 32050088, 35344686, 38935798,
  42850109, 47116709,
];

export function xpForLevel(level) {
  if (level < D2_XP_TABLE.length) return D2_XP_TABLE[level];
  // Extrapolate for levels beyond table
  return Math.floor(D2_XP_TABLE[D2_XP_TABLE.length - 1] * Math.pow(1.1, level - D2_XP_TABLE.length + 1));
}

export function mapSizeForFloor(floor) {
  return Math.min(MAP_MIN_SIZE + floor * MAP_SIZE_PER_FLOOR, MAP_MAX_SIZE);
}

// Shrine types (from D2 Shrines.txt)
export const SHRINE_TYPES = [
  { name: 'Health Shrine', effect: 'refillHealth', description: 'Fills health to maximum' },
  { name: 'Mana Shrine', effect: 'refillMana', description: 'Fills mana to maximum' },
  { name: 'Armor Shrine', effect: 'armorBoost', description: '+100% defense for 2 minutes', duration: 120 },
  { name: 'Combat Shrine', effect: 'combatBoost', description: '+200% damage for 2 minutes', duration: 120 },
  { name: 'Resist Fire Shrine', effect: 'resistFire', description: '+75% fire resistance for 2 minutes', duration: 120 },
  { name: 'Resist Cold Shrine', effect: 'resistCold', description: '+75% cold resistance for 2 minutes', duration: 120 },
  { name: 'Resist Lightning Shrine', effect: 'resistLightning', description: '+75% lightning resistance for 2 minutes', duration: 120 },
  { name: 'Experience Shrine', effect: 'xpBoost', description: '+50% experience for 2 minutes', duration: 120 },
  { name: 'Skill Shrine', effect: 'skillBoost', description: '+2 to all skills for 2 minutes', duration: 120 },
  { name: 'Gem Shrine', effect: 'dropItem', description: 'Drops a random item' },
];
