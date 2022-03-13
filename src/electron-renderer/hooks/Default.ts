import { whenGameStarted } from "renderer/gameFunctional";

export default class DefaultFunction {
  _isStarting = false;

  private _interval: number | null = null;

  start() {
    if (!this._isStarting && !this._interval) {
      this.execOne();
      this._interval = window.setInterval(() => this.logic(), 60 * 60 * 1000);
      this._isStarting = true;
    }
  }

  stop() {
    if (this._isStarting && this._interval) {
      clearInterval(this._interval);
      this._interval = null;
      this._isStarting = false;
    }
  }

  private async execOne() {
    await whenGameStarted();

    setTimeout(() => {
      window.doGetMoney();
      window.doGetExp();
    }, 10 * 1000);
  }

  private async logic() {
    await whenGameStarted();

    window.doGetMoney();
  }
}
