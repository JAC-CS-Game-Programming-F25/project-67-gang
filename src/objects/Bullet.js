import GameObject from "./GameObject.js";
import { CANVAS_WIDTH, CANVAS_HEIGHT, context, stats } from "../globals.js";

export default class Bullet extends GameObject {
	constructor(x, y, angle, damage = 10, speed = 400) {
		super(x, y, 8, 8);
		
		this.angle = angle;
		this.speed = speed;
		this.damage = damage;
		
		// Piercing properties (for sniper)
		this.piercing = false;
		this.maxPierceCount = 0;
		this.pierceCount = 0;
		
		// Calculate velocity based on angle
		this.velocity = {
			x: Math.cos(angle) * this.speed,
			y: Math.sin(angle) * this.speed
		};
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
		context.save();
		
		// Yellow bullet with glow
		context.fillStyle = '#ffff00';
		context.shadowColor = '#ffff00';
		context.shadowBlur = 10;
		
		context.beginPath();
		context.arc(
			this.position.x + this.dimensions.x / 2,
			this.position.y + this.dimensions.y / 2,
			4,
			0,
			Math.PI * 2
		);
		context.fill();
		
		context.restore();
	}
}