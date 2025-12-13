import State from "../../lib/State.js";
import GameStateName from "../enums/GameStateName.js";
import Input from "../../lib/Input.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, context, stateMachine, input, stats, saveHighScore, getHighScore, sounds } from "../globals.js";
export default class GameOverState extends State {
	constructor() {
		super();
	}

	enter() {
		// Save high score
		this.isNewHighScore = saveHighScore(stats.wave, stats.kills, stats.coins);
		this.highScore = getHighScore();
		
		sounds.play('gameOver');

	}

	update(dt) {
		// Press Enter to return to title
		if (input.isKeyPressed(Input.KEYS.ENTER)) {
			stateMachine.change(GameStateName.TitleScreen);
		}
	}

	render() {
		context.save();
		
		// Background
		context.fillStyle = '#0a0a1a';
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		
		// Game Over text
		context.fillStyle = '#ff0000';
		context.font = '60px Orbitron';
		context.textAlign = 'center';
		context.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 100);
		
		// New high score notification
		if (this.isNewHighScore) {
			context.fillStyle = '#00ff00';
			context.font = '30px Roboto';
			context.fillText('🎉 NEW HIGH SCORE! 🎉', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
		}
		
		// Stats
		context.fillStyle = '#ffffff';
		context.font = '24px Roboto';
		context.fillText(`Wave Reached: ${stats.wave}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
		context.fillText(`Enemies Killed: ${stats.kills}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
		context.fillText(`Coins Collected: ${stats.coins}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 90);
		
		// High score
		context.fillStyle = '#00ffff';
		context.font = '20px Roboto';
		context.fillText(`Best: Wave ${this.highScore.wave} | ${this.highScore.kills} Kills`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 140);
		
		// Restart prompt
		context.font = '18px Roboto';
		context.fillStyle = '#888888';
		context.fillText('Press ENTER to return to menu', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 100);
		
		context.restore();
	}
}