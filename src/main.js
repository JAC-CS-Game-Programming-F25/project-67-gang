/**
 * Neon Onslaught
 *
 * Omar & Ariyaman
 *
 * A fast-paced wave-based shooter. Survive 5 waves of enemies!
 *
 * Assets:
 * - Fonts: Orbitron & Roboto from Google Fonts
 */

import GameStateName from './enums/GameStateName.js';
import Game from '../lib/Game.js';
import {
	canvas,
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	context,
	fonts,
	images,
	timer,
	sounds,
	stateMachine,
} from './globals.js';
import PlayState from './states/PlayState.js';
import ShopState from './states/ShopState.js';
import GameOverState from './states/GameOverState.js';
import VictoryState from './states/VictoryState.js';
import TitleScreenState from './states/TitleScreenState.js';

// Set the dimensions of the play area.
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
canvas.setAttribute('tabindex', '1');

document.body.appendChild(canvas);

// Fetch the asset definitions from config.json.
const {
	images: imageDefinitions,
	fonts: fontDefinitions,
	sounds: soundDefinitions,
} = await fetch('./src/config.json').then((response) => response.json());

// Load all the assets from their definitions.
images.load(imageDefinitions);
fonts.load(fontDefinitions);
sounds.load(soundDefinitions);

// Add all the states to the state machine.
stateMachine.add(GameStateName.TitleScreen, new TitleScreenState());
stateMachine.add(GameStateName.Play, new PlayState());
stateMachine.add(GameStateName.Shop, new ShopState());
stateMachine.add(GameStateName.GameOver, new GameOverState());
stateMachine.add(GameStateName.Victory, new VictoryState());

stateMachine.change(GameStateName.TitleScreen);

const game = new Game(
	stateMachine,
	context,
	timer,
	canvas.width,
	canvas.height
);

game.start();

canvas.focus();