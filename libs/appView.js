// Canvas management

import * as DEBUG from "./debugHelpers.js";

export default class AppView {
    _CANVAS_HORZ_RATIO = { x: 9, y: 16 };
    _CANVAS_VERT_RATIO = { x: 16, y: 9 };

    _screenWidth = 0;
    _screenHeight = 0;

    _canvasSize = { x: 0, y: 0 };
    _isYLimits = false;

    _app;

    constructor(app) {
        this._app = app;
        this._screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        this._screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        // console.log(document.documentElement.clientWidth, window.innerWidth);
        // DEBUG.putValuesOnScreen(app, [document.documentElement.clientWidth, window.innerWidth]);
    }

    setScreen(orientationHorz) {
        if (!this._app) return;
        const usedRatio = orientationHorz ? this._CANVAS_HORZ_RATIO : this._CANVAS_VERT_RATIO;
        this._isYLimits = this._screenWidth / usedRatio.x > this._screenHeight / usedRatio.y;
        const smallerDimensionSize = this._isYLimits
            ? (this._screenHeight / usedRatio.y) * usedRatio.x
            : (this._screenWidth / usedRatio.x) * usedRatio.y;
        this._canvasSize.x = this._isYLimits ? smallerDimensionSize : this._screenWidth;
        this._canvasSize.y = this._isYLimits ? this._screenHeight : smallerDimensionSize;
        // console.log(this._isYLimits, this._canvasSize.x, this._canvasSize.y);
        this._app.renderer.resize(this._canvasSize.x, this._canvasSize.y);
    }

    setMargins() {
        if (!this._app) return;
        if (this._isYLimits) {
            this._app.view.style.marginLeft = this._app.view.style.marginRight = `${
                (this._screenWidth - this._canvasSize.x) / 2
            }px`;
            this._app.view.style.marginTop = this._app.view.style.marginBottom = "0";
        } else {
            this._app.view.style.marginLeft = this._app.view.style.marginRight = "0";
            this._app.view.style.marginTop = this._app.view.style.marginBottom = `${
                (this._screenHeight - this._canvasSize.y) / 2
            }px`;
        }
    }

    getCanvasSize() {
        return this._canvasSize;
    }
}