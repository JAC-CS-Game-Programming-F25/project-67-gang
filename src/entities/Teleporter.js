import Enemy from "./Enemy.js";
import { context, CANVAS_WIDTH, CANVAS_HEIGHT } from "../globals.js";
import SpriteManager from "../services/SpriteManager.js";

/**
 * Teleporter Enemy - Blinks to random positions near the player
 */
export default class Teleporter extends Enemy {
	constructor(x, y) {
		super(x, y, 35, 35);
		
		this.health = 40;
		this.maxHealth = this.health;
		this.speed = 80; // Slower base movement
		this.damage = 15;
		this.coinValue = 12;
		
		// Teleport properties
		this.teleportCooldown = 3.0; // Seconds between teleports
		this.teleportTimer = 0;
		this.teleportRange = 150; // How far to teleport near player
		this.isTeleporting = false;
		this.teleportDuration = 0.3; // Animation duration
		this.teleportAnimTimer = 0;
		this.teleportPhase = 'none'; // 'fadeOut', 'fadeIn', 'none'
		
		// Visual
		this.glowColor = '#aa00ff';
		this.spriteName = SpriteManager.sprites.enemies.insectoid1;
		this.spriteWidth = 45;
		this.spriteHeight = 45;
		this.alpha = 1;
	}

	update(dt, player) {
		// Handle teleport animation
		if (this.isTeleporting) {
			this.teleportAnimTimer += dt;
			
			if (this.teleportPhase === 'fadeOut') {
				this.alpha = 1 - (this.teleportAnimTimer / (this.teleportDuration / 2));
				
				if (this.teleportAnimTimer >= this.teleportDuration / 2) {
					// Actually teleport
					this.performTeleport(player);
					this.teleportPhase = 'fadeIn';
					this.teleportAnimTimer = 0;
				}
			} else if (this.teleportPhase === 'fadeIn') {
				this.alpha = this.teleportAnimTimer / (this.teleportDuration / 2);
				
				if (this.teleportAnimTimer >= this.teleportDuration / 2) {
					this.isTeleporting = false;
					this.teleportPhase = 'none';
					this.alpha = 1;
				}
			}
		} else {
			// Normal movement when not teleporting
			this.chasePlayer(player, dt);
			
			// Update teleport cooldown
			this.teleportTimer += dt;
			if (this.teleportTimer >= this.teleportCooldown) {
				this.startTeleport();
			}
		}
		
		super.update(dt);
	}

	startTeleport() {
		this.isTeleporting = true;
		this.teleportPhase = 'fadeOut';
		this.teleportAnimTimer = 0;
		this.teleportTimer = 0;
	}

	performTeleport(player) {
		if (!player) return;
		
		// Calculate random position near player
		const angle = Math.random() * Math.PI * 2;
		const distance = 50 + Math.random() * this.teleportRange;
		
		let newX = player.position.x + Math.cos(angle) * distance;
		let newY = player.position.y + Math.sin(angle) * distance;
		
		// Clamp to screen bounds
		newX = Math.max(50, Math.min(CANVAS_WIDTH - 50 - this.dimensions.x, newX));
		newY = Math.max(50, Math.min(CANVAS_HEIGHT - 50 - this.dimensions.y, newY));
		
		this.position.x = newX;
		this.position.y = newY;
	}

	render() {
		const centerX = this.position.x + this.dimensions.x / 2;
		const centerY = this.position.y + this.dimensions.y / 2;

		// Teleport effect particles
		if (this.isTeleporting) {
			context.save();
			context.globalAlpha = 0.7;
			context.shadowColor = this.glowColor;
			context.shadowBlur = 30;
			
			// Swirling particles
			for (let i = 0; i < 8; i++) {
				const angle = (Date.now() * 0.01 + i * Math.PI / 4) % (Math.PI * 2);
				const radius = 20 + Math.sin(Date.now() * 0.005 + i) * 10;
				const px = centerX + Math.cos(angle) * radius;
				const py = centerY + Math.sin(angle) * radius;
				
				context.beginPath();
				context.arc(px, py, 4, 0, Math.PI * 2);
				context.fillStyle = this.glowColor;
				context.fill();
			}
			context.restore();
		}

		// Glow effect
		context.save();
		context.globalAlpha = this.alpha * 0.5;
		context.shadowColor = this.glowColor;
		context.shadowBlur = 20;
		context.beginPath();
		context.arc(centerX, centerY, this.dimensions.x / 2 + 5, 0, Math.PI * 2);
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
				this.rotation,
				this.alpha
			);
		} else {
			// Fallback
			context.save();
			context.globalAlpha = this.alpha;
			context.fillStyle = this.glowColor;
			context.beginPath();
			context.arc(centerX, centerY, this.dimensions.x / 2, 0, Math.PI * 2);
			context.fill();
			context.restore();
		}

		// Health bar
		if (this.alpha > 0.5) {
			this.renderHealthBar();
		}
	}
}

