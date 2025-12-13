import EnemyType from "../enums/EnemyType.js";
import Drone from "../entities/Drone.js";
import Tank from "../entities/Tank.js";
import Turret from "../entities/Turret.js";
import Splitter from "../entities/Splitter.js";
import Elite from "../entities/Elite.js";
import Boss from "../entities/Boss.js";

export default class EnemyFactory {
	static createEnemy(type, x, y, isSmall = false) {
		switch (type) {
			case EnemyType.Drone:
				return new Drone(x, y);
			case EnemyType.Tank:
				return new Tank(x, y);
			case EnemyType.Turret:
				return new Turret(x, y);
			case EnemyType.Splitter:
				return new Splitter(x, y, isSmall);
			case EnemyType.Elite:
				return new Elite(x, y);
			default:
				return new Drone(x, y);
		}
	}

	static createBoss(x, y, waveNumber) {
		return new Boss(x, y, waveNumber);
	}

	/**
	 * Spawns enemies around the edges of the screen
	 */
	static spawnWaveEnemies(waveNumber, canvasWidth, canvasHeight) {
		const enemies = [];
		
		// Boss waves: 5, 10, 15, 20
		if (waveNumber % 5 === 0) {
			// Spawn boss in center
			const boss = this.createBoss(canvasWidth / 2, canvasHeight / 2, waveNumber);
			enemies.push(boss);
			
			// Also spawn some regular enemies (fewer than normal)
			const regularCount = 3 + Math.floor(waveNumber / 5);
			for (let i = 0; i < regularCount; i++) {
				const type = this.getRandomEnemyType(waveNumber);
				
				// Turrets spawn on-screen (they don't move), others at edges
				const { x, y } = type === EnemyType.Turret 
					? this.getRandomOnScreenPosition(canvasWidth, canvasHeight)
					: this.getRandomEdgePosition(canvasWidth, canvasHeight);
				
				enemies.push(this.createEnemy(type, x, y));
			}
		} else {
			// Regular waves - more enemies as waves progress
			const baseCount = 5;
			const enemyCount = baseCount + Math.floor(waveNumber * 1.5);

			for (let i = 0; i < enemyCount; i++) {
				const type = this.getRandomEnemyType(waveNumber);
				
				// Turrets spawn on-screen (they don't move), others at edges
				const { x, y } = type === EnemyType.Turret 
					? this.getRandomOnScreenPosition(canvasWidth, canvasHeight)
					: this.getRandomEdgePosition(canvasWidth, canvasHeight);
				
				enemies.push(this.createEnemy(type, x, y));
			}
		}

		return enemies;
	}

	static getRandomEnemyType(waveNumber) {
		const rand = Math.random();
		
		// Early waves (1-5): Mostly drones and tanks
		if (waveNumber <= 5) {
			return rand < 0.7 ? EnemyType.Drone : EnemyType.Tank;
		}
		// Mid waves (6-12): Add turrets and splitters
		else if (waveNumber <= 12) {
			if (rand < 0.4) return EnemyType.Drone;
			if (rand < 0.6) return EnemyType.Tank;
			if (rand < 0.8) return EnemyType.Turret;
			return EnemyType.Splitter;
		}
		// Late waves (13+): All enemy types including elite
		else {
			if (rand < 0.25) return EnemyType.Drone;
			if (rand < 0.45) return EnemyType.Tank;
			if (rand < 0.6) return EnemyType.Turret;
			if (rand < 0.75) return EnemyType.Splitter;
			return EnemyType.Elite;
		}
	}

	static getRandomEdgePosition(canvasWidth, canvasHeight) {
		const side = Math.floor(Math.random() * 4);
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

		return { x, y };
	}

	static getRandomOnScreenPosition(canvasWidth, canvasHeight) {
		// Spawn somewhere visible on screen (with margins)
		const margin = 100;
		const x = margin + Math.random() * (canvasWidth - margin * 2);
		const y = margin + Math.random() * (canvasHeight - margin * 2);
		return { x, y };
	}
}