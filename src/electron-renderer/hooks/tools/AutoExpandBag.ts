export default class AutoExpandBag {
  _isStarting = false

  private _interval: number | null = null

  start(d = 10 * 60 * 1000) {
    if (!this._interval) {
      this.logic()
      this._interval = window.setInterval(() => this.logic(), d)
      this._isStarting = true
    }
  }

  stop() {
    if (this._interval) {
      clearInterval(this._interval)
      this._interval = null
      this._isStarting = false
    }
  }

  private logic() {
    const { xself, Tool } = window

    const e = Math.floor(Tool.currentTime / 1e3)

    if (xself?.bag?.nextTime > 0 && e > xself?.bag?.nextTime)
      xself?.bag?.expandPackageByTime()
  }
}
