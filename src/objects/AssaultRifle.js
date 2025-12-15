import Weapon from "./Weapon.js";
import Bullet from "./Bullet.js";

export default class AssaultRifle extends Weapon {
	constructor() {
		super();
		this.damage = 10;
		this.fireRate = 0.15; // Fast fire rate
		this.bulletSpeed = 500;
		this.name = "Assault Rifle";
	}

	createBullets(x, y, angle) {
		return [new Bullet(x, y, angle, this.getActualDamage(), this.bulletSpeed, 'default')];
	}
}
