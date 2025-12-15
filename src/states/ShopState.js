import State from "../../lib/State.js";
import GameStateName from "../enums/GameStateName.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, context, stateMachine, input, stats, spendCoins, HEALTH_UPGRADE_BONUS, DAMAGE_UPGRADE_BONUS } from "../globals.js";
import Input from "../../lib/Input.js";
import UIRenderer from "../services/UIRenderer.js";

export default class ShopState extends State {
	constructor() {
		super();
		this.healthUpgradeCost = 40; 
		this.damageUpgradeCost = 30;
		this.time = 0;
	}

	enter(params) {
		this.nextWave = params.nextWave;
		this.player = params.player;
		this.time = 0;
		console.log(`Shop opened! Next wave: ${this.nextWave}`);
	}

	update(dt) {
		this.time += dt * 1000;
		
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
		UIRenderer.renderSpaceBackground(this.time);
		
		// Header panel
		UIRenderer.renderPanel(CANVAS_WIDTH / 2 - 250, 30, 500, 100, '◆ SUPPLY DEPOT ◆');
		
		// Wave info
		UIRenderer.renderSubtitle(`WAVE ${this.nextWave} INCOMING`, CANVAS_WIDTH / 2, 80, '#ff4444', 24);
		
		// Coins display
		context.save();
		context.font = 'bold 28px Orbitron';
		context.textAlign = 'center';
		context.fillStyle = '#ffff00';
		context.shadowColor = '#ffff00';
		context.shadowBlur = 15;
		context.fillText(`💰 ${stats.coins}`, CANVAS_WIDTH / 2, 115);
		context.restore();
		
		// Upgrade panels
		const panelWidth = 350;
		const panelHeight = 180;
		const leftX = CANVAS_WIDTH / 2 - panelWidth - 20;
		const rightX = CANVAS_WIDTH / 2 + 20;
		const panelY = 160;
		
		// Health Upgrade Panel
		const canAffordHealth = stats.coins >= this.healthUpgradeCost;
		this.renderUpgradePanel(
			leftX, panelY, panelWidth, panelHeight,
			'HULL REINFORCEMENT',
			'H',
			this.healthUpgradeCost,
			canAffordHealth,
			'#00ff88',
			[
				`Current HP: ${this.player.maxHealth}`,
				`After: ${this.player.maxHealth + HEALTH_UPGRADE_BONUS}`,
				`+ Full Repair`
			],
			`+${HEALTH_UPGRADE_BONUS} MAX HP`
		);
		
		// Damage Upgrade Panel
		const canAffordDamage = stats.coins >= this.damageUpgradeCost;
		const currentBonus = stats.damageUpgrades * DAMAGE_UPGRADE_BONUS * 100;
		const newBonus = (stats.damageUpgrades + 1) * DAMAGE_UPGRADE_BONUS * 100;
		this.renderUpgradePanel(
			rightX, panelY, panelWidth, panelHeight,
			'WEAPON OVERDRIVE',
			'D',
			this.damageUpgradeCost,
			canAffordDamage,
			'#ff4444',
			[
				`Current Bonus: +${currentBonus.toFixed(0)}%`,
				`After: +${newBonus.toFixed(0)}%`,
				`All weapons`
			],
			`+${(DAMAGE_UPGRADE_BONUS * 100).toFixed(0)}% DMG`
		);
		
		// Player status panel
		UIRenderer.renderPanel(CANVAS_WIDTH / 2 - 200, 370, 400, 100, '◆ SHIP STATUS ◆');
		
		// Health bar
		UIRenderer.renderText('HULL', CANVAS_WIDTH / 2 - 150, 410, '#888888', 14, 'left');
		UIRenderer.renderProgressBar(
			CANVAS_WIDTH / 2 - 100, 400, 250, 20,
			this.player.health, this.player.maxHealth,
			this.player.health > 30 ? '#00ff88' : '#ff4444'
		);
		
		// Stats
		UIRenderer.renderText(`DMG Bonus: +${currentBonus.toFixed(0)}%`, CANVAS_WIDTH / 2 - 80, 450, '#ff4444', 14, 'left');
		UIRenderer.renderText(`Upgrades: ${stats.healthUpgrades + stats.damageUpgrades}`, CANVAS_WIDTH / 2 + 80, 450, '#00ffff', 14, 'left');
		
		// Continue prompt
		UIRenderer.renderPrompt('◆ PRESS SPACE TO LAUNCH ◆', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 60, this.time);
		
		context.restore();
	}

	renderUpgradePanel(x, y, width, height, title, key, cost, canAfford, color, details, bonus) {
		context.save();
		
		// Panel background
		const bgColor = canAfford ? 'rgba(0, 255, 255, 0.1)' : 'rgba(50, 50, 50, 0.5)';
		context.fillStyle = bgColor;
		context.strokeStyle = canAfford ? color : '#444444';
		context.lineWidth = canAfford ? 2 : 1;
		
		if (canAfford) {
			context.shadowColor = color;
			context.shadowBlur = 15;
		}
		
		context.beginPath();
		context.roundRect(x, y, width, height, 8);
		context.fill();
		context.stroke();
		context.shadowBlur = 0;
		
		// Title
		context.font = 'bold 16px Orbitron';
		context.textAlign = 'center';
		context.fillStyle = canAfford ? color : '#666666';
		context.fillText(title, x + width / 2, y + 25);
		
		// Key hint
		context.font = 'bold 24px Orbitron';
		context.fillStyle = canAfford ? '#ffffff' : '#444444';
		context.fillText(`[${key}]`, x + width / 2, y + 55);
		
		// Cost
		context.font = '18px Orbitron';
		context.fillStyle = canAfford ? '#ffff00' : '#ff4444';
		context.fillText(`💰 ${cost}`, x + width / 2, y + 85);
		
		// Details
		context.font = '12px Roboto';
		context.fillStyle = '#888888';
		details.forEach((detail, i) => {
			context.fillText(detail, x + width / 2, y + 110 + i * 16);
		});
		
		// Bonus tag
		context.font = 'bold 14px Orbitron';
		context.fillStyle = canAfford ? color : '#555555';
		context.fillText(bonus, x + width / 2, y + height - 15);
		
		context.restore();
	}
}
