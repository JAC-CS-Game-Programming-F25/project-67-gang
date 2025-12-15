import Enemy from "./Enemy.js";
import { context, CANVAS_WIDTH, CANVAS_HEIGHT } from "../globals.js";
import SpriteManager from "../services/SpriteManager.js";

/**
 * Spawner Enemy - Periodically creates basic drone enemies
 */
export default class Spawner extends Enemy {
	constructor(x, y) {
		super(x, y, 50, 50);
		
		this.health = 100;
		this.maxHealth = this.health;
		this.speed = 30; // Very slow
		this.damage = 10;
		this.coinValue = 20;
		
		// Spawn properties
		this.spawnCooldown = 4.0; // Seconds between spawns
		this.spawnTimer = 2.0; // Start partially charged
		this.maxMinions = 3; // Max minions alive at once
		this.spawnedMinions = []; // Track spawned minions
		
		// Spawn animation
		this.isSpawning = false;
		this.spawnAnimTimer = 0;
		this.spawnAnimDuration = 0.5;
		
		// Visual
		this.glowColor = '#ff8800';
		this.spriteName = SpriteManager.sprites.enemies.abyssal2;
		this.spriteWidth = 60;
		this.spriteHeight = 60;
		this.pulseTimer = 0;
	}

	update(dt, player) {
		// Slow chase
		this.chasePlayer(player, dt);
		
		// Clean up dead minions from tracking
		this.spawnedMinions = this.spawnedMinions.filter(m => !m.isDead);
		
		// Spawn timer
		if (!this.isSpawning) {
			this.spawnTimer += dt;
			
			if (this.spawnTimer >= this.spawnCooldown && this.spawnedMinions.length < this.maxMinions) {
				this.startSpawn();
			}
		} else {
			// Spawn animation
			this.spawnAnimTimer += dt;
			if (this.spawnAnimTimer >= this.spawnAnimDuration) {
				this.isSpawning = false;
				this.spawnAnimTimer = 0;
			}
		}
		
		// Pulse animation
		this.pulseTimer += dt;
		
		super.update(dt);
	}

	startSpawn() {
		this.isSpawning = true;
		this.spawnAnimTimer = 0;
		this.spawnTimer = 0;
	}

	/**
	 * Called by PlayState to get the spawned minion
	 * Returns a minion config or null if not ready to spawn
	 */
	getSpawnedMinion() {
		if (this.isSpawning && this.spawnAnimTimer >= this.spawnAnimDuration * 0.8) {
			// Calculate spawn position (slightly offset from spawner)
			const angle = Math.random() * Math.PI * 2;
			const distance = 40;
			const spawnX = this.position.x + this.dimensions.x / 2 + Math.cos(angle) * distance;
			const spawnY = this.position.y + this.dimensions.y / 2 + Math.sin(angle) * distance;
			
			return {
				x: Math.max(10, Math.min(CANVAS_WIDTH - 40, spawnX)),
				y: Math.max(10, Math.min(CANVAS_HEIGHT - 40, spawnY)),
				type: 'drone'
			};
		}
		return null;
	}

	/**
	 * Register a minion as belonging to this spawner
	 */
	registerMinion(minion) {
		this.spawnedMinions.push(minion);
	}

	render() {
		const centerX = this.position.x + this.dimensions.x / 2;
		const centerY = this.position.y + this.dimensions.y / 2;
		
		// Spawn charge indicator
		const chargeRatio = this.spawnTimer / this.spawnCooldown;
		if (chargeRatio > 0 && !this.isSpawning) {
			context.save();
			context.globalAlpha = 0.3 + chargeRatio * 0.3;
			context.strokeStyle = this.glowColor;
			context.lineWidth = 3;
			context.shadowColor = this.glowColor;
			context.shadowBlur = 10;
			context.beginPath();
			context.arc(centerX, centerY, this.dimensions.x / 2 + 15, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * chargeRatio);
			context.stroke();
			context.restore();
		}

		// Spawn animation effect
		if (this.isSpawning) {
			const progress = this.spawnAnimTimer / this.spawnAnimDuration;
			
			// Expanding ring
			context.save();
			context.globalAlpha = 1 - progress;
			context.strokeStyle = this.glowColor;
			context.lineWidth = 4;
			context.shadowColor = this.glowColor;
			context.shadowBlur = 20;
			context.beginPath();
			context.arc(centerX, centerY, this.dimensions.x / 2 + progress * 40, 0, Math.PI * 2);
			context.stroke();
			context.restore();
			
			// Inner pulse
			context.save();
			context.globalAlpha = 0.7;
			context.fillStyle = this.glowColor;
			context.shadowColor = '#ffffff';
			context.shadowBlur = 30;
			context.beginPath();
			context.arc(centerX, centerY, this.dimensions.x / 2 * (1 - progress * 0.3), 0, Math.PI * 2);
			context.fill();
			context.restore();
		}

		// Pulsing glow
		const pulse = Math.sin(this.pulseTimer * 2) * 0.2 + 0.6;
		context.save();
		context.globalAlpha = pulse * 0.5;
		context.shadowColor = this.glowColor;
		context.shadowBlur = 25;
		context.beginPath();
		context.arc(centerX, centerY, this.dimensions.x / 2 + 8, 0, Math.PI * 2);
		context.fillStyle = this.glowColor;
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
			// Fallback - hexagon shape
			context.save();
			context.fillStyle = '#884400';
			context.strokeStyle = this.glowColor;
			context.lineWidth = 3;
			context.beginPath();
			for (let i = 0; i < 6; i++) {
				const angle = (Math.PI * 2 * i / 6) - Math.PI / 2;
				const x = centerX + Math.cos(angle) * (this.dimensions.x / 2);
				const y = centerY + Math.sin(angle) * (this.dimensions.y / 2);
				if (i === 0) context.moveTo(x, y);
				else context.lineTo(x, y);
			}
			context.closePath();
			context.fill();
			context.stroke();
			context.restore();
		}

		// Minion count indicator
		context.save();
		context.font = 'bold 12px Orbitron';
		context.textAlign = 'center';
		context.fillStyle = '#ffffff';
		context.shadowColor = this.glowColor;
		context.shadowBlur = 5;
		context.fillText(`${this.spawnedMinions.length}/${this.maxMinions}`, centerX, this.position.y - 25);
		context.restore();

		// Health bar
		this.renderHealthBar();
	}
}

