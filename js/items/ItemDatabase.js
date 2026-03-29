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
// Based on D2 Weapons.txt and Armor.txt
export const BASE_ITEMS = [
  // #region Weapons (from D2 Weapons.txt)
  // Axes
  { id: 'handAxe', name: 'Hand Axe', slot: 'weapon', gridW: 1, gridH: 3, damageMin: 3, damageMax: 6, reqLevel: 1, reqStr: 0, color: '#b0b0b0', speed: 0 },
  { id: 'axe', name: 'Axe', slot: 'weapon', gridW: 2, gridH: 3, damageMin: 4, damageMax: 11, reqLevel: 7, reqStr: 32, color: '#a0a0a0', speed: 10 },
  { id: 'doubleAxe', name: 'Double Axe', slot: 'weapon', gridW: 2, gridH: 3, damageMin: 5, damageMax: 13, reqLevel: 13, reqStr: 43, color: '#b0b0a0', speed: 10 },
  { id: 'warAxe', name: 'War Axe', slot: 'weapon', gridW: 2, gridH: 3, damageMin: 10, damageMax: 18, reqLevel: 25, reqStr: 67, color: '#c0c0b0', speed: 0 },
  { id: 'battleAxe', name: 'Battle Axe', slot: 'weapon', gridW: 2, gridH: 3, damageMin: 12, damageMax: 32, reqLevel: 17, reqStr: 54, color: '#a0a090', speed: 10 },

  // Swords
  { id: 'shortSword', name: 'Short Sword', slot: 'weapon', gridW: 1, gridH: 3, damageMin: 2, damageMax: 7, reqLevel: 1, reqStr: 0, color: '#c0c0c0', speed: 0 },
  { id: 'scimitar', name: 'Scimitar', slot: 'weapon', gridW: 1, gridH: 3, damageMin: 2, damageMax: 6, reqLevel: 5, reqStr: 0, reqDex: 21, color: '#c0c0c0', speed: -20 },
  { id: 'longSword', name: 'Long Sword', slot: 'weapon', gridW: 1, gridH: 3, damageMin: 3, damageMax: 17, reqLevel: 10, reqStr: 25, reqDex: 25, color: '#d0d0d0', speed: -10 },
  { id: 'broadSword', name: 'Broad Sword', slot: 'weapon', gridW: 1, gridH: 3, damageMin: 7, damageMax: 14, reqLevel: 15, reqStr: 48, color: '#d0d0d0', speed: 0 },
  { id: 'bastardSword', name: 'Bastard Sword', slot: 'weapon', gridW: 1, gridH: 3, damageMin: 7, damageMax: 19, reqLevel: 20, reqStr: 62, color: '#d0d0d0', speed: 10 },
  { id: 'claymore', name: 'Claymore', slot: 'weapon', gridW: 1, gridH: 4, damageMin: 13, damageMax: 30, reqLevel: 25, reqStr: 73, color: '#d0d0e0', speed: 10 },

  // Maces
  { id: 'club', name: 'Club', slot: 'weapon', gridW: 1, gridH: 3, damageMin: 1, damageMax: 6, reqLevel: 1, reqStr: 0, color: '#8b7355', speed: -10 },
  { id: 'mace', name: 'Mace', slot: 'weapon', gridW: 1, gridH: 3, damageMin: 3, damageMax: 10, reqLevel: 8, reqStr: 27, color: '#a09080', speed: 0 },
  { id: 'flail', name: 'Flail', slot: 'weapon', gridW: 2, gridH: 3, damageMin: 1, damageMax: 24, reqLevel: 15, reqStr: 41, reqDex: 35, color: '#a0a0a0', speed: -10 },
  { id: 'warHammer', name: 'War Hammer', slot: 'weapon', gridW: 2, gridH: 3, damageMin: 19, damageMax: 29, reqLevel: 25, reqStr: 53, color: '#b0b0b0', speed: 20 },

  // Wands / Staves
  { id: 'wand', name: 'Wand', slot: 'weapon', gridW: 1, gridH: 2, damageMin: 2, damageMax: 4, reqLevel: 1, reqStr: 0, color: '#8b7355', bonusEnergy: 3 },
  { id: 'yewWand', name: 'Yew Wand', slot: 'weapon', gridW: 1, gridH: 2, damageMin: 2, damageMax: 8, reqLevel: 12, reqStr: 0, color: '#7a6a4a', bonusEnergy: 5 },
  { id: 'boneWand', name: 'Bone Wand', slot: 'weapon', gridW: 1, gridH: 2, damageMin: 3, damageMax: 7, reqLevel: 18, reqStr: 0, color: '#c8c8a0', bonusEnergy: 8 },
  { id: 'grimWand', name: 'Grim Wand', slot: 'weapon', gridW: 1, gridH: 2, damageMin: 5, damageMax: 11, reqLevel: 26, reqStr: 0, color: '#5a5a4a', bonusEnergy: 12 },
  { id: 'staff', name: 'Short Staff', slot: 'weapon', gridW: 1, gridH: 3, damageMin: 1, damageMax: 5, reqLevel: 1, reqStr: 0, color: '#8b7355', bonusEnergy: 5 },
  { id: 'longStaff', name: 'Long Staff', slot: 'weapon', gridW: 1, gridH: 4, damageMin: 2, damageMax: 8, reqLevel: 8, reqStr: 0, color: '#7a6a4a', bonusEnergy: 8 },
  { id: 'arcaneStaff', name: 'War Staff', slot: 'weapon', gridW: 2, gridH: 4, damageMin: 12, damageMax: 28, reqLevel: 24, reqStr: 0, color: '#6a5aaa', bonusEnergy: 15 },

  // Bows
  { id: 'shortBow', name: 'Short Bow', slot: 'weapon', gridW: 2, gridH: 3, damageMin: 1, damageMax: 4, reqLevel: 1, reqDex: 15, color: '#8b6914', isRanged: true, speed: 5 },
  { id: 'huntersBow', name: "Hunter's Bow", slot: 'weapon', gridW: 2, gridH: 3, damageMin: 2, damageMax: 6, reqLevel: 5, reqDex: 28, color: '#9b7924', isRanged: true, speed: -10 },
  { id: 'longBow', name: 'Long Bow', slot: 'weapon', gridW: 2, gridH: 4, damageMin: 3, damageMax: 10, reqLevel: 8, reqStr: 22, reqDex: 19, color: '#7a5914', isRanged: true, speed: 0 },
  { id: 'compositeBow', name: 'Composite Bow', slot: 'weapon', gridW: 2, gridH: 3, damageMin: 4, damageMax: 8, reqLevel: 12, reqStr: 25, reqDex: 35, color: '#8b7914', isRanged: true, speed: -10 },
  { id: 'longWarBow', name: 'Long War Bow', slot: 'weapon', gridW: 2, gridH: 4, damageMin: 3, damageMax: 23, reqLevel: 20, reqStr: 50, reqDex: 40, color: '#6a5014', isRanged: true, speed: 10 },

  // Daggers
  { id: 'dagger', name: 'Dagger', slot: 'weapon', gridW: 1, gridH: 2, damageMin: 1, damageMax: 4, reqLevel: 1, reqDex: 0, color: '#c0c0b0', speed: -20 },
  { id: 'dirk', name: 'Dirk', slot: 'weapon', gridW: 1, gridH: 2, damageMin: 3, damageMax: 9, reqLevel: 9, reqDex: 25, color: '#b0b0a0', speed: 0 },
  { id: 'kris', name: 'Kris', slot: 'weapon', gridW: 1, gridH: 3, damageMin: 2, damageMax: 11, reqLevel: 17, reqDex: 45, color: '#c0b0a0', speed: -20 },
  { id: 'blade', name: 'Blade', slot: 'weapon', gridW: 1, gridH: 3, damageMin: 4, damageMax: 15, reqLevel: 23, reqStr: 35, reqDex: 50, color: '#d0c0b0', speed: -10 },
  // #endregion

  // #region Helmets (from D2 Armor.txt)
  { id: 'cap', name: 'Cap', slot: 'helmet', gridW: 2, gridH: 2, defense: 3, reqLevel: 1, color: '#8b7355' },
  { id: 'skullCap', name: 'Skull Cap', slot: 'helmet', gridW: 2, gridH: 2, defense: 8, reqLevel: 5, reqStr: 15, color: '#a0a0a0' },
  { id: 'helm', name: 'Helm', slot: 'helmet', gridW: 2, gridH: 2, defense: 15, reqLevel: 11, reqStr: 26, color: '#b0b0b0' },
  { id: 'fullHelm', name: 'Full Helm', slot: 'helmet', gridW: 2, gridH: 2, defense: 23, reqLevel: 15, reqStr: 41, color: '#b0b0b0' },
  { id: 'greatHelm', name: 'Great Helm', slot: 'helmet', gridW: 2, gridH: 2, defense: 30, reqLevel: 23, reqStr: 63, color: '#c0c0c0' },
  { id: 'crown', name: 'Crown', slot: 'helmet', gridW: 2, gridH: 2, defense: 25, reqLevel: 29, reqStr: 55, color: '#d4af37' },
  { id: 'mask', name: 'Mask', slot: 'helmet', gridW: 2, gridH: 2, defense: 9, reqLevel: 19, reqStr: 23, color: '#8a8a7a' },
  // #endregion

  // #region Armor (from D2 Armor.txt)
  { id: 'quiltedArmor', name: 'Quilted Armor', slot: 'armor', gridW: 2, gridH: 3, defense: 8, reqLevel: 1, color: '#8b6914' },
  { id: 'leatherArmor', name: 'Leather Armor', slot: 'armor', gridW: 2, gridH: 3, defense: 14, reqLevel: 3, reqStr: 15, color: '#6b4914' },
  { id: 'hardLeather', name: 'Hard Leather Armor', slot: 'armor', gridW: 2, gridH: 3, defense: 21, reqLevel: 5, reqStr: 20, color: '#5b3914' },
  { id: 'studdedLeather', name: 'Studded Leather', slot: 'armor', gridW: 2, gridH: 3, defense: 32, reqLevel: 8, reqStr: 27, color: '#5b3914' },
  { id: 'ringMail', name: 'Ring Mail', slot: 'armor', gridW: 2, gridH: 3, defense: 45, reqLevel: 11, reqStr: 36, color: '#a0a0a0' },
  { id: 'scaleMail', name: 'Scale Mail', slot: 'armor', gridW: 2, gridH: 3, defense: 57, reqLevel: 13, reqStr: 44, color: '#a0a0a0' },
  { id: 'chainMail', name: 'Chain Mail', slot: 'armor', gridW: 2, gridH: 3, defense: 72, reqLevel: 15, reqStr: 48, color: '#b0b0b0' },
  { id: 'splintMail', name: 'Splint Mail', slot: 'armor', gridW: 2, gridH: 3, defense: 90, reqLevel: 20, reqStr: 51, color: '#b0b0a0' },
  { id: 'plateMail', name: 'Plate Mail', slot: 'armor', gridW: 2, gridH: 3, defense: 108, reqLevel: 24, reqStr: 65, color: '#c0c0c0' },
  { id: 'gothicPlate', name: 'Gothic Plate', slot: 'armor', gridW: 2, gridH: 3, defense: 128, reqLevel: 28, reqStr: 70, color: '#c0c0d0' },
  { id: 'fullPlateMail', name: 'Full Plate Mail', slot: 'armor', gridW: 2, gridH: 3, defense: 150, reqLevel: 32, reqStr: 80, color: '#d0d0d0' },
  { id: 'ancientArmor', name: 'Ancient Armor', slot: 'armor', gridW: 2, gridH: 3, defense: 170, reqLevel: 37, reqStr: 100, color: '#d0d0e0' },
  // #endregion

  // #region Shields (from D2 Armor.txt)
  { id: 'buckler', name: 'Buckler', slot: 'shield', gridW: 2, gridH: 2, defense: 4, blockChance: 30, reqLevel: 1, color: '#8b7355' },
  { id: 'smallShield', name: 'Small Shield', slot: 'shield', gridW: 2, gridH: 2, defense: 8, blockChance: 35, reqLevel: 5, reqStr: 22, color: '#9a8a6a' },
  { id: 'largeShield', name: 'Large Shield', slot: 'shield', gridW: 2, gridH: 3, defense: 12, blockChance: 37, reqLevel: 11, reqStr: 34, color: '#a09080' },
  { id: 'kiteShield', name: 'Kite Shield', slot: 'shield', gridW: 2, gridH: 3, defense: 16, blockChance: 40, reqLevel: 15, reqStr: 47, color: '#a0a090' },
  { id: 'towerShield', name: 'Tower Shield', slot: 'shield', gridW: 2, gridH: 3, defense: 22, blockChance: 44, reqLevel: 22, reqStr: 75, color: '#b0a090' },
  { id: 'gothicShield', name: 'Gothic Shield', slot: 'shield', gridW: 2, gridH: 3, defense: 30, blockChance: 48, reqLevel: 30, reqStr: 60, color: '#b0b0a0' },
  // #endregion

  // #region Boots / Gloves / Belts
  { id: 'boots', name: 'Boots', slot: 'boots', gridW: 2, gridH: 2, defense: 2, reqLevel: 1, color: '#8b6914' },
  { id: 'heavyBoots', name: 'Heavy Boots', slot: 'boots', gridW: 2, gridH: 2, defense: 5, reqLevel: 5, reqStr: 18, color: '#6b4914' },
  { id: 'chainBoots', name: 'Chain Boots', slot: 'boots', gridW: 2, gridH: 2, defense: 8, reqLevel: 12, reqStr: 30, color: '#a0a0a0' },
  { id: 'lightPlateBoots', name: 'Light Plate Boots', slot: 'boots', gridW: 2, gridH: 2, defense: 12, reqLevel: 20, reqStr: 50, color: '#b0b0b0' },
  { id: 'plateBoots', name: 'Plate Boots', slot: 'boots', gridW: 2, gridH: 2, defense: 18, reqLevel: 28, reqStr: 65, color: '#c0c0c0' },

  { id: 'leatherGloves', name: 'Leather Gloves', slot: 'gloves', gridW: 2, gridH: 2, defense: 2, reqLevel: 1, color: '#8b6914' },
  { id: 'heavyGloves', name: 'Heavy Gloves', slot: 'gloves', gridW: 2, gridH: 2, defense: 5, reqLevel: 7, reqStr: 15, color: '#6b4914' },
  { id: 'chainGloves', name: 'Chain Gloves', slot: 'gloves', gridW: 2, gridH: 2, defense: 8, reqLevel: 12, reqStr: 25, color: '#a0a0a0' },
  { id: 'gauntlets', name: 'Gauntlets', slot: 'gloves', gridW: 2, gridH: 2, defense: 12, reqLevel: 22, reqStr: 45, color: '#b0b0b0' },

  { id: 'sash', name: 'Sash', slot: 'belt', gridW: 2, gridH: 1, defense: 2, reqLevel: 1, color: '#8b6914' },
  { id: 'lightBelt', name: 'Light Belt', slot: 'belt', gridW: 2, gridH: 1, defense: 3, reqLevel: 7, color: '#7b5914' },
  { id: 'belt', name: 'Belt', slot: 'belt', gridW: 2, gridH: 1, defense: 5, reqLevel: 12, reqStr: 25, color: '#6b4914' },
  { id: 'heavyBelt', name: 'Heavy Belt', slot: 'belt', gridW: 2, gridH: 1, defense: 6, reqLevel: 20, reqStr: 45, color: '#5b3914' },
  { id: 'plateBelt', name: 'Plated Belt', slot: 'belt', gridW: 2, gridH: 1, defense: 8, reqLevel: 27, reqStr: 60, color: '#b0b0b0' },
  // #endregion

  // #region Rings / Amulets
  { id: 'ring', name: 'Ring', slot: 'ring', gridW: 1, gridH: 1, reqLevel: 1, color: '#d4af37' },
  { id: 'amulet', name: 'Amulet', slot: 'amulet', gridW: 1, gridH: 1, reqLevel: 1, color: '#d4af37' },
  // #endregion

  // #region Potions
  { id: 'minorHealthPotion', name: 'Minor Health Potion', slot: 'potion', gridW: 1, gridH: 1, subType: 'health', healAmount: 30, reqLevel: 1, color: '#cc2222', stackable: true },
  { id: 'healthPotion', name: 'Health Potion', slot: 'potion', gridW: 1, gridH: 1, subType: 'health', healAmount: 60, reqLevel: 1, color: '#cc2222', stackable: true },
  { id: 'greaterHealthPotion', name: 'Greater Health Potion', slot: 'potion', gridW: 1, gridH: 1, subType: 'health', healAmount: 120, reqLevel: 8, color: '#ee3333', stackable: true },
  { id: 'superHealthPotion', name: 'Super Health Potion', slot: 'potion', gridW: 1, gridH: 1, subType: 'health', healAmount: 200, reqLevel: 16, color: '#ff4444', stackable: true },
  { id: 'minorManaPotion', name: 'Minor Mana Potion', slot: 'potion', gridW: 1, gridH: 1, subType: 'mana', healAmount: 20, reqLevel: 1, color: '#2244cc', stackable: true },
  { id: 'manaPotion', name: 'Mana Potion', slot: 'potion', gridW: 1, gridH: 1, subType: 'mana', healAmount: 40, reqLevel: 1, color: '#2244cc', stackable: true },
  { id: 'greaterManaPotion', name: 'Greater Mana Potion', slot: 'potion', gridW: 1, gridH: 1, subType: 'mana', healAmount: 80, reqLevel: 8, color: '#3355ee', stackable: true },
  { id: 'superManaPotion', name: 'Super Mana Potion', slot: 'potion', gridW: 1, gridH: 1, subType: 'mana', healAmount: 150, reqLevel: 16, color: '#4466ff', stackable: true },
  { id: 'rejuvPotion', name: 'Rejuvenation Potion', slot: 'potion', gridW: 1, gridH: 1, subType: 'rejuv', healAmount: 35, reqLevel: 1, color: '#8822cc', stackable: true },
  { id: 'fullRejuvPotion', name: 'Full Rejuvenation Potion', slot: 'potion', gridW: 1, gridH: 1, subType: 'fullrejuv', healAmount: 100, reqLevel: 1, color: '#aa44ee', stackable: true },
  // #endregion
];

