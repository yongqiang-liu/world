export default class AutoOnlineReward {
  _isStarting = false;

  private _interval: number | null = null;

  start(d: number = 1000 * 60) {
    if (!this._interval) {
      this.logic();
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
