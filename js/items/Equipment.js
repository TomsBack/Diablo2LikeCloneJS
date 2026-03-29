export class Equipment {
  constructor() {
    this.slots = {
      weapon: null,
      helmet: null,
      armor: null,
      shield: null,
      boots: null,
      gloves: null,
      belt: null,
      ring1: null,
      ring2: null,
      amulet: null,
    };
  }

  equip(item, slotOverride = null) {
    let slot = slotOverride || item.slot;

    // Handle ring slots
    if (item.slot === 'ring') {
      if (!this.slots.ring1) slot = 'ring1';
      else if (!this.slots.ring2) slot = 'ring2';
      else slot = 'ring1';
    }

    const previousItem = this.slots[slot];
    this.slots[slot] = item;
    return previousItem;
  }

  unequip(slot) {
    const item = this.slots[slot];
    this.slots[slot] = null;
    return item;
  }

  getItem(slot) {
    return this.slots[slot];
  }

  getSlotForItem(item) {
    if (item.slot === 'ring') {
      if (!this.slots.ring1) return 'ring1';
      if (!this.slots.ring2) return 'ring2';
      return 'ring1';
    }
    return item.slot;
  }

  getAllEquipped() {
    return Object.entries(this.slots)
      .filter(([, item]) => item !== null)
      .map(([slot, item]) => ({ slot, item }));
  }

  calculateBonuses() {
    const bonuses = {
      bonusStr: 0, bonusDex: 0, bonusVit: 0, bonusEnergy: 0,
      bonusHP: 0, bonusMana: 0, bonusDamageMin: 0, bonusDamageMax: 0,
      bonusDefense: 0, bonusAttackSpeed: 0, bonusMoveSpeed: 0,
      bonusHPRegen: 0, bonusManaRegen: 0,
      bonusFireDamage: 0, bonusColdDamage: 0,
      bonusLightningDamage: 0, bonusPoisonDamage: 0,
    };

    for (const [, item] of Object.entries(this.slots)) {
      if (!item) continue;

      // Base item defense/damage bonuses
      if (item.defense) bonuses.bonusDefense += item.defense;
      if (item.damageMin) bonuses.bonusDamageMin += item.damageMin;
      if (item.damageMax) bonuses.bonusDamageMax += item.damageMax;

      // Affix stats
      if (item.stats) {
        for (const [stat, value] of Object.entries(item.stats)) {
          if (stat in bonuses) {
            bonuses[stat] += value;
          }
        }
      }
    }

    return bonuses;
  }

  applyBonuses(player) {
    const bonuses = this.calculateBonuses();
    player.bonusStr = bonuses.bonusStr;
    player.bonusDex = bonuses.bonusDex;
    player.bonusVit = bonuses.bonusVit;
    player.bonusEnergy = bonuses.bonusEnergy;
    player.bonusHP = bonuses.bonusHP;
    player.bonusMana = bonuses.bonusMana;
    player.bonusDamageMin = bonuses.bonusDamageMin;
    player.bonusDamageMax = bonuses.bonusDamageMax;
    player.bonusDefense = bonuses.bonusDefense;
    player.bonusAttackSpeed = bonuses.bonusAttackSpeed;
    player.bonusMoveSpeed = bonuses.bonusMoveSpeed;
    player.bonusHPRegen = bonuses.bonusHPRegen;
    player.bonusManaRegen = bonuses.bonusManaRegen;
    player.bonusFireDamage = bonuses.bonusFireDamage;
    player.bonusColdDamage = bonuses.bonusColdDamage;
    player.bonusLightningDamage = bonuses.bonusLightningDamage;
    player.bonusPoisonDamage = bonuses.bonusPoisonDamage;
    player.recalcStats();
  }

  serialize() {
    return { ...this.slots };
  }

  static deserialize(data) {
    const eq = new Equipment();
    for (const [slot, item] of Object.entries(data)) {
      eq.slots[slot] = item;
    }
    return eq;
  }
}
