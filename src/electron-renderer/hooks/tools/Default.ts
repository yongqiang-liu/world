import { TimeHelper } from "common/timer";
import { EVENTS } from "renderer/events/eventConst";
import { whenGameStarted } from "renderer/gameFunctional";

export default class DefaultFunction {
  _isStarting = false;

  private _interval: number | null = null;

  start() {
    if (!this._isStarting && !this._interval) {
      this.execOne();
      this.eventLogic();
      this._interval = window.setInterval(
        () => this.logic(),
        TimeHelper.hour(1)
      );
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
    // 修改新手标志
    window.Player.NOVICE_LEVEL = 0;

    await whenGameStarted();

    setTimeout(() => {
      // 自动领取铜币
      window.doGetMoney();
      // 自动领取经验
      window.doGetExp();
    }, TimeHelper.second(10));
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
