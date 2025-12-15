import GameObject from "./GameObject.js";
import { context, sounds } from "../globals.js";
import SpriteManager from "../services/SpriteManager.js";

/**
 * Base PowerUp class for all temporary power-ups
 */
export default class PowerUp extends GameObject {
	constructor(x, y, type) {
		super(x, y, 30, 30);
		
		this.type = type; // 'speed', 'damage', 'shield', 'magnet'
		this.duration = 10.0; // How long the effect lasts
		this.despawnTimer = 0;
		this.despawnTime = 15.0; // Disappears after 15 seconds if not collected
		this.collected = false;
		
		// Visual properties
		this.pulseTimer = 0;
		this.bobTimer = Math.random() * Math.PI * 2; // Random start for bob animation
		this.baseY = y;
		
		// Configure based on type
		this.configure();
	}

	configure() {
		switch (this.type) {
			case 'speed':
				this.glowColor = '#00ff88';
				this.iconColor = '#00ff88';
				this.label = 'SPEED';
				this.duration = 8.0;
				break;
			case 'damage':
				this.glowColor = '#ff4444';
				this.iconColor = '#ff4444';
				this.label = 'DAMAGE';
				this.duration = 8.0;
				break;
			case 'shield':
				this.glowColor = '#00aaff';
				this.iconColor = '#00aaff';
				this.label = 'SHIELD';
				this.shieldAmount = 30;
				break;
			case 'magnet':
				this.glowColor = '#ffff00';
				this.iconColor = '#ffff00';
				this.label = 'MAGNET';
				this.duration = 12.0;
				break;
			default:
				this.glowColor = '#ffffff';
				this.iconColor = '#ffffff';
				this.label = '?';
		}
	}

	update(dt) {
		this.pulseTimer += dt;
		this.bobTimer += dt * 3;
		this.despawnTimer += dt;
		
		// Bob up and down
		this.position.y = this.baseY + Math.sin(this.bobTimer) * 5;
		
		// Cleanup if despawned
		if (this.despawnTimer >= this.despawnTime) {
			this.cleanUp = true;
		}
	}

	/**
	 * Collect the power-up and apply effect to player
	 */
	collect(player) {
		if (this.collected) return;
		this.collected = true;
		
		switch (this.type) {
			case 'speed':
				player.activateBoost('speedBoost', this.duration);
				break;
			case 'damage':
				player.activateBoost('damageBoost', this.duration);
				break;
			case 'shield':
				player.addShield(this.shieldAmount);
				break;
			case 'magnet':
				player.activateBoost('coinMagnet', this.duration);
				break;
		}
		
		sounds.play('health'); // Reuse health sound for power-ups
		this.cleanUp = true;
	}

	render() {
		const centerX = this.position.x + this.dimensions.x / 2;
		const centerY = this.position.y + this.dimensions.y / 2;
		
		// Despawn warning (flash when about to despawn)
		const timeLeft = this.despawnTime - this.despawnTimer;
		let alpha = 1;
		if (timeLeft < 3) {
			alpha = Math.sin(this.pulseTimer * 10) * 0.3 + 0.7;
		}
		
		const pulse = Math.sin(this.pulseTimer * 4) * 0.15 + 1;
		const size = this.dimensions.x * pulse;

		// Outer glow
		context.save();
		context.globalAlpha = alpha * 0.6;
		context.shadowColor = this.glowColor;
		context.shadowBlur = 25;
		context.beginPath();
		context.arc(centerX, centerY, size / 2 + 8, 0, Math.PI * 2);
		context.fillStyle = this.glowColor;
		context.fill();
		context.restore();

		// Main pickup body
		context.save();
		context.globalAlpha = alpha;
		context.fillStyle = 'rgba(20, 30, 50, 0.9)';
		context.strokeStyle = this.glowColor;
		context.lineWidth = 2;
		context.shadowColor = this.glowColor;
		context.shadowBlur = 10;
		context.beginPath();
		context.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
		context.fill();
		context.stroke();
		context.restore();

		// Icon based on type
		context.save();
		context.globalAlpha = alpha;
		context.font = 'bold 14px Orbitron';
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.fillStyle = this.iconColor;
		context.shadowColor = this.iconColor;
		context.shadowBlur = 5;
		
		let icon = '?';
		switch (this.type) {
			case 'speed': icon = '⚡'; break;
			case 'damage': icon = '💥'; break;
			case 'shield': icon = '🛡'; break;
			case 'magnet': icon = '🧲'; break;
		}
		context.fillText(icon, centerX, centerY);
		context.restore();

		// Label below
		context.save();
		context.globalAlpha = alpha * 0.8;
		context.font = '8px Orbitron';
		context.textAlign = 'center';
		context.fillStyle = this.glowColor;
		context.fillText(this.label, centerX, centerY + size / 2 + 12);
		context.restore();
	}
}

