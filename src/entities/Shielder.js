import Enemy from "./Enemy.js";
import { context } from "../globals.js";
import SpriteManager from "../services/SpriteManager.js";

/**
 * Shielder Enemy - Has a regenerating shield that must be depleted first
 */
export default class Shielder extends Enemy {
	constructor(x, y) {
		super(x, y, 40, 40);
		
		this.health = 60;
		this.maxHealth = this.health;
		this.speed = 70;
		this.damage = 12;
		this.coinValue = 15;
		
		// Shield properties
		this.shield = 50;
		this.maxShield = 50;
		this.shieldRegenRate = 8; // Shield points per second
		this.shieldRegenDelay = 2.0; // Seconds before shield starts regenerating
		this.shieldRegenTimer = 0;
		this.shieldBroken = false;
		
		// Visual
		this.glowColor = '#00aaff';
		this.spriteName = SpriteManager.sprites.enemies.abyssal1;
		this.spriteWidth = 50;
		this.spriteHeight = 50;
		this.shieldPulse = 0;
	}

	update(dt, player) {
		// Chase player
		this.chasePlayer(player, dt);
		
		// Shield regeneration
		if (this.shield < this.maxShield) {
			this.shieldRegenTimer += dt;
			
			if (this.shieldRegenTimer >= this.shieldRegenDelay) {
				this.shield += this.shieldRegenRate * dt;
				this.shield = Math.min(this.shield, this.maxShield);
				
				if (this.shield >= this.maxShield) {
					this.shieldBroken = false;
				}
			}
		}
		
		// Shield pulse animation
		this.shieldPulse += dt * 3;
		
		super.update(dt);
	}

	takeDamage(amount) {
		// Reset shield regen timer when hit
		this.shieldRegenTimer = 0;
		
		// Shield absorbs damage first
		if (this.shield > 0) {
			const shieldDamage = Math.min(this.shield, amount);
			this.shield -= shieldDamage;
			amount -= shieldDamage;
			
			if (this.shield <= 0) {
				this.shieldBroken = true;
				this.shield = 0;
			}
		}
		
		// Remaining damage hits health
		if (amount > 0) {
			this.health -= amount;
			if (this.health <= 0) {
				this.health = 0;
				this.isDead = true;
			}
		}
	}

	render() {
		const centerX = this.position.x + this.dimensions.x / 2;
		const centerY = this.position.y + this.dimensions.y / 2;

		// Shield effect (if shield is up)
		if (this.shield > 0) {
			const shieldAlpha = 0.3 + Math.sin(this.shieldPulse) * 0.1;
			const shieldRadius = this.dimensions.x / 2 + 10 + Math.sin(this.shieldPulse * 2) * 2;
			
			// Outer shield glow
			context.save();
			context.globalAlpha = shieldAlpha;
			context.strokeStyle = this.glowColor;
			context.lineWidth = 3;
			context.shadowColor = this.glowColor;
			context.shadowBlur = 20;
			context.beginPath();
			context.arc(centerX, centerY, shieldRadius, 0, Math.PI * 2);
			context.stroke();
			context.restore();
			
			// Inner shield fill
			context.save();
			context.globalAlpha = shieldAlpha * 0.3;
			context.fillStyle = this.glowColor;
			context.beginPath();
			context.arc(centerX, centerY, shieldRadius - 2, 0, Math.PI * 2);
			context.fill();
			context.restore();
			
			// Hexagon pattern on shield
			context.save();
			context.globalAlpha = shieldAlpha * 0.5;
			context.strokeStyle = '#ffffff';
			context.lineWidth = 1;
			for (let i = 0; i < 6; i++) {
				const angle = (Math.PI * 2 * i / 6) + this.shieldPulse * 0.5;
				const x1 = centerX + Math.cos(angle) * (shieldRadius - 5);
				const y1 = centerY + Math.sin(angle) * (shieldRadius - 5);
				const x2 = centerX + Math.cos(angle + Math.PI / 6) * (shieldRadius - 5);
				const y2 = centerY + Math.sin(angle + Math.PI / 6) * (shieldRadius - 5);
				context.beginPath();
				context.moveTo(x1, y1);
				context.lineTo(x2, y2);
				context.stroke();
			}
			context.restore();
		}

		// Base glow
		context.save();
		context.globalAlpha = 0.4;
		context.shadowColor = this.shield > 0 ? this.glowColor : '#ff4444';
		context.shadowBlur = 15;
		context.beginPath();
		context.arc(centerX, centerY, this.dimensions.x / 2, 0, Math.PI * 2);
		context.fillStyle = this.shield > 0 ? this.glowColor : '#ff4444';
		context.fill();
		context.restore();

		// Render sprite
		if (this.spriteName && SpriteManager.get(this.spriteName)) {
			SpriteManager.render(
				this.spriteName,
				centerX,
				centerY,
				this.spriteWidth,
				this.spriteHeight,
				this.rotation
			);
		} else {
			// Fallback
			context.save();
			context.fillStyle = this.shield > 0 ? '#0088cc' : '#cc4444';
			context.beginPath();
			context.arc(centerX, centerY, this.dimensions.x / 2, 0, Math.PI * 2);
			context.fill();
			context.restore();
		}

		// Health and shield bars
		this.renderBars();
	}

	renderBars() {
		const barWidth = 50;
		const barHeight = 4;
		const barX = this.position.x + this.dimensions.x / 2 - barWidth / 2;
		const healthBarY = this.position.y - 12;
		const shieldBarY = this.position.y - 18;

		// Shield bar (if any shield)
		if (this.maxShield > 0) {
			context.fillStyle = '#222222';
			context.fillRect(barX, shieldBarY, barWidth, barHeight);
			
			const shieldWidth = (this.shield / this.maxShield) * barWidth;
			context.fillStyle = this.glowColor;
			context.shadowColor = this.glowColor;
			context.shadowBlur = 5;
			context.fillRect(barX, shieldBarY, shieldWidth, barHeight);
			context.shadowBlur = 0;
			
			context.strokeStyle = '#00ccff';
			context.lineWidth = 1;
			context.strokeRect(barX, shieldBarY, barWidth, barHeight);
		}

		// Health bar
		context.fillStyle = '#333333';
		context.fillRect(barX, healthBarY, barWidth, barHeight);

		const healthWidth = (this.health / this.maxHealth) * barWidth;
		context.fillStyle = this.health > 30 ? '#00ff00' : '#ff0000';
		context.fillRect(barX, healthBarY, healthWidth, barHeight);

		context.strokeStyle = '#ffffff';
		context.lineWidth = 1;
		context.strokeRect(barX, healthBarY, barWidth, barHeight);
	}
}

