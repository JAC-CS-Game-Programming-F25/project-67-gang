import { context } from "../globals.js";
import SpriteManager from "./SpriteManager.js";

/**
 * Basic particle (colored shape)
 */
class Particle {
	constructor(x, y, vx, vy, color, size, lifetime) {
		this.x = x;
		this.y = y;
		this.vx = vx;
		this.vy = vy;
		this.color = color;
		this.size = size;
		this.lifetime = lifetime;
		this.age = 0;
		this.isDead = false;
		this.rotation = Math.random() * Math.PI * 2;
		this.rotationSpeed = (Math.random() - 0.5) * 10;
	}

	update(dt) {
		this.x += this.vx * dt;
		this.y += this.vy * dt;
		this.vx *= 0.95; // Friction
		this.vy *= 0.95;
		this.rotation += this.rotationSpeed * dt;
		
		this.age += dt;
		if (this.age >= this.lifetime) {
			this.isDead = true;
		}
	}

	render() {
		const alpha = 1 - (this.age / this.lifetime);
		const currentSize = this.size * (1 - this.age / this.lifetime * 0.5);
		
		context.save();
		context.globalAlpha = alpha;
		context.fillStyle = this.color;
		context.shadowColor = this.color;
		context.shadowBlur = 5;
		
		context.translate(this.x, this.y);
		context.rotate(this.rotation);
		context.fillRect(-currentSize / 2, -currentSize / 2, currentSize, currentSize);
		
		context.restore();
	}
}

/**
 * Sprite-based particle for death effects
 */
class SpriteParticle {
	constructor(x, y, vx, vy, spriteName, size, lifetime, glowColor = '#ff00ff') {
		this.x = x;
		this.y = y;
		this.vx = vx;
		this.vy = vy;
		this.spriteName = spriteName;
		this.size = size;
		this.lifetime = lifetime;
		this.age = 0;
		this.isDead = false;
		this.rotation = Math.random() * Math.PI * 2;
		this.rotationSpeed = (Math.random() - 0.5) * 8;
		this.glowColor = glowColor;
		this.gravity = 50; // Slight gravity for falling debris
	}

	update(dt) {
		this.x += this.vx * dt;
		this.y += this.vy * dt;
		this.vy += this.gravity * dt; // Apply gravity
		this.vx *= 0.98; // Less friction for debris
		this.vy *= 0.98;
		this.rotation += this.rotationSpeed * dt;
		
		this.age += dt;
		if (this.age >= this.lifetime) {
			this.isDead = true;
		}
	}

	render() {
		const alpha = 1 - (this.age / this.lifetime);
		const scale = 1 - (this.age / this.lifetime) * 0.3;
		
		// Glow underneath
		context.save();
		context.globalAlpha = alpha * 0.4;
		context.shadowColor = this.glowColor;
		context.shadowBlur = 10;
		context.beginPath();
		context.arc(this.x, this.y, this.size / 3, 0, Math.PI * 2);
		context.fillStyle = this.glowColor;
		context.fill();
		context.restore();

		// Render sprite
		SpriteManager.render(
			this.spriteName,
			this.x,
			this.y,
			this.size * scale,
			this.size * scale,
			this.rotation,
			alpha
		);
	}
}

/**
 * Glow particle for muzzle flashes and impacts
 */
class GlowParticle {
	constructor(x, y, color, size, lifetime) {
		this.x = x;
		this.y = y;
		this.color = color;
		this.size = size;
		this.lifetime = lifetime;
		this.age = 0;
		this.isDead = false;
	}

	update(dt) {
		this.age += dt;
		if (this.age >= this.lifetime) {
			this.isDead = true;
		}
	}

	render() {
		const alpha = 1 - (this.age / this.lifetime);
		const currentSize = this.size * (1 + this.age / this.lifetime);
		
		context.save();
		context.globalAlpha = alpha;
		context.shadowColor = this.color;
		context.shadowBlur = 30;
		context.beginPath();
		context.arc(this.x, this.y, currentSize, 0, Math.PI * 2);
		context.fillStyle = this.color;
		context.fill();
		context.restore();
	}
}

export default class ParticleSystem {
	constructor() {
		this.particles = [];
	}

	/**
	 * Create an explosion with colored particles
	 */
	createExplosion(x, y, color = '#ff00ff', count = 15) {
		for (let i = 0; i < count; i++) {
			const angle = (Math.PI * 2 * i) / count;
			const speed = 100 + Math.random() * 100;
			const vx = Math.cos(angle) * speed;
			const vy = Math.sin(angle) * speed;
			const size = 3 + Math.random() * 4;
			const lifetime = 0.3 + Math.random() * 0.4;
			
			this.particles.push(new Particle(x, y, vx, vy, color, size, lifetime));
		}

		// Add center glow
		this.particles.push(new GlowParticle(x, y, color, 15, 0.2));
	}

