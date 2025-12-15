import Enemy from "./Enemy.js";
import SpriteManager from "../services/SpriteManager.js";

export default class Tank extends Enemy {
	constructor(x, y) {
		super(x, y, 45, 45);
		
		this.health = 60;
		this.maxHealth = 60;
		this.speed = 60;
		this.damage = 20;
		this.coinValue = 10;
		this.color = '#ff6600'; // Orange fallback
		
		// Sprite configuration - larger, bulkier enemy
		this.spriteName = SpriteManager.sprites.enemies.tank;
		this.spriteWidth = 55;
		this.spriteHeight = 55;
		this.glowColor = '#ff6600';
	}

	update(dt, player) {
		this.chasePlayer(player, dt);
		super.update(dt);
	}
}
