import { TimeHelper } from "common/timer";

export default class AutoOnlineReward {
  _isStarting = false;

  private _interval: number | null = null;

  start(d: number = TimeHelper.minute(1)) {
    if (!this._interval) {
      setTimeout(() => this.logic(), TimeHelper.second(10));
      this._interval = window.setInterval(() => this.logic(), d);
      this._isStarting = true;
    }
  }

  stop() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
      this._isStarting = false;
    }
  }

  private async logic() {
    const { OnlineReward } = window;

    if (OnlineReward?.instance?.isCanReward()) {
      OnlineReward?.instance?.doGetReward();
    }
  }
}
