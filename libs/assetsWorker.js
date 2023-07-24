import { Assets } from "./pixi.mjs";

export default class AssetsWorker {
	_BASE_URL = "https://hgstudio.ru/jstesttask/levels/";

	_levelTextures = [];
    _currentLevel = 0;
    _currentLevelMeta = null;

	constructor() {
		this._loadFont();
	}

	_loadFont() {
		Assets.add("FilmotypeMajor", "../fonts/Filmotype_Major.otf");
		Assets.load("FilmotypeMajor");
	}

	async loadLevelResources(levelNumber) {
        if (this._currentLevel === levelNumber) return this._currentLevelMeta;
        else this._currentLevel = levelNumber;
		// if (this._levelTextures.length > 0)
		// await this._clearAssets();

		this._currentLevelMeta = await Assets.load(this._BASE_URL + levelNumber + "/level.json");

		this._currentLevelMeta.slots.forEach((item) => {
			Assets.add(`${levelNumber}_${item.name}`, this._BASE_URL + levelNumber + "/images/" + item.name + ".jpg");
			this._levelTextures.push(`${levelNumber}_${item.name}`);
		});

		await Assets.load(this._levelTextures);
		return this._currentLevelMeta;
	}

	async _clearAssets() {
		console.log(`Has 1? ${Assets.cache.has("1")}`);
		await Assets.unload(this._levelTextures);
		// Assets.cache.reset();
		// this._levelTextures.forEach((item) => {
		//     Assets.cache.remove(item);
		// });
		console.log(`Has 1? ${Assets.cache.has("1")}`);
		this._levelTextures = [];
	}
}
