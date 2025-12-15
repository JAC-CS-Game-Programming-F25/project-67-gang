/**
 * BackgroundManager - Handles decorative background elements
 * Renders rocks, floating meteors, and star particles for visual depth
 */

import { context, CANVAS_WIDTH, CANVAS_HEIGHT } from "../globals.js";
import SpriteManager from "./SpriteManager.js";

class BackgroundRock {
	constructor() {
		this.x = Math.random() * CANVAS_WIDTH;
		this.y = Math.random() * CANVAS_HEIGHT;
		this.spriteName = SpriteManager.getRandomRock();
		this.size = 30 + Math.random() * 40;
		this.rotation = Math.random() * Math.PI * 2;
		this.alpha = 0.3 + Math.random() * 0.3;
	}

	render() {
		SpriteManager.render(
			this.spriteName,
			this.x,
			this.y,
			this.size,
			this.size,
			this.rotation,
			this.alpha
		);
	}
}

class FloatingMeteor {
	constructor() {
		this.reset();
	}

	reset() {
		// Start from random edge
		const edge = Math.floor(Math.random() * 4);
		switch (edge) {
			case 0: // Top
				this.x = Math.random() * CANVAS_WIDTH;
				this.y = -50;
				break;
			case 1: // Right
				this.x = CANVAS_WIDTH + 50;
				this.y = Math.random() * CANVAS_HEIGHT;
				break;
			case 2: // Bottom
				this.x = Math.random() * CANVAS_WIDTH;
				this.y = CANVAS_HEIGHT + 50;
				break;
			case 3: // Left
				this.x = -50;
				this.y = Math.random() * CANVAS_HEIGHT;
				break;
		}

		// Random velocity towards screen center area
		const targetX = CANVAS_WIDTH / 2 + (Math.random() - 0.5) * CANVAS_WIDTH;
		const targetY = CANVAS_HEIGHT / 2 + (Math.random() - 0.5) * CANVAS_HEIGHT;
		const dx = targetX - this.x;
		const dy = targetY - this.y;
		const dist = Math.sqrt(dx * dx + dy * dy);
		const speed = 20 + Math.random() * 30;
		this.vx = (dx / dist) * speed;
		this.vy = (dy / dist) * speed;

		// Random properties
		this.spriteName = SpriteManager.sprites.environment.meteors[
			Math.floor(Math.random() * SpriteManager.sprites.environment.meteors.length)
		];
		this.size = 20 + Math.random() * 30;
		this.rotation = Math.random() * Math.PI * 2;
		this.rotationSpeed = (Math.random() - 0.5) * 2;
		this.alpha = 0.2 + Math.random() * 0.2;
	}

	update(dt) {
		this.x += this.vx * dt;
		this.y += this.vy * dt;
		this.rotation += this.rotationSpeed * dt;

		// Reset if out of bounds
		if (this.x < -100 || this.x > CANVAS_WIDTH + 100 ||
			this.y < -100 || this.y > CANVAS_HEIGHT + 100) {
			this.reset();
		}
	}

	render() {
		SpriteManager.render(
			this.spriteName,
			this.x,
			this.y,
			this.size,
			this.size,
			this.rotation,
			this.alpha
		);
	}
}

class Star {
	constructor() {
		this.x = Math.random() * CANVAS_WIDTH;
		this.y = Math.random() * CANVAS_HEIGHT;
		this.size = 1 + Math.random() * 2;
		this.alpha = 0.3 + Math.random() * 0.7;
		this.twinkleSpeed = 2 + Math.random() * 3;
		this.twinkleOffset = Math.random() * Math.PI * 2;
	}

	update(dt) {
		// Twinkle effect
		this.twinkleOffset += dt * this.twinkleSpeed;
	}

	render() {
		const alpha = this.alpha * (0.5 + Math.sin(this.twinkleOffset) * 0.5);
		
		context.save();
		context.globalAlpha = alpha;
		context.fillStyle = '#ffffff';
		context.shadowColor = '#ffffff';
		context.shadowBlur = 3;
		context.beginPath();
		context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
		context.fill();
		context.restore();
	}
}

export default class BackgroundManager {
	constructor() {
		this.rocks = [];
		this.meteors = [];
		this.stars = [];
		
		// Generate decorations
		this.generateDecorations();
	}

	generateDecorations() {
		// Static rocks (10-15)
		const rockCount = 10 + Math.floor(Math.random() * 6);
		for (let i = 0; i < rockCount; i++) {
			this.rocks.push(new BackgroundRock());
		}

		// Floating meteors (3-5)
		const meteorCount = 3 + Math.floor(Math.random() * 3);
		for (let i = 0; i < meteorCount; i++) {
			this.meteors.push(new FloatingMeteor());
		}

		// Stars (50-80)
		const starCount = 50 + Math.floor(Math.random() * 31);
		for (let i = 0; i < starCount; i++) {
			this.stars.push(new Star());
		}
	}

	update(dt) {
		// Update floating meteors
		this.meteors.forEach(meteor => meteor.update(dt));
		
		// Update star twinkle
		this.stars.forEach(star => star.update(dt));
	}

	render() {
		// Render background gradient
		this.renderGradient();

		// Render grid lines for cyberpunk feel
		this.renderGrid();

		// Render stars (furthest back)
		this.stars.forEach(star => star.render());

		// Render static rocks
		this.rocks.forEach(rock => rock.render());

		// Render floating meteors
		this.meteors.forEach(meteor => meteor.render());
	}

	renderGradient() {
		// Dark space gradient
		const gradient = context.createRadialGradient(
			CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 0,
			CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH
		);
		gradient.addColorStop(0, '#0f0f2a');
		gradient.addColorStop(0.5, '#0a0a1a');
		gradient.addColorStop(1, '#050510');
		
		context.fillStyle = gradient;
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	}

	renderGrid() {
		// Subtle grid for cyberpunk feel
		context.save();
		context.strokeStyle = '#1a1a3a';
		context.lineWidth = 1;
		context.globalAlpha = 0.3;

		const gridSize = 80;

		// Vertical lines
		for (let x = 0; x <= CANVAS_WIDTH; x += gridSize) {
			context.beginPath();
			context.moveTo(x, 0);
			context.lineTo(x, CANVAS_HEIGHT);
			context.stroke();
		}

		// Horizontal lines
		for (let y = 0; y <= CANVAS_HEIGHT; y += gridSize) {
			context.beginPath();
			context.moveTo(0, y);
			context.lineTo(CANVAS_WIDTH, y);
			context.stroke();
		}

		context.restore();
	}

	reset() {
		this.rocks = [];
		this.meteors = [];
		this.stars = [];
		this.generateDecorations();
	}
}

