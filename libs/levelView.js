import * as PIXI from "./pixi.mjs";
// import * as Debug from "./debugHelpers.js";
import AppView from "./appView.js";
// import { EventLevelFinished } from "./eventManager.js";
import UiView from "./uiView.js";

export default class LevelView {
	_GAP = 0.05;
	_SIDE_GAP = 0.05;
	_canvasSize = { x: 0, y: 0 };
	_baseScale = 1;
	_layerShift = { x: 0, y: 0 };
	_isOrientationHorz = false;

	_appStage;
	_appView;
	_levelContainer = new PIXI.Container();

	_hiddenFragmentsHitAreas = [];

	_uiView = UiView.instance();

	constructor() {}

	init(app) {
		this._appView = new AppView(app);
		this._appStage = app.stage;
	}

	create(meta, levelNumber) {
		const baseSlot = meta.slots.find((item) => item.layer === "standart");
		
		// set screen orientation
		this._isOrientationHorz = baseSlot.width > baseSlot.height;
		this._appView.setScreen(this._isOrientationHorz);
		this._appView.setMargins();
		this._canvasSize = this._appView.getCanvasSize();

		// Left/Top image
		const baseLayerA = PIXI.Sprite.from(`${levelNumber}_${baseSlot.name}`);
		this._calculateBaseScale(baseLayerA.width, baseLayerA.height);
		baseLayerA.anchor.set(0.5);
		baseLayerA.scale.set(this._baseScale);

		if (this._isOrientationHorz) {
			this._layerShift.y = 0.5 * baseLayerA.height * (1 + this._GAP);
			baseLayerA.x = 0;
			baseLayerA.y = -this._layerShift.y;
		} else {
			this._layerShift.x = 0.5 * baseLayerA.width * (1 + this._GAP);
			baseLayerA.x = 0;
			baseLayerA.y = 0;
		}
		baseLayerA.interactive = true;
		baseLayerA.on("pointerup", this._onClick, this);
		this._levelContainer.addChild(baseLayerA);

		// Right/Bottom image
		const baseLayerB = PIXI.Sprite.from(`${levelNumber}_${baseSlot.name}`);
		baseLayerB.anchor.set(0.5);
		baseLayerB.scale.set(this._baseScale);
		if (this._isOrientationHorz) {
			baseLayerB.x = 0;
			baseLayerB.y = this._layerShift.y;
		} else {
			baseLayerB.x = 2 * this._layerShift.x;
			baseLayerB.y = 0;
		}
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
		// Debug.DrawMark(layerAZeroPoint.x, layerAZeroPoint.y, this._levelContainer);
		// Debug.DrawMark(layerBZeroPoint.x, layerBZeroPoint.y, this._levelContainer);

		meta.slots.forEach((item) => {
			if (item.layer === "LayerA") this._placeFragment(layerAZeroPoint, levelNumber, item);
			else if (item.layer === "LayerB")
				this._placeFragment(layerBZeroPoint, levelNumber, item);
		});

		// Level title
		let titlePosition = { x: 0, y: 0 };
		if (this._isOrientationHorz) {
			titlePosition.x = 0;
			titlePosition.y = layerAZeroPoint.y - this._layerShift.y * 0.5;
		} else {
			titlePosition.x = layerAZeroPoint.x - this._layerShift.x;
			titlePosition.y = layerAZeroPoint.y + baseLayerB.height * 0.25;
		}
		const titleText = this._uiView.getTitle();
		titleText.x = titlePosition.x;
		titleText.y = titlePosition.y;
		this._levelContainer.addChild(titleText);

		// Counters
		let countersPosition = { x: 0, y: 0 };
		if (!this._isOrientationHorz) {
			countersPosition.x = 0.5 * baseLayerB.width;
			countersPosition.y = layerBZeroPoint.y + baseLayerB.height + 30;
		} else {
			countersPosition.x = layerAZeroPoint.x - 20;
			countersPosition.y = layerAZeroPoint.y + baseLayerB.height - 30;
		}
		const [diffCounterText, errorsCounterText] = this._uiView.getCounters();
		diffCounterText.x = countersPosition.x;
		diffCounterText.y = countersPosition.y;
		this._levelContainer.addChild(diffCounterText);
		errorsCounterText.x = countersPosition.x;
		errorsCounterText.y = countersPosition.y + 20;
		this._levelContainer.addChild(errorsCounterText);

		// this._uiView.updateCounters(this._foundFragmentsHitAreas.length, this._errorsNumber);

		this._levelContainer.x = this._canvasSize.x / 2;
		this._levelContainer.y = this._canvasSize.y / 2;
		this._appStage.addChild(this._levelContainer);
	}

	_calculateBaseScale(baseWidth, baseHeight) {
		let imageScaleX = 1;
		if (this._canvasSize.x < baseWidth)
			imageScaleX = (this._canvasSize.x * (1 - 2 * this._SIDE_GAP)) / baseWidth;
		let imageScaleY = 1;
		if (this._canvasSize.y < baseHeight)
			imageScaleY = (this._canvasSize.y * (1 - 2 * this._SIDE_GAP)) / baseHeight;
		this._baseScale = imageScaleX < imageScaleY ? imageScaleX : imageScaleY;
	}

	_hideAndDelete() {
		this._levelContainer.visible = false;
		this._levelContainer.destroy(); // TODO: check if options.texture destroy all textures
		// this._eventManager.notify(EventLevelFinished, null);
		this._uiView.showWinScreen();
	}

	_placeFragment(layerZeroPoint, levelNumber, fragmentSlot) {
		const fragment = PIXI.Sprite.from(`${levelNumber}_${fragmentSlot.name}`);
		fragment.scale.set(this._baseScale);
		fragment.x = layerZeroPoint.x + fragmentSlot.x * this._baseScale;
		fragment.y = layerZeroPoint.y + fragmentSlot.y * this._baseScale;
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
		// fragmentArea.graphics = this._uiView.makeHitFrame(fragment.hitArea);

		let shift = { x: 0, y: 0 }; //2 * this._layerShift;
		if (this._isOrientationHorz) shift.x = 2 * this._layerShift.x;
		else shift.y = 2 * this._layerShift.y;
		if (fragmentSlot.layer === "LayerB") {
			shift.x = -shift.x;
			shift.y = -shift.y;
		}
		fragment.hitArea = new PIXI.RoundedRectangle(
			fragment.x + shift.x,
			fragment.y + shift.y,
			fragment.width,
			fragment.height,
			fragment.width < fragment.height ? fragment.width / 5 : fragment.height / 5
		);
		fragmentArea.mirrorHitArea = fragment.hitArea;
		// fragmentArea.mirrorGraphics = this._uiView.makeHitFrame(fragment.hitArea);
		this._hiddenFragmentsHitAreas.push(fragmentArea);
	}

	_onClick(_event) {
		const localX = _event.global.x - this._canvasSize.x / 2;
		const localY = _event.global.y - this._canvasSize.y / 2;
		if (
			!this._checkIfHiddenFragmentClicked(localX, localY) &&
			!this._checkIfFoundFragmentClicked(localX, localY)
		) {
			this._levelContainer.addChild(this._uiView.makeMissFrame(localX, localY));
			// this._uiView.createHtmlMissFrame(_event.global.x, _event.global.y);
			this._errorsNumber++;
		}
		this._uiView.updateCounters(this._foundFragmentsHitAreas.length, this._errorsNumber);
		this._checkForWin();
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
}
