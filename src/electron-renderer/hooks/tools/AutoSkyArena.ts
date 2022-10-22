export class AutoSkyArena {
  _isStarting = false;

  _interval: NodeJS.Timer | null = null;

  start() {
    if (!this._interval) {
      this._isStarting = true
      this._interval = setInterval(() => {
        if (window.PanelManager.getPanel(window.SkyArenaScene).skyArena.tier === 100)
          this.stop()

        if (!window.xworld.inBattle && window.PanelManager.getPanel(window.SkyArenaScene).refresh_time.text.includes('0')) {
          window.PanelManager.getPanel(window.SkyArenaScene).onChallenge()
        }
      }, 5000)
    }
  }

  stop() {
    if (this._interval) {
      this._isStarting = false
      clearInterval(this._interval)
    }
  }
}