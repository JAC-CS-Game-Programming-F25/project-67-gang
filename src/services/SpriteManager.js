/**
 * SpriteManager - Centralized sprite access and rendering utilities
 * Provides easy access to loaded sprites by category and helper methods for rendering
 */

import { images, context } from "../globals.js";

const SpriteManager = {
	// Sprite categories for organized access
	sprites: {
		player: 'player-ship',
		enemies: {
			drone: 'drone',
			tank: 'tank',
			turret: 'turret',
			splitter: 'splitter',
			elite: 'elite'
		},
		bosses: {
			wave5: 'boss-1',
			wave10: 'boss-2',
			wave15: 'boss-3',
			wave20: 'boss-4'
		},
		projectiles: {
			player: 'projectile-player',
			shotgun: 'projectile-shotgun',
			sniper: 'projectile-sniper',
			enemy: 'projectile-enemy'
		},
		pickups: {
			health: 'pickup-health',
			coin: 'pickup-coin',
			crate: 'pickup-crate'
		},
		particles: {
			glow: 'particle-glow',
			smoke: 'particle-smoke',
			circle: 'particle-circle',
			debris: 'particle-debris'
		},
		chunks: ['chunk-1', 'chunk-2', 'chunk-3', 'chunk-4'],
		environment: {
			rocks: ['rock-1', 'rock-2', 'rock-3'],
			meteors: ['meteor-1', 'meteor-2']
		}
	},

	/**
	 * Get a Graphic object by name
	 * @param {string} name - Sprite name from config
	 * @returns {Graphic|null}
	 */
	get(name) {
		return images.get(name);
	},

	/**
	 * Check if a sprite is loaded and ready
	 * @param {string} name - Sprite name
	 * @returns {boolean}
	 */
	isLoaded(name) {
		const graphic = this.get(name);
		return graphic && graphic.image && graphic.image.complete && graphic.image.naturalWidth > 0;
	},

	/**
	 * Render a sprite centered at position with optional rotation
	 * @param {string} name - Sprite name
	 * @param {number} x - Center X position
	 * @param {number} y - Center Y position
	 * @param {number} width - Render width
	 * @param {number} height - Render height
	 * @param {number} rotation - Rotation in radians (default 0)
	 * @param {number} alpha - Opacity (default 1)
	 */
	render(name, x, y, width, height, rotation = 0, alpha = 1) {
		const graphic = this.get(name);
		
		// Check if sprite is loaded
		if (!graphic || !graphic.image || !graphic.image.complete || graphic.image.naturalWidth === 0) {
			// Fallback to colored rectangle if sprite not loaded
			context.save();
			context.globalAlpha = alpha;
			context.fillStyle = '#ff00ff';
			context.translate(x, y);
			if (rotation !== 0) {
				context.rotate(rotation);
			}
			context.fillRect(-width / 2, -height / 2, width, height);
			context.restore();
			return;
		}

		context.save();
		context.globalAlpha = alpha;
		context.translate(x, y);
		
		if (rotation !== 0) {
			context.rotate(rotation);
		}
		
		context.drawImage(
			graphic.image,
			-width / 2,
			-height / 2,
			width,
			height
		);
		
		context.restore();
	},

	/**
	 * Render a sprite with glow effect
	 * @param {string} name - Sprite name
	 * @param {number} x - Center X position
	 * @param {number} y - Center Y position
	 * @param {number} width - Render width
	 * @param {number} height - Render height
	 * @param {string} glowColor - Glow color (default cyan)
	 * @param {number} glowSize - Glow blur size (default 10)
	 */
	renderWithGlow(name, x, y, width, height, glowColor = '#00ffff', glowSize = 10) {
		context.save();
		context.shadowColor = glowColor;
		context.shadowBlur = glowSize;
		this.render(name, x, y, width, height);
		context.restore();
	},

	/**
	 * Get a random chunk sprite name for death effects
	 * @returns {string}
	 */
	getRandomChunk() {
		const chunks = this.sprites.chunks;
		return chunks[Math.floor(Math.random() * chunks.length)];
	},

	/**
	 * Get a random rock sprite name
	 * @returns {string}
	 */
	getRandomRock() {
		const rocks = this.sprites.environment.rocks;
		return rocks[Math.floor(Math.random() * rocks.length)];
	},

	/**
	 * Get boss sprite based on wave number
	 * @param {number} wave - Current wave (5, 10, 15, or 20)
	 * @returns {string}
	 */
	getBossSprite(wave) {
		switch (wave) {
			case 5: return this.sprites.bosses.wave5;
			case 10: return this.sprites.bosses.wave10;
			case 15: return this.sprites.bosses.wave15;
			case 20: return this.sprites.bosses.wave20;
			default: return this.sprites.bosses.wave5;
		}
	}
};

export default SpriteManager;
