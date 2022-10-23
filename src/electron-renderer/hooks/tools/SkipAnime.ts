export default class SkipBattleAnime {
  _isStarting = false
  time = 1300

  private _logicCount = 0

  start() {
    if (!this._isStarting) {
      this._isStarting = true
      window.nato.WorldTicker.instance.register(this.logic, this)
    }
  }

  stop() {
    if (this._isStarting) {
      this._isStarting = false
      window.nato.WorldTicker.instance.unregister(this.logic, this)
    }
  }

  logic(t: number) {
    if (((this._logicCount += t), !(this._logicCount < this.time))) {
      const {
        AlertPanel,
        xworld,
        PanelManager,
        BattleInputHandler,
        BattleView,
      } = window

      if (AlertPanel.instance && AlertPanel.instance.stage)
        return AlertPanel.instance.closePanel()

      if (((this._logicCount = 0), xworld.inBattle)) {
        const e = PanelManager.battleUI

        if (
          e?.stage
          && e?.visible
          && e?.btn_auto?.stage
          && e?.btn_auto?.visible
          && e?.btn_auto.parent.visible
        ) {
          e.actionWidget = e.btn_auto
          BattleInputHandler?.instance.processOrderPopPanel()
        }
        else {
          if (e?.btn_skip_anime.stage && e?.btn_skip_anime.visible) {
            e.actionWidget = e.btn_skip_anime
            BattleInputHandler.instance.processOrderPopPanel()
          }
        }

        const n = PanelManager.battleResultPanel
        return n && n.stage && n.visible && BattleView.instance.doExit()
      }
    }
  }
}
