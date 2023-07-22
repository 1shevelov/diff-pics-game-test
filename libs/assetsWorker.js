import { Assets } from "./pixi.mjs";

export default class AssetsWorker {
	_BASE_URL = "https://hgstudio.ru/jstesttask/levels/";

	constructor() {
        this._loadFont();
    }

	_loadFont() {
		Assets.add("FilmotypeMajor", "../fonts/Filmotype_Major.otf");
		Assets.load("FilmotypeMajor");
	}

	async loadLevelResources(level = 1) {
		const meta = await Assets.load(this._BASE_URL + level + "/level.json");
		// console.log(meta);

		const textureNames = [];
		meta.slots.forEach((item) => {
			Assets.add(item.name, this._BASE_URL + level + "/images/" + item.name + ".jpg");
			textureNames.push(item.name);
		});

		await Assets.load(textureNames);

		return { meta, textureNames };
	}
}
