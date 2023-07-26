export const EventLevelFinished = "LevelFinished";
export const EventWinScreenClosed = "WinScreenClosed";

export class EventManager {
	_listeners = [];

	constructor() {}

	subscribe(event, callback) {
		this._listeners.push({ event, callback });
	}

	unsubscribe(event, callback) {
		this._listeners = this._listeners.filter(
			(item) => item.event !== event || item.callback !== callback
		);
	}

	notify(event, data) {
		this._listeners.forEach((item) => {
			if (item.event === event) {
				item.callback(data);
			}
		});
	}
}
