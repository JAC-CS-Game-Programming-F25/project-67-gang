import Enemy from "./Enemy.js";
import { context } from "../globals.js";

export default class Turret extends Enemy {
	constructor(x, y) {
		super(x, y, 35, 35);
		
		this.health = 40;
		this.maxHealth = 40;
		this.speed = 0; // Doesn't move!
		this.damage = 15;
		this.coinValue = 8;
		this.color = '#ff00aa'; // Pink/magenta
	}

	update(dt, player) {
		// Turret doesn't move, just sits there
		// (Could add shooting behavior later)
		super.update(dt);
	}

	render() {
		// Draw as octagon (stationary turret)
		context.save();
		
		const centerX = this.position.x + this.dimensions.x / 2;
		const centerY = this.position.y + this.dimensions.y / 2;
		const radius = this.dimensions.x / 2;
		
		// Draw octagon
		context.fillStyle = this.color;
		context.beginPath();
		for (let i = 0; i < 8; i++) {
			const angle = (Math.PI * 2 * i) / 8;
			const x = centerX + radius * Math.cos(angle);
			const y = centerY + radius * Math.sin(angle);
			if (i === 0) {
				context.moveTo(x, y);
			} else {
				context.lineTo(x, y);
			}
		}
		context.closePath();
		context.fill();
		
		// Outline
		context.strokeStyle = '#ffffff';
		context.lineWidth = 2;
		context.stroke();
		
		context.restore();

		// Health bar
		this.renderHealthBar();
	}
}