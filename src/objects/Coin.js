import GameObject from "./GameObject.js";
import { context, addCoins } from "../globals.js";

export default class Coin extends GameObject {
	constructor(x, y, value = 5) {
		super(x, y, 16, 16);
		
		this.value = value;
		this.lifetime = 10; // Despawn after 10 seconds
		this.age = 0;
		
		// Slight random velocity for scatter effect
		this.velocity = {
			x: (Math.random() - 0.5) * 50,
			y: (Math.random() - 0.5) * 50
		};
		this.friction = 0.9;
	}

	update(dt) {
		// Apply velocity with friction
		this.position.x += this.velocity.x * dt;
		this.position.y += this.velocity.y * dt;
		this.velocity.x *= this.friction;
		this.velocity.y *= this.friction;

		// Age and despawn
		this.age += dt;
		if (this.age >= this.lifetime) {
			this.cleanUp = true;
		}
	}

	collect() {
		addCoins(this.value);
		this.cleanUp = true;
	}

	render() {
		context.save();
		
		// Yellow coin with glow
		context.fillStyle = '#ffff00';
		context.shadowColor = '#ffff00';
		context.shadowBlur = 8;
		
		// Draw coin as circle
		context.beginPath();
		context.arc(
			this.position.x + this.dimensions.x / 2,
			this.position.y + this.dimensions.y / 2,
			8,
			0,
			Math.PI * 2
		);
		context.fill();
		
		// Outline
		context.strokeStyle = '#ffffff';
		context.lineWidth = 2;
		context.stroke();
		
		// $ symbol
		context.shadowBlur = 0;
		context.fillStyle = '#000000';
		context.font = 'bold 12px Roboto';
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.fillText('$', 
			this.position.x + this.dimensions.x / 2, 
			this.position.y + this.dimensions.y / 2
		);
		
		context.restore();
	}
}