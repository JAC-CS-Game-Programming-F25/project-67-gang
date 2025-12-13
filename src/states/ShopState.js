import State from "../../lib/State.js";
import GameStateName from "../enums/GameStateName.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, context, stateMachine, input, stats, spendCoins, HEALTH_UPGRADE_BONUS, DAMAGE_UPGRADE_BONUS } from "../globals.js";
import Input from "../../lib/Input.js";

export default class ShopState extends State {
	constructor() {
		super();
		this.healthUpgradeCost = 40; 
		this.damageUpgradeCost = 30; 
	}

	enter(params) {
		this.nextWave = params.nextWave;
		this.player = params.player;
		console.log(`Shop opened! Next wave: ${this.nextWave}`);
	}

	update(dt) {
		// Press Space to continue to next wave
		if (input.isKeyPressed(Input.KEYS.SPACE)) {
			stateMachine.change(GameStateName.Play, {
				player: this.player,
				nextWave: this.nextWave
			});
		}

		// Press H to buy health upgrade
		if (input.isKeyPressed(Input.KEYS.H)) {
			if (spendCoins(this.healthUpgradeCost)) {
				stats.healthUpgrades++;
				this.player.maxHealth += HEALTH_UPGRADE_BONUS;
				this.player.health = this.player.maxHealth; // Full heal
				console.log("Bought health upgrade!");
			}
		}

		// Press D to buy damage upgrade
		if (input.isKeyPressed(Input.KEYS.D)) {
			if (spendCoins(this.damageUpgradeCost)) {
				stats.damageUpgrades++;
				console.log("Bought damage upgrade!");
			}
		}
	}

	render() {
		context.save();
		
		// Background
		context.fillStyle = '#0a0a1a';
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		
		// Title
		context.fillStyle = '#00ffff';
		context.font = '40px Orbitron';
		context.textAlign = 'center';
		context.fillText('SHOP', CANVAS_WIDTH / 2, 100);
		
		// Wave info
		context.fillStyle = '#ffffff';
		context.font = '24px Roboto';
		context.fillText(`Prepare for Wave ${this.nextWave}`, CANVAS_WIDTH / 2, 150);
		
		// Coins
		context.fillStyle = '#ffff00';
		context.fillText(`Coins: ${stats.coins}`, CANVAS_WIDTH / 2, 200);
		
		// Upgrades
		const x = 300;
		const canAffordHealth = stats.coins >= this.healthUpgradeCost;
		const canAffordDamage = stats.coins >= this.damageUpgradeCost;
		
		// Health Upgrade
		context.font = '20px Roboto';
		context.textAlign = 'left';
		context.fillStyle = canAffordHealth ? '#ffffff' : '#555555';
		context.fillText(`[H] Health Upgrade - ${this.healthUpgradeCost} coins`, x, 260);
		
		context.fillStyle = '#888888';
		context.font = '16px Roboto';
		context.fillText(`  Current HP: ${this.player.maxHealth} → After: ${this.player.maxHealth + HEALTH_UPGRADE_BONUS} (+${HEALTH_UPGRADE_BONUS} & Full Heal)`, x, 280);
		
		// Damage Upgrade
		context.fillStyle = canAffordDamage ? '#ffffff' : '#555555';
		context.font = '20px Roboto';
		context.fillText(`[D] Damage Upgrade - ${this.damageUpgradeCost} coins`, x, 330);
		
		context.fillStyle = '#888888';
		context.font = '16px Roboto';
		const currentBonus = stats.damageUpgrades * DAMAGE_UPGRADE_BONUS * 100;
		const newBonus = (stats.damageUpgrades + 1) * DAMAGE_UPGRADE_BONUS * 100;
		context.fillText(`  Current Bonus: +${currentBonus}% → After: +${newBonus}% (+${DAMAGE_UPGRADE_BONUS * 100}% to all weapons)`, x, 350);
		
		// Example damage preview
		context.fillStyle = '#666666';
		context.font = '14px Roboto';
		const exampleDamage = 50; // Sniper base damage
		const currentDamage = Math.floor(exampleDamage * (1 + stats.damageUpgrades * DAMAGE_UPGRADE_BONUS));
		const afterDamage = Math.floor(exampleDamage * (1 + (stats.damageUpgrades + 1) * DAMAGE_UPGRADE_BONUS));
		context.fillText(`  (Ex: Sniper 50 base → ${currentDamage} now → ${afterDamage} after upgrade)`, x, 370);
		
		// Continue
		context.fillStyle = '#00ff00';
		context.font = '24px Roboto';
		context.textAlign = 'center';
		context.fillText('Press SPACE to continue', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 100);
		
		context.restore();
	}
}