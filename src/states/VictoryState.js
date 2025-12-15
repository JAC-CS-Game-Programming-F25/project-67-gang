import State from "../../lib/State.js";
import GameStateName from "../enums/GameStateName.js";
import Input from "../../lib/Input.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, context, stateMachine, input, stats, saveHighScore, getHighScore, sounds } from "../globals.js";
import UIRenderer from "../services/UIRenderer.js";

export default class VictoryState extends State {
	constructor() {
		super();
		this.time = 0;
	}

	enter() {
		// Always save on victory (beat wave 20)
		saveHighScore(20, stats.kills, stats.coins);
		this.highScore = getHighScore();
		this.time = 0;

		sounds.play('win');
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
		
		// Animated space background
		UIRenderer.renderSpaceBackground(this.time);
		
		// Golden/green victory overlay
		const gradient = context.createRadialGradient(
			CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 0,
			CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 400
		);
		gradient.addColorStop(0, 'rgba(0, 255, 100, 0.2)');
		gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
		context.fillStyle = gradient;
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		
		// Animated title
		const bounce = Math.sin(this.time * 0.005) * 5;
		UIRenderer.renderTitle('MISSION', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 180 + bounce, '#00ff88', 50);
		UIRenderer.renderTitle('COMPLETE', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 110 + bounce, '#00ffff', 70);
		
		// Subtitle
		UIRenderer.renderSubtitle('★ ALL 20 WAVES SURVIVED ★', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50, '#ffff00', 22);
		
		// Stats panel
		UIRenderer.renderPanel(CANVAS_WIDTH / 2 - 180, CANVAS_HEIGHT / 2 - 10, 360, 150, '◆ FINAL STATS ◆');
		
		const statsX = CANVAS_WIDTH / 2 - 140;
		const statsY = CANVAS_HEIGHT / 2 + 40;
		
		UIRenderer.renderStat('Enemies Destroyed', stats.kills.toString(), statsX, statsY, '#00ff88', '★');
		UIRenderer.renderStat('Credits Earned', stats.coins.toString(), statsX, statsY + 30, '#ffff00', '★');
		
		// Separator
		context.strokeStyle = '#333333';
		context.beginPath();
		context.moveTo(statsX, statsY + 55);
		context.lineTo(statsX + 280, statsY + 55);
		context.stroke();
		
		// Best record
		UIRenderer.renderText(
			`Record: ${this.highScore.kills} Kills ● ${this.highScore.coins} Credits`,
			CANVAS_WIDTH / 2,
			statsY + 80,
			'#00ffff',
			16
		);
		
		// Celebration particles (simple)
		this.renderCelebration();
		
		// Return prompt
		UIRenderer.renderPrompt('◆ PRESS ENTER TO RETURN ◆', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 80, this.time);
		
		context.restore();
	}

	renderCelebration() {
		context.save();
		
		// Floating stars
		for (let i = 0; i < 20; i++) {
			const x = (i * 97 + this.time * 0.05) % CANVAS_WIDTH;
			const y = (i * 53 + this.time * 0.03) % CANVAS_HEIGHT;
			const size = 3 + Math.sin(this.time * 0.01 + i) * 2;
			const alpha = 0.5 + Math.sin(this.time * 0.005 + i * 0.5) * 0.5;
			
			context.globalAlpha = alpha;
			context.fillStyle = i % 3 === 0 ? '#ffff00' : i % 3 === 1 ? '#00ffff' : '#ff00ff';
			context.font = `${size * 4}px Arial`;
			context.fillText('★', x, y);
		}
		
		context.restore();
	}
}
