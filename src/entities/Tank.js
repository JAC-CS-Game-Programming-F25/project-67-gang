import Enemy from "./Enemy.js";

export default class Tank extends Enemy {
	constructor(x, y) {
		super(x, y, 45, 45);
		
		this.health = 60;
		this.maxHealth = 60;
		this.speed = 60;
		this.damage = 20;
		this.coinValue = 10;
		this.color = '#ff6600'; // Orange
	}

	update(dt, player) {
		this.chasePlayer(player, dt);
		super.update(dt);
	}
}