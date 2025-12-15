import GameObject from "./GameObject.js";
import { context, sounds } from "../globals.js";
import SpriteManager from "../services/SpriteManager.js";

export default class HealthPack extends GameObject {
	constructor(x, y) {
		super(x, y, 20, 20);
		
		this.healAmount = 30;
		this.lifetime = 15; // Despawn after 15 seconds
		this.age = 0;
		this.pulseTimer = 0;

		// Sprite configuration
		this.spriteName = SpriteManager.sprites.pickups.health;
		this.spriteWidth = 32;
		this.spriteHeight = 32;
	}

	update(dt) {
		this.age += dt;
		this.pulseTimer += dt;
		
		if (this.age >= this.lifetime) {
			this.cleanUp = true;
		}
	}

	collect(player) {
		player.heal(this.healAmount);
		sounds.play('health');
		this.cleanUp = true;
	}

	render() {
		const centerX = this.position.x + this.dimensions.x / 2;
		const centerY = this.position.y + this.dimensions.y / 2;
		
		// Pulsing effect
		const pulse = Math.sin(this.pulseTimer * 5) * 0.15 + 1;
		const width = this.spriteWidth * pulse;
		const height = this.spriteHeight * pulse;
		
		// Fading effect when about to despawn
		let alpha = 1;
		if (this.age > this.lifetime - 3) {
			alpha = Math.abs(Math.sin(this.age * 5)); // Blink
		}

		// Check if sprite is loaded
		if (this.spriteName && SpriteManager.get(this.spriteName)) {
			// Green glow underneath
			context.save();
			context.globalAlpha = alpha * 0.5;
			context.shadowColor = '#00ff00';
			context.shadowBlur = 20;
			context.beginPath();
			context.arc(centerX, centerY, 15, 0, Math.PI * 2);
			context.fillStyle = '#00ff00';
			context.fill();
			context.restore();

			// Render health pack sprite with pulsing
			SpriteManager.render(
				this.spriteName,
				centerX,
				centerY,
				width,
				height,
				0,
				alpha
			);
		} else {
			// Fallback: Red cross with pulsing
			const size = this.dimensions.x * pulse;
			
			context.save();
			context.globalAlpha = alpha;
			
			// Green glow
			context.shadowColor = '#00ff00';
			context.shadowBlur = 15;
			
			// Red cross background
			context.fillStyle = '#ff0000';
			context.fillRect(
				centerX - size / 2,
				centerY - size / 2,
				size,
				size
			);
			
			// White cross
			context.fillStyle = '#ffffff';
			const crossThick = size / 4;
			// Horizontal bar
			context.fillRect(
				centerX - size / 2,
				centerY - crossThick / 2,
				size,
				crossThick
			);
			// Vertical bar
			context.fillRect(
				centerX - crossThick / 2,
				centerY - size / 2,
				crossThick,
				size
			);
			
			context.restore();
		}
	}
}
