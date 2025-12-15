import GameObject from "./GameObject.js";
import { CANVAS_WIDTH, CANVAS_HEIGHT, context, stats } from "../globals.js";
import SpriteManager from "../services/SpriteManager.js";

export default class Bullet extends GameObject {
	constructor(x, y, angle, damage = 10, speed = 400, weaponType = 'default') {
		super(x, y, 8, 8);
		
		this.angle = angle;
		this.speed = speed;
		this.damage = damage;
		this.weaponType = weaponType;
		
		// Piercing properties (for sniper)
		this.piercing = false;
		this.maxPierceCount = 0;
		this.pierceCount = 0;
		
		// Calculate velocity based on angle
		this.velocity = {
			x: Math.cos(angle) * this.speed,
			y: Math.sin(angle) * this.speed
		};

		// Sprite configuration based on weapon type
		this.spriteName = this.getSpriteForWeapon(weaponType);
		this.spriteWidth = this.getSpriteSize(weaponType);
		this.spriteHeight = this.getSpriteSize(weaponType);
		this.glowColor = this.getGlowColor(weaponType);
	}

	getSpriteForWeapon(type) {
		switch (type) {
			case 'shotgun': return SpriteManager.sprites.projectiles.shotgun;
			case 'sniper': return SpriteManager.sprites.projectiles.sniper;
			case 'enemy': return SpriteManager.sprites.projectiles.enemy;
			default: return SpriteManager.sprites.projectiles.player;
		}
	}

	getSpriteSize(type) {
		switch (type) {
			case 'shotgun': return 16;
			case 'sniper': return 24;
			case 'enemy': return 14;
			default: return 18;
		}
	}

	getGlowColor(type) {
		switch (type) {
			case 'shotgun': return '#ffaa00';
			case 'sniper': return '#00ffff';
			case 'enemy': return '#ff4444';
			default: return '#ffff00';
		}
	}

	update(dt) {
		// Move bullet
		this.position.x += this.velocity.x * dt;
		this.position.y += this.velocity.y * dt;

		// Remove if out of bounds
		if (this.position.x < -20 || this.position.x > CANVAS_WIDTH + 20 ||
		    this.position.y < -20 || this.position.y > CANVAS_HEIGHT + 20) {
			this.cleanUp = true;
		}
	}

	onHit() {
		if (this.piercing) {
			this.pierceCount++;
			if (this.pierceCount >= this.maxPierceCount) {
				this.cleanUp = true;
			}
		} else {
			this.cleanUp = true;
		}
	}

	render() {
		const centerX = this.position.x + this.dimensions.x / 2;
		const centerY = this.position.y + this.dimensions.y / 2;

		// Check if sprite is loaded
		if (this.spriteName && SpriteManager.get(this.spriteName)) {
			// Glow effect
			context.save();
			context.globalAlpha = 0.6;
			context.shadowColor = this.glowColor;
			context.shadowBlur = 15;
			context.beginPath();
			context.arc(centerX, centerY, this.spriteWidth / 3, 0, Math.PI * 2);
			context.fillStyle = this.glowColor;
			context.fill();
			context.restore();

			// Render projectile sprite with rotation
			SpriteManager.render(
				this.spriteName,
				centerX,
				centerY,
				this.spriteWidth,
				this.spriteHeight,
				this.angle + Math.PI / 2
			);
		} else {
			// Fallback: Yellow bullet with glow
			context.save();
			
			context.fillStyle = this.glowColor;
			context.shadowColor = this.glowColor;
			context.shadowBlur = 10;
			
			context.beginPath();
			context.arc(centerX, centerY, 4, 0, Math.PI * 2);
			context.fill();
			
			context.restore();
		}
	}
}
