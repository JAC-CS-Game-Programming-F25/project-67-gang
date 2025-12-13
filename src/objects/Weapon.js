import { stats , DAMAGE_UPGRADE_BONUS} from "../globals.js";
export default class Weapon {
	constructor() {
		this.damage = 10;
		this.fireRate = 0.2;
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

	getActualDamage() {
		return Math.floor(this.damage * (1 + stats.damageUpgrades * DAMAGE_UPGRADE_BONUS));
	}

	// Override in subclasses
	createBullets(x, y, angle) {
		return [];
	}
}