	/**
	 * Create death explosion with sprite debris
	 */
	createDeathExplosion(x, y, glowColor = '#ff4444', count = 8) {
		// Sprite debris chunks
		for (let i = 0; i < count; i++) {
			const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
			const speed = 80 + Math.random() * 120;
			const vx = Math.cos(angle) * speed;
			const vy = Math.sin(angle) * speed;
			const size = 15 + Math.random() * 15;
			const lifetime = 0.8 + Math.random() * 0.5;
			const chunkSprite = SpriteManager.getRandomChunk();
			
			this.particles.push(new SpriteParticle(x, y, vx, vy, chunkSprite, size, lifetime, glowColor));
		}

		// Core explosion glow
		this.particles.push(new GlowParticle(x, y, glowColor, 25, 0.3));
		this.particles.push(new GlowParticle(x, y, '#ffffff', 15, 0.15));

		// Extra colored particles
		for (let i = 0; i < 10; i++) {
			const angle = Math.random() * Math.PI * 2;
			const speed = 150 + Math.random() * 100;
			const vx = Math.cos(angle) * speed;
			const vy = Math.sin(angle) * speed;
			const size = 2 + Math.random() * 3;
			const lifetime = 0.2 + Math.random() * 0.3;
			
			this.particles.push(new Particle(x, y, vx, vy, glowColor, size, lifetime));
		}
	}

	/**
	 * Create boss death explosion (more dramatic)
	 */
	createBossDeathExplosion(x, y, glowColor = '#ff4444') {
		// Multiple waves of debris
		for (let wave = 0; wave < 3; wave++) {
			setTimeout(() => {
				this.createDeathExplosion(
					x + (Math.random() - 0.5) * 50, 
					y + (Math.random() - 0.5) * 50, 
					glowColor, 
					12
				);
			}, wave * 100);
		}

		// Big central glow
		this.particles.push(new GlowParticle(x, y, glowColor, 50, 0.5));
		this.particles.push(new GlowParticle(x, y, '#ffffff', 30, 0.3));
	}

	/**
	 * Create muzzle flash effect
	 */
	createMuzzleFlash(x, y, angle, color = '#ffff00') {
		// Directional particles
		for (let i = 0; i < 5; i++) {
			const spread = 0.3;
			const particleAngle = angle + (Math.random() - 0.5) * spread;
			const speed = 200 + Math.random() * 100;
			const vx = Math.cos(particleAngle) * speed;
			const vy = Math.sin(particleAngle) * speed;
			const size = 2 + Math.random() * 2;
			const lifetime = 0.1 + Math.random() * 0.1;
			
			this.particles.push(new Particle(x, y, vx, vy, color, size, lifetime));
		}

		// Flash glow
		this.particles.push(new GlowParticle(x, y, color, 8, 0.08));
	}

	/**
	 * Create hit impact effect
	 */
	createImpact(x, y, color = '#ffffff') {
		for (let i = 0; i < 6; i++) {
			const angle = Math.random() * Math.PI * 2;
			const speed = 50 + Math.random() * 50;
			const vx = Math.cos(angle) * speed;
			const vy = Math.sin(angle) * speed;
			const size = 2 + Math.random() * 2;
			const lifetime = 0.15 + Math.random() * 0.1;
			
			this.particles.push(new Particle(x, y, vx, vy, color, size, lifetime));
		}

		// Impact flash
		this.particles.push(new GlowParticle(x, y, color, 10, 0.1));
	}

	/**
	 * Create floating damage number
	 */
	createDamageNumber(x, y, damage, isCritical = false) {
		this.particles.push(new DamageNumber(x, y, damage, isCritical));
	}

	update(dt) {
		this.particles.forEach(particle => particle.update(dt));
		this.particles = this.particles.filter(p => !p.isDead);
	}

	render() {
		this.particles.forEach(particle => particle.render());
	}

	clear() {
		this.particles = [];
	}
}

/**
 * Floating damage number
 */
class DamageNumber {
	constructor(x, y, damage, isCritical = false) {
		this.x = x;
		this.y = y;
		this.damage = Math.round(damage);
		this.isCritical = isCritical;
		this.lifetime = 0.8;
		this.age = 0;
		this.isDead = false;
		this.vy = -80; // Float upward
		this.vx = (Math.random() - 0.5) * 30;
	}

	update(dt) {
		this.x += this.vx * dt;
		this.y += this.vy * dt;
		this.vy *= 0.95;
		
		this.age += dt;
		if (this.age >= this.lifetime) {
			this.isDead = true;
		}
	}

	render() {
		const alpha = 1 - (this.age / this.lifetime);
		const scale = this.isCritical ? 1.5 : 1;
		const yOffset = -this.age * 20; // Rise up
		
		context.save();
		context.globalAlpha = alpha;
		context.font = `bold ${16 * scale}px Orbitron`;
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		
		// Shadow/outline
		context.fillStyle = '#000000';
		context.fillText(this.damage, this.x + 1, this.y + yOffset + 1);
		
		// Main text
		context.fillStyle = this.isCritical ? '#ff4444' : '#ffffff';
		context.shadowColor = this.isCritical ? '#ff0000' : '#ffff00';
		context.shadowBlur = 5;
		context.fillText(this.damage, this.x, this.y + yOffset);
		
		context.restore();
	}
}