export const PREFIXES = [
  // Damage
  { name: 'Sharp', stat: 'bonusDamageMin', min: 1, max: 5, slots: ['weapon'] },
  { name: 'Fine', stat: 'bonusDamageMax', min: 2, max: 8, slots: ['weapon'] },
  { name: 'Warrior\'s', stat: 'bonusDamageMax', min: 5, max: 15, slots: ['weapon'] },
  { name: 'Soldier\'s', stat: 'bonusDamageMax', min: 8, max: 20, slots: ['weapon'] },
  // Defense
  { name: 'Sturdy', stat: 'bonusDefense', min: 2, max: 8, slots: ['armor', 'helmet', 'shield', 'boots', 'gloves', 'belt'] },
  { name: 'Strong', stat: 'bonusDefense', min: 5, max: 15, slots: ['armor', 'helmet', 'shield', 'boots', 'gloves', 'belt'] },
  { name: 'Glorious', stat: 'bonusDefense', min: 10, max: 30, slots: ['armor', 'helmet', 'shield'] },
  // Elemental
  { name: 'Fiery', stat: 'bonusFireDamage', min: 2, max: 6, slots: ['weapon', 'ring', 'amulet'] },
  { name: 'Burning', stat: 'bonusFireDamage', min: 5, max: 15, slots: ['weapon'] },
  { name: 'Shocking', stat: 'bonusLightningDamage', min: 1, max: 10, slots: ['weapon', 'ring', 'amulet'] },
  { name: 'Sapphire', stat: 'bonusColdDamage', min: 2, max: 6, slots: ['weapon', 'ring', 'amulet'] },
  { name: 'Freezing', stat: 'bonusColdDamage', min: 5, max: 12, slots: ['weapon'] },
  { name: 'Toxic', stat: 'bonusPoisonDamage', min: 3, max: 8, slots: ['weapon', 'ring'] },
  // Utility
  { name: "Lizard's", stat: 'bonusHPRegen', min: 1, max: 5, slots: ['ring', 'amulet', 'belt', 'armor'] },
  { name: 'Swift', stat: 'bonusAttackSpeed', min: 5, max: 20, slots: ['weapon', 'gloves'] },
  { name: 'Fleet', stat: 'bonusMoveSpeed', min: 5, max: 20, slots: ['boots'] },
  { name: 'Blessed', stat: 'bonusMana', min: 5, max: 25, slots: ['helmet', 'armor', 'ring', 'amulet'] },
  { name: 'Resilient', stat: 'bonusHP', min: 5, max: 30, slots: ['armor', 'helmet', 'belt', 'ring', 'amulet'] },
  { name: 'Stout', stat: 'bonusHP', min: 15, max: 50, slots: ['armor', 'belt'] },
  { name: 'Cobalt', stat: 'bonusMana', min: 10, max: 40, slots: ['armor', 'ring', 'amulet'] },
  // Resist
  { name: 'Ruby', stat: 'bonusResistFire', min: 5, max: 20, slots: ['armor', 'helmet', 'shield', 'ring', 'amulet'] },
  { name: 'Azure', stat: 'bonusResistCold', min: 5, max: 20, slots: ['armor', 'helmet', 'shield', 'ring', 'amulet'] },
  { name: 'Amber', stat: 'bonusResistLightning', min: 5, max: 20, slots: ['armor', 'helmet', 'shield', 'ring', 'amulet'] },
  { name: 'Emerald', stat: 'bonusResistPoison', min: 5, max: 20, slots: ['armor', 'helmet', 'shield', 'ring', 'amulet'] },
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
  { name: 'of the Colossus', stat: 'bonusHP', min: 20, max: 60 },
  { name: 'of the Apprentice', stat: 'bonusManaRegen', min: 2, max: 5 },
  { name: 'of the Jackal', stat: 'bonusHP', min: 5, max: 15 },
  { name: 'of Maiming', stat: 'bonusDamageMax', min: 3, max: 10 },
  { name: 'of Frost', stat: 'bonusColdDamage', min: 2, max: 8 },
  { name: 'of Flame', stat: 'bonusFireDamage', min: 2, max: 8 },
  { name: 'of Shock', stat: 'bonusLightningDamage', min: 1, max: 12 },
  { name: 'of Blight', stat: 'bonusPoisonDamage', min: 3, max: 10 },
];

