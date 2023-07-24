import * as PIXI from "./pixi.mjs";
import * as Debug from "./debugHelpers.js";
import * as EVENTS from "./eventManager.js";

export default class LevelView {
	_GAP = 0.05;
	_SIDE_GAP = 0.05;
	_canvasSize = { x: 0, y: 0 };
	_baseScale = 1;
	_layerShift = { x: 0, y: 0 };
	_isOrientationHorz = false;

	_DIFF_TEXT = "Differences found: ";
	_ERRORS_TEXT = "Errors: ";

	_levelContainer = new PIXI.Container();
	_titleText = null;
	_diffText = null;
	_errorsText = null;

	_diffNumber = 0;
	_errorsNumber = 0;

	_hiddenFragmentsHitAreas = [];
	_foundFragmentsHitAreas = [];

	_eventManager = null;

	constructor(canvasWidth, canvasHeight, appEventManager) {
		this._canvasSize.x = canvasWidth;
		this._canvasSize.y = canvasHeight;
		this._isOrientationHorz = canvasWidth > canvasHeight;

		this._eventManager = appEventManager;
	}

	create(levelNumber, meta) {
		const baseSlot = meta.slots.find((item) => item.layer === "standart");

		// Left/Top image
		const baseLayerA = PIXI.Sprite.from(`${levelNumber}_${baseSlot.name}`);
		this._calculateBaseScale(baseLayerA.width, baseLayerA.height);

		baseLayerA.anchor.set(0.5);
		baseLayerA.scale.set(this._baseScale);

		if (!this._isOrientationHorz) {
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
		if (!this._isOrientationHorz) {
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
		if (!this._isOrientationHorz) {
			titlePosition.x = 0;
			titlePosition.y = layerAZeroPoint.y - this._layerShift.y * 0.5;
		} else {
			titlePosition.x = layerAZeroPoint.x - this._layerShift.x;
			titlePosition.y = layerAZeroPoint.y + baseLayerB.height * 0.25;
		}
		this._placeTitle(levelNumber, titlePosition);

		// Counters
		let countersPosition = { x: 0, y: 0 };
		if (!this._isOrientationHorz) {
			countersPosition.x = 0.5 * baseLayerB.width;
			countersPosition.y = layerBZeroPoint.y + baseLayerB.height + 30;
		} else {
			countersPosition.x = layerAZeroPoint.x - 20;
			countersPosition.y = layerAZeroPoint.y + baseLayerB.height - 30;
		}
		this._placeCounters(countersPosition);
		this._diffNumber = meta.slots.length - 1;
		this._updateCounters();

		return this._levelContainer;
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

	_hide() {
		this._levelContainer.visible = false;
		this._eventManager.notify(EVENTS.LevelFinished, null);
	}

	_placeTitle(levelNumber, position) {
		const LEVEL_TEXT = "Level";
		this._titleText = new PIXI.Text(
			`${LEVEL_TEXT} ${levelNumber}`,
			new PIXI.TextStyle({
				fontFamily: "FilmotypeMajor",
				fontSize: 36,
				fontWeight: "800",
			})
		);
		this._titleText.anchor.set(0.5);
		this._titleText.x = position.x;
		this._titleText.y = position.y;
		this._levelContainer.addChild(this._titleText);
	}

	_placeCounters(position) {
		this._diffText = new PIXI.Text(
			this._DIFF_TEXT,
			new PIXI.TextStyle({
				fontFamily: "FilmotypeMajor",
				fontSize: 16,
				fontWeight: "800",
			})
		);
		this._diffText.anchor.set(1);
		this._diffText.x = position.x;
		this._diffText.y = position.y;
		this._levelContainer.addChild(this._diffText);

		this._errorsText = new PIXI.Text(
			this._ERRORS_TEXT,
			new PIXI.TextStyle({
				fontFamily: "FilmotypeMajor",
				fontSize: 16,
				fontWeight: "800",
			})
		);
		this._errorsText.anchor.set(1);
		this._errorsText.x = position.x;
		this._errorsText.y = position.y + 20;
		this._levelContainer.addChild(this._errorsText);
	}

	_updateCounters() {
		this._diffText.text = `${this._DIFF_TEXT}${this._foundFragmentsHitAreas.length} / ${this._diffNumber}`;
		this._errorsText.text = `${this._ERRORS_TEXT}${this._errorsNumber}`;

		if (this._foundFragmentsHitAreas.length === this._diffNumber) {
			console.log("You win!");
			setTimeout(() => {
				this._hide();
			}, 1000);
		}
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
		fragmentArea.graphics = this._makeHitFrame(fragment.hitArea);

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
		fragmentArea.mirrorGraphics = this._makeHitFrame(fragment.hitArea);
		this._hiddenFragmentsHitAreas.push(fragmentArea);
	}

	_onClick(_event) {
		const localX = _event.global.x - this._canvasSize.x / 2;
		const localY = _event.global.y - this._canvasSize.y / 2;
		if (
			!this._checkIfHiddenFragmentClicked(localX, localY) &&
			!this._checkIfFoundFragmentClicked(localX, localY)
		) {
			this._drawMissFrame(localX, localY);
			this._errorsNumber++;
		}
		this._updateCounters();
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
		return g;
	}
}
