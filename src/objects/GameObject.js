export default class GameObject {
	/**
	 * Base class for all game objects (bullets, powerups, etc.)
	 */
	constructor(x, y, width, height) {
		this.position = { x, y };
		this.dimensions = { x: width, y: height };
		this.cleanUp = false;
	}

	update(dt) {
		// Override in subclasses
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