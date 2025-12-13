import Enemy from "./Enemy.js";

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
		} else {
			this.health = 25;
			this.maxHealth = 25;
			this.speed = 90;
			this.damage = 12;
			this.coinValue = 7;
		}
		
		this.color = '#00ff00'; // Green
		this.canSplit = !isSmall; // Only big ones split
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