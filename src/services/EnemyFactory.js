import EnemyType from "../enums/EnemyType.js";
import Drone from "../entities/Drone.js";
import Tank from "../entities/Tank.js";
import Turret from "../entities/Turret.js";
import Splitter from "../entities/Splitter.js";
import Elite from "../entities/Elite.js";
import Boss from "../entities/Boss.js";
import Teleporter from "../entities/Teleporter.js";
import Shielder from "../entities/Shielder.js";
import Spawner from "../entities/Spawner.js";

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
			case EnemyType.Teleporter:
				return new Teleporter(x, y);
			case EnemyType.Shielder:
				return new Shielder(x, y);
			case EnemyType.Spawner:
				return new Spawner(x, y);
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
		
		// Early waves (1-4): Mostly drones and tanks
		if (waveNumber <= 4) {
			return rand < 0.7 ? EnemyType.Drone : EnemyType.Tank;
		}
		// Waves 5-7: Add turrets and splitters
		else if (waveNumber <= 7) {
			if (rand < 0.35) return EnemyType.Drone;
			if (rand < 0.55) return EnemyType.Tank;
			if (rand < 0.75) return EnemyType.Turret;
			return EnemyType.Splitter;
		}
		// Waves 8-11: Add teleporters and shielders
		else if (waveNumber <= 11) {
			if (rand < 0.2) return EnemyType.Drone;
			if (rand < 0.35) return EnemyType.Tank;
			if (rand < 0.5) return EnemyType.Turret;
			if (rand < 0.65) return EnemyType.Splitter;
			if (rand < 0.8) return EnemyType.Teleporter;
			return EnemyType.Shielder;
		}
		// Waves 12-15: Add spawners
		else if (waveNumber <= 15) {
			if (rand < 0.15) return EnemyType.Drone;
			if (rand < 0.28) return EnemyType.Tank;
			if (rand < 0.4) return EnemyType.Turret;
			if (rand < 0.52) return EnemyType.Splitter;
			if (rand < 0.64) return EnemyType.Teleporter;
			if (rand < 0.76) return EnemyType.Shielder;
			if (rand < 0.88) return EnemyType.Spawner;
			return EnemyType.Elite;
		}
		// Late waves (16+): All enemy types with elites more common
		else {
			if (rand < 0.1) return EnemyType.Drone;
			if (rand < 0.2) return EnemyType.Tank;
			if (rand < 0.3) return EnemyType.Turret;
			if (rand < 0.42) return EnemyType.Splitter;
			if (rand < 0.54) return EnemyType.Teleporter;
			if (rand < 0.66) return EnemyType.Shielder;
			if (rand < 0.78) return EnemyType.Spawner;
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