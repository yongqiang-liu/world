export default class TestRefreshGame {
  _isStarting = false

  private _interval: number | null = null

  _mission = null

  start(d?: number) {
    const { xworld } = window

    this._interval = window.setInterval(() => {
      for (let i = 0; i < xworld.npcList.length; i++) {
        if (xworld.npcList[i].isMonster && !xworld.npcList[i].isVisible()) {
          xworld.npcList[i].rebornImmediately()
          xworld.npcList[i].rangeX = -1
        }
      }
    }, d)

    if (!this._isStarting) {
      this._isStarting = true

      if (!window.skipBattleAnime._isStarting)
        window.skipBattleAnime.start()
    }
  }

  stop() {
    if (this._interval) {
      clearInterval(this._interval)
      this._interval = null
      this._isStarting = false

      if (window.skipBattleAnime._isStarting && !window.config.skipBattleAnim)
        window.skipBattleAnime.stop()
    }
  }
}
