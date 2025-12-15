import GameEntity from "./GameEntity.js";
import { CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER_SPEED, PLAYER_MAX_HEALTH, HEALTH_UPGRADE_BONUS, context, input, stats } from "../globals.js";
import Input from "../../lib/Input.js";
import AssaultRifle from "../objects/AssaultRifle.js";
import Sniper from "../objects/Sniper.js";
import Shotgun from "../objects/Shotgun.js";
import SpriteManager from "../services/SpriteManager.js";

export default class Player extends GameEntity {
	constructor(x, y) {
		super(x, y, 40, 40);
		
		this.maxHealth = PLAYER_MAX_HEALTH + (stats.healthUpgrades * HEALTH_UPGRADE_BONUS);
		this.health = this.maxHealth;
		this.baseSpeed = PLAYER_SPEED;
		this.speed = this.baseSpeed;
		
		// Mouse aiming
		this.aimAngle = 0;
		
		// Weapon system
		this.weapons = [
			new AssaultRifle(),
			new Shotgun(),
			new Sniper()
		];
		this.currentWeaponIndex = 0;
		this.currentWeapon = this.weapons[0];

		// Invincibility frames (from damage)
		this.isInvincible = false;
		this.invincibilityTimer = 0;
		this.invincibilityDuration = 1.0; // 1 second after damage
		this.hasDamageInvincibility = false; // Track damage invincibility separately

		// Dash ability
		this.isDashing = false;
		this.dashTimer = 0;
		this.dashDuration = 0.15; // Short dash
		this.dashCooldown = 1.0; // 1 second cooldown
		this.dashCooldownTimer = 0;
		this.canDash = true;
		this.dashSpeed = 800; // Fast dash
		this.dashDirection = { x: 0, y: 0 };

		// Shield system (from power-ups)
		this.shield = 0;
		this.maxShield = 50;

		// Active power-up boosts
		this.activeBoosts = {
			speedBoost: { active: false, duration: 0, multiplier: 1.5 },
			damageBoost: { active: false, duration: 0, multiplier: 2.0 },
			coinMagnet: { active: false, duration: 0, range: 200 }
		};

		// Sprite size (slightly larger for visual impact)
		this.spriteWidth = 50;
		this.spriteHeight = 50;
	}

	update(dt) {
		// Handle dash
		this.handleDash(dt);
		
		// Only handle normal movement if not dashing
		if (!this.isDashing) {
			this.handleMovement(dt);
		}
		
		this.handleAiming();
		this.handleWeaponSwitching();
		this.currentWeapon.update(dt);
		
		// Update damage invincibility timer (continues even while dashing)
		if (this.hasDamageInvincibility) {
			this.invincibilityTimer += dt;
			if (this.invincibilityTimer >= this.invincibilityDuration) {
				this.hasDamageInvincibility = false;
				this.invincibilityTimer = 0;
				// Only remove invincibility if not currently dashing
				if (!this.isDashing) {
					this.isInvincible = false;
				}
			}
		}

		// Update dash cooldown
		if (!this.canDash) {
			this.dashCooldownTimer += dt;
			if (this.dashCooldownTimer >= this.dashCooldown) {
				this.canDash = true;
				this.dashCooldownTimer = 0;
			}
		}

		// Update active boosts
		this.updateBoosts(dt);
		
		this.position.x = Math.max(0, Math.min(CANVAS_WIDTH - this.dimensions.x, this.position.x));
		this.position.y = Math.max(0, Math.min(CANVAS_HEIGHT - this.dimensions.y, this.position.y));
	}

	handleDash(dt) {
		// Start dash on spacebar
		if (input.isKeyPressed(Input.KEYS.SPACE) && this.canDash && !this.isDashing) {
			this.startDash();
		}

		// Continue dash
		if (this.isDashing) {
			this.dashTimer += dt;
			
			// Move in dash direction
			this.position.x += this.dashDirection.x * this.dashSpeed * dt;
			this.position.y += this.dashDirection.y * this.dashSpeed * dt;

			// End dash
			if (this.dashTimer >= this.dashDuration) {
				this.isDashing = false;
				this.dashTimer = 0;
				// Only remove invincibility if no active damage invincibility
				if (!this.hasDamageInvincibility) {
					this.isInvincible = false;
				}
			}
		}
	}

