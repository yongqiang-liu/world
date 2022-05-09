import { TimeHelper } from "common/timer";
import { EVENTS } from "common/eventConst";
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
    // 修改新手指引
    window.GameWorld.useGuide = false;

    await whenGameStarted();

    // 称号
    

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
      if (
        window?.xself.get(window?.ModelConst.HP) <
        window?.xself.get(window.ModelConst.HPMAX)
      )
        window?.ItemManager?.doQuickAddHP(window.xself);
    });
  }

  getTitleList() {
    const { MsgHandler, nato } = window;

    return new Promise<any[][]>((resolve) => {
          let e = MsgHandler.createAchieveTitleList();
      nato.Network.sendCmd(
        e,
         (e: any) => {
           let i: any[] = [];
          for (let n = e?.getByte(), o = 0; n > o; o++)
            (i[o] = []),
              (i[o][0] = e.getShort()),
              (i[o][1] = e.getString()),
              (i[o][2] = e.getUnsignedByte()),
              (i[o][3] = e.getShort()),
              (i[o][4] = e.getUnsignedByte()),
              (i[o][5] = e.getShort());
          // 40645
          resolve(i)
        },
        this
      )
    })
  }

  useTitle(id: number) {
    // 40645 505
    const { MsgHandler, nato, AlertPanel,Achieve, AchieveScene,PanelManager } = window;
    var e = MsgHandler.createAchieveUseTitle(id);
            nato.Network.sendCmd(
              e,
              function (e: any) {
                if (null == e) return !1;
                var i = e.getByte();
                if (0 > i) return void AlertPanel.alertCommon(e.getString());
                var o = e.getString(),
                  a = e.getShort(),
                  r = e.getShort(),
                  s = e.getShort(),
                  l = e.getShort();
                let n = window.xself
                n.setTitle(o),
                  (n.titlePower1 = a),
                  (n.titlePowerValue1 = r),
                  (n.titlePower2 = s),
                  (n.titlePowerValue2 = l),
                Achieve.instance.setNowTitle(o);
                PanelManager.getPanel(AchieveScene, !1) &&
                    PanelManager.getPanel(AchieveScene).updateNowTitle(o);
              },
              this
            )
  }

  private async logic() {
    await whenGameStarted();

    window.doGetMoney();
  }
}
