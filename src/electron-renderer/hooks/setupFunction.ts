import { EVENTS } from "common/eventConst";
import { delay, when } from "common/functional";
import { TimeHelper } from "common/timer";
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

  // 自动领取无双任务
  window.doAcceptWushuangMission = function (): Promise<void> {
    return new Promise((resolve) => {
      const { xworld, xself, City, Mission } = window;
      if (xself.isInTeam() && xself.isMember()) {
        resolve();
      }

      const handleCity = async function () {
        const npc = xworld.npcList[0];

        npc.doNPC();

        await when(npc, (npc) => {
          return npc && npc.missions.length > 0;
        });

        // 接受任务
        Mission.doAcceptMissionMsgNoAlert(xself, npc, npc.missions[3]);
        setTimeout(() => resolve());
      };

      if (!xworld.isInCityNow()) {
        window.__myEvent__.on(EVENTS.ENTER_CITY, () =>
          setTimeout(() => handleCity(), TimeHelper.second(2))
        );
        City.doEnterCity(xself.getId());
      } else {
        handleCity();
      }
    });
  };

  // 自动进入游戏
  window.doEnterGame = async function () {
    await when(window.PanelManager, (panel) => {
      return !!panel?.getPanel(window.AreaLineListPanel);
    });

    window.PanelManager.getPanel(window.AreaLineListPanel).onBtnEnterGame();

    await when(window.Login.instance, (Login) => {
      return !!Login.selectRoleScene;
    });

    await delay(500);

    window.Login.instance.selectRoleScene.onEnterGame();
  };
}
