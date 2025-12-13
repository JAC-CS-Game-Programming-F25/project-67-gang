export default class GameEntity {
	/**
	 * Base class for all game entities (player, enemies, etc.)
	 */
	constructor(x, y, width, height) {
		this.position = { x, y };
		this.dimensions = { x: width, y: height };
		this.velocity = { x: 0, y: 0 };
		this.isDead = false;
		this.cleanUp = false;
	}

	update(dt) {
		this.position.x += this.velocity.x * dt;
		this.position.y += this.velocity.y * dt;
	}

	render(context) {
		// Override in subclasses
	}

	didCollideWithEntity(entity) {
		// AABB collision detection
		return this.position.x < entity.position.x + entity.dimensions.x
			&& this.position.x + this.dimensions.x > entity.position.x
			&& this.position.y < entity.position.y + entity.dimensions.y
			&& this.position.y + this.dimensions.y > entity.position.y;
	}
}