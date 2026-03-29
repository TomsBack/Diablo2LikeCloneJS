export const ITEM_SLOTS = {
  weapon: 'Weapon',
  helmet: 'Helmet',
  armor: 'Armor',
  shield: 'Shield',
  boots: 'Boots',
  gloves: 'Gloves',
  belt: 'Belt',
  ring: 'Ring',
  amulet: 'Amulet',
  potion: 'Potion',
};

// Grid size: [width, height] in inventory cells
export const BASE_ITEMS = [
  // Weapons
  { id: 'shortSword', name: 'Short Sword', slot: 'weapon', gridW: 1, gridH: 3, damageMin: 2, damageMax: 6, reqLevel: 1, reqStr: 0, color: '#b0b0b0' },
  { id: 'longSword', name: 'Long Sword', slot: 'weapon', gridW: 1, gridH: 3, damageMin: 4, damageMax: 10, reqLevel: 5, reqStr: 20, color: '#c0c0c0' },
  { id: 'broadSword', name: 'Broad Sword', slot: 'weapon', gridW: 1, gridH: 3, damageMin: 7, damageMax: 15, reqLevel: 10, reqStr: 35, color: '#d0d0d0' },
  { id: 'warAxe', name: 'War Axe', slot: 'weapon', gridW: 2, gridH: 3, damageMin: 10, damageMax: 22, reqLevel: 15, reqStr: 50, color: '#a0a090' },
  { id: 'staff', name: 'Staff', slot: 'weapon', gridW: 1, gridH: 3, damageMin: 3, damageMax: 8, reqLevel: 1, reqStr: 0, color: '#8b7355', bonusEnergy: 5 },
  { id: 'arcaneStaff', name: 'Arcane Staff', slot: 'weapon', gridW: 2, gridH: 3, damageMin: 6, damageMax: 14, reqLevel: 8, reqStr: 0, color: '#6a5aaa', bonusEnergy: 12 },
  { id: 'shortBow', name: 'Short Bow', slot: 'weapon', gridW: 2, gridH: 3, damageMin: 3, damageMax: 7, reqLevel: 1, reqDex: 15, color: '#8b6914', isRanged: true },
  { id: 'longBow', name: 'Long Bow', slot: 'weapon', gridW: 2, gridH: 3, damageMin: 5, damageMax: 12, reqLevel: 8, reqDex: 30, color: '#9b7924', isRanged: true },
  { id: 'dagger', name: 'Dagger', slot: 'weapon', gridW: 1, gridH: 2, damageMin: 2, damageMax: 5, reqLevel: 1, reqDex: 10, color: '#c0c0b0', attackSpeed: 20 },

  // Helmets
  { id: 'cap', name: 'Cap', slot: 'helmet', gridW: 2, gridH: 2, defense: 3, reqLevel: 1, color: '#8b7355' },
  { id: 'helmet', name: 'Helmet', slot: 'helmet', gridW: 2, gridH: 2, defense: 8, reqLevel: 6, reqStr: 20, color: '#a0a0a0' },
  { id: 'greatHelm', name: 'Great Helm', slot: 'helmet', gridW: 2, gridH: 2, defense: 15, reqLevel: 12, reqStr: 40, color: '#b0b0b0' },

  // Armor
  { id: 'quiltedArmor', name: 'Quilted Armor', slot: 'armor', gridW: 2, gridH: 3, defense: 5, reqLevel: 1, color: '#8b6914' },
  { id: 'leatherArmor', name: 'Leather Armor', slot: 'armor', gridW: 2, gridH: 3, defense: 10, reqLevel: 4, reqStr: 15, color: '#6b4914' },
  { id: 'chainMail', name: 'Chain Mail', slot: 'armor', gridW: 2, gridH: 3, defense: 18, reqLevel: 8, reqStr: 30, color: '#a0a0a0' },
  { id: 'plateMail', name: 'Plate Mail', slot: 'armor', gridW: 2, gridH: 3, defense: 28, reqLevel: 14, reqStr: 50, color: '#c0c0c0' },

  // Shields
  { id: 'buckler', name: 'Buckler', slot: 'shield', gridW: 2, gridH: 2, defense: 4, blockChance: 10, reqLevel: 1, color: '#8b7355' },
  { id: 'roundShield', name: 'Round Shield', slot: 'shield', gridW: 2, gridH: 3, defense: 10, blockChance: 18, reqLevel: 6, reqStr: 20, color: '#a09080' },
  { id: 'towerShield', name: 'Tower Shield', slot: 'shield', gridW: 2, gridH: 3, defense: 20, blockChance: 24, reqLevel: 12, reqStr: 45, color: '#b0a090' },

  // Boots
  { id: 'sandals', name: 'Sandals', slot: 'boots', gridW: 2, gridH: 2, defense: 2, reqLevel: 1, color: '#8b6914' },
  { id: 'heavyBoots', name: 'Heavy Boots', slot: 'boots', gridW: 2, gridH: 2, defense: 5, reqLevel: 5, reqStr: 15, color: '#6b4914' },
  { id: 'plateBoots', name: 'Plate Boots', slot: 'boots', gridW: 2, gridH: 2, defense: 10, reqLevel: 10, reqStr: 30, color: '#a0a0a0' },

  // Gloves
  { id: 'leatherGloves', name: 'Leather Gloves', slot: 'gloves', gridW: 2, gridH: 2, defense: 2, reqLevel: 1, color: '#8b6914' },
  { id: 'chainGloves', name: 'Chain Gloves', slot: 'gloves', gridW: 2, gridH: 2, defense: 5, reqLevel: 6, reqStr: 15, color: '#a0a0a0' },

  // Belts
  { id: 'sash', name: 'Sash', slot: 'belt', gridW: 2, gridH: 1, defense: 1, reqLevel: 1, color: '#8b6914' },
  { id: 'heavyBelt', name: 'Heavy Belt', slot: 'belt', gridW: 2, gridH: 1, defense: 4, reqLevel: 6, reqStr: 15, color: '#6b4914' },

  // Rings
  { id: 'ring', name: 'Ring', slot: 'ring', gridW: 1, gridH: 1, reqLevel: 1, color: '#d4af37' },

  // Amulets
  { id: 'amulet', name: 'Amulet', slot: 'amulet', gridW: 1, gridH: 1, reqLevel: 1, color: '#d4af37' },

  // Potions
  { id: 'healthPotion', name: 'Health Potion', slot: 'potion', gridW: 1, gridH: 1, subType: 'health', healAmount: 50, reqLevel: 1, color: '#cc2222', stackable: true },
  { id: 'manaPotion', name: 'Mana Potion', slot: 'potion', gridW: 1, gridH: 1, subType: 'mana', healAmount: 30, reqLevel: 1, color: '#2244cc', stackable: true },
  { id: 'greaterHealthPotion', name: 'Greater Health Potion', slot: 'potion', gridW: 1, gridH: 1, subType: 'health', healAmount: 120, reqLevel: 8, color: '#ee3333', stackable: true },
  { id: 'greaterManaPotion', name: 'Greater Mana Potion', slot: 'potion', gridW: 1, gridH: 1, subType: 'mana', healAmount: 80, reqLevel: 8, color: '#3355ee', stackable: true },
];

