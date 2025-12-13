import GameObject from "./GameObject.js";
import { BULLET_SPEED, BULLET_DAMAGE, CANVAS_WIDTH, CANVAS_HEIGHT, context, stats } from "../globals.js";

export default class Bullet extends GameObject {
	constructor(x, y, angle) {
		super(x, y, 8, 8); // Small bullet
		
		this.angle = angle;
		this.speed = BULLET_SPEED;
		this.damage = BULLET_DAMAGE * (1 + stats.damageUpgrades * 0.15);
		
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