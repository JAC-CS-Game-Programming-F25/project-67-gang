import Weapon from "./Weapon.js";
import Bullet from "./Bullet.js";

export default class Shotgun extends Weapon {
	constructor() {
		super();
		this.damage = 6; // Lower per-pellet damage
		this.fireRate = 0.6; // Slow fire rate
		this.bulletSpeed = 350; // Slower bullets
		this.pelletCount = 8; // 8 pellets per shot
		this.spread = 0.4; // Spread angle
		this.name = "Shotgun";
	}

	createBullets(x, y, angle) {
		const bullets = [];
		
		// Create multiple pellets in a spread
		for (let i = 0; i < this.pelletCount; i++) {
			const spreadAngle = angle + (Math.random() - 0.5) * this.spread;
			bullets.push(new Bullet(x, y, spreadAngle, this.damage, this.bulletSpeed));
		}
		
		return bullets;
	}
}