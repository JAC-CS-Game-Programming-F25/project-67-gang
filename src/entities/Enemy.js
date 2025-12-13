import GameEntity from "./GameEntity.js";
import { context, stats, addCoins } from "../globals.js";

export default class Enemy extends GameEntity {
	constructor(x, y, width, height) {
		super(x, y, width, height);
		
		this.health = 30;
		this.maxHealth = 30;
		this.speed = 100;
		this.damage = 10;
		this.coinValue = 5;
		this.color = '#ff00ff'; // Magenta by default
	}

	takeDamage(amount) {
		this.health -= amount;
		if (this.health <= 0) {
			this.health = 0;
			this.isDead = true;
			this.onDeath();
		}
	}

	onDeath() {
		stats.kills++;
	}

	chasePlayer(player, dt) {
		// Calculate direction to player
		const dx = player.position.x - this.position.x;
		const dy = player.position.y - this.position.y;
		const distance = Math.sqrt(dx * dx + dy * dy);

		if (distance > 0) {
			// Normalize and apply speed
			this.velocity.x = (dx / distance) * this.speed;
			this.velocity.y = (dy / distance) * this.speed;
		}
	}

	render() {
		// Draw enemy shape
		context.save();
		context.fillStyle = this.color;
		context.fillRect(this.position.x, this.position.y, this.dimensions.x, this.dimensions.y);
		
		// Outline
		context.strokeStyle = '#ffffff';
		context.lineWidth = 2;
		context.strokeRect(this.position.x, this.position.y, this.dimensions.x, this.dimensions.y);
		
		context.restore();

		// Health bar
		this.renderHealthBar();
	}

	renderHealthBar() {
		const barWidth = this.dimensions.x;
		const barHeight = 4;
		const barX = this.position.x;
		const barY = this.position.y - 8;

		// Background
		context.fillStyle = '#333333';
		context.fillRect(barX, barY, barWidth, barHeight);

		// Health
		const healthWidth = (this.health / this.maxHealth) * barWidth;
		context.fillStyle = '#ff0000';
		context.fillRect(barX, barY, healthWidth, barHeight);
	}
    dropCoin() {
        // Called from PlayState to create coin object
        return {
            x: this.position.x + this.dimensions.x / 2,
            y: this.position.y + this.dimensions.y / 2,
            value: this.coinValue
        };
    }
}