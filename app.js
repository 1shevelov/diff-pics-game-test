import * as PIXI from "./libs/pixi.mjs";
import AssetsWorker from "./libs/assetsWorker.js";
import LevelView from "./libs/levelView.js";
import * as Debug from "./libs/debugHelpers.js";
import * as EVENTS from "./libs/eventManager.js";

const CANVAS_HORZ_RATIO = { x: 9, y: 16 };
const CANVAS_VERT_RATIO = { x: 16, y: 9 };
let canvasWidth;
let canvasHeight;
let isYLimits = false;
let isOrientationHorz = true;

const app = new PIXI.Application({
	view: document.getElementById("pixi-canvas"),
	resolution: window.devicePixelRatio || 1,
	// antialias: true,
	autoDensity: true,
	backgroundColor: 0xddddcc,
	width: 0,
	height: 0,
});

let screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
let screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

function setScreen() {
	const usedRatio = isOrientationHorz ? CANVAS_HORZ_RATIO : CANVAS_VERT_RATIO;
	isYLimits = screenWidth / usedRatio.x > screenHeight / usedRatio.y;
	const smallerDimensionSize = isYLimits
		? (screenHeight / usedRatio.y) * usedRatio.x
		: (screenWidth / usedRatio.x) * usedRatio.y;
	canvasWidth = isYLimits ? smallerDimensionSize : screenWidth;
	canvasHeight = isYLimits ? screenHeight : smallerDimensionSize;
	// console.log(isYLimits, canvasWidth, canvasHeight);
	if (app) app.renderer.resize(canvasWidth, canvasHeight);
}

function setMargins() {
	if (!app) return;
	if (isYLimits) {
		app.view.style.marginLeft = app.view.style.marginRight = `${
			(screenWidth - canvasWidth) / 2
		}px`;
		app.view.style.marginTop = app.view.style.marginBottom = "0";
	} else {
		app.view.style.marginLeft = app.view.style.marginRight = "0";
		app.view.style.marginTop = app.view.style.marginBottom = `${
			(screenHeight - canvasHeight) / 2
		}px`;
	}
	// console.log(
	// 	app.view.style.marginLeft,
	// 	app.view.style.marginRight,
	// 	app.view.style.marginTop,
	// 	app.view.style.marginBottom
	// );
}

const eventManager = new EVENTS.EventManager();
const assetsWorker = new AssetsWorker();

let currentLevel = 2;

async function startLevel() {
	app.stage.removeChildren();
	const meta = await assetsWorker.loadLevelResources(currentLevel);
	// console.log(meta);

	const baseSlot = meta.slots.find((item) => item.layer === "standart");
	isOrientationHorz = baseSlot.width > baseSlot.height;
	setScreen();
	setMargins();
	// console.log(isYLimits, canvasWidth, canvasHeight);

	const level = new LevelView(canvasWidth, canvasHeight, eventManager);
	const levelContainer = level.create(currentLevel, meta);
	levelContainer.x = app.screen.width / 2;
	levelContainer.y = app.screen.height / 2;
	app.stage.addChild(levelContainer);
}

startLevel();

eventManager.subscribe(EVENTS.LevelFinished, () => {
	currentLevel++;
	startLevel();
});

window.addEventListener("resize", (_event) => {
	// rendererScale = scaleToWindow(app.renderer.view);
    screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
	startLevel();
	// Debug.ViewRendererSize(app.renderer.view);
	// console.log(`Renderer scale: ${rendererScale}`);
});
