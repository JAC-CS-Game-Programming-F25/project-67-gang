import State from "../../lib/State.js";
import { context, CANVAS_WIDTH, CANVAS_HEIGHT, input, stateMachine, stats, sounds, saveGameState, deleteSaveGame } from "../globals.js";
import Input from "../../lib/Input.js";
import Player from "../entities/Player.js";
import Bullet from "../objects/Bullet.js";
import GameStateName from "../enums/GameStateName.js";
import EnemyFactory from "../services/EnemyFactory.js";
import Coin from "../objects/Coin.js";
import ParticleSystem from "../services/ParticleSystem.js";
import HealthPack from "../objects/HealthPack.js";

export default class PlayState extends State {
	constructor() {
		super();
	}

	enter(params = {}) {
			if (params.player && params.bullets) {
				this.player = params.player;
				this.currentWave = params.currentWave;
				this.bullets = params.bullets;
				this.enemies = params.enemies;
				this.coins = params.coins;
				this.healthPacks = params.healthPacks;
				this.particles = new ParticleSystem();
				
				console.log('Resumed from pause');
				return; // Skip rest of enter logic
			}
		// Check if loading from save game
		if (params.loadGame) {
			const saveData = params.loadGame;
			
			// Restore player with saved data
			this.player = new Player(saveData.player.x, saveData.player.y);
			this.player.health = saveData.player.health;
			this.player.maxHealth = saveData.player.maxHealth;
			
			// Restore stats
			stats.coins = saveData.stats.coins;
			stats.kills = saveData.stats.kills;
			stats.healthUpgrades = saveData.stats.healthUpgrades;
			stats.damageUpgrades = saveData.stats.damageUpgrades;
			
			// Restore wave
			this.currentWave = saveData.currentWave;
			
			console.log(`Loaded save game - Wave ${this.currentWave}`);
		}
		// Coming from shop, keep the same player
		else if (params.player) {
			this.player = params.player;
			this.currentWave = params.nextWave;
		} 
		// New game - create new player
		else {
			this.player = new Player(CANVAS_WIDTH / 2 - 20, CANVAS_HEIGHT / 2 - 20);
			this.currentWave = 1;
			
			// Delete old save when starting new game
			deleteSaveGame();
		}
		
		this.bullets = [];
		this.enemies = [];
		this.coins = [];
		this.healthPacks = [];
		this.particles = new ParticleSystem();
		
		// Spawn wave
		this.spawnWave();
		
		// Start background music
		if (!sounds.get('music').pool[0].paused) {
			sounds.stop('music');
		}
		sounds.play('music');
		
		console.log(`Wave ${this.currentWave} started!`);
	}

	spawnWave() {
		this.enemies = EnemyFactory.spawnWaveEnemies(this.currentWave, CANVAS_WIDTH, CANVAS_HEIGHT);
		stats.wave = this.currentWave;
		console.log(`Wave ${this.currentWave} - ${this.enemies.length} enemies!`);
	}

	update(dt) {
		// Check for pause (P key)
		if (input.isKeyPressed(Input.KEYS.P)) {
			stateMachine.change(GameStateName.Pause, {
				playStateData: {
					player: this.player,
					currentWave: this.currentWave,
					bullets: this.bullets,
					enemies: this.enemies,
					coins: this.coins,
					healthPacks: this.healthPacks
				}
			});
			return; // Stop updating when paused
		}
		// Update player
		this.player.update(dt);

		// Handle shooting
		if (input.isMouseButtonHeld(Input.MOUSE.LEFT)) {
			if (this.player.shoot()) {
				const center = this.player.getCenter();
				const bullet = new Bullet(center.x - 4, center.y - 4, this.player.aimAngle);
				this.bullets.push(bullet);

				this.particles.createMuzzleFlash(center.x, center.y, this.player.aimAngle);
				sounds.play('shoot');
			}
		}

		// Update bullets
		this.bullets.forEach(bullet => bullet.update(dt));

		// Update enemies
		this.enemies.forEach(enemy => enemy.update(dt, this.player));
		
		// Update coins
		this.coins.forEach(coin => coin.update(dt));

		// Update health packs
		this.healthPacks.forEach(healthPack => healthPack.update(dt));

		// Update particle system
		this.particles.update(dt);
	
		// Check bullet-enemy collisions
		this.checkBulletEnemyCollisions();

		// Check player-enemy collisions
		this.checkPlayerEnemyCollisions();
		
		// Check player-coin collisions 
		this.checkPlayerCoinCollisions();

		// Check player-health pack collisions
		this.checkPlayerHealthPackCollisions();

		// Remove dead entities
		this.bullets = this.bullets.filter(bullet => !bullet.cleanUp);
		this.enemies = this.enemies.filter(enemy => !enemy.isDead);
		this.coins = this.coins.filter(coin => !coin.cleanUp); 
		this.healthPacks = this.healthPacks.filter(pack => !pack.cleanUp);

		// Check wave completion
		if (this.enemies.length === 0) {
			this.onWaveComplete();
		}

		// Check if player is dead
		if (this.player.isDead) {
			deleteSaveGame();
			stateMachine.change(GameStateName.GameOver);
		}
	}