	startDash() {
		// Get movement direction or use aim direction
		let dx = 0, dy = 0;
		
		if (input.isKeyHeld(Input.KEYS.W)) dy = -1;
		if (input.isKeyHeld(Input.KEYS.S)) dy = 1;
		if (input.isKeyHeld(Input.KEYS.A)) dx = -1;
		if (input.isKeyHeld(Input.KEYS.D)) dx = 1;

		// If no movement keys, dash in aim direction
		if (dx === 0 && dy === 0) {
			dx = Math.cos(this.aimAngle);
			dy = Math.sin(this.aimAngle);
		} else {
			// Normalize
			const length = Math.sqrt(dx * dx + dy * dy);
			dx /= length;
			dy /= length;
		}

		this.dashDirection = { x: dx, y: dy };
		this.isDashing = true;
		this.isInvincible = true; // Invincible during dash
		this.canDash = false;
		this.dashTimer = 0;
	}

	updateBoosts(dt) {
		// Update speed based on active boost
		this.speed = this.baseSpeed;
		
		for (const [key, boost] of Object.entries(this.activeBoosts)) {
			if (boost.active) {
				boost.duration -= dt;
				if (boost.duration <= 0) {
					boost.active = false;
					boost.duration = 0;
				}
			}
		}

		// Apply speed boost
		if (this.activeBoosts.speedBoost.active) {
			this.speed = this.baseSpeed * this.activeBoosts.speedBoost.multiplier;
		}
	}

	// Activate a power-up boost
	activateBoost(boostType, duration) {
		if (this.activeBoosts[boostType]) {
			this.activeBoosts[boostType].active = true;
			this.activeBoosts[boostType].duration = duration;
		}
	}

	// Get damage multiplier from boosts
	getDamageMultiplier() {
		if (this.activeBoosts.damageBoost.active) {
			return this.activeBoosts.damageBoost.multiplier;
		}
		return 1.0;
	}

	// Check if coin magnet is active
	hasCoinMagnet() {
		return this.activeBoosts.coinMagnet.active;
	}

	getCoinMagnetRange() {
		return this.activeBoosts.coinMagnet.range;
	}

	// Add shield
	addShield(amount) {
		this.shield = Math.min(this.maxShield, this.shield + amount);
	}

	handleMovement(dt) {
		this.velocity.x = 0;
		this.velocity.y = 0;

		// WASD movement
		if (input.isKeyHeld(Input.KEYS.W)) {
			this.velocity.y = -this.speed;
		}
		if (input.isKeyHeld(Input.KEYS.S)) {
			this.velocity.y = this.speed;
		}
		if (input.isKeyHeld(Input.KEYS.A)) {
			this.velocity.x = -this.speed;
		}
		if (input.isKeyHeld(Input.KEYS.D)) {
			this.velocity.x = this.speed;
		}

		// Normalize diagonal movement
		if (this.velocity.x !== 0 && this.velocity.y !== 0) {
			this.velocity.x *= 0.707; // 1/sqrt(2)
			this.velocity.y *= 0.707;
		}

		super.update(dt);
	}

	handleAiming() {
		const mouse = input.getMousePosition();
		const dx = mouse.x - (this.position.x + this.dimensions.x / 2);
		const dy = mouse.y - (this.position.y + this.dimensions.y / 2);
		this.aimAngle = Math.atan2(dy, dx);
	}

	shoot() {
		return this.currentWeapon.shoot();
	}

	takeDamage(amount) {
		if (this.isInvincible || this.isDashing) return; // Can't take damage while invincible or dashing
		
		// Shield absorbs damage first
		if (this.shield > 0) {
			const shieldDamage = Math.min(this.shield, amount);
			this.shield -= shieldDamage;
			amount -= shieldDamage;
		}

		if (amount > 0) {
			this.health -= amount;
			this.isInvincible = true; // Activate invincibility
			this.hasDamageInvincibility = true; // Track damage-based invincibility
			this.invincibilityTimer = 0;
		}
		
		if (this.health <= 0) {
			this.health = 0;
			this.isDead = true;
		}
	}

	heal(amount) {
		this.health = Math.min(this.maxHealth, this.health + amount);
	}

