import GameObject from "./GameObject.js";
import { context, addCoins, sounds } from "../globals.js";
import SpriteManager from "../services/SpriteManager.js";

export default class Coin extends GameObject {
	constructor(x, y, value = 5) {
		super(x, y, 16, 16);
		
		this.value = value;
		this.lifetime = 10; // Despawn after 10 seconds
		this.age = 0;
		
		// Slight random velocity for scatter effect
		this.velocity = {
			x: (Math.random() - 0.5) * 50,
			y: (Math.random() - 0.5) * 50
		};
		this.friction = 0.9;

		// Sprite configuration
		this.spriteName = SpriteManager.sprites.pickups.coin;
		this.spriteWidth = 24;
		this.spriteHeight = 24;
		
		// Animation
		this.bobTimer = Math.random() * Math.PI * 2; // Random starting phase
		this.rotationTimer = 0;
	}

	update(dt) {
		// Apply velocity with friction
		this.position.x += this.velocity.x * dt;
		this.position.y += this.velocity.y * dt;
		this.velocity.x *= this.friction;
		this.velocity.y *= this.friction;

		// Animation timers
		this.bobTimer += dt * 3;
		this.rotationTimer += dt * 2;

		// Age and despawn
		this.age += dt;
		if (this.age >= this.lifetime) {
			this.cleanUp = true;
		}
	}

	collect() {
		addCoins(this.value);
		sounds.play('coin');
		this.cleanUp = true;
	}

	render() {
		const centerX = this.position.x + this.dimensions.x / 2;
		const centerY = this.position.y + this.dimensions.y / 2 + Math.sin(this.bobTimer) * 3;
		
		// Fading effect when about to despawn
		let alpha = 1;
		if (this.age > this.lifetime - 3) {
			alpha = Math.abs(Math.sin(this.age * 5)); // Blink
		}

		// Check if sprite is loaded
		if (this.spriteName && SpriteManager.get(this.spriteName)) {
			// Glow effect underneath
			context.save();
			context.globalAlpha = alpha * 0.5;
			context.shadowColor = '#ffff00';
			context.shadowBlur = 15;
			context.beginPath();
			context.arc(centerX, centerY, 10, 0, Math.PI * 2);
			context.fillStyle = '#ffff00';
			context.fill();
			context.restore();

			// Render coin sprite
			SpriteManager.render(
				this.spriteName,
				centerX,
				centerY,
				this.spriteWidth,
				this.spriteHeight,
				0,
				alpha
			);
		} else {
			// Fallback: Yellow coin with glow
			context.save();
			context.globalAlpha = alpha;
			
			context.fillStyle = '#ffff00';
			context.shadowColor = '#ffff00';
			context.shadowBlur = 8;
			
			// Draw coin as circle
			context.beginPath();
			context.arc(centerX, centerY, 8, 0, Math.PI * 2);
			context.fill();
			
			// Outline
			context.strokeStyle = '#ffffff';
			context.lineWidth = 2;
			context.stroke();
			
			// $ symbol
			context.shadowBlur = 0;
			context.fillStyle = '#000000';
			context.font = 'bold 12px Roboto';
			context.textAlign = 'center';
			context.textBaseline = 'middle';
			context.fillText('$', centerX, centerY);
			
			context.restore();
		}
	}
}