	checkBulletEnemyCollisions() {
		this.bullets.forEach(bullet => {
			this.enemies.forEach(enemy => {
				if (!bullet.cleanUp && !enemy.isDead && bullet.didCollideWithEntity(enemy)) {
					const wasDead = enemy.isDead;
					
					enemy.takeDamage(bullet.damage);
					bullet.cleanUp = true;
					
					// Drop coin and explode if enemy just died
					if (enemy.isDead && !wasDead) {
						const coinData = enemy.dropCoin();
						
						// Random drop: 25% health pack, 50% coin, 25% nothing
						const dropRoll = Math.random();
						if (dropRoll < 0.25) {
							// 25% chance: Health pack
							this.healthPacks.push(new HealthPack(coinData.x - 10, coinData.y - 10));
						} else if (dropRoll < 0.75) {
							// 50% chance: Coin (0.25 to 0.75)
							this.coins.push(new Coin(coinData.x - 8, coinData.y - 8, coinData.value));
						}
						// 25% chance: Nothing (0.75 to 1.0)
						
						sounds.play('death');

						// Explosion effect
						this.particles.createExplosion(
							coinData.x, 
							coinData.y, 
							enemy.color, 
							20
						);
					}
				}
			});
		});
	}

	checkPlayerEnemyCollisions() {
		this.enemies.forEach(enemy => {
			if (this.player.didCollideWithEntity(enemy)) {
				this.player.takeDamage(enemy.damage);
				enemy.isDead = true; // Enemy dies on contact
			}
		});
	}
	checkPlayerCoinCollisions() {
		this.coins.forEach(coin => {
			if (this.player.didCollideWithEntity(coin)) {
				coin.collect();
			}
		});
	}
	checkPlayerHealthPackCollisions() {
		this.healthPacks.forEach(pack => {
			if (this.player.didCollideWithEntity(pack)) {
				pack.collect(this.player);
			}
		});
	}

	onWaveComplete() {
		sounds.play('waveComplete');
		if (this.currentWave >= 5) {
			// Victory!
			deleteSaveGame();
			stateMachine.change(GameStateName.Victory);
		} else {
			saveGameState(this.player, this.currentWave + 1);
			// Next wave - pass player to shop
			stateMachine.change(GameStateName.Shop, { 
				nextWave: this.currentWave + 1,
				player: this.player 
			});
		}
	}

	render() {
		context.save();
		
		// Dark background
		context.fillStyle = '#0a0a1a';
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		
		// Render enemies
		this.enemies.forEach(enemy => enemy.render());
		
		// Render coins
		this.coins.forEach(coin => coin.render());

		// Render health packs
		this.healthPacks.forEach(healthPack => healthPack.render());

		// Render particle system
		this.particles.render();

		// Render player
		this.player.render();

		// Render bullets
		this.bullets.forEach(bullet => bullet.render());

		// HUD
		this.renderHUD();
		
		context.restore();
	}

	renderHUD() {
		context.save();
		context.fillStyle = '#ffffff';
		context.font = '20px Roboto';
		context.textAlign = 'left';
		
		// Health
		context.fillText(`HP: ${Math.ceil(this.player.health)}/${this.player.maxHealth}`, 20, 30);
		
		// Wave
		context.fillText(`Wave: ${this.currentWave}/5`, 20, 60);
		
		// Enemies remaining
		context.fillText(`Enemies: ${this.enemies.length}`, 20, 90);

		// Coins
		context.fillText(`Coins: ${stats.coins}`, 20, 120);
		
		context.restore();
	}
}