import State from "../../lib/State.js";
import GameStateName from "../enums/GameStateName.js";
import Input from "../../lib/Input.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, context, stateMachine, input, getHighScore, sounds, hasSaveGame, loadGameState } from "../globals.js";

export default class TitleScreenState extends State {
	constructor() {
		super();
	}

	enter() {
		this.highScore = getHighScore();
		
		// Stop music if playing
		if (sounds.get('music')) {
			sounds.stop('music');
		}
	}

	update(dt) {
		// Check for save game every frame
		this.hasSave = hasSaveGame(); // FIXED: was this.hasSaveGame
		
		// Check for Enter key to start NEW game
		if (input.isKeyPressed(Input.KEYS.ENTER)) {
			stateMachine.change(GameStateName.Play);
		}
		
		// Check for R key to RESUME game (if save exists)
		if (this.hasSave && input.isKeyPressed(Input.KEYS.R)) {
			const saveData = loadGameState();
			stateMachine.change(GameStateName.Play, { loadGame: saveData });
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
		context.fillText('NEON ONSLAUGHT', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 100);
		
		// Instructions
		context.fillStyle = '#ffffff';
		context.font = '24px Roboto';
		context.fillText('Press ENTER to Start New Game', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
		
		// Resume option (if save exists)
		if (this.hasSave) {
			context.fillStyle = '#00ff00';
			context.font = '24px Roboto';
			context.fillText('Press R to Resume Game', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
		}
		
		// High score
		if (this.highScore && this.highScore.wave > 0) {
			context.fillStyle = '#00ffff';
			context.font = '20px Roboto';
			context.fillText(`High Score: Wave ${this.highScore.wave} | ${this.highScore.kills} Kills`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 100);
		}
		
		// Controls
		context.font = '16px Roboto';
		context.fillStyle = '#888888';
		context.fillText('WASD: Move | Mouse: Aim | Click: Shoot', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 130);
		context.fillText('P: Pause | ESC: Quit to Menu (when paused)', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 100);

		context.restore();
	}
}