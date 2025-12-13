import State from "../../lib/State.js";
import GameStateName from "../enums/GameStateName.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, context, stateMachine, input, stats, spendCoins } from "../globals.js";
import Input from "../../lib/Input.js";

export default class ShopState extends State {
	constructor() {
		super();
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

		// Press H to buy health upgrade (20 coins)
		if (input.isKeyPressed(Input.KEYS.H)) {
			if (spendCoins(20)) {
				stats.healthUpgrades++;
				this.player.maxHealth += 20;
				this.player.health = this.player.maxHealth; // Full heal
				console.log("Bought health upgrade!");
			}
		}

		// Press D to buy damage upgrade (15 coins)
		if (input.isKeyPressed(Input.KEYS.D)) {
			if (spendCoins(15)) {
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
		context.fillText(`Coins: ${stats.coins}`, CANVAS_WIDTH / 2, 200);
		
		// Upgrades
		context.font = '20px Roboto';
		context.textAlign = 'left';
		const x = 300;
		
		context.fillText('[H] Health Upgrade - 20 coins', x, 280);
		context.fillStyle = '#888888';
		context.font = '16px Roboto';
		context.fillText('  +20 Max HP & Full Heal', x, 305);
		
		context.fillStyle = '#ffffff';
		context.font = '20px Roboto';
		context.fillText('[D] Damage Upgrade - 15 coins', x, 360);
		context.fillStyle = '#888888';
		context.font = '16px Roboto';
		context.fillText('  +15% Bullet Damage', x, 385);
		
		// Continue
		context.fillStyle = '#00ff00';
		context.font = '24px Roboto';
		context.textAlign = 'center';
		context.fillText('Press SPACE to continue', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 100);
		
		context.restore();
	}
}