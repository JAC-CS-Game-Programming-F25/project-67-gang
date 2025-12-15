import Enemy from "./Enemy.js";
import SpriteManager from "../services/SpriteManager.js";
import { context } from "../globals.js";

export default class Elite extends Enemy {
	constructor(x, y) {
		super(x, y, 40, 40);
		
		this.health = 50;
		this.maxHealth = 50;
		this.speed = 150; // Very fast!
		this.damage = 25; // High damage
		this.coinValue = 15;
		this.color = '#ffaa00'; // Gold/orange fallback
		
		// Sprite configuration - Abyssal style for elite
		this.spriteName = SpriteManager.sprites.enemies.elite;
		this.spriteWidth = 50;
		this.spriteHeight = 50;
		this.glowColor = '#ff4488';
	}

	update(dt, player) {
		this.chasePlayer(player, dt);
		super.update(dt);
	}

	render() {
		const centerX = this.position.x + this.dimensions.x / 2;
		const centerY = this.position.y + this.dimensions.y / 2;

		// Check if sprite is loaded
		if (this.spriteName && SpriteManager.get(this.spriteName)) {
			// Elite enemies get a more intense glow
			context.save();
			context.globalAlpha = 0.6;
			context.shadowColor = this.glowColor;
			context.shadowBlur = 25;
			context.beginPath();
			context.arc(centerX, centerY, this.dimensions.x / 2 + 5, 0, Math.PI * 2);
			context.fillStyle = this.glowColor;
			context.fill();
			context.restore();

			// Render sprite
			SpriteManager.render(
				this.spriteName,
				centerX,
				centerY,
				this.spriteWidth,
				this.spriteHeight,
				this.rotation
			);
		} else {
			// Fallback: Draw as diamond shape
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
			
			context.strokeStyle = '#ffffff';
			context.lineWidth = 2;
			context.stroke();
			
			context.restore();
		}

		// Health bar
		this.renderHealthBar();
	}
}
