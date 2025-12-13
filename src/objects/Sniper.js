import Weapon from "./Weapon.js";
import Bullet from "./Bullet.js";

export default class Sniper extends Weapon {
	constructor() {
		super();
		this.damage = 50; // Very high damage
		this.fireRate = 1.0; // Slow fire rate (1 second between shots)
		this.bulletSpeed = 800; // Fast bullets
		this.name = "Sniper";
		this.piercing = true; // Can go through enemies
	}

	createBullets(x, y, angle) {
		const bullet = new Bullet(x, y, angle, this.getActualDamage(), this.bulletSpeed);
		bullet.piercing = true;
		bullet.maxPierceCount = 3;
		bullet.pierceCount = 0;
		return [bullet];
	}
}