import Enemy from "./Enemy.js";
import { context } from "../globals.js";
import SpriteManager from "../services/SpriteManager.js";

export default class Boss extends Enemy {
	constructor(x, y, waveNumber) {
		// Bigger size for boss
		super(x, y, 80, 80);
		
		// Scale stats based on wave
		this.health = 200 + (waveNumber * 50); // Gets tankier each wave
		this.maxHealth = this.health;
		this.speed = 40; // Slower than normal enemies
		this.damage = 30;
		this.coinValue = 50; // Drops lots of coins
		this.color = '#ff0000'; // Red boss fallback
		this.isBoss = true;
		
		// Boss-specific properties
		this.phase = 1;
		this.shootTimer = 0;
		this.shootCooldown = 2.0; // Shoots every 2 seconds
		this.waveNumber = waveNumber;
		
		// Sprite configuration - use wave-appropriate boss
		this.spriteName = SpriteManager.getBossSprite(waveNumber);
		this.spriteWidth = 100;
		this.spriteHeight = 100;
		this.glowColor = this.getBossGlowColor(waveNumber);
		
		// Pulsing animation
		this.pulseTimer = 0;
	}

	getBossGlowColor(wave) {
		switch (wave) {
			case 5: return '#ff4444'; // Red
			case 10: return '#44ff44'; // Green
			case 15: return '#ff44ff'; // Magenta
			case 20: return '#ffaa00'; // Gold
			default: return '#ff4444';
		}
	}

	update(dt, player) {
		// Chase player
		this.chasePlayer(player, dt);
		
		// Boss phases based on health
		if (this.health < this.maxHealth * 0.5 && this.phase === 1) {
			this.phase = 2;
			this.speed = 60; // Speeds up at half health
			this.shootCooldown = 1.5; // Shoots faster
		}
		
		// Shooting behavior (optional)
		this.shootTimer += dt;
		
		// Pulsing animation
		this.pulseTimer += dt;
		
		super.update(dt);
	}

	render() {
		const centerX = this.position.x + this.dimensions.x / 2;
		const centerY = this.position.y + this.dimensions.y / 2;
		
		// Pulsing effect
		const pulse = Math.sin(this.pulseTimer * 3) * 0.1 + 1;
		const pulseWidth = this.spriteWidth * pulse;
		const pulseHeight = this.spriteHeight * pulse;

		// Check if sprite is loaded
		if (this.spriteName && SpriteManager.get(this.spriteName)) {
			// Intense glow effect for bosses
			context.save();
			context.globalAlpha = 0.5 + Math.sin(this.pulseTimer * 5) * 0.2;
			context.shadowColor = this.glowColor;
			context.shadowBlur = 40;
			context.beginPath();
			context.arc(centerX, centerY, this.dimensions.x / 2 + 15, 0, Math.PI * 2);
			context.fillStyle = this.glowColor;
			context.fill();
			context.restore();

			// Second glow layer for extra intensity
			context.save();
			context.globalAlpha = 0.3;
			context.shadowColor = '#ffffff';
			context.shadowBlur = 20;
			context.beginPath();
			context.arc(centerX, centerY, this.dimensions.x / 2, 0, Math.PI * 2);
			context.fillStyle = '#ffffff';
			context.fill();
			context.restore();

			// Render boss sprite with pulsing
			SpriteManager.render(
				this.spriteName,
				centerX,
				centerY,
				pulseWidth,
				pulseHeight,
				this.rotation
			);
		} else {
			// Fallback: Draw as large pulsing square
			const pulseOffset = (pulse - 1) * this.dimensions.x / 2;
			
			context.save();
			context.fillStyle = this.color;
			context.fillRect(
				this.position.x - pulseOffset / 2, 
				this.position.y - pulseOffset / 2, 
				this.dimensions.x + pulseOffset, 
				this.dimensions.y + pulseOffset
			);
			
			context.strokeStyle = '#ffffff';
			context.lineWidth = 3;
			context.strokeRect(
				this.position.x - pulseOffset / 2, 
				this.position.y - pulseOffset / 2, 
				this.dimensions.x + pulseOffset, 
				this.dimensions.y + pulseOffset
			);
			
			context.restore();
		}
		
		// Boss label 
		context.save();
		context.fillStyle = '#ffffff';
		context.font = '20px Orbitron';
		context.textAlign = 'center';
		context.shadowColor = this.glowColor;
		context.shadowBlur = 10;
		context.fillText('BOSS', centerX, this.position.y - 70);
		context.restore();

		// Health bar (bigger for boss)
		this.renderBossHealthBar();
	}

	renderBossHealthBar() {
		const barWidth = 200;
		const barHeight = 8;
		const barX = this.position.x + this.dimensions.x / 2 - barWidth / 2;
		const barY = this.position.y - 55;

		// Background
		context.fillStyle = '#333333';
		context.fillRect(barX, barY, barWidth, barHeight);

		// Health with gradient effect
		const healthWidth = (this.health / this.maxHealth) * barWidth;
		const healthGradient = context.createLinearGradient(barX, barY, barX + healthWidth, barY);
		healthGradient.addColorStop(0, '#ff0000');
		healthGradient.addColorStop(1, '#ff6600');
		context.fillStyle = healthGradient;
		context.fillRect(barX, barY, healthWidth, barHeight);

		// Border with glow
		context.strokeStyle = '#ffffff';
		context.lineWidth = 2;
		context.shadowColor = this.glowColor;
		context.shadowBlur = 5;
		context.strokeRect(barX, barY, barWidth, barHeight);
		context.shadowBlur = 0;
		
		// Health text 
		context.fillStyle = '#ffffff';
		context.font = '12px Roboto';
		context.textAlign = 'center';
		context.fillText(`${Math.ceil(this.health)} / ${this.maxHealth}`, barX + barWidth / 2, barY + barHeight + 18);
	}
}
