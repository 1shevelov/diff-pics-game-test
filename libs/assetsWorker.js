import { Assets } from "./pixi.mjs";

export default class AssetsWorker {
	_BASE_URL = "https://hgstudio.ru/jstesttask/levels/";

	_levelTextures = [];

	constructor() {
		this._loadFont();
	}

	_loadFont() {
		Assets.add("FilmotypeMajor", "../fonts/Filmotype_Major.otf");
		Assets.load("FilmotypeMajor");
	}

	async loadLevelResources(levelNumber) {
		// if (this._levelTextures.length > 0)
		// await this._clearAssets();

		const meta = await Assets.load(this._BASE_URL + levelNumber + "/level.json");

		meta.slots.forEach((item) => {
			Assets.add(`${levelNumber}_${item.name}`, this._BASE_URL + levelNumber + "/images/" + item.name + ".jpg");
			this._levelTextures.push(`${levelNumber}_${item.name}`);
		});

		await Assets.load(this._levelTextures);
		console.log(this._levelTextures);
		this._levelTextures.forEach((item) => {
			console.log(Assets.cache.has(item));
		});
		return { meta: meta, textures: this._levelTextures };
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
