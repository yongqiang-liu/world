import { EVENTS } from "renderer/events/eventConst";
import { whenGameStarted } from "renderer/gameFunctional";

export default class DefaultFunction {
  _isStarting = false;

  private _interval: number | null = null;

  start() {
    if (!this._isStarting && !this._interval) {
      this.execOne();
      this.eventLogic();
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
      // 自动领取铜币
      window.doGetMoney();
      // 自动领取经验
      window.doGetExp();
    }, 10 * 1000);
  }

  private eventLogic() {
    window.__myEvent__.on(EVENTS.EXIT_BATTLE_MAP, () => {
      // 自动回血
      window?.ItemManager?.doQuickAddHP(window.xself);
    });
  }

  private async logic() {
    await whenGameStarted();

    window.doGetMoney();
  }
}
