import GameEntity from "./GameEntity.js";
import { CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER_SPEED, PLAYER_MAX_HEALTH, context, input, stats } from "../globals.js";
import Input from "../../lib/Input.js";
import AssaultRifle from "../objects/AssaultRifle.js";
import Sniper from "../objects/Sniper.js";
import Shotgun from "../objects/Shotgun.js";

export default class Player extends GameEntity {
	constructor(x, y) {
		super(x, y, 40, 40);
		
		this.maxHealth = PLAYER_MAX_HEALTH + (stats.healthUpgrades * 20);
		this.health = this.maxHealth;
		this.speed = PLAYER_SPEED;
		
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

		// Invincibility frames
		this.isInvincible = false;
		this.invincibilityTimer = 0;
		this.invincibilityDuration = 2.0; // 2 seconds
	}

	update(dt) {
		this.handleMovement(dt);
		this.handleAiming();
		this.handleWeaponSwitching();
		this.currentWeapon.update(dt);
		// Update invincibility timer
		if (this.isInvincible) {
			this.invincibilityTimer += dt;
			if (this.invincibilityTimer >= this.invincibilityDuration) {
				this.isInvincible = false;
				this.invincibilityTimer = 0;
			}
		}
		
		this.position.x = Math.max(0, Math.min(CANVAS_WIDTH - this.dimensions.x, this.position.x));
		this.position.y = Math.max(0, Math.min(CANVAS_HEIGHT - this.dimensions.y, this.position.y));
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
		if (this.isInvincible) return; // Can't take damage while invincible
		
		this.health -= amount;
		this.isInvincible = true; // Activate invincibility
		this.invincibilityTimer = 0;
		
		if (this.health <= 0) {
			this.health = 0;
			this.isDead = true;
		}
	}

	heal(amount) {
		this.health = Math.min(this.maxHealth, this.health + amount);
	}

	render() {
		context.save();
		// Flashing effect when invincible
		if (this.isInvincible) {
			const flash = Math.floor(this.invincibilityTimer * 10) % 2 === 0;
			if (flash) {
				context.globalAlpha = 0.5; // Transparent
			}
		}
		// Draw player as a cyan triangle (spaceship)
		context.translate(this.position.x + this.dimensions.x / 2, this.position.y + this.dimensions.y / 2);
		context.rotate(this.aimAngle);
		
		context.fillStyle = '#00ffff';
		context.beginPath();
		context.moveTo(20, 0);  // Front point
		context.lineTo(-15, -12); // Back left
		context.lineTo(-15, 12);  // Back right
		context.closePath();
		context.fill();
		
		// Outline
		context.strokeStyle = '#ffffff';
		context.lineWidth = 2;
		context.stroke();

		context.restore();

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