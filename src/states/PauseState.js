import State from "../../lib/State.js";
import GameStateName from "../enums/GameStateName.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, context, stateMachine, input } from "../globals.js";
import Input from "../../lib/Input.js";

export default class PauseState extends State {
	constructor() {
		super();
	}

	enter(params) {
		this.fromState = params.fromState;
		this.playStateData = params.playStateData;
	}

	update(dt) {
		// Press P to resume
		if (input.isKeyPressed(Input.KEYS.P)) {
			stateMachine.change(GameStateName.Play, this.playStateData);
		}
		
		// Press ESC to quit to title
		if (input.isKeyPressed(Input.KEYS.ESCAPE)) {
			stateMachine.change(GameStateName.TitleScreen);
		}
	}

	render() {
		// Render the paused game in background (darkened)
		context.save();
		context.fillStyle = 'rgba(0, 0, 0, 0.7)';
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		
		// Pause title
		context.fillStyle = '#00ffff';
		context.font = '60px Orbitron';
		context.textAlign = 'center';
		context.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
		
		// Options
		context.fillStyle = '#ffffff';
		context.font = '24px Roboto';
		context.fillText('Press P to Resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
		context.fillText('Press ESC to Quit to Menu', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 70);
		
		context.restore();
	}
}