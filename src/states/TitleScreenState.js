import State from "../../lib/State.js";
import GameStateName from "../enums/GameStateName.js";
import Input from "../../lib/Input.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, context, stateMachine, input, getHighScore, sounds, hasSaveGame, loadGameState } from "../globals.js";
import UIRenderer from "../services/UIRenderer.js";

export default class TitleScreenState extends State {
	constructor() {
		super();
		this.time = 0;
	}

	enter() {
		this.highScore = getHighScore();
		this.time = 0;
		
		// Stop music if playing
		if (sounds.get('music')) {
			sounds.stop('music');
		}
	}

	update(dt) {
		this.time += dt * 1000;
		
		// Check for save game every frame
		this.hasSave = hasSaveGame();
		
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
		
		// Animated space background
		UIRenderer.renderSpaceBackground(this.time);
		
		// Title with glow animation
		const titleGlow = Math.sin(this.time * 0.003) * 10 + 20;
		context.shadowBlur = titleGlow;
		UIRenderer.renderTitle('NEON', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 150, '#00ffff', 80);
		UIRenderer.renderTitle('ONSLAUGHT', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 70, '#ff00ff', 60);
		
		// Tagline
		UIRenderer.renderSubtitle('Survive the cosmic invasion', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10, '#888888', 18);
		
		// Menu options
		const menuY = CANVAS_HEIGHT / 2 + 60;
		UIRenderer.renderButton('▶  NEW GAME  [ENTER]', CANVAS_WIDTH / 2, menuY, true);
		
		if (this.hasSave) {
			UIRenderer.renderButton('↻  CONTINUE  [R]', CANVAS_WIDTH / 2, menuY + 55, false, '#00ff88');
		}
		
		// High score panel
		if (this.highScore && this.highScore.wave > 0) {
			UIRenderer.renderPanel(CANVAS_WIDTH / 2 - 150, CANVAS_HEIGHT - 180, 300, 70, '◆ HIGH SCORE ◆');
			UIRenderer.renderText(
				`Wave ${this.highScore.wave}  ●  ${this.highScore.kills} Kills`,
				CANVAS_WIDTH / 2,
				CANVAS_HEIGHT - 130,
				'#00ffff',
				20
			);
		}
		
		// Controls hint
		const controlsY = CANVAS_HEIGHT - 50;
		context.save();
		context.font = '12px Roboto';
		context.textAlign = 'center';
		context.fillStyle = '#555555';
		context.fillText('WASD: Move  ●  Mouse: Aim  ●  Click: Shoot  ●  SPACE: Dash  ●  1/2/3: Weapons  ●  ESC: Pause  ●  M: Mute', CANVAS_WIDTH / 2, controlsY);
		context.restore();
		
		context.restore();
	}
}
