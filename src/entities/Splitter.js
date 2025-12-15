import Enemy from "./Enemy.js";
import SpriteManager from "../services/SpriteManager.js";

export default class Splitter extends Enemy {
	constructor(x, y, isSmall = false) {
		const size = isSmall ? 20 : 35;
		super(x, y, size, size);
		
		this.isSmall = isSmall;
		
		if (isSmall) {
			this.health = 15;
			this.maxHealth = 15;
			this.speed = 150; // Faster when small
			this.damage = 5;
			this.coinValue = 3;
			// Smaller sprite for split versions
			this.spriteWidth = 28;
			this.spriteHeight = 28;
		} else {
			this.health = 25;
			this.maxHealth = 25;
			this.speed = 90;
			this.damage = 12;
			this.coinValue = 7;
			// Normal sprite size
			this.spriteWidth = 45;
			this.spriteHeight = 45;
		}
		
		this.color = '#00ff00'; // Green fallback
		this.canSplit = !isSmall; // Only big ones split
		
		// Sprite configuration - insectoid style for organic splitter
		this.spriteName = SpriteManager.sprites.enemies.splitter;
		this.glowColor = '#44ff44';
	}

	update(dt, player) {
		this.chasePlayer(player, dt);
		super.update(dt);
	}

	onDeath() {
		super.onDeath();
		// Signal that this enemy should split (PlayState will handle spawning)
		this.shouldSplit = this.canSplit;
	}
}
