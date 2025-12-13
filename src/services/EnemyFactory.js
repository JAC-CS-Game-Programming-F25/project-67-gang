import EnemyType from "../enums/EnemyType.js";
import Drone from "../entities/Drone.js";
import Tank from "../entities/Tank.js";

export default class EnemyFactory {
	static createEnemy(type, x, y) {
		switch (type) {
			case EnemyType.Drone:
				return new Drone(x, y);
			case EnemyType.Tank:
				return new Tank(x, y);
			default:
				return new Drone(x, y);
		}
	}

	/**
	 * Spawns enemies around the edges of the screen
	 */
	static spawnWaveEnemies(waveNumber, canvasWidth, canvasHeight) {
		const enemies = [];
		const baseCount = 3;
		const enemyCount = baseCount + waveNumber * 2; // More enemies each wave

		for (let i = 0; i < enemyCount; i++) {
			// Random position on screen edges
			const side = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
			let x, y;

			switch (side) {
				case 0: // Top
					x = Math.random() * canvasWidth;
					y = -50;
					break;
				case 1: // Right
					x = canvasWidth + 50;
					y = Math.random() * canvasHeight;
					break;
				case 2: // Bottom
					x = Math.random() * canvasWidth;
					y = canvasHeight + 50;
					break;
				case 3: // Left
					x = -50;
					y = Math.random() * canvasHeight;
					break;
			}

			// Mix of Drones and Tanks
			// More tanks as waves progress
			const type = Math.random() < (0.3 + waveNumber * 0.1) 
				? EnemyType.Tank 
				: EnemyType.Drone;

			enemies.push(this.createEnemy(type, x, y));
		}

		return enemies;
	}
}