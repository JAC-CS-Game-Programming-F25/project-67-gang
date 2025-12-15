/**
 * Combo System - Tracks kill streaks and provides score multipliers
 */
export default class ComboSystem {
	constructor() {
		this.comboCount = 0;
		this.comboTimer = 0;
		this.maxComboTime = 3.0; // 3 seconds to maintain combo
		this.multiplier = 1;
		this.highestCombo = 0;
	}

	/**
	 * Register a kill and increase combo
	 */
	addKill() {
		this.comboCount++;
		this.comboTimer = this.maxComboTime; // Reset timer
		this.updateMultiplier();
		
		if (this.comboCount > this.highestCombo) {
			this.highestCombo = this.comboCount;
		}
	}

	/**
	 * Update the combo timer
	 */
	update(dt) {
		if (this.comboCount > 0) {
			this.comboTimer -= dt;
			if (this.comboTimer <= 0) {
				this.resetCombo();
			}
		}
	}

	/**
	 * Reset combo (called when timer expires or player takes damage)
	 */
	resetCombo() {
		this.comboCount = 0;
		this.comboTimer = 0;
		this.multiplier = 1;
	}

	/**
	 * Calculate multiplier based on combo count
	 */
	updateMultiplier() {
		if (this.comboCount >= 20) {
			this.multiplier = 4.0;
		} else if (this.comboCount >= 15) {
			this.multiplier = 3.0;
		} else if (this.comboCount >= 10) {
			this.multiplier = 2.5;
		} else if (this.comboCount >= 5) {
			this.multiplier = 2.0;
		} else if (this.comboCount >= 3) {
			this.multiplier = 1.5;
		} else {
			this.multiplier = 1.0;
		}
	}

	/**
	 * Get current multiplier
	 */
	getMultiplier() {
		return this.multiplier;
	}

	/**
	 * Get timer progress (0-1)
	 */
	getTimerProgress() {
		return this.comboTimer / this.maxComboTime;
	}

	/**
	 * Check if combo is active
	 */
	isActive() {
		return this.comboCount > 0;
	}
}

