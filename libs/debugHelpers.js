import { Sprite, Graphics } from "./pixi.mjs";

// gets PIXI.ICanvas as input
export function ViewRendererSize(canvas) {
	console.log(`Renderer size: ${canvas.width} x ${canvas.height}`);
}

// gets PIXI.Application as input
export function ShowCenteredSprite(app) {
	const ASSET = "../images/football.png";

	const football = Sprite.from(ASSET);

	football.anchor.set(0.5);
	football.x = app.screen.width / 2;
	football.y = app.screen.height / 2;
	app.stage.addChild(football);
}

// returns orange pixel sprite
export function DrawMark(x, y, container) {
	const SIZE = 50;
    const g = new Graphics();
    g.lineStyle(2, 0xFF0000, 1);
    g.moveTo(x, y - SIZE / 2);
    g.lineTo(x, y + SIZE / 2);
    g.moveTo(x - SIZE / 2, y);
    g.lineTo(x + SIZE / 2, y);
    g.closePath();
    container.addChild(g);
}
