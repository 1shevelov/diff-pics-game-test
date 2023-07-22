import { Application, Sprite } from "./libs/pixi.mjs";
import { scaleToWindow } from "./libs/scaleToWindow.js";
import * as Debug from "./libs/debugHelpers.js";

const app = new Application({
	view: document.getElementById("pixi-canvas"),
	resolution: window.devicePixelRatio || 1,
	autoDensity: true,
	backgroundColor: 0x13c23c,
	width: 900,
	height: 1600,
});

let rendererScale = scaleToWindow(app.renderer.view);

const football = Sprite.from("images/football.png");

football.anchor.set(0.5);

football.x = app.screen.width / 2;
football.y = app.screen.height / 2;

app.stage.addChild(football);

window.addEventListener("resize", (_event) => {
	rendererScale = scaleToWindow(app.renderer.view);
	// Debug.ViewRendererSize(app.renderer.view);
	// console.log(`Renderer scale: ${rendererScale}`);
});
