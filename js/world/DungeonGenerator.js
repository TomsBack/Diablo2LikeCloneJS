import { TILE } from '../core/Constants.js';
import { TileMap } from './TileMap.js';
import { RNG } from '../utils/RNG.js';

class BSPNode {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.left = null;
    this.right = null;
    this.room = null;
  }
}

export class DungeonGenerator {
  constructor(seed) {
    this.rng = new RNG(seed);
  }

  generate(width, height, floor = 1) {
    const map = new TileMap(width, height);

    // Fill with walls
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        map.set(x, y, TILE.WALL);
      }
    }

    // BSP split
    const root = new BSPNode(1, 1, width - 2, height - 2);
    this._split(root, 0);

    // Create rooms in leaf nodes
    const leaves = [];
    this._getLeaves(root, leaves);

    for (const leaf of leaves) {
      this._createRoom(map, leaf);
    }

    // Connect rooms through the BSP tree
    this._connect(map, root);

    // Place stairs
    const rooms = map.rooms;
    if (rooms.length >= 2) {
      // Stairs up in first room (entrance)
      const startRoom = rooms[0];
      const stairUpX = Math.floor(startRoom.x + startRoom.w / 2);
      const stairUpY = Math.floor(startRoom.y + startRoom.h / 2);
      map.set(stairUpX, stairUpY, TILE.STAIRS_UP);
      map.stairsUp = { x: stairUpX, y: stairUpY };

      // Stairs down in last room (furthest from start)
      const endRoom = rooms[rooms.length - 1];
      const stairDownX = Math.floor(endRoom.x + endRoom.w / 2);
      const stairDownY = Math.floor(endRoom.y + endRoom.h / 2);
      map.set(stairDownX, stairDownY, TILE.STAIRS_DOWN);
      map.stairsDown = { x: stairDownX, y: stairDownY };
    }

    // Spawn points for monsters (floor tiles in rooms, excluding stairs)
    map.spawnPoints = [];
    for (const room of rooms) {
      for (let y = room.y + 1; y < room.y + room.h - 1; y++) {
        for (let x = room.x + 1; x < room.x + room.w - 1; x++) {
          if (map.get(x, y) === TILE.FLOOR) {
            map.spawnPoints.push({ x, y, room });
          }
        }
      }
    }

    // Mark a boss room on certain floors
    if (floor % 4 === 0 && rooms.length > 2) {
      const bossRoom = rooms[rooms.length - 2];
      bossRoom.isBossRoom = true;
      map.bossRoom = bossRoom;
    }

    map.floor = floor;
    return map;
  }

  generateTown() {
    const width = 40;
    const height = 40;
    const map = new TileMap(width, height);

    // Fill with void
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        map.set(x, y, TILE.VOID);
      }
    }

    // Town square
    for (let y = 8; y < 32; y++) {
      for (let x = 8; x < 32; x++) {
        map.set(x, y, TILE.TOWN_FLOOR);
      }
    }

    // Buildings (walls)
    this._placeBuilding(map, 10, 10, 6, 5);
    this._placeBuilding(map, 24, 10, 6, 5);
    this._placeBuilding(map, 10, 25, 6, 5);

    // Fountain/decoration in center
    for (let y = 18; y < 22; y++) {
      for (let x = 18; x < 22; x++) {
        map.set(x, y, TILE.WATER);
      }
    }

    // Portal to dungeon
    map.set(20, 28, TILE.STAIRS_DOWN);
    map.stairsDown = { x: 20, y: 28 };

    // Explore entire town by default
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (map.get(x, y) !== TILE.VOID) {
          map.setExplored(x, y);
          map.setVisible(x, y, true);
        }
      }
    }

    // NPC positions
    map.npcPositions = {
      merchant: { x: 12, y: 16 },
      stash: { x: 26, y: 16 },
      healer: { x: 12, y: 23 },
    };

    // Player start position (south of fountain)
    map.playerStart = { x: 20, y: 24 };
    map.isTown = true;
    map.floor = 0;

    // Add rooms for the town (just the main square for compatibility)
    map.rooms = [{ x: 8, y: 8, w: 24, h: 24 }];
    map.spawnPoints = [];

    return map;
  }

  _placeBuilding(map, x, y, w, h) {
    for (let by = y; by < y + h; by++) {
      for (let bx = x; bx < x + w; bx++) {
        map.set(bx, by, TILE.TOWN_BUILDING);
      }
    }
    // Door
    map.set(x + Math.floor(w / 2), y + h - 1, TILE.TOWN_FLOOR);
  }

  _split(node, depth) {
    const minSize = 10;
    const maxDepth = 5;

    if (depth >= maxDepth) return;
    if (node.w < minSize * 2 && node.h < minSize * 2) return;

    // Choose split direction
    let splitH;
    if (node.w < minSize * 2) splitH = true;
    else if (node.h < minSize * 2) splitH = false;
    else splitH = this.rng.nextBool();

    if (splitH) {
      if (node.h < minSize * 2) return;
      const split = this.rng.nextInt(minSize, node.h - minSize);
      node.left = new BSPNode(node.x, node.y, node.w, split);
      node.right = new BSPNode(node.x, node.y + split, node.w, node.h - split);
    } else {
      if (node.w < minSize * 2) return;
      const split = this.rng.nextInt(minSize, node.w - minSize);
      node.left = new BSPNode(node.x, node.y, split, node.h);
      node.right = new BSPNode(node.x + split, node.y, node.w - split, node.h);
    }

    this._split(node.left, depth + 1);
    this._split(node.right, depth + 1);
  }

  _getLeaves(node, leaves) {
    if (!node.left && !node.right) {
      leaves.push(node);
      return;
    }
    if (node.left) this._getLeaves(node.left, leaves);
    if (node.right) this._getLeaves(node.right, leaves);
  }

  _createRoom(map, node) {
    const margin = 2;
    const minRoomSize = 5;
    const maxW = node.w - margin * 2;
    const maxH = node.h - margin * 2;

    if (maxW < minRoomSize || maxH < minRoomSize) return;

    const roomW = this.rng.nextInt(minRoomSize, maxW);
    const roomH = this.rng.nextInt(minRoomSize, maxH);
    const roomX = node.x + margin + this.rng.nextInt(0, maxW - roomW);
    const roomY = node.y + margin + this.rng.nextInt(0, maxH - roomH);

    const room = { x: roomX, y: roomY, w: roomW, h: roomH };
    node.room = room;
    map.rooms.push(room);

    for (let y = roomY; y < roomY + roomH; y++) {
      for (let x = roomX; x < roomX + roomW; x++) {
        map.set(x, y, TILE.FLOOR);
      }
    }
  }

  _getRoomCenter(node) {
    if (node.room) {
      return {
        x: Math.floor(node.room.x + node.room.w / 2),
        y: Math.floor(node.room.y + node.room.h / 2),
      };
    }
    if (node.left) return this._getRoomCenter(node.left);
    if (node.right) return this._getRoomCenter(node.right);
    return { x: Math.floor(node.x + node.w / 2), y: Math.floor(node.y + node.h / 2) };
  }

  _connect(map, node) {
    if (!node.left || !node.right) return;

    this._connect(map, node.left);
    this._connect(map, node.right);

    const a = this._getRoomCenter(node.left);
    const b = this._getRoomCenter(node.right);

    // L-shaped corridor
    if (this.rng.nextBool()) {
      this._carveHorizontal(map, a.x, b.x, a.y);
      this._carveVertical(map, a.y, b.y, b.x);
    } else {
      this._carveVertical(map, a.y, b.y, a.x);
      this._carveHorizontal(map, a.x, b.x, b.y);
    }
  }

  _carveHorizontal(map, x1, x2, y) {
    const start = Math.min(x1, x2);
    const end = Math.max(x1, x2);
    for (let x = start; x <= end; x++) {
      if (map.get(x, y) === TILE.WALL) {
        map.set(x, y, TILE.FLOOR);
      }
      // Ensure walls on either side
      if (map.get(x, y - 1) === TILE.VOID) map.set(x, y - 1, TILE.WALL);
      if (map.get(x, y + 1) === TILE.VOID) map.set(x, y + 1, TILE.WALL);
    }
  }

  _carveVertical(map, y1, y2, x) {
    const start = Math.min(y1, y2);
    const end = Math.max(y1, y2);
    for (let y = start; y <= end; y++) {
      if (map.get(x, y) === TILE.WALL) {
        map.set(x, y, TILE.FLOOR);
      }
      if (map.get(x - 1, y) === TILE.VOID) map.set(x - 1, y, TILE.WALL);
      if (map.get(x + 1, y) === TILE.VOID) map.set(x + 1, y, TILE.WALL);
    }
  }
}
