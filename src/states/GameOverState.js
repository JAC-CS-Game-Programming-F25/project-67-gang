import State from "../../lib/State.js";
import GameStateName from "../enums/GameStateName.js";
import Input from "../../lib/Input.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, context, stateMachine, input, stats, saveHighScore, getHighScore, sounds } from "../globals.js";
import UIRenderer from "../services/UIRenderer.js";

export default class GameOverState extends State {
	constructor() {
		super();
		this.time = 0;
	}

	enter() {
		// Save high score
		this.isNewHighScore = saveHighScore(stats.wave, stats.kills, stats.coins);
		this.highScore = getHighScore();
		this.time = 0;
		
		sounds.play('gameOver');
	}

	update(dt) {
		this.time += dt * 1000;
		
		// Press Enter to return to title
		if (input.isKeyPressed(Input.KEYS.ENTER)) {
			stateMachine.change(GameStateName.TitleScreen);
		}
	}

	render() {
		context.save();
		
		// Dark red-tinted background
		UIRenderer.renderSpaceBackground(this.time);
		
		// Red overlay
		context.fillStyle = 'rgba(100, 0, 0, 0.3)';
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		
		// Glitchy title effect
		const glitch = Math.random() > 0.95 ? Math.random() * 4 - 2 : 0;
		UIRenderer.renderTitle('MISSION', CANVAS_WIDTH / 2 + glitch, CANVAS_HEIGHT / 2 - 180, '#ff0000', 50);
		UIRenderer.renderTitle('FAILED', CANVAS_WIDTH / 2 - glitch, CANVAS_HEIGHT / 2 - 120, '#ff4444', 70);
		
		// New high score notification
		if (this.isNewHighScore) {
			const flash = Math.sin(this.time * 0.01) > 0;
			if (flash) {
				UIRenderer.renderSubtitle('★ NEW HIGH SCORE ★', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60, '#00ff88', 24);
			}
		}
		
		// Stats panel
		UIRenderer.renderPanel(CANVAS_WIDTH / 2 - 180, CANVAS_HEIGHT / 2 - 30, 360, 170, '◆ MISSION REPORT ◆');
		
		const statsX = CANVAS_WIDTH / 2 - 140;
		const statsY = CANVAS_HEIGHT / 2 + 20;
		
		UIRenderer.renderStat('Wave Reached', stats.wave.toString(), statsX, statsY, '#ff4444', '◈');
		UIRenderer.renderStat('Enemies Destroyed', stats.kills.toString(), statsX, statsY + 30, '#ff00ff', '◈');
		UIRenderer.renderStat('Credits Earned', stats.coins.toString(), statsX, statsY + 60, '#ffff00', '◈');
		
		// Separator
		context.strokeStyle = '#333333';
		context.beginPath();
		context.moveTo(statsX, statsY + 85);
		context.lineTo(statsX + 280, statsY + 85);
		context.stroke();
		
		// Best record
		UIRenderer.renderText(
			`Best: Wave ${this.highScore.wave} ● ${this.highScore.kills} Kills`,
			CANVAS_WIDTH / 2,
			statsY + 110,
			'#00ffff',
			16
		);
		
		// Return prompt
		UIRenderer.renderPrompt('◆ PRESS ENTER TO RETURN ◆', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 80, this.time);
		
		context.restore();
	}
}
