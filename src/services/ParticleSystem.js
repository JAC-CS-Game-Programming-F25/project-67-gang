import { context } from "../globals.js";

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
	}

	update(dt) {
		this.x += this.vx * dt;
		this.y += this.vy * dt;
		this.vx *= 0.95; // Friction
		this.vy *= 0.95;
		
		this.age += dt;
		if (this.age >= this.lifetime) {
			this.isDead = true;
		}
	}

	render() {
		const alpha = 1 - (this.age / this.lifetime);
		
		context.save();
		context.globalAlpha = alpha;
		context.fillStyle = this.color;
		context.shadowColor = this.color;
		context.shadowBlur = 5;
		
		context.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
		
		context.restore();
	}
}

export default class ParticleSystem {
	constructor() {
		this.particles = [];
	}

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
	}

	createMuzzleFlash(x, y, angle) {
		for (let i = 0; i < 5; i++) {
			const spread = 0.3;
			const particleAngle = angle + (Math.random() - 0.5) * spread;
			const speed = 200 + Math.random() * 100;
			const vx = Math.cos(particleAngle) * speed;
			const vy = Math.sin(particleAngle) * speed;
			const size = 2 + Math.random() * 2;
			const lifetime = 0.1 + Math.random() * 0.1;
			
			this.particles.push(new Particle(x, y, vx, vy, '#ffff00', size, lifetime));
		}
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