	render() {
		const centerX = this.position.x + this.dimensions.x / 2;
		const centerY = this.position.y + this.dimensions.y / 2;

		// Flashing effect when invincible (not during dash)
		let alpha = 1;
		if (this.isInvincible && !this.isDashing) {
			const flash = Math.floor(this.invincibilityTimer * 10) % 2 === 0;
			alpha = flash ? 0.5 : 1;
		}

		// Dash trail effect
		if (this.isDashing) {
			context.save();
			context.globalAlpha = 0.3;
			context.shadowColor = '#00ffff';
			context.shadowBlur = 30;
			// Draw afterimages
			for (let i = 1; i <= 3; i++) {
				const trailX = centerX - this.dashDirection.x * i * 20;
				const trailY = centerY - this.dashDirection.y * i * 20;
				context.globalAlpha = 0.3 - i * 0.08;
				context.beginPath();
				context.arc(trailX, trailY, 15, 0, Math.PI * 2);
				context.fillStyle = '#00ffff';
				context.fill();
			}
			context.restore();
		}

		// Render glow effect underneath (cyan or gold if speed boost active)
		const glowColor = this.activeBoosts.speedBoost.active ? '#ffaa00' : '#00ffff';
		context.save();
		context.globalAlpha = alpha * 0.6;
		context.shadowColor = glowColor;
		context.shadowBlur = this.isDashing ? 40 : 20;
		context.beginPath();
		context.arc(centerX, centerY, 20, 0, Math.PI * 2);
		context.fillStyle = glowColor;
		context.fill();
		context.restore();

		// Shield effect
		if (this.shield > 0) {
			context.save();
			context.globalAlpha = 0.4 + Math.sin(Date.now() * 0.005) * 0.1;
			context.strokeStyle = '#00aaff';
			context.lineWidth = 3;
			context.shadowColor = '#00aaff';
			context.shadowBlur = 15;
			context.beginPath();
			context.arc(centerX, centerY, 30, 0, Math.PI * 2);
			context.stroke();
			context.restore();
		}

		// Damage boost indicator
		if (this.activeBoosts.damageBoost.active) {
			context.save();
			context.globalAlpha = 0.5 + Math.sin(Date.now() * 0.01) * 0.2;
			context.shadowColor = '#ff4444';
			context.shadowBlur = 25;
			context.beginPath();
			context.arc(centerX, centerY, 25, 0, Math.PI * 2);
			context.fillStyle = '#ff4444';
			context.fill();
			context.restore();
		}

		// Render ship sprite with rotation
		// Add Math.PI/2 to adjust for sprite facing "up" by default
		SpriteManager.render(
			SpriteManager.sprites.player,
			centerX,
			centerY,
			this.spriteWidth,
			this.spriteHeight,
			this.aimAngle + Math.PI / 2,
			alpha
		);

		// Health bar above player
		this.renderHealthBar();
	}

	renderHealthBar() {
		const barWidth = 50;
		const barHeight = 5;
		const barX = this.position.x + this.dimensions.x / 2 - barWidth / 2;
		const barY = this.position.y - 15;

		// Background
		context.fillStyle = '#333333';
		context.fillRect(barX, barY, barWidth, barHeight);

		// Health
		const healthWidth = (this.health / this.maxHealth) * barWidth;
		context.fillStyle = this.health > 30 ? '#00ff00' : '#ff0000';
		context.fillRect(barX, barY, healthWidth, barHeight);

		// Border
		context.strokeStyle = '#ffffff';
		context.lineWidth = 1;
		context.strokeRect(barX, barY, barWidth, barHeight);

		// Shield bar (if any)
		if (this.shield > 0) {
			const shieldBarY = barY - 7;
			context.fillStyle = '#222222';
			context.fillRect(barX, shieldBarY, barWidth, 4);
			
			const shieldWidth = (this.shield / this.maxShield) * barWidth;
			context.fillStyle = '#00aaff';
			context.shadowColor = '#00aaff';
			context.shadowBlur = 5;
			context.fillRect(barX, shieldBarY, shieldWidth, 4);
			context.shadowBlur = 0;
			
			context.strokeStyle = '#00aaff';
			context.strokeRect(barX, shieldBarY, barWidth, 4);
		}

		// Dash cooldown indicator
		if (!this.canDash) {
			const cooldownRatio = this.dashCooldownTimer / this.dashCooldown;
			const cooldownY = this.position.y + this.dimensions.y + 5;
			context.fillStyle = '#333333';
			context.fillRect(barX, cooldownY, barWidth, 3);
			context.fillStyle = '#ffaa00';
			context.fillRect(barX, cooldownY, barWidth * cooldownRatio, 3);
		}
	}

	getCenter() {
		return {
			x: this.position.x + this.dimensions.x / 2,
			y: this.position.y + this.dimensions.y / 2
		};
	}
	handleWeaponSwitching() {
		// Number keys 1, 2, 3 to switch weapons
		if (input.isKeyPressed(Input.KEYS['1'])) {
			this.switchWeapon(0);
		}
		if (input.isKeyPressed(Input.KEYS['2'])) {
			this.switchWeapon(1);
		}
		if (input.isKeyPressed(Input.KEYS['3'])) {
			this.switchWeapon(2);
		}
	}

	switchWeapon(index) {
		if (index >= 0 && index < this.weapons.length) {
			this.currentWeaponIndex = index;
			this.currentWeapon = this.weapons[index];
			console.log('Switched to:', this.currentWeapon.name);
		}
	}
}
