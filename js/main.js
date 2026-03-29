import { Game } from './core/Game.js';

const canvas = document.getElementById('gameCanvas');
const game = new Game(canvas);
window.__game = game; // expose for debugging
game.start();
