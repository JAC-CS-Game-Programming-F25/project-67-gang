import Enemy from "./Enemy.js";

export default class Drone extends Enemy {
	constructor(x, y) {
		super(x, y, 30, 30);
		
		this.health = 30;
		this.maxHealth = 30;
		this.speed = 120;
		this.damage = 10;
		this.coinValue = 5;
		this.color = '#ff00ff'; // Magenta
	}

	update(dt, player) {
		this.chasePlayer(player, dt);
		super.update(dt);
	}
}