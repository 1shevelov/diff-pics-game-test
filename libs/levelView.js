import * as PIXI from "./pixi.mjs";
import * as Debug from "./debugHelpers.js";

export default class LevelView {
	_GAP = 0.05;
	_SIDE_GAP = 0.05;
	_canvasSize = { x: 0, y: 0 };
	_baseImageScale = 1;

	_levelContainer = new PIXI.Container();

	constructor(canvasWidth, canvasHeight) {
		this._canvasSize.x = canvasWidth;
		this._canvasSize.y = canvasHeight;
	}

	make(meta, textures) {
		const baseSlot = meta.slots.find((item) => item.layer === "standart");

		const baseLayerA = PIXI.Sprite.from(baseSlot.name);
		if (this._canvasSize.x < baseLayerA.width)
			this._baseImageScale = (this._canvasSize.x * (1 - 2 * this._SIDE_GAP)) / baseLayerA.width;

		baseLayerA.anchor.set(0.5);
		baseLayerA.scale.set(this._baseImageScale);
		baseLayerA.x = 0;
		baseLayerA.y = -0.5 * baseLayerA.height * (1 + this._GAP);
		this._levelContainer.addChild(baseLayerA);

		const layerAZeroPoint = { x: baseLayerA.x - baseLayerA.width / 2,
			y: baseLayerA.y - baseLayerA.height / 2 };
		meta.slots.forEach((item) => {
			if (item.layer === "LayerA") this._placeFragment(layerAZeroPoint, item);
		});
		// Debug.DrawMark(baseLayerA.x - baseLayerA.width / 2, baseLayerA.y - baseLayerA.height / 2, this._levelContainer);

		const baseLayerB = PIXI.Sprite.from(baseSlot.name);
		baseLayerB.anchor.set(0.5);
		baseLayerB.scale.set(this._baseImageScale);
		baseLayerB.x = 0;
		baseLayerB.y = 0.5 * baseLayerB.height * (1 + this._GAP);
		this._levelContainer.addChild(baseLayerB);

		const layerBZeroPoint = { x: baseLayerB.x - baseLayerB.width / 2,
			y: baseLayerB.y - baseLayerB.height / 2 };
		meta.slots.forEach((item) => {
			if (item.layer === "LayerB") this._placeFragment(layerBZeroPoint, item);
		});

		// Debug.DrawMark(this.layerAZero.x, this.layerAZero.y, this._levelContainer);
		return this._levelContainer;
	}

	_placeFragment(layerZeroPoint, fragmentSlot) {
		const fragment = PIXI.Sprite.from(fragmentSlot.name);
		// fragment.anchor.set(0.5);
		fragment.scale.set(this._baseImageScale);
		fragment.x = layerZeroPoint.x + fragmentSlot.x * this._baseImageScale;
		fragment.y = layerZeroPoint.y + fragmentSlot.y * this._baseImageScale;
		fragment.interactive = true;
		fragment.cursor = "pointer";
		this._levelContainer.addChild(fragment);
	}
}
