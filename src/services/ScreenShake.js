/**
 * Screen Shake Effect System
 */
export default class ScreenShake {
	constructor() {
		this.intensity = 0;
		this.duration = 0;
		this.timer = 0;
		this.offsetX = 0;
		this.offsetY = 0;
	}

	/**
	 * Trigger a screen shake
	 * @param {number} intensity - How strong the shake is (pixels)
	 * @param {number} duration - How long the shake lasts (seconds)
	 */
	shake(intensity, duration) {
		// Only replace if new shake is stronger
		if (intensity > this.intensity) {
			this.intensity = intensity;
			this.duration = duration;
			this.timer = 0;
		}
	}

	/**
	 * Small shake for impacts
	 */
	smallShake() {
		this.shake(4, 0.1);
	}

	/**
	 * Medium shake for enemy deaths
	 */
	mediumShake() {
		this.shake(8, 0.15);
	}

	/**
	 * Large shake for explosions and boss deaths
	 */
	largeShake() {
		this.shake(15, 0.25);
	}

	/**
	 * Huge shake for dramatic moments
	 */
	hugeShake() {
		this.shake(25, 0.4);
	}

	/**
	 * Update the shake effect
	 */
	update(dt) {
		if (this.timer < this.duration) {
			this.timer += dt;
			
			// Calculate remaining intensity (fade out)
			const progress = this.timer / this.duration;
			const currentIntensity = this.intensity * (1 - progress);
			
			// Random offset
			this.offsetX = (Math.random() * 2 - 1) * currentIntensity;
			this.offsetY = (Math.random() * 2 - 1) * currentIntensity;
		} else {
			this.offsetX = 0;
			this.offsetY = 0;
			this.intensity = 0;
		}
	}

	/**
	 * Apply shake transformation to canvas context
	 */
	apply(context) {
		context.translate(this.offsetX, this.offsetY);
	}

	/**
	 * Check if shake is active
	 */
	isShaking() {
		return this.timer < this.duration;
	}
}

