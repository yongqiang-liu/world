import { EVENTS, WroldEvent } from "renderer/events/eventConst";
import { ProtocolDefine } from "renderer/gameConst";

function setupMsgHandler() {
  function bindMsgHandler(protocol: number, callback: Function) {
    msgHandler?.(protocol, callback, window.MsgHandler.instance);
  }

  const msgHandler = window.nato.Network.addMsgHandler;

  // Bag
  // 整理背包
  bindMsgHandler(ProtocolDefine.CG_BAG_CLEAN, (...args: any[]) => {
    window.__myEvent__.emit(EVENTS.BAG_CLEAN, ...args);
  });

  // ESCORT
  bindMsgHandler(ProtocolDefine.CG_TASK_ESCORT_START, (t: any) => {
    window.__myEvent__.emit(EVENTS.ENTER_ESCORT_MAP, t);
  });

  bindMsgHandler(ProtocolDefine.CG_TASK_ESCORT_MOVE, (...args: any[]) => {
    console.log(...args);
    window.__myEvent__.emit(EVENTS.MOVE_ESCORT_MAP);
  });

  bindMsgHandler(
    ProtocolDefine.CG_TASK_ESCORT_CHOICE_EVENT,
    (...args: any[]) => {
      console.log(...args);
      window.__myEvent__.emit(EVENTS.CHECK_ESCORT_EVENT);
    }
  );

  bindMsgHandler(ProtocolDefine.CG_TASK_ESCORT_CANCEL, (...args: any[]) => {
    console.log(...args);
    window.__myEvent__.emit(EVENTS.EXIT_ESCORT_MAP);
  });

  // Battle
  bindMsgHandler(ProtocolDefine.CG_FIGHT_BATTLE_UPDATE, (...args: any[]) => {
    console.log("更新战斗: ", ...args);
  });

  bindMsgHandler(
    ProtocolDefine.CG_FIGHT_ENTER_PLAYER_REMOTEBATTLE_EXIT,
    (...args: any[]) => {
      console.log("退出战斗: ", ...args);
    }
  );
}

