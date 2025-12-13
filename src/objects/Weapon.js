export default class Weapon {
	constructor() {
		this.damage = 10;
		this.fireRate = 0.2; // Time between shots
		this.shootTimer = 0;
		this.canShoot = true;
		this.bulletSpeed = 400;
		this.name = "Weapon";
	}

	update(dt) {
		if (!this.canShoot) {
			this.shootTimer += dt;
			if (this.shootTimer >= this.fireRate) {
				this.canShoot = true;
				this.shootTimer = 0;
			}
		}
	}

	shoot() {
		if (this.canShoot) {
			this.canShoot = false;
			return true;
		}
		return false;
	}

	// Override in subclasses
	createBullets(x, y, angle) {
		return [];
	}
}