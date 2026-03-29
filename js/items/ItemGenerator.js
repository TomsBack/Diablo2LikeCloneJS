import { RARITY, RARITY_DROP_WEIGHTS } from '../core/Constants.js';
import { randomInt, randomChoice, weightedRandom } from '../utils/MathUtils.js';
import { BASE_ITEMS, PREFIXES, SUFFIXES, UNIQUE_ITEMS, getBaseItemsByLevel } from './ItemDatabase.js';

let nextItemId = 1;

export class ItemGenerator {
  static generateItem(itemLevel, forcedRarity = null) {
    const rarity = forcedRarity || weightedRandom(RARITY_DROP_WEIGHTS);

    // For unique items, try to find a matching unique
    if (rarity === RARITY.UNIQUE) {
      const unique = this._tryGenerateUnique(itemLevel);
      if (unique) return unique;
      // Fall back to rare if no unique available
      return this.generateItem(itemLevel, RARITY.RARE);
    }

    // Pick a base item appropriate for the level
    const candidates = getBaseItemsByLevel(itemLevel + 3);
    if (candidates.length === 0) return this._generatePotion(itemLevel);

    const base = randomChoice(candidates);
    return this._buildItem(base, rarity, itemLevel);
  }

  static generatePotion(itemLevel) {
    return this._generatePotion(itemLevel);
  }

  static _generatePotion(itemLevel) {
    const isHealth = Math.random() < 0.5;
    const isGreater = itemLevel >= 8 && Math.random() < 0.5;

    let baseId;
    if (isHealth) {
      baseId = isGreater ? 'greaterHealthPotion' : 'healthPotion';
    } else {
      baseId = isGreater ? 'greaterManaPotion' : 'manaPotion';
    }

    const base = BASE_ITEMS.find(b => b.id === baseId);
    return {
      id: nextItemId++,
      ...base,
      baseType: base.id,
      rarity: RARITY.NORMAL,
      affixes: [],
      stats: {},
    };
  }

  static _buildItem(base, rarity, itemLevel) {
    const item = {
      id: nextItemId++,
      baseType: base.id,
      name: base.name,
      slot: base.slot,
      gridW: base.gridW,
      gridH: base.gridH,
      rarity,
      reqLevel: base.reqLevel,
      reqStr: base.reqStr || 0,
      reqDex: base.reqDex || 0,
      color: base.color,
      isRanged: base.isRanged || false,
      subType: base.subType || null,
      healAmount: base.healAmount || 0,

      // Base stats
      damageMin: base.damageMin || 0,
      damageMax: base.damageMax || 0,
      defense: base.defense || 0,
      blockChance: base.blockChance || 0,

      // Affix stats
      stats: {},
      affixes: [],
    };

    // Copy base bonus stats
    if (base.bonusEnergy) item.stats.bonusEnergy = base.bonusEnergy;
    if (base.attackSpeed) item.stats.bonusAttackSpeed = base.attackSpeed;

    // Add affixes based on rarity
    if (rarity === RARITY.MAGIC) {
      this._addAffixes(item, 1, 2, itemLevel);
    } else if (rarity === RARITY.RARE) {
      this._addAffixes(item, 3, 6, itemLevel);
      item.name = this._generateRareName(base.name);
    }

    return item;
  }

  static _addAffixes(item, minCount, maxCount, itemLevel) {
    const count = randomInt(minCount, maxCount);
    const usedPrefixes = new Set();
    const usedSuffixes = new Set();
    let prefixCount = 0;
    let suffixCount = 0;

    for (let i = 0; i < count; i++) {
      const usePrefix = prefixCount <= suffixCount && Math.random() < 0.5;

      if (usePrefix) {
        const available = PREFIXES.filter(p =>
          !usedPrefixes.has(p.name) &&
          (!p.slots || p.slots.includes(item.slot))
        );
        if (available.length > 0) {
          const prefix = randomChoice(available);
          usedPrefixes.add(prefix.name);
          const scaledMin = Math.floor(prefix.min * (1 + itemLevel * 0.1));
          const scaledMax = Math.floor(prefix.max * (1 + itemLevel * 0.1));
          const value = randomInt(scaledMin, scaledMax);
          item.stats[prefix.stat] = (item.stats[prefix.stat] || 0) + value;
          item.affixes.push({ name: prefix.name, stat: prefix.stat, value });
          prefixCount++;

          if (item.rarity === RARITY.MAGIC && prefixCount === 1) {
            item.name = `${prefix.name} ${item.name}`;
          }
        }
      } else {
        const available = SUFFIXES.filter(s => !usedSuffixes.has(s.name));
        if (available.length > 0) {
          const suffix = randomChoice(available);
          usedSuffixes.add(suffix.name);
          const scaledMin = Math.floor(suffix.min * (1 + itemLevel * 0.1));
          const scaledMax = Math.floor(suffix.max * (1 + itemLevel * 0.1));
          const value = randomInt(scaledMin, scaledMax);
          item.stats[suffix.stat] = (item.stats[suffix.stat] || 0) + value;
          item.affixes.push({ name: suffix.name, stat: suffix.stat, value });
          suffixCount++;

          if (item.rarity === RARITY.MAGIC && suffixCount === 1) {
            item.name = `${item.name} ${suffix.name}`;
          }
        }
      }
    }
  }

