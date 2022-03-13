import { ProtocolDefine } from "renderer/gameConst";

export default function setupFunction() {
  // 领取城市金钱
  window.doGetMoney = function () {
    const {
      MsgHandler,
      GameText,
      xself,
      WorldMessage,
      PowerString,
      nato,
      ColorUtils,
    } = window;
    const e = function (e: any) {
        if (!MsgHandler.isMessageHaveError(e)) {
          var n = e.getInt(),
            i = e.getInt(),
            o = e.getInt();
          n > 0 &&
            WorldMessage.addTips(
              "获得 " +
                PowerString.makeColorString(
                  GameText.STR_MONEY1 + "x" + n,
                  ColorUtils.COLOR_MONEY2
                )
            ),
            i > 0 &&
              WorldMessage.addTips(
                "获得 " +
                  PowerString.makeColorString(
                    GameText.STR_MONEY2 + "x" + i,
                    ColorUtils.COLOR_MONEY2
                  )
              ),
            o > 0 &&
              WorldMessage.addTips(
                "获得 " +
                  PowerString.makeColorString(
                    GameText.STR_MONEY3 + "x" + o,
                    ColorUtils.COLOR_MONEY3
                  )
              );
        }
      },
      n = MsgHandler.createGetCityMoneyMsg(xself.getId());
    return nato.Network.sendCmd(n, e, this), !0;
  };

  // 领取离线经验
  window.doGetExp = function () {
    const { nato } = window;
    var t = new nato.Message(ProtocolDefine.CG_ACTOR_OFFLINE_EXP_GET);
    t.putByte(0),
      nato.Network.sendCmd(
        t,
        () => {
          console.log("领取离线经验成功");
        },
        this
      );
  };
}
