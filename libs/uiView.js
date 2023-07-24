import { Text, TextStyle } from "./pixi.mjs";

export default class UiView {
	_LEVEL_TEXT = "Level";
	_DIFF_TEXT = "Differences found: ";
	_ERRORS_TEXT = "Errors: ";

	_titleText = null;
	_diffText = null;
	_errorsText = null;

	_levelDiffNumber = 0;

	constructor() {}

	placeTitle(levelNumber, position, container) {
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
		this._titleText.x = position.x;
		this._titleText.y = position.y;
		container.addChild(this._titleText);
	}

	placeCounters(position, container) {
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
		this._diffText.x = position.x;
		this._diffText.y = position.y;
		container.addChild(this._diffText);

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
		this._errorsText.x = position.x;
		this._errorsText.y = position.y + 20;
		container.addChild(this._errorsText);
	}

	setLevelDiffNumber(diffNumber) {
		this._levelDiffNumber = diffNumber;
	}

	updateCounters(foundFragmentsNum, errorsNum) {
		if (this._levelDiffNumber !== 0)
			this._diffText.text = `${this._DIFF_TEXT}${foundFragmentsNum} / ${this._levelDiffNumber}`;
		else this._diffText.text = `${this._DIFF_TEXT}${foundFragmentsNum}`;
		this._errorsText.text = `${this._ERRORS_TEXT}${errorsNum}`;
	}
}
