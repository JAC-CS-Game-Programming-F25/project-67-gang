import Enemy from "./Enemy.js";
import SpriteManager from "../services/SpriteManager.js";

export default class Drone extends Enemy {
	constructor(x, y) {
		super(x, y, 30, 30);
		
		this.health = 30;
		this.maxHealth = 30;
		this.speed = 120;
		this.damage = 10;
		this.coinValue = 5;
		this.color = '#ff00ff'; // Magenta fallback
		
		// Sprite configuration
		this.spriteName = SpriteManager.sprites.enemies.drone;
		this.spriteWidth = 40;
		this.spriteHeight = 40;
		this.glowColor = '#ff4444';
	}

	update(dt, player) {
		this.chasePlayer(player, dt);
		super.update(dt);
	}
}
