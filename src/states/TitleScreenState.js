import State from "../../lib/State.js";
import GameStateName from "../enums/GameStateName.js";
import Input from "../../lib/Input.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, context, stateMachine, input, getHighScore, sounds } from "../globals.js";
export default class TitleScreenState extends State {
	constructor() {
		super();
	}
	enter() {
		this.highScore = getHighScore();
			if (sounds.get('music')) {
				sounds.stop('music');
			}
	}

	update(dt) {
		// Check for Enter key to start
		if (input.isKeyPressed(Input.KEYS.ENTER)) {
			stateMachine.change(GameStateName.Play);
		}
	}

render() {
	context.save();
	
	// Background
	context.fillStyle = '#0a0a1a';
	context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	
	// Title
	context.fillStyle = '#00ffff';
	context.font = '60px Orbitron';
	context.textAlign = 'center';
	context.fillText('NEON ONSLAUGHT', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
	
	// Instructions
	context.fillStyle = '#ffffff';
	context.font = '24px Roboto';
	context.fillText('Press ENTER to Start', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
	
	// High score - ADD THIS
	if (this.highScore && this.highScore.wave > 0) {
		context.fillStyle = '#00ffff';
		context.font = '20px Roboto';
		context.fillText(`High Score: Wave ${this.highScore.wave} | ${this.highScore.kills} Kills`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 100);
	}
	
	// Controls
	context.font = '16px Roboto';
	context.fillStyle = '#888888';
	context.fillText('WASD: Move | Mouse: Aim | Click: Shoot', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 100);
	
	context.restore();
}

}