  static _tryGenerateUnique(itemLevel) {
    const available = UNIQUE_ITEMS.filter(u => {
      const base = BASE_ITEMS.find(b => b.id === u.baseType);
      return base && base.reqLevel <= itemLevel + 5;
    });

    if (available.length === 0) return null;

    const uniqueDef = randomChoice(available);
    const base = BASE_ITEMS.find(b => b.id === uniqueDef.baseType);

    const item = {
      id: nextItemId++,
      baseType: base.id,
      name: uniqueDef.name,
      slot: base.slot,
      gridW: base.gridW,
      gridH: base.gridH,
      rarity: RARITY.UNIQUE,
      reqLevel: base.reqLevel,
      reqStr: base.reqStr || 0,
      reqDex: base.reqDex || 0,
      color: base.color,
      isRanged: base.isRanged || false,

      damageMin: base.damageMin || 0,
      damageMax: base.damageMax || 0,
      defense: base.defense || 0,
      blockChance: base.blockChance || 0,

      stats: { ...uniqueDef.fixedStats },
      affixes: Object.entries(uniqueDef.fixedStats).map(([stat, value]) => ({
        name: stat, stat, value,
      })),
    };

    return item;
  }

  static _generateRareName(baseName) {
    const prefixes = [
      'Grim', 'Storm', 'Shadow', 'Blood', 'Soul', 'Death', 'Dark',
      'Doom', 'Wrath', 'Chaos', 'Bone', 'Viper', 'Havoc', 'Rune',
    ];
    const suffixes = [
      'Bane', 'Song', 'Ward', 'Mark', 'Fang', 'Brow', 'Gaze',
      'Roar', 'Bite', 'Star', 'Wind', 'Grasp', 'Thirst', 'Touch',
    ];
    return `${randomChoice(prefixes)}${randomChoice(suffixes)}`;
  }

  static generateLoot(monsterLevel, isBoss = false) {
    const drops = [];

    // Gold
    const goldAmount = randomInt(
      monsterLevel * 3,
      monsterLevel * 10 * (isBoss ? 5 : 1)
    );
    drops.push({ type: 'gold', amount: goldAmount });

    // Item drop chance
    const dropChance = isBoss ? 1.0 : 0.3;
    if (Math.random() < dropChance) {
      const item = this.generateItem(monsterLevel, isBoss ? RARITY.RARE : null);
      drops.push({ type: 'item', item });
    }

    // Boss always drops another item
    if (isBoss && Math.random() < 0.5) {
      const bonusItem = this.generateItem(monsterLevel);
      drops.push({ type: 'item', item: bonusItem });
    }

    // Potion drop
    if (Math.random() < 0.25) {
      drops.push({ type: 'item', item: this.generatePotion(monsterLevel) });
    }

    return drops;
  }
}

export const STAT_DISPLAY_NAMES = {
  bonusDamageMin: '+%d Min Damage',
  bonusDamageMax: '+%d Max Damage',
  bonusDefense: '+%d Defense',
  bonusStr: '+%d Strength',
  bonusDex: '+%d Dexterity',
  bonusVit: '+%d Vitality',
  bonusEnergy: '+%d Energy',
  bonusHP: '+%d Life',
  bonusMana: '+%d Mana',
  bonusHPRegen: '+%d Life Regen/sec',
  bonusManaRegen: '+%d Mana Regen/sec',
  bonusAttackSpeed: '+%d% Attack Speed',
  bonusMoveSpeed: '+%d% Move Speed',
  bonusFireDamage: '+%d Fire Damage',
  bonusColdDamage: '+%d Cold Damage',
  bonusLightningDamage: '+%d Lightning Damage',
  bonusPoisonDamage: '+%d Poison Damage',
  bonusResistFire: '+%d% Fire Resistance',
  bonusResistCold: '+%d% Cold Resistance',
  bonusResistLightning: '+%d% Lightning Resistance',
  bonusResistPoison: '+%d% Poison Resistance',
};
