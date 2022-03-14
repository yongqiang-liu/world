export default class TestRefreshGame {
  _isStarting = false;

  private _interval: number | null = null;

  _mission = null;

  private _logicCount: number = 0;

  start(d?: number) {
    const { xworld, nato } = window;

    this._interval = window.setInterval(() => {
      for (var i = 0; i < xworld.npcList.length; i++) {
        if (xworld.npcList[i].isMonster && !xworld.npcList[i].isVisible()) {
          xworld.npcList[i].rebornImmediately();
          xworld.npcList[i].rangeX = -1;
        }
      }
    }, d);

    if (!this._isStarting) {
      this._isStarting = true;
      nato.WorldTicker.instance.register(this.logic, this);
    }
  }

  stop() {
    if (this._interval) {
      const { nato } = window;
      clearInterval(this._interval);
      this._interval = null;
      this._isStarting &&
        ((this._isStarting = false),
        nato.WorldTicker.instance.unregister(this.logic, this));
    }
  }

  logic(t: number) {
    if (((this._logicCount += t), !(this._logicCount < 1000))) {
      const {
        AlertPanel,
        xworld,
        PanelManager,
        BattleInputHandler,
        BattleView,
      } = window;

      if (AlertPanel.instance && AlertPanel.instance.stage) {
        return AlertPanel.instance.closePanel();
      }

      if (((this._logicCount = 0), xworld.inBattle)) {
        let e = PanelManager.battleUI;

        if (
          e?.stage &&
          e?.visible &&
          e?.btn_auto?.stage &&
          e?.btn_auto?.visible &&
          e?.btn_auto.parent.visible
        ) {
          e.actionWidget = e.btn_auto;
          BattleInputHandler?.instance.processOrderPopPanel();
        } else {
          if (e?.btn_skip_anime.stage && e?.btn_skip_anime.visible) {
            e.actionWidget = e.btn_skip_anime;
            BattleInputHandler.instance.processOrderPopPanel();
          }
        }

        let n = PanelManager.battleResultPanel;
        return n && n.stage && n.visible && BattleView.instance.doExit();
      }
    }
  }
}
