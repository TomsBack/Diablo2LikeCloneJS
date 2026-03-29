# Dark Wanderer - Diablo 2 Browser Clone

## Project Overview

A browser-based Diablo 2 tribute game built in vanilla JavaScript with Vite. All visuals are procedurally generated on HTML5 Canvas (no sprite assets). Audio uses Web Audio API synthesis. Runs from `index.html` with ES modules.

## Diablo 2 Reference

A Diablo 2 installation is available for reference at: `C:\Games\Diablo II\`

Key data files for game balance and mechanics are in: `C:\Games\Diablo II\Mod PlugY\data\global\excel\`

Important reference files:
- `Experience.txt` - XP curve per level (500 for lv1, exponential to 3.84M for lv99)
- `DifficultyLevels.txt` - Normal/Nightmare/Hell resist penalties, monster skill bonuses, steal divisors
- `ItemRatio.txt` - Unique/Rare/Set/Magic drop rate formulas (ratio - monsterLevel / divisor)
- `MonStats.txt` (736 lines) - All monster stats, AI, HP, damage, resistances across difficulties
- `Weapons.txt` (308 lines), `Armor.txt` (204 lines) - Base item definitions
- `UniqueItems.txt` (403 lines) - Unique item stats and requirements
- `Skills.txt` (358 lines) - All skill definitions with progression formulas
- `TreasureClassEx.txt` (878 lines) - Loot table system
- `Runes.txt` (170 lines) - Runeword definitions
- `SetItems.txt` / `Sets.txt` - Set item and set bonus definitions
- `ElemTypes.txt` - Fire, Lightning, Cold, Poison, Magic, Life/Mana Drain, Stun, Burn, Freeze
- `Shrines.txt` - Shrine effects (Refill, Armor +100%, Combat +200% dmg, Resist +75%, Skill +2, XP +50%)

Always consult these files before changing game balance, adding items, or modifying mechanics to stay faithful to D2's design.

## Tech Stack

- Vanilla JavaScript with ES modules
- Vite dev server (`npm run dev`)
- HTML5 Canvas for game rendering
- HTML/CSS overlay for UI panels (not drawn on canvas)
- Web Audio API for procedural sound effects
- localStorage for save/load

## Architecture

```
index.html              - Entry point, canvas, HUD HTML
css/style.css           - All UI styling
js/
  main.js               - Bootstrap
  core/
    Game.js             - Main game loop, state machine, orchestrates everything
    Camera.js           - Viewport, screen/world coordinate conversion
    InputManager.js     - Mouse/keyboard event capture
    AssetGenerator.js   - Procedural sprite/tile generation (cached offscreen canvases)
    AudioManager.js     - Web Audio API procedural SFX
    SaveManager.js      - localStorage save/load
    Constants.js        - Tile size, colors, class stats, XP formula, balance values
  world/
    DungeonGenerator.js - BSP room-corridor algorithm
    TileMap.js          - 2D tile grid, collision, visibility state
    FogOfWar.js         - Raycasting FOV
    Minimap.js          - Minimap rendering
  entities/
    Entity.js           - Base class (position, render, health bar)
    Player.js           - Stats, movement, combat, leveling
    Monster.js          - AI state machine (idle/chase/attack), monster definitions
    NPC.js              - Town NPCs (merchant, stash, healer)
    Projectile.js       - Arrow, fireball, icebolt projectiles with trails
    LootDrop.js         - Ground items and gold piles
  combat/
    CombatResolver.js   - Hit chance, damage calc, crits, elemental damage
    SkillSystem.js      - Skill definitions, cooldowns, execution (melee/projectile/aoe/buff/teleport)
  items/
    ItemDatabase.js     - Base item types, affix pools (prefixes/suffixes), unique items
    ItemGenerator.js    - Random item generation with rarity and affixes
    Inventory.js        - 10x4 grid with variable-size item placement
    Equipment.js        - 10 equipment slots, stat bonus calculation
  ui/
    HUD.js              - Health/mana orbs with liquid animation, XP bar, skill bar
    InventoryPanel.js   - Inventory grid UI, equip slots, tooltips
    CharacterPanel.js   - Stats display with +/- allocation buttons
    SkillPanel.js       - Skill tree canvas with nodes and prerequisite lines
  pathfinding/
    AStar.js            - A* with binary heap, octile heuristic, 2000 node cap
  utils/
    MathUtils.js        - distance, lerp, clamp, normalize, noise, weighted random
    RNG.js              - Mulberry32 seeded PRNG
    EventBus.js         - Pub/sub event system
    ObjectPool.js       - Object pooling
```

## Game Systems

### Classes
- **Warrior**: STR 30, DEX 15, VIT 25, Energy 10. HP per VIT: 4. Melee focused.
- **Mage**: STR 10, DEX 15, VIT 15, Energy 35. Mana per Energy: 3. Spell focused.
- **Rogue**: STR 15, DEX 30, VIT 20, Energy 15. Ranged + fast melee.

### Combat
- Hit chance: `attackRating / (attackRating + targetDefense * 2)` clamped 5-95%
- Crit chance: `DEX / 20` percent, 1.5x multiplier
- Monster AI: IDLE (check aggro 8 tiles) -> CHASE (repath every 500ms) -> ATTACK -> DEAD

### Items
- Rarity weights: Normal 60%, Magic 25%, Rare 10%, Unique 5%
- Grid sizes: weapons 1x3/2x3, armor 2x3, helm/boots/gloves 2x2, belt 2x1, ring/amulet/potion 1x1
- Affixes scale with item level: `scaledValue = base * (1 + itemLevel * 0.1)`

### Progression
- XP formula: `100 * level * (level + 1) / 2`
- 5 stat points per level, 1 skill point per level (from level 2)
- Max level 30, max dungeon floor 16
- Boss every 4th floor

### Town
- Town is floor 0, always accessible via stairs up from floor 1
- NPCs: Gheed (buy potions / sell normals), Akara (full heal), Stash
- Death: respawn in town with 80% gold, half HP/mana

## Commands

- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Keybindings (In-Game)

- **Left Click**: Move / Attack / Interact / Pick up loot
- **Right Click**: Use primary skill (slot 1)
- **1-8**: Use skill in slot
- **Shift+1-4**: Use potion from belt
- **I**: Toggle inventory
- **C**: Toggle character panel
- **S**: Toggle skill tree
- **M**: Toggle audio
- **Escape**: Close all panels
