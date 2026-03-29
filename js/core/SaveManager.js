const SAVE_KEY = 'darkwanderer_save';

export class SaveManager {
  static hasSave() {
    return localStorage.getItem(SAVE_KEY) !== null;
  }

  static save(game) {
    const player = game.player;
    const data = {
      version: 1,
      timestamp: Date.now(),
      player: {
        className: player.className,
        level: player.level,
        xp: player.xp,
        hp: player.hp,
        mana: player.mana,
        baseStr: player.baseStr,
        baseDex: player.baseDex,
        baseVit: player.baseVit,
        baseEnergy: player.baseEnergy,
        addedStr: player.addedStr,
        addedDex: player.addedDex,
        addedVit: player.addedVit,
        addedEnergy: player.addedEnergy,
        statPoints: player.statPoints,
        skillPoints: player.skillPoints,
        gold: player.gold,
        skillLevels: player.skillLevels,
        equippedSkills: player.equippedSkills,
        potionBelt: player.potionBelt,
      },
      currentFloor: game.currentFloor,
      dungeonSeed: game.dungeonSeed,
      inventory: game.inventory.serialize(),
      equipment: game.equipment.serialize(),
    };

    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Save failed:', e);
      return false;
    }
  }

  static load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.error('Load failed:', e);
      return null;
    }
  }

  static deleteSave() {
    localStorage.removeItem(SAVE_KEY);
  }
}
