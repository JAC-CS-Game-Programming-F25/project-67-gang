import State from "../../lib/State.js";
import GameStateName from "../enums/GameStateName.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, context, stateMachine, input, stats } from "../globals.js";
import Input from "../../lib/Input.js";
import UIRenderer from "../services/UIRenderer.js";

export default class PauseState extends State {
	constructor() {
		super();
		this.time = 0;
	}

	enter(params) {
		this.fromState = params.fromState;
		this.playStateData = params.playStateData;
		this.time = 0;
	}

	update(dt) {
		this.time += dt * 1000;
		
		// Press ESC or P to resume
		if (input.isKeyPressed(Input.KEYS.ESCAPE) || input.isKeyPressed(Input.KEYS.P)) {
			stateMachine.change(GameStateName.Play, this.playStateData);
		}
		
		// Press Q to quit to title
		if (input.isKeyPressed(Input.KEYS.Q)) {
			stateMachine.change(GameStateName.TitleScreen);
		}
	}

	render() {
		context.save();
		
		// Darken background
		context.fillStyle = 'rgba(0, 0, 0, 0.85)';
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		
		// Scanline effect
		context.fillStyle = 'rgba(0, 255, 255, 0.03)';
		for (let y = 0; y < CANVAS_HEIGHT; y += 4) {
			context.fillRect(0, y, CANVAS_WIDTH, 2);
		}
		
		// Pause title with glitch effect
		const glitch = Math.sin(this.time * 0.01) > 0.9 ? Math.random() * 3 : 0;
		UIRenderer.renderTitle('PAUSED', CANVAS_WIDTH / 2 + glitch, CANVAS_HEIGHT / 2 - 100, '#00ffff', 70);
		
		// Current game status
		UIRenderer.renderPanel(CANVAS_WIDTH / 2 - 150, CANVAS_HEIGHT / 2 - 40, 300, 100, '◆ STATUS ◆');
		
		const statusX = CANVAS_WIDTH / 2 - 100;
		UIRenderer.renderStat('Wave', this.playStateData?.currentWave?.toString() || '?', statusX, CANVAS_HEIGHT / 2 + 5, '#00ffff', '►');
		UIRenderer.renderStat('Kills', stats.kills.toString(), statusX, CANVAS_HEIGHT / 2 + 30, '#ff00ff', '►');
		UIRenderer.renderStat('Credits', stats.coins.toString(), statusX, CANVAS_HEIGHT / 2 + 55, '#ffff00', '►');
		
		// Menu options
		const optionsY = CANVAS_HEIGHT / 2 + 100;
		UIRenderer.renderButton('RESUME  [ESC]', CANVAS_WIDTH / 2, optionsY, true, '#00ff88');
		UIRenderer.renderButton('QUIT  [Q]', CANVAS_WIDTH / 2, optionsY + 55, false, '#ff4444');
		
		// Hint
		UIRenderer.renderText('Progress is auto-saved', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 50, '#555555', 14);
		
		context.restore();
	}
}
