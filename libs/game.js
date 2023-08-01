// handles all game logic
// requests assets loading
// inits levelView on level start and restores on window resize


import AssetsWorker from "./assetsWorker.js";
import { EventWinScreenClosed, EventManager } from "./eventManager.js";
import LevelView from "./levelView.js";
// import UiView from "./uiView.js";

export default class Game {
    _eventManager = new EventManager();
    _assetsWorker = new AssetsWorker();

    _differencesNumber = 0;
	_errorsNumber = 0;

	// _hiddenFragmentsHitAreas = [];
	// _foundFragmentsHitAreas = [];
    
    _assetsWorker = new AssetsWorker();
	// _uiView = UiView.instance();
    _levelView = new LevelView();

    _STARTING_LEVEL_NUMBER = 1;
    _currentLevelNumber = this._STARTING_LEVEL_NUMBER;

    constructor(app) {
        this.init(app);
    }

    async init(app) {
        const meta = await this._assetsWorker.loadLevelResources(this._currentLevelNumber);

		this._differencesNumber = meta.slots.length - 1;
        console.log(`Differences number: ${this._differencesNumber}`);
		// this._uiView.setLevelData(this._canvasSize, this._differencesNumber);
        // from GameView
        //this._levelView.init(this._canvasSize.x, this._canvasSize.y);
        // this._uiView.setLevelNumber(levelNumber);
        this._levelView.init(app);
        this._levelView.create(meta, this._currentLevelNumber);
    }

	// _checkForWin() {
	// 	if (this._foundFragmentsHitAreas.length === this._differencesNumber) {
	// 		this._hideAndDelete();
	// 	}
	// }
}