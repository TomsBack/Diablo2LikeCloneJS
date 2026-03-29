export class InputManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseWorldX = 0;
    this.mouseWorldY = 0;
    this.leftClick = null;
    this.rightClick = null;
    this.keysDown = new Set();
    this.keysPressed = new Set();
    this.keysReleased = new Set();
    this._pendingPressed = new Set();
    this._pendingReleased = new Set();
    this._pendingLeftClick = null;
    this._pendingRightClick = null;

    this._bindEvents();
  }

  _bindEvents() {
    this.canvas.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });

    const handleMouseDown = (e) => {
      e.preventDefault();
      if (e.button === 0) this._pendingLeftClick = { x: e.clientX, y: e.clientY };
      if (e.button === 2) this._pendingRightClick = { x: e.clientX, y: e.clientY };
    };
    this.canvas.addEventListener('mousedown', handleMouseDown);
    // Also handle click for compatibility with automation tools
    this.canvas.addEventListener('click', (e) => {
      if (!this._pendingLeftClick) {
        this._pendingLeftClick = { x: e.clientX, y: e.clientY };
      }
    });

    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      this.keysDown.add(e.code);
      this._pendingPressed.add(e.code);
    });

    window.addEventListener('keyup', (e) => {
      this.keysDown.delete(e.code);
      this._pendingReleased.add(e.code);
    });
  }

  update(camera) {
    this.keysPressed = new Set(this._pendingPressed);
    this.keysReleased = new Set(this._pendingReleased);
    this._pendingPressed.clear();
    this._pendingReleased.clear();

    this.leftClick = this._pendingLeftClick;
    this.rightClick = this._pendingRightClick;
    this._pendingLeftClick = null;
    this._pendingRightClick = null;

    if (camera) {
      const world = camera.screenToWorld(this.mouseX, this.mouseY);
      this.mouseWorldX = world.x;
      this.mouseWorldY = world.y;
    }
  }

  isKeyDown(code) {
    return this.keysDown.has(code);
  }

  wasKeyPressed(code) {
    return this.keysPressed.has(code);
  }

  wasKeyReleased(code) {
    return this.keysReleased.has(code);
  }

  isMovingCamera() {
    return this.isKeyDown('ArrowUp') || this.isKeyDown('ArrowDown') ||
           this.isKeyDown('ArrowLeft') || this.isKeyDown('ArrowRight') ||
           this.isKeyDown('KeyW') || this.isKeyDown('KeyS') ||
           this.isKeyDown('KeyA') || this.isKeyDown('KeyD');
  }
}
