import Enemy from "./Enemy.js";
import SpriteManager from "../services/SpriteManager.js";
import { context } from "../globals.js";

export default class Turret extends Enemy {
	constructor(x, y) {
		super(x, y, 35, 35);
		
		this.health = 40;
		this.maxHealth = 40;
		this.speed = 0; // Doesn't move!
		this.damage = 15;
		this.coinValue = 8;
		this.color = '#ff00aa'; // Pink/magenta fallback
		
		// Sprite configuration
		this.spriteName = SpriteManager.sprites.enemies.turret;
		this.spriteWidth = 45;
		this.spriteHeight = 45;
		this.glowColor = '#ff00aa';
		this.rotation = 0; // Turrets can still rotate to face player
	}

	update(dt, player) {
		// Turret doesn't move, but rotates to face player
		if (player) {
			const dx = player.position.x - this.position.x;
			const dy = player.position.y - this.position.y;
			this.rotation = Math.atan2(dy, dx) + Math.PI / 2;
		}
		super.update(dt);
	}

	render() {
		const centerX = this.position.x + this.dimensions.x / 2;
		const centerY = this.position.y + this.dimensions.y / 2;

		// Check if sprite is loaded
		if (this.spriteName && SpriteManager.get(this.spriteName)) {
			// Glow effect underneath
			context.save();
			context.globalAlpha = 0.5;
			context.shadowColor = this.glowColor;
			context.shadowBlur = 20;
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
			// Fallback: Draw as octagon
			context.save();
			
			const radius = this.dimensions.x / 2;
			
			context.fillStyle = this.color;
			context.beginPath();
			for (let i = 0; i < 8; i++) {
				const angle = (Math.PI * 2 * i) / 8;
				const x = centerX + radius * Math.cos(angle);
				const y = centerY + radius * Math.sin(angle);
				if (i === 0) {
					context.moveTo(x, y);
				} else {
					context.lineTo(x, y);
				}
			}
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
