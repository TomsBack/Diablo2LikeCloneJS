// A* pathfinding with binary heap priority queue

class MinHeap {
  constructor() {
    this.data = [];
  }

  push(item) {
    this.data.push(item);
    this._bubbleUp(this.data.length - 1);
  }

  pop() {
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length > 0) {
      this.data[0] = last;
      this._sinkDown(0);
    }
    return top;
  }

  get size() { return this.data.length; }

  _bubbleUp(i) {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.data[i].f < this.data[parent].f) {
        [this.data[i], this.data[parent]] = [this.data[parent], this.data[i]];
        i = parent;
      } else break;
    }
  }

  _sinkDown(i) {
    const len = this.data.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < len && this.data[left].f < this.data[smallest].f) smallest = left;
      if (right < len && this.data[right].f < this.data[smallest].f) smallest = right;
      if (smallest !== i) {
        [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
        i = smallest;
      } else break;
    }
  }
}

const DIRS = [
  { x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 },
  { x: 1, y: -1 }, { x: 1, y: 1 }, { x: -1, y: 1 }, { x: -1, y: -1 },
];

const SQRT2 = Math.SQRT2;
const MAX_NODES = 2000;

export function findPath(tileMap, startX, startY, endX, endY) {
  if (!tileMap.isWalkable(endX, endY)) {
    // Try to find nearest walkable tile
    const nearest = findNearestWalkable(tileMap, endX, endY);
    if (!nearest) return null;
    endX = nearest.x;
    endY = nearest.y;
  }

  if (startX === endX && startY === endY) return [];

  const open = new MinHeap();
  const closed = new Set();
  const gScores = new Map();
  const parents = new Map();

  const key = (x, y) => y * tileMap.width + x;
  const startKey = key(startX, startY);

  open.push({ x: startX, y: startY, f: 0, g: 0 });
  gScores.set(startKey, 0);

  let nodesExplored = 0;

  while (open.size > 0 && nodesExplored < MAX_NODES) {
    const current = open.pop();
    const ck = key(current.x, current.y);

    if (current.x === endX && current.y === endY) {
      return reconstructPath(parents, current.x, current.y, startX, startY, tileMap.width);
    }

    if (closed.has(ck)) continue;
    closed.add(ck);
    nodesExplored++;

    for (const dir of DIRS) {
      const nx = current.x + dir.x;
      const ny = current.y + dir.y;

      if (!tileMap.isWalkable(nx, ny)) continue;

      const nk = key(nx, ny);
      if (closed.has(nk)) continue;

      // Prevent diagonal movement through corners
      const isDiagonal = dir.x !== 0 && dir.y !== 0;
      if (isDiagonal) {
        if (!tileMap.isWalkable(current.x + dir.x, current.y) ||
            !tileMap.isWalkable(current.x, current.y + dir.y)) {
          continue;
        }
      }

      const moveCost = isDiagonal ? SQRT2 : 1;
      const ng = current.g + moveCost;

      if (!gScores.has(nk) || ng < gScores.get(nk)) {
        gScores.set(nk, ng);
        parents.set(nk, ck);
        const h = octileDistance(nx, ny, endX, endY);
        open.push({ x: nx, y: ny, f: ng + h, g: ng });
      }
    }
  }

  return null; // No path found
}

function octileDistance(x1, y1, x2, y2) {
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  return Math.max(dx, dy) + (SQRT2 - 1) * Math.min(dx, dy);
}

function reconstructPath(parents, endX, endY, startX, startY, mapWidth) {
  const path = [];
  let ck = endY * mapWidth + endX;
  const startKey = startY * mapWidth + startX;

  while (ck !== startKey) {
    const x = ck % mapWidth;
    const y = Math.floor(ck / mapWidth);
    path.unshift({ x, y });
    ck = parents.get(ck);
    if (ck === undefined) return null;
  }

  return path;
}

export function findNearestWalkable(tileMap, x, y, maxRadius = 5) {
  for (let r = 1; r <= maxRadius; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
        if (tileMap.isWalkable(x + dx, y + dy)) {
          return { x: x + dx, y: y + dy };
        }
      }
    }
  }
  return null;
}

export function hasLineOfSight(tileMap, x1, y1, x2, y2) {
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  const sx = x1 < x2 ? 1 : -1;
  const sy = y1 < y2 ? 1 : -1;
  let err = dx - dy;
  let cx = x1;
  let cy = y1;

  while (cx !== x2 || cy !== y2) {
    if (!tileMap.isTransparent(cx, cy) && !(cx === x1 && cy === y1)) return false;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; cx += sx; }
    if (e2 < dx) { err += dx; cy += sy; }
  }
  return true;
}
