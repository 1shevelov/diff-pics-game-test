import { Text, TextStyle, Graphics, Container } from "./pixi.mjs";
import { EventWinScreenClosed } from "./eventManager.js";

export default class UiView {
	static _instance;

	_LEVEL_TEXT = "Level";
	_DIFF_TEXT = "Differences found: ";
	_ERRORS_TEXT = "Errors: ";
	_WIN_TEXT = "You win!";
	_WIN_BUTTON_TEXT = "Next level";

	_titleText = null;
	_diffText = null;
	_errorsText = null;

	_winText = null;
	_winButton = null;
    _winButtonText = null;
	_winScreenContainer = new Container();

	_canvasSize = { x: 0, y: 0 };
	_levelDiffNumber = 0;

    _appContainer = null;
    _eventManager = null;

	static instance() {
		if (!this._instance) {
			this._instance = new this();
		}

		return this._instance;
	}

	_constructor() {}

    init(appContainer, appEventManager) {
        this._appContainer = appContainer;
        this._eventManager = appEventManager;
    }

	getTitle(levelNumber) {
		if (!this._titleText) {
			this._titleText = new Text(
				"",
				new TextStyle({
					fontFamily: "FilmotypeMajor",
					fontSize: 36,
					fontWeight: "800",
				})
			);
			this._titleText.anchor.set(0.5);
		}
		this._titleText.text = `${this._LEVEL_TEXT} ${levelNumber}`;

		this._createWinScreen();

		return this._titleText;
	}

	getCounters() {
		if (!this._diffText) {
			this._diffText = new Text(
				this._DIFF_TEXT,
				new TextStyle({
					fontFamily: "FilmotypeMajor",
					fontSize: 16,
					fontWeight: "800",
				})
			);
			this._diffText.anchor.set(1);
		}

		if (!this._errorsText) {
			this._errorsText = new Text(
				this._ERRORS_TEXT,
				new TextStyle({
					fontFamily: "FilmotypeMajor",
					fontSize: 16,
					fontWeight: "800",
				})
			);
			this._errorsText.anchor.set(1);
		}

		return [this._diffText, this._errorsText];
	}

	setLevelData(canvasSize, diffNumber) {
		this._canvasSize = canvasSize;
		this._levelDiffNumber = diffNumber;
	}

	updateCounters(foundFragmentsNum, errorsNum) {
		if (this._levelDiffNumber !== 0)
			this._diffText.text = `${this._DIFF_TEXT}${foundFragmentsNum} / ${this._levelDiffNumber}`;
		else this._diffText.text = `${this._DIFF_TEXT}${foundFragmentsNum}`;
		this._errorsText.text = `${this._ERRORS_TEXT}${errorsNum}`;
	}

	makeMissFrame(x, y) {
		const SIZE = 22;
		const g = new Graphics();
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
		return g;
	}

	makeHitFrame(rect) {
		const g = new Graphics();
		g.lineStyle(2, 0x00ff00, 1);
		g.drawShape(rect);
		return g;
	}

	showWinScreen() {
        this._createButton();
		this._winScreenContainer.visible = true;
	}

    clearButton() {
        if (this._winButton) {
            this._winScreenContainer.removeChild(this._winScreenContainer.getChildByName("winButton"));
            this._winButton.clear();
            this._winButton = null;
        }
    }

	_createWinScreen() {
		this._winScreenContainer.x = this._canvasSize.x / 2;
		this._winScreenContainer.y = this._canvasSize.y / 3;

		if (!this._winText) {
			this._winText = new Text(
				"",
				new TextStyle({
					fontFamily: "FilmotypeMajor",
					fontSize: 42,
					fill: ["Crimson", "DeepPink", "MediumVioletRed"],
					fontWeight: "800",
					align: "center",
				})
			);
			this._winText.anchor.set(0.5);
			this._winText.x = 0;
			this._winText.y = 0;
			this._winScreenContainer.addChild(this._winText);
		}
		this._winText.text = `${this._titleText.text}\n${this._WIN_TEXT}`;

        this._createButton();

        if (this._winButtonText === null) {
            this._winButtonText = new Text(
                this._WIN_BUTTON_TEXT,
                new TextStyle({
                    fontFamily: "FilmotypeMajor",
                    fontSize: 24,
                    fill: ["#ffffff"],
                    fontWeight: "800",
                    align: "center",
                })
            );
            this._winButtonText.anchor.set(0.5);
            this._winScreenContainer.addChild(this._winButtonText);
		}
        this._winButtonText.x = 0;
        this._winButtonText.y = this._canvasSize.y * 0.4;

        this._winScreenContainer.visible = false;
        this._appContainer.addChild(this._winScreenContainer);
	}

    _onNextButtonClick() {
        this._winScreenContainer.visible = false;
        this.clearButton();
        this._eventManager.notify(EventWinScreenClosed, null);
    }

    _createButton() {
        this.clearButton();

        const BUTTON_SIZE = { x: 200, y: 50 };
        this._winButton = new Graphics();
        this._winButton.beginFill(0x2e8b57, 1);
        this._winButton.drawRoundedRect(
            BUTTON_SIZE.x / -2,
            BUTTON_SIZE.y / -2 + this._canvasSize.y * 0.4,
            BUTTON_SIZE.x,
            BUTTON_SIZE.y,
            BUTTON_SIZE.x > BUTTON_SIZE.y ? BUTTON_SIZE.y / 5 : BUTTON_SIZE.x / 5
        );
        this._winButton.endFill();
        this._winButton.interactive = true;
        this._winButton.on("pointerup", this._onNextButtonClick, this);
        this._winButton.name = "winButton";
        this._winScreenContainer.addChildAt(this._winButton, 0);
    }
}
