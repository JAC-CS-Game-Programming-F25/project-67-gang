import Fonts from '../lib/Fonts.js';
import Images from '../lib/Images.js';
import Sounds from '../lib/Sounds.js';
import StateMachine from '../lib/StateMachine.js';
import Timer from '../lib/Timer.js';
import Input from '../lib/Input.js';

export const canvas = document.createElement('canvas');
export const context =
	canvas.getContext('2d') || new CanvasRenderingContext2D();

// Game dimensions
export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;

const resizeCanvas = () => {
	const scaleX = window.innerWidth / CANVAS_WIDTH;
	const scaleY = window.innerHeight / CANVAS_HEIGHT;
	const scale = Math.min(scaleX, scaleY);

	canvas.style.width = `${CANVAS_WIDTH * scale}px`;
	canvas.style.height = `${CANVAS_HEIGHT * scale}px`;
};

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

export const keys = {};
export const images = new Images(context);
export const fonts = new Fonts();
export const stateMachine = new StateMachine();
export const timer = new Timer();
export const input = new Input(canvas);
export const sounds = new Sounds();

// Game-specific constants
export const PLAYER_SPEED = 200;
export const PLAYER_MAX_HEALTH = 100;
export const BULLET_SPEED = 400;
export const BULLET_DAMAGE = 10;

// Global game stats
export const stats = {
	coins: 0,
	wave: 1,
	kills: 0,
	healthUpgrades: 0,
	damageUpgrades: 0
};

export function resetStats() {
	stats.coins = 0;
	stats.wave = 1;
	stats.kills = 0;
}

export function addCoins(amount) {
	stats.coins += amount;
}

export function spendCoins(amount) {
	if (stats.coins >= amount) {
		stats.coins -= amount;
		return true;
	}
	return false;
}
// localStorage for high scores
export function saveHighScore(wave, kills, coins) {
	const currentBest = getHighScore();
	
	if (wave > currentBest.wave || 
	    (wave === currentBest.wave && kills > currentBest.kills)) {
		const highScore = { wave, kills, coins };
		localStorage.setItem('neonOnslaughtHighScore', JSON.stringify(highScore));
		return true; // New high score!
	}
	return false;
}

export function getHighScore() {
	const saved = localStorage.getItem('neonOnslaughtHighScore');
	if (saved) {
		return JSON.parse(saved);
	}
	return { wave: 0, kills: 0, coins: 0 };
}
// Full game state save/load
export function saveGameState(player, currentWave) {
	const gameState = {
		player: {
			x: player.position.x,
			y: player.position.y,
			health: player.health,
			maxHealth: player.maxHealth
		},
		currentWave: currentWave,
		stats: {
			coins: stats.coins,
			kills: stats.kills,
			healthUpgrades: stats.healthUpgrades,
			damageUpgrades: stats.damageUpgrades
		},
		timestamp: Date.now()
	};
	
	localStorage.setItem('neonOnslaughtSaveGame', JSON.stringify(gameState));
	console.log('Game saved!');
}

export function loadGameState() {
	const saved = localStorage.getItem('neonOnslaughtSaveGame');
	if (saved) {
		return JSON.parse(saved);
	}
	return null;
}

export function deleteSaveGame() {
	localStorage.removeItem('neonOnslaughtSaveGame');
	console.log('Save game deleted');
}

export function hasSaveGame() {
	return localStorage.getItem('neonOnslaughtSaveGame') !== null;
}