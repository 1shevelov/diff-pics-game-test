import * as PIXI from "./pixi.mjs";
import * as Debug from "./debugHelpers.js";

export default class LevelView {
	_GAP = 0.05;
	_SIDE_GAP = 0.05;
	_canvasSize = { x: 0, y: 0 };
	_baseImageScale = 1;
	_layerShift = 0;

	_levelContainer = new PIXI.Container();
	_titleText;

	_hiddenFragmentsHitAreas = [];
	_foundFragmentsHitAreas = [];

	constructor(canvasWidth, canvasHeight) {
		this._canvasSize.x = canvasWidth;
		this._canvasSize.y = canvasHeight;
	}

	make(number, meta, textures) {
		const baseSlot = meta.slots.find((item) => item.layer === "standart");

		const baseLayerA = PIXI.Sprite.from(baseSlot.name);
		if (this._canvasSize.x < baseLayerA.width)
			this._baseImageScale =
				(this._canvasSize.x * (1 - 2 * this._SIDE_GAP)) / baseLayerA.width;

		baseLayerA.anchor.set(0.5);
		baseLayerA.scale.set(this._baseImageScale);
		this._layerShift = 0.5 * baseLayerA.height * (1 + this._GAP);
		baseLayerA.x = 0;
		baseLayerA.y = -this._layerShift;
		baseLayerA.interactive = true;
		baseLayerA.on("pointerup", this._onClick, this);
		this._levelContainer.addChild(baseLayerA);

		const baseLayerB = PIXI.Sprite.from(baseSlot.name);
		baseLayerB.anchor.set(0.5);
		baseLayerB.scale.set(this._baseImageScale);
		baseLayerB.x = 0;
		baseLayerB.y = this._layerShift;
		baseLayerB.interactive = true;
		baseLayerB.on("pointerup", this._onClick, this);
		this._levelContainer.addChild(baseLayerB);

		const layerAZeroPoint = {
			x: baseLayerA.x - baseLayerA.width / 2,
			y: baseLayerA.y - baseLayerA.height / 2,
		};
		const layerBZeroPoint = {
			x: baseLayerB.x - baseLayerB.width / 2,
			y: baseLayerB.y - baseLayerB.height / 2,
		};
		meta.slots.forEach((item) => {
			if (item.layer === "LayerA") this._placeFragment(layerAZeroPoint, item);
			else if (item.layer === "LayerB") this._placeFragment(layerBZeroPoint, item);
		});

		this._placeTitle(number, 0, layerAZeroPoint.y - this._layerShift * 0.5);
		// Debug.DrawMark(this.layerAZero.x, this.layerAZero.y, this._levelContainer);
		return this._levelContainer;
	}

	_placeTitle(number, x, y) {
		this._titleText = new PIXI.Text(
			`Level ${number}`,
			new PIXI.TextStyle({ fontFamily: "FilmotypeMajor", fontSize: 30, fontWeight: "bolder" })
		);
		this._titleText.anchor.set(0.5);
		this._titleText.x = x;
		this._titleText.y = y;
		this._levelContainer.addChild(this._titleText);
	}

	_placeFragment(layerZeroPoint, fragmentSlot) {
		const fragment = PIXI.Sprite.from(fragmentSlot.name);
		// fragment.anchor.set(0.5);
		fragment.scale.set(this._baseImageScale);
		fragment.x = layerZeroPoint.x + fragmentSlot.x * this._baseImageScale;
		fragment.y = layerZeroPoint.y + fragmentSlot.y * this._baseImageScale;
		this._levelContainer.addChild(fragment);

		fragment.hitArea = new PIXI.RoundedRectangle(
			fragment.x,
			fragment.y,
			fragment.width,
			fragment.height,
			fragment.width < fragment.height ? fragment.width / 5 : fragment.height / 5
		);
		const fragmentArea = {};
		fragmentArea.hitArea = fragment.hitArea;
		fragmentArea.graphics = this._makeHitFrame(fragment.hitArea);

		let shift = 2 * this._layerShift;
		if (fragmentSlot.layer === "LayerB") shift = -shift;
		fragment.hitArea = new PIXI.RoundedRectangle(
			fragment.x,
			fragment.y + shift,
			fragment.width,
			fragment.height,
			fragment.width < fragment.height ? fragment.width / 5 : fragment.height / 5
		);
		fragmentArea.mirrorHitArea = fragment.hitArea;
		fragmentArea.mirrorGraphics = this._makeHitFrame(fragment.hitArea);
		this._hiddenFragmentsHitAreas.push(fragmentArea);
	}

	_onClick(_event) {
		// console.log(`missed`);
		const localX = _event.global.x - this._canvasSize.x / 2;
		const localY = _event.global.y - this._canvasSize.y / 2;
		if (
			!this._checkIfHiddenFragmentClicked(localX, localY) &&
			!this._checkIfFoundFragmentClicked(localX, localY)
		)
			this._drawMissFrame(localX, localY);
	}

	_checkIfHiddenFragmentClicked(x, y) {
		for (let i = 0; i < this._hiddenFragmentsHitAreas.length; i++) {
			if (
				this._hiddenFragmentsHitAreas[i].hitArea.contains(x, y) ||
				this._hiddenFragmentsHitAreas[i].mirrorHitArea.contains(x, y)
			) {
				this._levelContainer.addChild(this._hiddenFragmentsHitAreas[i].graphics);
				this._levelContainer.addChild(this._hiddenFragmentsHitAreas[i].mirrorGraphics);
				this._foundFragmentsHitAreas.push(...this._hiddenFragmentsHitAreas.splice(i, 1));
				return true;
			}
		}
		return false;
	}

	_checkIfFoundFragmentClicked(x, y) {
		for (let i = 0; i < this._foundFragmentsHitAreas.length; i++) {
			if (
				this._foundFragmentsHitAreas[i].hitArea.contains(x, y) ||
				this._foundFragmentsHitAreas[i].mirrorHitArea.contains(x, y)
			)
				return true;
		}
		return false;
	}

	_drawMissFrame(x, y) {
		const SIZE = 22;
		const g = new PIXI.Graphics();
		g.lineStyle(2, 0xff0000, 1);
		g.beginFill(0xff0000, 0.1);
		g.drawRoundedRect(x - SIZE / 2, y - SIZE / 2, SIZE, SIZE, SIZE / 5);
		g.endFill();
		g.lineStyle(SIZE / 7, 0xff0000, 1);
		g.moveTo(x - SIZE / 5, y - SIZE / 5);
		g.lineTo(x + SIZE / 5, y + SIZE / 5);
		g.moveTo(x + SIZE / 5, y - SIZE / 5);
		g.lineTo(x - SIZE / 5, y + SIZE / 5);
		g.closePath();
		this._levelContainer.addChild(g);
	}

	_makeHitFrame(rect) {
		const g = new PIXI.Graphics();
		g.lineStyle(2, 0x00ff00, 1);
		g.drawShape(rect);
		// g.drawRoundedRect(x - SIZE / 2, y - SIZE / 2, SIZE, SIZE, SIZE / 5);
		// g.lineStyle(SIZE / 7, 0xff0000, 1);
		// g.moveTo(x - SIZE / 5, y - SIZE / 5);
		// g.lineTo(x + SIZE / 5, y + SIZE / 5);
		// g.moveTo(x + SIZE / 5, y - SIZE / 5);
		// g.lineTo(x - SIZE / 5, y + SIZE / 5);
		// g.closePath();
		// this._levelContainer.addChild(g);
		return g;
	}
}