export default function setupGameHook() {
  // 修理装备但是不进行提示
  window.xworld.doRepairEquipNoAlert = function () {
    var t = window.xself;
    if (null != t) {
      var e = -1,
        n = function (n: any) {
          if (!window.MsgHandler.isMessageHaveError(n)) {
            var i = n.getInt();
            t.setMoneyByType(window.ModelConst.MONEY3, i),
              window.PlayerBag.repairEquip(t, e, !1),
              window.PanelManager.mainMenu &&
                window.PanelManager.mainMenu.stage &&
                window.PanelManager.mainMenu.updateWorldIconPoint(),
              window.AlertPanel.alertCommon(
                window.GameText.STR_REPAIR_EQUIP_SURE_SUCCESS
              ),
              window.xself.checkPower();
          }
        },
        i = () => {
          var t = new window.nato.Message(window.ProtocolDefine.CG_BAG_REPAIR);
          t.putShort(e), window.nato.Network.sendCmd(t, n, this);
        };

      i();
    }
  };

  // 退出 Battle 后
  window.MsgHandler.processAfterBattlePoint = function (
    t: any,
    e: any,
    n: any
  ) {
    if (null != t && null != e) {
      if (n) {
        var i = window.PowerString.makeColorString(
          "背包已满，无法获得物品",
          window.ColorUtils.COLOR_RED
        );
        window.WorldMessage.addPromptMsg(i),
          window.OneKeyDailyMission.isDoingOnekeyMission &&
            window.AutoSell.autoSell_onekeyDailyMission();
        window.__myEvent__.emit(EVENTS.BAG_FULL);
      } else if (t.bag.countFreePos() < 6) {
        var i = window.PowerString.makeColorString(
          "背包将满，请尽快清理",
          window.ColorUtils.COLOR_RED
        );
        window.WorldMessage.addPromptMsg(i);
        window.__myEvent__.emit(EVENTS.BAG_WILL_FULL);
      }
      var o = t.get(window.ModelConst.HP);
      if (0 >= o || t.get(window.ModelConst.HPMAX) / o > 4) {
        var i = window.PowerString.makeColorString(
          window.GameText.STR_HP_UNDER_QUARTER,
          window.ColorUtils.COLOR_RED
        );
        window.WorldMessage.addPromptMsg(i);
      }
    }
  };

  window.BattleView.prototype.initBattle = function () {
    const { xworld, GameWorld, BattleConst, Main, Battle, BattleView } = window;

    (xworld.inBattle = !0),
      this.openBattleUI(),
      this.initBottomBg(),
      (this.battleX = 0),
      (this.battleY = 0),
      (this.battleWidth = Main.instance.stage.stageWidth),
      (this.battleHeight = Main.instance.stage.stageHeight);
    var t = this.battle.rowLeft,
      n = this.battle.rowRight,
      i = BattleView.BATTLE_TOP_HEIGHT,
      o = BattleView.BATTLE_BOTTOM_HEIGHT,
      a = this.battleX,
      r = this.battleWidth,
      s = this.battleY + i,
      l = this.battleHeight - i - o,
      _ = this.getOffsetY(l, t),
      h = this.getOffsetY(l, n);
    this.initBattlePosition(a, s, r, l, _, t, !1),
      this.initBattlePosition(a, s, r, l, h, n, !0);
    for (var u = 0; u < Battle.MAX_POS; u++) {
      var c = this.getPlayerByPos(u);
      this.addBattlePlayer(c, u);
    }
    this.check(),
      1 == GameWorld.useGuide &&
        (GameWorld.isLoginSetting(GameWorld.IS_GUIDE_BATTLE_DOING)
          ? (GameWorld.setLoginSetting(!1, GameWorld.IS_GUIDE_BATTLE_DOING),
            this.setGuide(BattleConst.TAG_IS_GUIDE_ATTACK_MENU))
          : GameWorld.isLoginSetting(GameWorld.IS_GUIDE_BATTLE_AUTO)
          ? (GameWorld.setLoginSetting(!1, GameWorld.IS_GUIDE_BATTLE_AUTO),
            this.setGuide(BattleConst.TAG_IS_GUIDE_ATTACK_AUTO))
          : GameWorld.isLoginSetting(GameWorld.IS_GUIDE_OPEN_BATTLE_SKILL) &&
            (GameWorld.setLoginSetting(
              !1,
              GameWorld.IS_GUIDE_OPEN_BATTLE_SKILL
            ),
            this.setGuide(BattleConst.TAG_IS_GUIDE_OPEN_SKILL)),
        GameWorld.isLoginSetting(GameWorld.IS_GUIDE_SKIP_ROUND)
          ? (GameWorld.setLoginSetting(!1, GameWorld.IS_GUIDE_SKIP_ROUND),
            this.setGuide(BattleConst.TAG_IS_GUIDE_SKIP_ROUND))
          : GameWorld.isLoginSetting(GameWorld.IS_GUIDE_SKIP_BATTLE) &&
            (GameWorld.setLoginSetting(!1, GameWorld.IS_GUIDE_SKIP_BATTLE),
            this.setGuide(BattleConst.TAG_IS_GUIDE_SKIP_BATTLE)));

    window.__myEvent__.emit(EVENTS.ENTER_BATTLE_MAP);
  };

  // @ts-ignore
  window.BattleView.prototype.exit = function () {
    const {
      xworld,
      GuideHandler,
      PanelManager,
      Main,
      GameWorld,
      MsgHandler,
      Define,
      nato,
      BattleConst,
      SkyArena,
      CountryBoss,
      TeamBoss,
      OneKeyDailyMission,
      ItemManager,
      xself,
      Mission,
      AutoGamer,
      Battle,
    } = window;

    (xworld.inBattle = !1),
      (xworld.inBattleResult = !1),
      (xworld.readyToBattle = !1),
      GuideHandler.setGuideWidgetVisible(!0),
      this.clear(),
      this.closeBattleUI(),
      (this.endCountTime = -1);
    var t = 2 == this.battle.result;
    if (
      (this.battle.resetBattleResult(),
      PanelManager.closeBattleResult(),
      Main.instance.removeBattleItemView(),
      this.removeChildren(),
      this.parent && this.parent.removeChild(this),
      1 == GameWorld.useGuide &&
        GameWorld.isLoginSetting(GameWorld.IS_GUIDE_SEL_AUTO_SKILL) &&
        (GameWorld.setLoginSetting(!1, GameWorld.IS_GUIDE_SEL_AUTO_SKILL),
        GameWorld.setGuide(GameWorld.GUIDE_SEL_AUTO_SKILL)),
      xworld.battleChangeMap)
    ) {
      xworld.battleChangeMap = !1;
      var e = MsgHandler.createWorldDataMessage(
        Define.SIMPLE_FLASH_DATA_FLAG,
        !0
      );
      nato.Network.sendCmd(e);
    }
    if (
      ((null == xworld.npcList || 0 == xworld.npcList.length) &&
        MsgHandler.createWorldDataReflashMsg(),
      null != GameWorld.skyarena)
    )
      return void (
        this.isTag(BattleConst.TAG_IS_BATTLE_SEE) ||
        (false == t
          ? GameWorld.skyarena.setStatus(
              !0,
              SkyArena.SKYARENA_STAGE_BATTLE_FAIL
            )
          : GameWorld.skyarena.setStatus(
              !0,
              SkyArena.SKYARENA_STAGE_BATTLE_WIN
            ))
      );
    if (null != GameWorld.countryBoss)
      return (
        GameWorld.countryBoss.setStatus(!t, CountryBoss.STATUS_FIGHT_FAIL),
        void GameWorld.countryBoss.setStatus(!0, CountryBoss.STATUS_FIGHT_EXIT)
      );
    if (null != GameWorld.teamBoss)
      return (
        GameWorld.teamBoss.setStatus(!t, TeamBoss.STATUS_FIGHT_FAIL),
        void GameWorld.teamBoss.setStatus(!0, TeamBoss.STATUS_FIGHT_EXIT)
      );
    !t &&
      GameWorld.countryWar &&
      (GameWorld.countryWar.clearUpdate(), (GameWorld.countryWar = null)),
      OneKeyDailyMission.isDoingOnekeyMission &&
        false == t &&
        ItemManager.doQuickAddHP(xself);
    var n = Mission.checkBattleMissionFinish();
    if (
      (0 == n && AutoGamer.checkAutoGameEnable() && AutoGamer.autoFindMission(),
      this.battle.type != Battle.LOCAL && null == GameWorld.getEscort())
    ) {
      var i = Define.SIMPLE_FLASH_DATA_FLAG,
        e = MsgHandler.createWorldDataMessage(i, !1);
      nato.Network.sendCmd(e);
    }

    window.__myEvent__.emit(EVENTS.EXIT_BATTLE_MAP);
  };

  window.xevent.addEventListener(WroldEvent.ITEM_SELL_END, () => {
    window.__myEvent__.emit(WroldEvent.ITEM_SELL_END);
  });

  window.Escort.doEscortMove = function (e: any, n: any) {
    const {
      Escort,
      AlertPanel,
      PanelManager,
      MenuActionData,
      PopUpManager,
      MsgHandler,
      nato,
    } = window;

    if (null == e) return !1;
    if (0 == this.isCanMove(e, n)) return !1;
    var i = e.getRowByIndex(n),
      o = e.getColByIndex(n);
    e.setStatus(!0, Escort.STATUS_MOVE);
    var a = function (n: any) {
        Escort.doEscortEventMsg(e, n);
      },
      // @ts-ignore
      r = function (this: any, n: any) {
        PanelManager.closeWaitForServer();
        var i = n.getByte();
        if (0 > i) return void AlertPanel.errorMessage(n.getString());
        var o = i;
        if (0 >= o) Escort.clearRefreshTime(e);
        else {
          (e.eventContent = n.getString()),
            (e.eventID = new Array(o)),
            (e.eventButton = new Array(o));
          for (var r, s = [], l = 0; o > l; l++)
            (e.eventID[l] = n.getShort()),
              (e.eventButton[l] = n.getString()),
              (r = new MenuActionData(e.eventButton[l], e.eventID[l])),
              s.push(r);
          e.refreshTime(n.getInt(), n.getInt());
          window.__myEvent__.emit(EVENTS.ESCORT_EVENT_LIST, s);
          PanelManager.openSelectMenuPanel(
            e.eventContent,
            s,
            a,
            this,
            PopUpManager.CloseType.NONE
          );
        }
      },
      s = MsgHandler.createEscortMoveMsg(i, o);
    return (
      nato.Network.sendCmd(s, r, this), PanelManager.openWaitForServer(), !0
    );
  };

  setupMsgHandler();
}