export const PREFIXES = [
  { name: 'Sharp', stat: 'bonusDamageMin', min: 1, max: 5, slots: ['weapon'] },
  { name: 'Fine', stat: 'bonusDamageMax', min: 2, max: 8, slots: ['weapon'] },
  { name: 'Sturdy', stat: 'bonusDefense', min: 2, max: 10, slots: ['armor', 'helmet', 'shield', 'boots', 'gloves', 'belt'] },
  { name: 'Ruby', stat: 'bonusFireDamage', min: 2, max: 8, slots: ['weapon', 'ring', 'amulet'] },
  { name: 'Sapphire', stat: 'bonusColdDamage', min: 2, max: 6, slots: ['weapon', 'ring', 'amulet'] },
  { name: "Lizard's", stat: 'bonusHPRegen', min: 1, max: 5, slots: ['ring', 'amulet', 'belt', 'armor'] },
  { name: 'Swift', stat: 'bonusAttackSpeed', min: 5, max: 20, slots: ['weapon', 'gloves'] },
  { name: 'Fleet', stat: 'bonusMoveSpeed', min: 5, max: 15, slots: ['boots'] },
  { name: 'Blessed', stat: 'bonusMana', min: 5, max: 25, slots: ['helmet', 'armor', 'ring', 'amulet'] },
  { name: 'Resilient', stat: 'bonusHP', min: 5, max: 30, slots: ['armor', 'helmet', 'belt', 'ring', 'amulet'] },
];

export const SUFFIXES = [
  { name: 'of the Bear', stat: 'bonusStr', min: 2, max: 10 },
  { name: 'of the Fox', stat: 'bonusDex', min: 2, max: 10 },
  { name: 'of the Whale', stat: 'bonusHP', min: 10, max: 40 },
  { name: 'of the Leech', stat: 'bonusHPRegen', min: 2, max: 8 },
  { name: 'of Speed', stat: 'bonusAttackSpeed', min: 5, max: 15 },
  { name: 'of the Mammoth', stat: 'bonusVit', min: 2, max: 8 },
  { name: 'of Brilliance', stat: 'bonusEnergy', min: 2, max: 8 },
  { name: 'of the Titan', stat: 'bonusStr', min: 5, max: 15 },
  { name: 'of Fortune', stat: 'bonusMana', min: 10, max: 30 },
];

export const UNIQUE_ITEMS = [
  {
    baseType: 'longSword', name: 'Griswold\'s Edge', rarity: 'unique',
    fixedStats: { bonusDamageMin: 5, bonusDamageMax: 12, bonusStr: 10, bonusHP: 20, bonusFireDamage: 8 },
  },
  {
    baseType: 'arcaneStaff', name: 'The Oculus', rarity: 'unique',
    fixedStats: { bonusEnergy: 20, bonusMana: 50, bonusColdDamage: 10, bonusManaRegen: 5 },
  },
  {
    baseType: 'plateMail', name: 'Arkaine\'s Valor', rarity: 'unique',
    fixedStats: { bonusDefense: 25, bonusHP: 50, bonusVit: 10, bonusHPRegen: 5 },
  },
  {
    baseType: 'longBow', name: 'Windforce', rarity: 'unique',
    fixedStats: { bonusDamageMin: 8, bonusDamageMax: 15, bonusDex: 15, bonusAttackSpeed: 20 },
  },
];

export function getBaseItem(id) {
  return BASE_ITEMS.find(i => i.id === id);
}

export function getBaseItemsForSlot(slot) {
  return BASE_ITEMS.filter(i => i.slot === slot && !i.stackable);
}

export function getBaseItemsByLevel(maxLevel) {
  return BASE_ITEMS.filter(i => i.reqLevel <= maxLevel && !i.stackable);
}
