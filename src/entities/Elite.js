import Enemy from "./Enemy.js";
import { context } from "../globals.js";

export default class Elite extends Enemy {
	constructor(x, y) {
		super(x, y, 40, 40);
		
		this.health = 50;
		this.maxHealth = 50;
		this.speed = 150; // Very fast!
		this.damage = 25; // High damage
		this.coinValue = 15;
		this.color = '#ffaa00'; // Gold/orange
	}

	update(dt, player) {
		this.chasePlayer(player, dt);
		super.update(dt);
	}

	render() {
		// Draw as diamond shape (elite)
		const centerX = this.position.x + this.dimensions.x / 2;
		const centerY = this.position.y + this.dimensions.y / 2;
		const size = this.dimensions.x / 2;
		
		context.save();
		
		context.fillStyle = this.color;
		context.beginPath();
		context.moveTo(centerX, centerY - size); // Top
		context.lineTo(centerX + size, centerY); // Right
		context.lineTo(centerX, centerY + size); // Bottom
		context.lineTo(centerX - size, centerY); // Left
		context.closePath();
		context.fill();
		
		// Outline
		context.strokeStyle = '#ffffff';
		context.lineWidth = 2;
		context.stroke();
		
		context.restore();

		// Health bar
		this.renderHealthBar();
	}
}