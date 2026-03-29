export const TILE_SIZE = 48;
export const MAP_MIN_SIZE = 80;
export const MAP_MAX_SIZE = 120;
export const MAP_SIZE_PER_FLOOR = 5;

export const PLAYER_SPEED = 4; // tiles per second
export const MONSTER_AGGRO_RADIUS = 8;
export const MONSTER_PATHFIND_INTERVAL = 500;
export const MONSTER_LEASH_RADIUS = 16;

export const MAX_LEVEL = 30;
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
  UNIQUE: 'unique',
};

export const RARITY_COLORS = {
  normal: '#cccccc',
  magic: '#4169ff',
  rare: '#ffff00',
  unique: '#c78428',
};

export const RARITY_DROP_WEIGHTS = {
  normal: 60,
  magic: 25,
  rare: 10,
  unique: 5,
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
};

export const CLASS_STATS = {
  warrior: {
    name: 'Warrior',
    baseStr: 30, baseDex: 15, baseVit: 25, baseEnergy: 10,
    baseHP: 60, baseMana: 15,
    hpPerVit: 4, manaPerEnergy: 1.5,
    startSkills: ['bash'],
  },
  mage: {
    name: 'Mage',
    baseStr: 10, baseDex: 15, baseVit: 15, baseEnergy: 35,
    baseHP: 35, baseMana: 60,
    hpPerVit: 2, manaPerEnergy: 3,
    startSkills: ['fireball'],
  },
  rogue: {
    name: 'Rogue',
    baseStr: 15, baseDex: 30, baseVit: 20, baseEnergy: 15,
    baseHP: 45, baseMana: 25,
    hpPerVit: 3, manaPerEnergy: 2,
    startSkills: ['multipleShot'],
  },
};

export function xpForLevel(level) {
  return 100 * level * (level + 1) / 2;
}

export function mapSizeForFloor(floor) {
  return Math.min(MAP_MIN_SIZE + floor * MAP_SIZE_PER_FLOOR, MAP_MAX_SIZE);
}