// D2-inspired unique items
export const UNIQUE_ITEMS = [
  // Act 1 uniques
  {
    baseType: 'shortSword', name: "The Gnasher", rarity: 'unique',
    fixedStats: { bonusDamageMin: 3, bonusDamageMax: 8, bonusStr: 8, bonusHP: 10 },
  },
  {
    baseType: 'longSword', name: "Griswold's Edge", rarity: 'unique',
    fixedStats: { bonusDamageMin: 5, bonusDamageMax: 12, bonusStr: 10, bonusHP: 20, bonusFireDamage: 8 },
  },
  {
    baseType: 'skullCap', name: 'Tarnhelm', rarity: 'unique',
    fixedStats: { bonusDefense: 8, bonusHP: 15, bonusEnergy: 5, bonusMana: 20 },
  },
  {
    baseType: 'cap', name: "Biggin's Bonnet", rarity: 'unique',
    fixedStats: { bonusDefense: 14, bonusHP: 30, bonusDamageMin: 1, bonusDamageMax: 3 },
  },
  {
    baseType: 'arcaneStaff', name: 'The Oculus', rarity: 'unique',
    fixedStats: { bonusEnergy: 20, bonusMana: 50, bonusColdDamage: 10, bonusManaRegen: 5 },
  },
  {
    baseType: 'leatherArmor', name: "Greyform", rarity: 'unique',
    fixedStats: { bonusDefense: 20, bonusDex: 5, bonusColdDamage: 3, bonusHP: 15 },
  },
  {
    baseType: 'fullPlateMail', name: "Arkaine's Valor", rarity: 'unique',
    fixedStats: { bonusDefense: 40, bonusHP: 60, bonusVit: 10, bonusHPRegen: 5 },
  },
  {
    baseType: 'longWarBow', name: 'Windforce', rarity: 'unique',
    fixedStats: { bonusDamageMin: 8, bonusDamageMax: 15, bonusDex: 15, bonusAttackSpeed: 20 },
  },
  {
    baseType: 'buckler', name: "Bverrit Keep", rarity: 'unique',
    fixedStats: { bonusDefense: 30, bonusStr: 10, bonusHP: 20 },
  },
  {
    baseType: 'crown', name: "Crown of Ages", rarity: 'unique',
    fixedStats: { bonusDefense: 50, bonusHP: 40, bonusResistFire: 15, bonusResistCold: 15, bonusResistLightning: 15, bonusResistPoison: 15 },
  },
  {
    baseType: 'chainMail', name: "Spirit Shroud", rarity: 'unique',
    fixedStats: { bonusDefense: 35, bonusMana: 30, bonusManaRegen: 3, bonusResistCold: 20 },
  },
  {
    baseType: 'warAxe', name: "Butcher's Pupil", rarity: 'unique',
    fixedStats: { bonusDamageMin: 10, bonusDamageMax: 20, bonusAttackSpeed: 15, bonusHP: 25 },
  },
  {
    baseType: 'flail', name: 'The General\'s Tan Do Li Ga', rarity: 'unique',
    fixedStats: { bonusDamageMin: 5, bonusDamageMax: 15, bonusStr: 8, bonusDex: 8, bonusAttackSpeed: 10 },
  },
  {
    baseType: 'gothicPlate', name: "Rattlecage", rarity: 'unique',
    fixedStats: { bonusDefense: 45, bonusStr: 10, bonusHP: 35, bonusDamageMax: 8 },
  },
];

// Set items (D2 style)
export const SET_ITEMS = [
  {
    setName: "Civerb's Vestments", pieces: [
      { baseType: 'amulet', name: "Civerb's Icon", fixedStats: { bonusHPRegen: 3, bonusMana: 20 } },
      { baseType: 'largeShield', name: "Civerb's Ward", fixedStats: { bonusDefense: 15, bonusHP: 25 } },
    ],
    fullBonus: { bonusStr: 15, bonusHP: 50 },
  },
  {
    setName: "Isenhart's Armory", pieces: [
      { baseType: 'broadSword', name: "Isenhart's Lightbrand", fixedStats: { bonusDamageMin: 5, bonusDamageMax: 10, bonusAttackSpeed: 10 } },
      { baseType: 'chainMail', name: "Isenhart's Case", fixedStats: { bonusDefense: 20, bonusHP: 30 } },
    ],
    fullBonus: { bonusDex: 10, bonusStr: 10, bonusAttackSpeed: 20 },
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
