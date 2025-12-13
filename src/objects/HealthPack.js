import GameObject from "./GameObject.js";
import { context, sounds } from "../globals.js";

export default class HealthPack extends GameObject {
	constructor(x, y) {
		super(x, y, 20, 20);
		
		this.healAmount = 30;
		this.lifetime = 15; // Despawn after 15 seconds
		this.age = 0;
		this.pulseTimer = 0;
	}

	update(dt) {
		this.age += dt;
		this.pulseTimer += dt;
		
		if (this.age >= this.lifetime) {
			this.cleanUp = true;
		}
	}

	collect(player) {
		player.heal(this.healAmount);
		sounds.play('health');
		this.cleanUp = true;
	}

	render() {
		// Pulsing effect
		const pulse = Math.sin(this.pulseTimer * 5) * 0.2 + 1;
		const size = this.dimensions.x * pulse;
		
		context.save();
		
		// Green glow
		context.shadowColor = '#00ff00';
		context.shadowBlur = 15;
		
		// Red cross background
		context.fillStyle = '#ff0000';
		context.fillRect(
			this.position.x + this.dimensions.x / 2 - size / 2,
			this.position.y + this.dimensions.y / 2 - size / 2,
			size,
			size
		);
		
		// White cross
		context.fillStyle = '#ffffff';
		const crossThick = size / 4;
		// Horizontal bar
		context.fillRect(
			this.position.x + this.dimensions.x / 2 - size / 2,
			this.position.y + this.dimensions.y / 2 - crossThick / 2,
			size,
			crossThick
		);
		// Vertical bar
		context.fillRect(
			this.position.x + this.dimensions.x / 2 - crossThick / 2,
			this.position.y + this.dimensions.y / 2 - size / 2,
			crossThick,
			size
		);
		
		context.restore();
	}
}