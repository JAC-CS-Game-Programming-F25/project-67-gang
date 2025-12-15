import State from "../../lib/State.js";
import { context, CANVAS_WIDTH, CANVAS_HEIGHT, input, stateMachine, stats, sounds, saveGameState, deleteSaveGame, DAMAGE_UPGRADE_BONUS } from "../globals.js";
import Input from "../../lib/Input.js";
import Player from "../entities/Player.js";
import Bullet from "../objects/Bullet.js";
import GameStateName from "../enums/GameStateName.js";
import EnemyFactory from "../services/EnemyFactory.js";
import Coin from "../objects/Coin.js";
import ParticleSystem from "../services/ParticleSystem.js";
import HealthPack from "../objects/HealthPack.js";
import PowerUp from "../objects/PowerUp.js";
import EnemyType from "../enums/EnemyType.js";
import BackgroundManager from "../services/BackgroundManager.js";
import UIRenderer from "../services/UIRenderer.js";
import ComboSystem from "../services/ComboSystem.js";
import ScreenShake from "../services/ScreenShake.js";

export default class PlayState extends State {
	constructor() {
		super();
		this.background = new BackgroundManager();
		this.combo = new ComboSystem();
		this.screenShake = new ScreenShake();
		this.isMuted = false;
	}

	enter(params = {}) {
			if (params.player && params.bullets) {
				this.player = params.player;
				this.currentWave = params.currentWave;
				this.bullets = params.bullets;
				this.enemies = params.enemies;
				this.coins = params.coins;
				this.healthPacks = params.healthPacks;
				this.powerUps = params.powerUps || [];
				this.particles = new ParticleSystem();
				this.combo = params.combo || new ComboSystem();
				
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
		this.powerUps = [];
		this.particles = new ParticleSystem();
		this.combo = new ComboSystem();
		this.screenShake = new ScreenShake();
		
		// Reset background for variety
		this.background.reset();
		
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
		// Check for pause (ESC or P key)
		if (input.isKeyPressed(Input.KEYS.ESCAPE) || input.isKeyPressed(Input.KEYS.P)) {
			stateMachine.change(GameStateName.Pause, {
				playStateData: {
					player: this.player,
					currentWave: this.currentWave,
					bullets: this.bullets,
					enemies: this.enemies,
					coins: this.coins,
					healthPacks: this.healthPacks,
					powerUps: this.powerUps,
					combo: this.combo
				}
			});
			return; // Stop updating when paused
		}

		// Mute toggle (M key)
		if (input.isKeyPressed(Input.KEYS.M)) {
			this.toggleMute();
		}

		// Update screen shake
		this.screenShake.update(dt);

		// Update combo system
		this.combo.update(dt);

		// Update background (floating meteors, star twinkle)
		this.background.update(dt);

		// Update player
		this.player.update(dt);

		// Handle shooting
		if (input.isMouseButtonHeld(Input.MOUSE.LEFT)) {
			if (this.player.shoot()) {
				const center = this.player.getCenter();
				
				// Create bullets based on weapon type (apply damage boost)
				const newBullets = this.player.currentWeapon.createBullets(
					center.x - 4, 
					center.y - 4, 
					this.player.aimAngle
				);
				
				// Apply damage multiplier from power-ups
				const damageMultiplier = this.player.getDamageMultiplier();
				newBullets.forEach(bullet => {
					bullet.damage = Math.floor(bullet.damage * damageMultiplier);
				});
				
				this.bullets.push(...newBullets);
				
				// Muzzle flash
				this.particles.createMuzzleFlash(center.x, center.y, this.player.aimAngle);
				
				// Shoot sound
				if (!this.isMuted) sounds.play('shoot');
			}
		}

		// Update bullets
		this.bullets.forEach(bullet => bullet.update(dt));

		// Update enemies
		this.enemies.forEach(enemy => enemy.update(dt, this.player));
		
		// Check for spawner minions
		this.handleSpawnerMinions();
		
		// Update coins (with magnet effect)
		this.updateCoinsWithMagnet(dt);

		// Update health packs
		this.healthPacks.forEach(healthPack => healthPack.update(dt));

		// Update power-ups
		this.powerUps.forEach(powerUp => powerUp.update(dt));

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

		// Check player-power-up collisions
		this.checkPlayerPowerUpCollisions();

		// Remove dead entities
		this.bullets = this.bullets.filter(bullet => !bullet.cleanUp);
		this.enemies = this.enemies.filter(enemy => !enemy.isDead);
		this.coins = this.coins.filter(coin => !coin.cleanUp); 
		this.healthPacks = this.healthPacks.filter(pack => !pack.cleanUp);
		this.powerUps = this.powerUps.filter(powerUp => !powerUp.cleanUp);

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

	toggleMute() {
		this.isMuted = !this.isMuted;
		if (this.isMuted) {
			sounds.stop('music');
		} else {
			sounds.play('music');
		}
	}

	handleSpawnerMinions() {
		this.enemies.forEach(enemy => {
			if (enemy.constructor.name === 'Spawner') {
				const minionData = enemy.getSpawnedMinion();
				if (minionData) {
					const minion = EnemyFactory.createEnemy(EnemyType.Drone, minionData.x, minionData.y);
					enemy.registerMinion(minion);
					this.enemies.push(minion);
				}
			}
		});
	}

	updateCoinsWithMagnet(dt) {
		const playerCenter = this.player.getCenter();
		const hasMagnet = this.player.hasCoinMagnet();
		const magnetRange = this.player.getCoinMagnetRange();
		
		this.coins.forEach(coin => {
			coin.update(dt);
			
			// Magnet attraction
			if (hasMagnet) {
				const dx = playerCenter.x - (coin.position.x + coin.dimensions.x / 2);
				const dy = playerCenter.y - (coin.position.y + coin.dimensions.y / 2);
				const distance = Math.sqrt(dx * dx + dy * dy);
				
				if (distance < magnetRange && distance > 0) {
					const speed = 300 * (1 - distance / magnetRange); // Faster when closer
					coin.position.x += (dx / distance) * speed * dt;
					coin.position.y += (dy / distance) * speed * dt;
				}
			}
		});
	}

	checkPlayerPowerUpCollisions() {
		this.powerUps.forEach(powerUp => {
			if (this.player.didCollideWithEntity(powerUp)) {
				powerUp.collect(this.player);
			}
		});
	}

	checkBulletEnemyCollisions() {
		this.bullets.forEach(bullet => {
			this.enemies.forEach(enemy => {
				if (!bullet.cleanUp && !enemy.isDead && bullet.didCollideWithEntity(enemy)) {
					const wasDead = enemy.isDead;
					
					enemy.takeDamage(bullet.damage);
					
					// Small screen shake on hit
					this.screenShake.smallShake();
					
					// Impact effect
					this.particles.createImpact(
						bullet.position.x + bullet.dimensions.x / 2,
						bullet.position.y + bullet.dimensions.y / 2,
						enemy.glowColor || '#ffffff'
					);
					
					// Damage number (show combo multiplier if active)
					const comboMult = this.combo.getMultiplier();
					this.particles.createDamageNumber(
						enemy.position.x + enemy.dimensions.x / 2,
						enemy.position.y,
						bullet.damage,
						comboMult > 1.5 // Is critical if high combo
					);
					
					bullet.onHit();
					
					// Drop coin and explode if enemy just died
					if (enemy.isDead && !wasDead) {
						// Add to combo
						this.combo.addKill();
						stats.kills++;
						
						const coinData = enemy.dropCoin();	
						
						// Handle splitter spawning 2 small enemies
						if (enemy.shouldSplit) {
							const { x, y } = coinData;
							this.enemies.push(EnemyFactory.createEnemy(EnemyType.Splitter, x - 20, y, true));
							this.enemies.push(EnemyFactory.createEnemy(EnemyType.Splitter, x + 20, y, true));
						}
						
						// Calculate coin value with combo multiplier
						const comboValue = Math.floor(coinData.value * this.combo.getMultiplier());
						
						// Random drop: 15% power-up, 20% health pack, 50% coin, 15% nothing
						const dropRoll = Math.random();
						if (dropRoll < 0.15 && this.currentWave >= 3) {
							// Random power-up type
							const powerUpTypes = ['speed', 'damage', 'shield', 'magnet'];
							const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
							this.powerUps.push(new PowerUp(coinData.x - 15, coinData.y - 15, randomType));
						} else if (dropRoll < 0.35) {
							this.healthPacks.push(new HealthPack(coinData.x - 10, coinData.y - 10));
						} else if (dropRoll < 0.85) {
							this.coins.push(new Coin(coinData.x - 8, coinData.y - 8, comboValue));
						}
						
						if (!this.isMuted) sounds.play('death');

						// Screen shake based on enemy type
						if (enemy.isBoss) {
							this.screenShake.hugeShake();
							this.particles.createBossDeathExplosion(
								coinData.x, 
								coinData.y, 
								enemy.glowColor || '#ff4444'
							);
						} else {
							this.screenShake.mediumShake();
							this.particles.createDeathExplosion(
								coinData.x, 
								coinData.y, 
								enemy.glowColor || '#ff00ff',
								6
							);
						}
					}
				}
			});
		});
	}

	checkPlayerEnemyCollisions() {
		this.enemies.forEach(enemy => {
			if (!this.player.isInvincible && !this.player.isDashing && this.player.didCollideWithEntity(enemy)) {
				this.player.takeDamage(enemy.damage);
				
				// Reset combo when hit
				this.combo.resetCombo();
				
				// Screen shake when player takes damage
				this.screenShake.largeShake();
				
				// Impact effect on player
				this.particles.createImpact(
					this.player.position.x + this.player.dimensions.x / 2,
					this.player.position.y + this.player.dimensions.y / 2,
					'#ff0000'
				);
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
		if (!this.isMuted) sounds.play('waveComplete');
		if (this.currentWave >= 20) {
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
		
		// Apply screen shake
		this.screenShake.apply(context);
		
		// Render background (gradient, grid, stars, rocks, meteors)
		this.background.render();
		
		// Render enemies
		this.enemies.forEach(enemy => enemy.render());
		
		// Render coins
		this.coins.forEach(coin => coin.render());

		// Render health packs
		this.healthPacks.forEach(healthPack => healthPack.render());

		// Render power-ups
		this.powerUps.forEach(powerUp => powerUp.render());

		// Render particle system
		this.particles.render();

		// Render player
		this.player.render();

		// Render bullets
		this.bullets.forEach(bullet => bullet.render());

		context.restore();
		
		// HUD (not affected by screen shake)
		this.renderHUD();
	}

	renderHUD() {
		context.save();
		
		// Top-left status panel
		this.renderStatusPanel();
		
		// Top-right wave indicator
		this.renderWaveIndicator();
		
		// Combo display (top center)
		this.renderComboDisplay();
		
		// Active boosts display (below status panel)
		this.renderActiveBoosts();
		
		// Bottom weapon bar
		this.renderWeaponBar();
		
		// Mute indicator
		if (this.isMuted) {
			context.font = '14px Orbitron';
			context.fillStyle = '#ff4444';
			context.textAlign = 'right';
			context.fillText('🔇 MUTED', CANVAS_WIDTH - 20, CANVAS_HEIGHT - 20);
		}
		
		context.restore();
	}

	renderStatusPanel() {
		const x = 15;
		const y = 15;
		const width = 220;
		const height = 90;
		
		// Panel background
		context.fillStyle = 'rgba(10, 20, 40, 0.85)';
		context.strokeStyle = '#00ffff';
		context.lineWidth = 1;
		context.beginPath();
		context.roundRect(x, y, width, height, 6);
		context.fill();
		context.stroke();
		
		// Corner accents
		context.fillStyle = '#00ffff';
		context.fillRect(x, y, 15, 2);
		context.fillRect(x, y, 2, 15);
		context.fillRect(x + width - 15, y, 15, 2);
		context.fillRect(x + width - 2, y, 2, 15);
		
		// Health bar
		context.font = '12px Orbitron';
		context.fillStyle = '#888888';
		context.textAlign = 'left';
		context.fillText('HULL', x + 10, y + 22);
		
		UIRenderer.renderProgressBar(
			x + 50, y + 12, 155, 16,
			this.player.health, this.player.maxHealth,
			this.player.health > 30 ? '#00ff88' : '#ff4444'
		);
		
		// Stats row
		context.font = '14px Orbitron';
		
		// Coins
		context.fillStyle = '#ffff00';
		context.shadowColor = '#ffff00';
		context.shadowBlur = 5;
		context.fillText(`💰 ${stats.coins}`, x + 10, y + 52);
		context.shadowBlur = 0;
		
		// Kills
		context.fillStyle = '#ff00ff';
		context.fillText(`☠ ${stats.kills}`, x + 100, y + 52);
		
		// Damage bonus
		const dmgBonus = stats.damageUpgrades * DAMAGE_UPGRADE_BONUS * 100;
		if (dmgBonus > 0) {
			context.fillStyle = '#ff4444';
			context.font = '11px Roboto';
			context.fillText(`+${dmgBonus.toFixed(0)}% DMG`, x + 160, y + 52);
		}
		
		// Dash indicator
		context.font = '10px Roboto';
		context.fillStyle = this.player.canDash ? '#00ff88' : '#555555';
		context.fillText(this.player.canDash ? 'DASH READY' : 'DASH...', x + 10, y + 70);
		
		// Controls hint
		context.font = '10px Roboto';
		context.fillStyle = '#555555';
		context.fillText('ESC: Pause  M: Mute', x + 10, y + 84);
	}

	renderWaveIndicator() {
		const x = CANVAS_WIDTH - 180;
		const y = 15;
		
		// Panel
		context.fillStyle = 'rgba(10, 20, 40, 0.85)';
		context.strokeStyle = this.enemies.some(e => e.isBoss) ? '#ff4444' : '#00ffff';
		context.lineWidth = 2;
		context.beginPath();
		context.roundRect(x, y, 165, 60, 6);
		context.fill();
		context.stroke();
		
		// Wave number
		context.font = 'bold 24px Orbitron';
		context.textAlign = 'center';
		context.fillStyle = '#00ffff';
		context.shadowColor = '#00ffff';
		context.shadowBlur = 10;
		context.fillText(`WAVE ${this.currentWave}`, x + 82, y + 28);
		context.shadowBlur = 0;
		
		// Enemy count
		context.font = '14px Orbitron';
		context.fillStyle = this.enemies.length > 5 ? '#ff4444' : '#00ff88';
		context.fillText(`◈ ${this.enemies.length} HOSTILES`, x + 82, y + 50);
	}

	renderComboDisplay() {
		if (!this.combo.isActive()) return;
		
		const x = CANVAS_WIDTH / 2;
		const y = 30;
		
		// Combo panel
		context.save();
		context.fillStyle = 'rgba(10, 20, 40, 0.8)';
		context.strokeStyle = this.combo.getMultiplier() >= 2 ? '#ffaa00' : '#00ffff';
		context.lineWidth = 2;
		context.shadowColor = context.strokeStyle;
		context.shadowBlur = 10;
		context.beginPath();
		context.roundRect(x - 80, y - 15, 160, 50, 6);
		context.fill();
		context.stroke();
		context.shadowBlur = 0;
		context.restore();
		
		// Combo count and multiplier
		context.font = 'bold 20px Orbitron';
		context.textAlign = 'center';
		context.fillStyle = '#ffffff';
		context.shadowColor = this.combo.getMultiplier() >= 2 ? '#ffaa00' : '#00ffff';
		context.shadowBlur = 5;
		context.fillText(`${this.combo.comboCount}x COMBO`, x, y + 5);
		context.shadowBlur = 0;
		
		// Multiplier
		context.font = 'bold 14px Orbitron';
		context.fillStyle = this.combo.getMultiplier() >= 2 ? '#ffaa00' : '#00ff88';
		context.fillText(`×${this.combo.getMultiplier().toFixed(1)} COINS`, x, y + 22);
		
		// Timer bar
		const barWidth = 140;
		const barX = x - barWidth / 2;
		const barY = y + 28;
		context.fillStyle = '#333333';
		context.fillRect(barX, barY, barWidth, 4);
		
		const timerWidth = barWidth * this.combo.getTimerProgress();
		const timerColor = this.combo.getTimerProgress() > 0.3 ? '#00ff88' : '#ff4444';
		context.fillStyle = timerColor;
		context.fillRect(barX, barY, timerWidth, 4);
	}

	renderActiveBoosts() {
		const boosts = this.player.activeBoosts;
		const activeBoostsList = [];
		
		if (boosts.speedBoost.active) {
			activeBoostsList.push({ label: '⚡ SPEED', duration: boosts.speedBoost.duration, color: '#00ff88' });
		}
		if (boosts.damageBoost.active) {
			activeBoostsList.push({ label: '💥 DAMAGE', duration: boosts.damageBoost.duration, color: '#ff4444' });
		}
		if (boosts.coinMagnet.active) {
			activeBoostsList.push({ label: '🧲 MAGNET', duration: boosts.coinMagnet.duration, color: '#ffff00' });
		}
		
		// Shield display
		if (this.player.shield > 0) {
			activeBoostsList.push({ label: `🛡 ${Math.ceil(this.player.shield)}`, duration: null, color: '#00aaff' });
		}
		
		if (activeBoostsList.length === 0) return;
		
		const x = 15;
		let y = 115;
		
		activeBoostsList.forEach((boost, index) => {
			context.save();
			context.fillStyle = 'rgba(10, 20, 40, 0.8)';
			context.strokeStyle = boost.color;
			context.lineWidth = 1;
			context.beginPath();
			context.roundRect(x, y + index * 28, 120, 24, 4);
			context.fill();
			context.stroke();
			
			context.font = '11px Orbitron';
			context.textAlign = 'left';
			context.fillStyle = boost.color;
			context.shadowColor = boost.color;
			context.shadowBlur = 5;
			context.fillText(boost.label, x + 8, y + index * 28 + 16);
			context.shadowBlur = 0;
			
			if (boost.duration !== null) {
				context.textAlign = 'right';
				context.fillStyle = '#ffffff';
				context.fillText(`${boost.duration.toFixed(1)}s`, x + 112, y + index * 28 + 16);
			}
			
			context.restore();
		});
	}

	renderWeaponBar() {
		const barWidth = 400;
		const barHeight = 50;
		const x = CANVAS_WIDTH / 2 - barWidth / 2;
		const y = CANVAS_HEIGHT - barHeight - 10;
		
		// Background
		context.fillStyle = 'rgba(10, 20, 40, 0.85)';
		context.strokeStyle = '#00ffff';
		context.lineWidth = 1;
		context.beginPath();
		context.roundRect(x, y, barWidth, barHeight, 6);
		context.fill();
		context.stroke();
		
		// Weapon slots
		const slotWidth = barWidth / 3;
		this.player.weapons.forEach((weapon, index) => {
			const slotX = x + index * slotWidth;
			const isActive = index === this.player.currentWeaponIndex;
			
			// Slot background
			if (isActive) {
				context.fillStyle = 'rgba(0, 255, 255, 0.2)';
				context.fillRect(slotX + 2, y + 2, slotWidth - 4, barHeight - 4);
				
				// Active indicator
				context.fillStyle = '#00ffff';
				context.fillRect(slotX + 2, y + barHeight - 4, slotWidth - 4, 2);
			}
			
			// Key number
			context.font = 'bold 12px Orbitron';
			context.textAlign = 'center';
			context.fillStyle = isActive ? '#00ffff' : '#555555';
			context.fillText(`[${index + 1}]`, slotX + slotWidth / 2, y + 15);
			
			// Weapon name
			context.font = isActive ? 'bold 11px Orbitron' : '11px Roboto';
			context.fillStyle = isActive ? '#ffffff' : '#888888';
			context.fillText(weapon.name.toUpperCase(), slotX + slotWidth / 2, y + 30);
			
			// Damage
			const baseDamage = weapon.damage;
			const actualDamage = Math.floor(baseDamage * (1 + stats.damageUpgrades * DAMAGE_UPGRADE_BONUS));
			context.font = '10px Roboto';
			context.fillStyle = isActive ? '#ff4444' : '#666666';
			context.fillText(`${actualDamage} DMG`, slotX + slotWidth / 2, y + 43);
		});
	}
}
