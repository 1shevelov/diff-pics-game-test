import * as PIXI from "./libs/pixi.mjs";
import AssetsWorker from "./libs/assetsWorker.js";
import LevelView from "./libs/levelView.js";
import * as Debug from "./libs/debugHelpers.js";
import * as EVENTS from "./libs/eventManager.js";

const CANVAS_RATIO = { x: 9, y: 16 };
const screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
const screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

const isYLimits = screenWidth / CANVAS_RATIO.x > screenHeight / CANVAS_RATIO.y;
const smallerSimensionSize = isYLimits
	? (screenHeight / CANVAS_RATIO.y) * CANVAS_RATIO.x
	: (screenWidth / CANVAS_RATIO.x) * CANVAS_RATIO.y;
const canvasWidth = isYLimits ? smallerSimensionSize : screenWidth;
const canvasHeight = isYLimits ? screenHeight : smallerSimensionSize;

const app = new PIXI.Application({
	view: document.getElementById("pixi-canvas"),
	resolution: window.devicePixelRatio || 1,
	// antialias: true,
	autoDensity: true,
	backgroundColor: 0xcccccc,
	width: canvasWidth,
	height: canvasHeight,
});

if (isYLimits)
	app.view.style.marginLeft = app.view.style.marginRight = `${(screenWidth - canvasWidth) / 2}px`;
else
	app.view.style.marginTop = app.view.style.marginBottom = `${
		(screenHeight - canvasHeight) / 2
	}px`;

const eventManager = new EVENTS.EventManager();
const assetsWorker = new AssetsWorker();

let currentLevel = -1;

async function startLevel() {
	app.stage.removeChildren();
	currentLevel += 2;
	const { meta, textures } = await assetsWorker.loadLevelResources(currentLevel);
	console.log(meta);

	const level = new LevelView(canvasWidth, canvasHeight, eventManager);
	const levelContainer = level.make(currentLevel, meta);
	levelContainer.x = app.screen.width / 2;
	levelContainer.y = app.screen.height / 2;
	app.stage.addChild(levelContainer);
}

startLevel();

eventManager.subscribe(EVENTS.LevelFinished, startLevel);

// window.addEventListener("resize", (_event) => {
// 	rendererScale = scaleToWindow(app.renderer.view);
// 	// Debug.ViewRendererSize(app.renderer.view);
// 	// console.log(`Renderer scale: ${rendererScale}`);
// });
