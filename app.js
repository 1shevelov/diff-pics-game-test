import { Application } from "./libs/pixi.mjs";
// import AppView from "./libs/appView.js";
// import LevelView from "./libs/levelView.js";
// import * as Debug from "./libs/debugHelpers.js";
// import UiView from "./libs/uiView.js";
import Game from "./libs/game.js";

const app = new Application({
	view: document.getElementById("pixi-canvas"),
	resolution: window.devicePixelRatio || 1,
	// antialias: true,
	autoDensity: true,
	backgroundColor: 0xddddcc,
	width: 0,
	height: 0,
});

new Game(app);

// async function startLevel() {
// 	app.stage.removeChildren();

// 	const level = new LevelView(canvasWidth, canvasHeight, eventManager);
// 	const levelContainer = level.create(currentLevel, meta);
	// app.stage.addChild(levelContainer);
// }

// startLevel();

// eventManager.subscribe(EventWinScreenClosed, () => {
//     app.stage.removeChildren();
//     currentLevel++;
//     if (currentLevel === 6) currentLevel = 1;
// 	startLevel();
// });

// TODO: Resizing resets level progress
// How to fix: save level state "inprogress" with hidden & found fragments arrays, error clicks coordinates array
// when restarting level, check state and restore hidden & found fragments arrays
window.addEventListener("resize", (_event) => {
    screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
	startLevel();
	// Debug.ViewRendererSize(app.renderer.view);
	// console.log(`Renderer scale: ${rendererScale}`);
});
