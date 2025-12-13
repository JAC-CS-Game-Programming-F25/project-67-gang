import State from "../../lib/State.js";
import GameStateName from "../enums/GameStateName.js";
import Input from "../../lib/Input.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, context, stateMachine, input, stats, saveHighScore, getHighScore, sounds } from "../globals.js";
export default class VictoryState extends State {
	constructor() {
		super();
	}

	enter() {
		// Always save on victory (beat wave 20)
		saveHighScore(20, stats.kills, stats.coins);
		this.highScore = getHighScore();

		sounds.play('win');
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
		
		// Victory text
		context.fillStyle = '#00ff00';
		context.font = '60px Orbitron';
		context.textAlign = 'center';
		context.fillText('VICTORY!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 120);
		
		// Congratulations
		context.fillStyle = '#00ffff';
		context.font = '30px Roboto';
		context.fillText('You survived all 20 waves!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);
		
		// Stats
		context.fillStyle = '#ffffff';
		context.font = '24px Roboto';
		context.fillText(`Enemies Killed: ${stats.kills}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
		context.fillText(`Coins Collected: ${stats.coins}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
		
		// High score
		context.fillStyle = '#00ffff';
		context.font = '20px Roboto';
		context.fillText(`Best Record: ${this.highScore.kills} Kills | ${this.highScore.coins} Coins`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 100);
		
		// Restart prompt
		context.font = '18px Roboto';
		context.fillStyle = '#888888';
		context.fillText('Press ENTER to return to menu', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 100);
		
		context.restore();
	}
}