import { EVENTS, WorldEvent } from 'common/eventConst'
import { ProtocolDefine } from 'renderer/gameConst'

function setupMsgHandler() {
  const msgHandler = window.nato.Network.addMsgHandler

  function bindMsgHandler(protocol: number, callback: Function) {
    msgHandler?.(protocol, callback, window.MsgHandler.instance)
  }

  // Bag
  // 整理背包
  bindMsgHandler(ProtocolDefine.CG_BAG_CLEAN, (...args: any[]) => {
    window.__myEvent__.emit(EVENTS.BAG_CLEAN, ...args)
  })

  bindMsgHandler(ProtocolDefine.CG_SCENE_GO_CITY, () => {
    window.__myEvent__.emit(EVENTS.ENTER_CITY)
  })

  // ESCORT
  bindMsgHandler(ProtocolDefine.CG_TASK_ESCORT_START, () => {
    window.__escortEmitter__.emit(EVENTS.ENTER_ESCORT_MAP)
  })

  bindMsgHandler(ProtocolDefine.CG_TASK_ESCORT_MOVE, () => {
    window.__escortEmitter__.emit(EVENTS.MOVE_ESCORT_MAP)
  })

  bindMsgHandler(ProtocolDefine.CG_TASK_ESCORT_REFURBISH, () => {
    window.__escortEmitter__.emit(EVENTS.ESCORT_REFRESH)
  })

  bindMsgHandler(ProtocolDefine.CG_TASK_ESCORT_CHOICE_EVENT, () => {
    window.__escortEmitter__.emit(EVENTS.CHECK_ESCORT_EVENT)
  })

  bindMsgHandler(ProtocolDefine.CG_TASK_ESCORT_CANCEL, () => {
    window.__escortEmitter__.emit(EVENTS.EXIT_ESCORT_MAP)
  })

  // Battle
  bindMsgHandler(ProtocolDefine.CG_FIGHT_BATTLE_UPDATE, () => {
    window.__escortEmitter__.emit(EVENTS.UPDATE_BATTLE)
  })

  bindMsgHandler(ProtocolDefine.CG_FIGHT_ENTER_PLAYER_REMOTEBATTLE_EXIT, () => {
    window.__myEvent__.emit(EVENTS.EXIT_BATTLE_MAP)
  })

  // City
  bindMsgHandler(ProtocolDefine.CG_SCENE_GO_CITY, () => {
    window.__myEvent__.emit(EVENTS.ENTER_CITY)
  })

  // Sell
  bindMsgHandler(ProtocolDefine.CG_AUTO_SELL, () => {
    setTimeout(() => window.__myEvent__.emit(EVENTS.SELL_ENDED))
  })

  // useItem
  bindMsgHandler(ProtocolDefine.CG_ACTOR_PLAYERBAG, () => {
    setTimeout(() => window.__myEvent__.emit(EVENTS.USED_ITEM))
  })
}

export default function setupGameHook() {
  // 修理装备但是不进行提示
  window.xworld.doRepairEquipNoAlert = function () {
    const t = window.xself
    if (t != null) {
      const e = -1
      const n = function (n: any) {
        if (!window.MsgHandler.isMessageHaveError(n)) {
          const i = n.getInt()
          t.setMoneyByType(window.ModelConst.MONEY3, i),
          window.PlayerBag.repairEquip(t, e, !1),
          window.PanelManager.mainMenu
                && window.PanelManager.mainMenu.stage
                && window.PanelManager.mainMenu.updateWorldIconPoint(),
          window.AlertPanel.alertCommon(
            window.GameText.STR_REPAIR_EQUIP_SURE_SUCCESS,
          ),
          window.xself.checkPower()
        }
      }
      const i = () => {
        const t = new window.nato.Message(window.ProtocolDefine.CG_BAG_REPAIR)
        t.putShort(e), window.nato.Network.sendCmd(t, n, this)
      }

      i()
    }
  }

  // 接受任务, 留给自己调用的
  window.Mission.doAcceptMissionMsgNoAlert = function (e: any, n: any, i: any) {
    const {
      PanelManager,
      AlertPanel,
      GameText,
      TodayEvent,
      MsgHandler,
      Mission,
      GameWorld,
      CountryTaskListPanel,
      Tool,
      WorldMessage,
      nato,
      Model,
    } = window
    if (e == null || n == null || i == null)
      return !1
    const o = function (o: any) {
      PanelManager.closeWaitForServer()
      const a = o.getByte()
      if (a != 0) {
        return void AlertPanel.alertNotify(
          GameText.getText(GameText.TI_ERROR),
          o.getString(),
        )
      }
      TodayEvent.checkSaveMissionID(i.id)
      const r = { id: i.id, name: i.name }
      Mission.saveTestMission.push(r), MsgHandler.processMissionNPCStatus(o)
      const s = o.getBoolean()
      if (s != 0) {
        const l = o.getByte()
        if (l != 0)
          return void AlertPanel.errorMessage(o.getString())
        if (
          (MsgHandler.processMissionReward(e, i.id, o),
          GameWorld.checkNPCRelaMissions(!0),
          PanelManager.isPanelShow(CountryTaskListPanel))
        ) {
          var _ = PanelManager.getPanel(CountryTaskListPanel)
          _.update()
        }
      }
      else {
        e.addMission(i)
        if (
          (Tool.isNullText(i.simpleDesc) == 0
              && WorldMessage.addPromptMsg(
                Tool.manageString(GameText.STR_MISSION_BULLETIN, i.simpleDesc),
              ),
          GameWorld.checkNPCRelaMissions(!0),
          i.doAcceptEndCheck(n),
          PanelManager.isPanelShow(CountryTaskListPanel))
        ) {
          var _ = PanelManager.getPanel(CountryTaskListPanel)
          _.update()
        }
      }
    }
    const a = function () {
      PanelManager.openWaitForServer()
      const t = MsgHandler.createTaskAcceptMsg(n.getId(), i.getId())
      // @ts-expect-error
      nato.Network.sendCmd(t, o, this)
    }

    i.isEscort()
      ? window.__escortEmitter__.emit(EVENTS.ACCEPT_MISSION, i)
      : window.__myEvent__.emit(EVENTS.ACCEPT_MISSION, i)
    a()
  }

  // window.MsgHandler.processPlayerEventMsg = function (e: any) {
  //   const {
  //     GameText,
  //     xworld,
  //     Define,
  //     xself,
  //     xevent,
  //     WorldEvent,
  //     Model,
  //     PanelManager,
  //     AlertPanel,
  //     nato,
  //     PopUpManager,
  //   } = window;
  //   var n = e.getInt(),
  //     i = e.getByte(),
  //     o = e.getInt(),
  //     a = e.getString(),
  //     r =
  //       (e.getString(),
  //       e.getString(),
  //       new Date().getTime() + e.getInt(),
  //       GameText.STR_TITLE),
  //     s = xworld.getModel(o);
  //   switch (i) {
  //     case Define.PLAYER_EVENT_TEAM_INVITE:
  //       if (xself.isNovice) return;
  //       if (((r = GameText.getText(GameText.TI_INVITE_TEAM)), null == s))
  //         return;
  //       xevent.dispatchEvent(
  //         new WorldEvent(WorldEvent.AROUND__REFRESH_TEAM_INFO, this)
  //       );
  //       break;
  //     case Define.PLAYER_EVENT_TEAM_APPLY:
  //       if (((r = GameText.getText(GameText.TI_JOIN_TEAM)), null == s)) return;
  //       xevent.dispatchEvent(
  //         new WorldEvent(WorldEvent.AROUND__REFRESH_TEAM_INFO, this)
  //       );
  //       break;
  //     case Define.PLAYER_EVENT_PKASK:
  //       if (((r = GameText.getText(GameText.TI_PK)), null == s)) return;
  //       break;
  //     case Define.PLAYER_EVENT_JOINCOUNTRYASK:
  //       r = GameText.getText(GameText.TI_INVITE_COUNTRY);
  //       break;
  //     case Define.PLAYER_EVENT_ESCORT:
  //       if(window.autoEscortTools._isStarting) {
  //         window.__escortEmitter__.emit(EVENTS.ACCEPT_ESCORT, n);
  //         return;
  //       }
  //       r = GameText.STR_ESCORT_MISSION;
  //       break;
  //     case Define.PLAYER_EVENT_MASTER:
  //       r = GameText.getText(GameText.TI_APPRENTICE);
  //       break;
  //     case Define.PLAYER_EVENT_JOINCOUNTRYHANDLE:
  //       r = GameText.STR_JOINCOUNTRYHANDLE;
  //       break;
  //     case Define.PLAYER_EVENT_MERRY:
  //       r = GameText.STR_PARTNER;
  //   }
  //   i == Define.PLAYER_EVENT_JOINCOUNTRYHANDLE
  //     ? xself &&
  //       (xself.setTabStatus(!0, Model.COUNTRY_APPLY),
  //       PanelManager.updateWorldIconPoint())
  //     : AlertPanel.alert(
  //         r,
  //         a,
  //         function () {
  //           var e = window.MsgHandler.createPlayerEvent(
  //             n,
  //             ProtocolDefine.PLAYER_EVENT_CHOOSE_YES
  //           );
  //           nato.Network.sendCmd(e);
  //         },
  //         this,
  //         function () {
  //           var e = window.MsgHandler.createPlayerEvent(
  //             n,
  //             ProtocolDefine.PLAYER_EVENT_CHOOSE_NO
  //           );
  //           nato.Network.sendCmd(e);
  //         },
  //         PopUpManager.CloseType.NONE
  //       );
  // };

  // 退出 Battle 后
  window.MsgHandler.processAfterBattlePoint = function (
    t: any,
    e: any,
    n: any,
  ) {
    if (t != null && e != null) {
      if (n) {
        var i = window.PowerString.makeColorString(
          '背包已满，无法获得物品',
          window.ColorUtils.COLOR_RED,
        )
        window.WorldMessage.addPromptMsg(i),
        window.OneKeyDailyMission.isDoingOnekeyMission
            && window.AutoSell.autoSell_onekeyDailyMission()
        window.__myEvent__.emit(EVENTS.BAG_FULL)
      }
      else if (t.bag.countFreePos() < 6) {
        var i = window.PowerString.makeColorString(
          '背包将满，请尽快清理',
          window.ColorUtils.COLOR_RED,
        )
        window.WorldMessage.addPromptMsg(i)
        window.__myEvent__.emit(EVENTS.BAG_WILL_FULL)
      }
      const o = t.get(window.ModelConst.HP)
      if (o <= 0 || t.get(window.ModelConst.HPMAX) / o > 4) {
        var i = window.PowerString.makeColorString(
          window.GameText.STR_HP_UNDER_QUARTER,
          window.ColorUtils.COLOR_RED,
        )
        window.WorldMessage.addPromptMsg(i)
      }
    }
  }

  window.BattleView.prototype.initBattle = function () {
    const { xworld, GameWorld, BattleConst, Main, Battle, BattleView } = window;

    (xworld.inBattle = !0),
    this.openBattleUI(),
    this.initBottomBg(),
    (this.battleX = 0),
    (this.battleY = 0),
    (this.battleWidth = Main.instance.stage.stageWidth),
    (this.battleHeight = Main.instance.stage.stageHeight)
    const t = this.battle.rowLeft
    const n = this.battle.rowRight
    const i = BattleView.BATTLE_TOP_HEIGHT
    const o = BattleView.BATTLE_BOTTOM_HEIGHT
    const a = this.battleX
    const r = this.battleWidth
    const s = this.battleY + i
    const l = this.battleHeight - i - o
    const _ = this.getOffsetY(l, t)
    const h = this.getOffsetY(l, n)
    this.initBattlePosition(a, s, r, l, _, t, !1),
    this.initBattlePosition(a, s, r, l, h, n, !0)
    for (let u = 0; u < Battle.MAX_POS; u++) {
      const c = this.getPlayerByPos(u)
      this.addBattlePlayer(c, u)
    }
    this.check(),
    GameWorld.useGuide == 1
        && (GameWorld.isLoginSetting(GameWorld.IS_GUIDE_BATTLE_DOING)
          ? (GameWorld.setLoginSetting(!1, GameWorld.IS_GUIDE_BATTLE_DOING),
            this.setGuide(BattleConst.TAG_IS_GUIDE_ATTACK_MENU))
          : GameWorld.isLoginSetting(GameWorld.IS_GUIDE_BATTLE_AUTO)
            ? (GameWorld.setLoginSetting(!1, GameWorld.IS_GUIDE_BATTLE_AUTO),
              this.setGuide(BattleConst.TAG_IS_GUIDE_ATTACK_AUTO))
            : GameWorld.isLoginSetting(GameWorld.IS_GUIDE_OPEN_BATTLE_SKILL)
            && (GameWorld.setLoginSetting(
              !1,
              GameWorld.IS_GUIDE_OPEN_BATTLE_SKILL,
            ),
            this.setGuide(BattleConst.TAG_IS_GUIDE_OPEN_SKILL)),
        GameWorld.isLoginSetting(GameWorld.IS_GUIDE_SKIP_ROUND)
          ? (GameWorld.setLoginSetting(!1, GameWorld.IS_GUIDE_SKIP_ROUND),
            this.setGuide(BattleConst.TAG_IS_GUIDE_SKIP_ROUND))
          : GameWorld.isLoginSetting(GameWorld.IS_GUIDE_SKIP_BATTLE)
            && (GameWorld.setLoginSetting(!1, GameWorld.IS_GUIDE_SKIP_BATTLE),
            this.setGuide(BattleConst.TAG_IS_GUIDE_SKIP_BATTLE)))

    window.__myEvent__.emit(EVENTS.ENTER_BATTLE_MAP)
    window.__escortEmitter__.emit(EVENTS.ENTER_BATTLE_MAP)
  }

  // @ts-expect-error
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
    (this.endCountTime = -1)
    const t = this.battle.result == 2
    if (
      (this.battle.resetBattleResult(),
      PanelManager.closeBattleResult(),
      Main.instance.removeBattleItemView(),
      this.removeChildren(),
      this.parent && this.parent.removeChild(this),
      GameWorld.useGuide == 1
        && GameWorld.isLoginSetting(GameWorld.IS_GUIDE_SEL_AUTO_SKILL)
        && (GameWorld.setLoginSetting(!1, GameWorld.IS_GUIDE_SEL_AUTO_SKILL),
        GameWorld.setGuide(GameWorld.GUIDE_SEL_AUTO_SKILL)),
      xworld.battleChangeMap)
    ) {
      xworld.battleChangeMap = !1
      var e = MsgHandler.createWorldDataMessage(
        Define.SIMPLE_FLASH_DATA_FLAG,
        !0,
      )
      nato.Network.sendCmd(e)
    }
    if (
      ((xworld.npcList == null || xworld.npcList.length == 0)
        && MsgHandler.createWorldDataReflashMsg(),
      GameWorld.skyarena != null)
    ) {
      return void (
        this.isTag(BattleConst.TAG_IS_BATTLE_SEE)
        || (t == false
          ? GameWorld.skyarena.setStatus(
            !0,
            SkyArena.SKYARENA_STAGE_BATTLE_FAIL,
          )
          : GameWorld.skyarena.setStatus(
            !0,
            SkyArena.SKYARENA_STAGE_BATTLE_WIN,
          ))
      )
    }
    if (GameWorld.countryBoss != null) {
      return (
        GameWorld.countryBoss.setStatus(!t, CountryBoss.STATUS_FIGHT_FAIL),
        void GameWorld.countryBoss.setStatus(!0, CountryBoss.STATUS_FIGHT_EXIT)
      )
    }
    if (GameWorld.teamBoss != null) {
      return (
        GameWorld.teamBoss.setStatus(!t, TeamBoss.STATUS_FIGHT_FAIL),
        void GameWorld.teamBoss.setStatus(!0, TeamBoss.STATUS_FIGHT_EXIT)
      )
    }
    !t
      && GameWorld.countryWar
      && (GameWorld.countryWar.clearUpdate(), (GameWorld.countryWar = null)),
    OneKeyDailyMission.isDoingOnekeyMission
        && t == false
        && ItemManager.doQuickAddHP(xself)
    const n = Mission.checkBattleMissionFinish()
    if (
      (n == 0 && AutoGamer.checkAutoGameEnable() && AutoGamer.autoFindMission(),
      this.battle.type != Battle.LOCAL && GameWorld.getEscort() == null)
    ) {
      const i = Define.SIMPLE_FLASH_DATA_FLAG
      var e = MsgHandler.createWorldDataMessage(i, !1)
      nato.Network.sendCmd(e)
    }

    window.__myEvent__.emit(EVENTS.EXIT_BATTLE_MAP)
    window.__escortEmitter__.emit(EVENTS.EXIT_BATTLE_MAP)
  }

  window.xevent.addEventListener(WorldEvent.ITEM_SELL_END, () => {
    window.__myEvent__.emit(WorldEvent.ITEM_SELL_END)
  })

  window.Escort.doEscortMove = function (e: any, n: any) {
    const {
      Escort,
      AlertPanel,
      PanelManager,
      MenuActionData,
      PopUpManager,
      MsgHandler,
      nato,
    } = window

    if (e == null)
      return !1
    if (this.isCanMove(e, n) == 0)
      return !1
    const i = e.getRowByIndex(n)
    const o = e.getColByIndex(n)
    e.setStatus(!0, Escort.STATUS_MOVE)
    const a = function (n: any) {
      Escort.doEscortEventMsg(e, n)
    }
    // @ts-expect-error
    const r = function (this: any, n: any) {
      PanelManager.closeWaitForServer()
      const i = n.getByte()
      if (i < 0)
        return void AlertPanel.errorMessage(n.getString())
      const o = i
      if (o <= 0) { Escort.clearRefreshTime(e) }
      else {
        (e.eventContent = n.getString()),
        (e.eventID = new Array(o)),
        (e.eventButton = new Array(o))
        for (var r, s = [], l = 0; o > l; l++) {
          (e.eventID[l] = n.getShort()),
          (e.eventButton[l] = n.getString()),
          (r = new MenuActionData(e.eventButton[l], e.eventID[l])),
          s.push(r)
        }
        e.refreshTime(n.getInt(), n.getInt())
        window.__escortEmitter__.emit(EVENTS.ESCORT_EVENT_LIST, s)
        PanelManager.openSelectMenuPanel(
          e.eventContent,
          s,
          a,
          this,
          PopUpManager.CloseType.NONE,
        )
      }
    }
    const s = MsgHandler.createEscortMoveMsg(i, o)
    return (
      nato.Network.sendCmd(s, r, this), PanelManager.openWaitForServer(), !0
    )
  }

  // 退出护送任务
  window.Escort.doEscortPostQuitMsgNoAlert = function () {
    if (!window.GameWorld.getEscort())
      return

    const {
      MsgHandler,
      GameText,
      GameWorld,
      PanelManager,
      AlertPanel,
      xself,
      nato,
    } = window

    const t = function (t: any) {
      MsgHandler.isMessageHaveError(t)
          || (PanelManager.closeScene(!0),
          GameWorld.clearEscort(),
          MsgHandler.instance.processDataBlockFlagMsg(t),
          PanelManager.updateWorldIconPoint(),
          xself.checkHPMP(),
          AlertPanel.alertNotify(
            GameText.STR_ESCORT_MISSION_QUIT,
            GameText.STR_ESCORT_MISSION_QUIT_SUCCESS,
          ))
    }
    const e = function () {
      const e = MsgHandler.createEscortPostQuit()
      // @ts-expect-error
      nato.Network.sendCmd(e, t, this)
    }

    setTimeout(() => e())
  }

  // 结束
  window.Escort.processEscostEndMsg = function (e: any, n: any) {
    const {
      GameWorld,
      MsgHandler,
      xself,
      GameText,
      Tool,
      Escort,
      AlertPanel,
      WorldMessage,
      TodayEvent,
    } = window
    if (e != null) {
      let i = ''
      const o = e.getBoolean()
      let a = 0
      o
        ? MsgHandler.processMissionReward(xself, -1, e)
        : ((a = e.getByte()),
          n.type == Escort.ESCORT_TURN_FAVOURER && (i = e.getString()))
      const r = e.getByte()
      r == 0
        && TodayEvent.curMissionID > 0
        && TodayEvent.saveMissionIDInPlayerData(),
      GameWorld.clearEscort(),
      MsgHandler.instance.processDataBlockFlagMsg(e),
      MsgHandler.createWorldDataReflashMsg()
      let s
        = (n.type == Escort.ESCORT_TURN_HUN
          ? GameText.STR_ESCORT_ROB_SUCCESS
          : GameText.STR_ESCORT_MISSION_SUCCESS)
        + GameText.STR_ESCORT_MISSION_SUCCESS_INFO
      n.type == Escort.ESCORT_TURN_FAVOURER
        && (s += Tool.manageString(GameText.STR_ESCORT_TURN_FAVOURER, `${r}`))
      let l = GameText.STR_ESCORT_MISSION_FAIL
      n.type == Escort.ESCORT_TURN_HUN
        ? (l
            += a == Escort.ESCORT_STATE_FINISH_SYSTEM
              ? GameText.STR_ESCORT_STATE_FINISH_SYSTEM
              : a == Escort.ESCORT_STATE_FINISH_CANCEL
                ? GameText.STR_ESCORT_STATE_FINISH_CANCEL
                : a)
        : Tool.isNullText(i) == 0 && (l = i),
      o
        ? AlertPanel.alertNotify(GameText.STR_ESCORT_MISSION_END, s)
        : WorldMessage.addTips(l)
      window.__escortEmitter__.emit(EVENTS.ESCORT_ENDED)
    }
  }

  window.AutoSell.sendToSellNoAlert = function (t: any) {
    const { PanelManager, xself, nato } = window
    function e(t: any) {
      PanelManager.closeWaitForServer()
      const e = t.getByte()
      for (let n = '', i = 0; e > i; i++) {
        const o = (t.getInt(), t.getShort())
        const a = t.getShort()
        const r = xself.bag.getBagItemBySlotPos(a)
        r != null && (n += `\n${r.getNameInfo()}X${o}`),
        xself.bag.removeBagItemByPos(a, o)
      }
      const s = t.getInt()
      const l = t.getInt()
      const _ = t.getInt()
      const h = t.getInt()

      xself.setPlayerMoneyValue(s, l, _)
    }

    if (t != null && t.length != 0) {
      const n = new nato.Message(ProtocolDefine.CG_AUTO_SELL)
      n.putByte(t.length)
      for (let i = 0; i < t.length; i++) {
        const o = t[i]
        n.putInt(o.id), n.putShort(o.slotPos), n.putShort(o.quantity)
      }
      nato.Network.sendCmd(n, e, this), PanelManager.openWaitForServer()
    }
  }

  window.ItemManager.doItemNoAlert = function (e: any, n: any) {
    void 0 === n && (n = !0)
    const {
      xself,
      SafeLock,
      PanelManager,
      ForgeScene,
      Define,
      Skill,
      PetGuide,
      ItemManager,
      MountGuide,
      Enchant,
      PlayerTurnMonster,
    } = window
    const i = xself
    if (SafeLock.doSafeLockVerify() != 0 && e != null) {
      if (e.isIdentifyScrollItem() || e.isHighIdentifyScrollItem())
        return void PanelManager.openForgeScene(ForgeScene.TAB_INDEX_IDENTIFY)
      if (e.isUpgradeIdentifyScrollItem())
        return void PanelManager.openForgeScene(ForgeScene.TAB_INDEX_IDENTIFY)
      if (e.isUpgradeIntensifyScroll())
        return void PanelManager.openForgeScene(ForgeScene.TAB_INDEX_UPSTAR)
      if (e.type == Define.ITEM_TYPE_SKILL_BOOK)
        return void Skill.doUseLearnSkillItem(e, !1, null, null)
      if (Define.POWER_NEW_GET_PET == e.power1)
        return void PetGuide.doPetGuideList(e)
      if (Define.POWER_NEW_GET_ITEM == e.power1)
        return void MountGuide.doGetMountGuideItemList(e)
      if (Define.POWER_ENCHANT_ITEM == e.power1)
        return void Enchant.doEnchantGetLists(e, !1)
      if (Define.POWER_FORMATION_BOOK == e.power1)
        return void Skill.doUseFormationBookItem(e)
      if (Define.POWER_TURN_MONSTER_CARD == e.power1)
        return void PlayerTurnMonster.doUseTurnMonsterCard(e)
      const o = ItemManager.doWorldUseItemActionNoAlert(i, e, n, null, null)
      o
        && PanelManager.bagScene
        && PanelManager.bagScene.stage
        && PanelManager.bagScene.updatePanel()
    }
  }

  window.ItemManager.doWorldUseItemActionNoAlert = function (
    e: any,
    n: any,
    i: any,
    o: any,
    a: any,
  ) {
    if (
      (void 0 === o && (o = null),
      void 0 === a && (a = null),
      e == null || n == null || e.bag == null)
    )
      return !1

    const {
      Define,
      AlertPanel,
      GameText,
      Tool,
      ColorUtils,
      PowerString,
      GameText2,
    } = window
    const r = function () {
      window.ItemManager.doWorldUseItemActionToServerNoAlert(e, n, i, o, a)
    }
    if (Define.isChangeJobItem(n.id)) {
      AlertPanel.alert(
        GameText.getText(GameText.TI_WARM_SHOW),
        Tool.manageString(
          GameText.STR_PLAYER_CHANGE_JOB_ASK,
          PowerString.makeColorString(n.name, ColorUtils.COLOR_RED),
        ),
        r,
        this,
      )
    }
    else if (a != null && n.isPetResetItem()) {
      AlertPanel.alert(
        GameText.STR_ITEM_SHOW,
        Tool.manageString(GameText.STR_PET_ITEM_RESET_ASK, `${a.getLevel()}`),
        r,
        this,
      )
    }
    else if (n.isChangeSexItem()) {
      AlertPanel.alert(
        GameText.STR_ITEM_SHOW,
        GameText2.STR_CHANGE_SEX_INFO,
        r,
        this,
      )
    }
    else {
      if (
        !(
          n.isCpPointAddItem()
          || n.isSpPointAddItem()
          || n.isProsperityDegreePointAddItem()
          || n.isSkillPlayerItem()
          || n.isSkillPetItem()
        )
      ) {
        return window.ItemManager.doWorldUseItemActionToServerNoAlert(
          e,
          n,
          i,
          o,
          a,
        )
      }
      AlertPanel.alert(
        GameText.STR_ITEM_SHOW,
        Tool.manageString(
          GameText2.STR_USE_ITEM_ASK,
          PowerString.makeColorString(n.name, ColorUtils.COLOR_WHITE),
        ),
        r,
        this,
      )
    }
    return !1
  }

  window.ItemManager.doWorldUseItemActionToServerNoAlert = function (
    e: any,
    n: any,
    i: any,
    o: any,
    a: any,
  ) {
    const {
      Tool,
      GameWorld,
      AlertPanel,
      StringBuffer,
      GameText,
      Define,
      ItemData,
      PlayerBag,
      PanelManager,
      DrugPanel,
      ModelConst,
      MsgHandler,
      nato,
      MyPet,
      xself,
      PetDetailScene,
      PopUpManager,
      PetEquipDes,
      WorldMessage,
    } = window

    if ((void 0 === o && (o = null), void 0 === a && (a = null), e == null))
      return !1
    if (
      Tool.isAbleToAddHPMP(n)
      && (GameWorld.isCountryBossStatus()
        || GameWorld.isEscortStatus()
        || GameWorld.isTeamBossStatus()
        || GameWorld.isCountryWarStatus())
    )
      return AlertPanel.alertCommon('当前场景下不能使用'), !1

    const r = e.bag
    if (r == null)
      return !1
    if (n == null)
      return !1
    if (n.isNotOperate())
      return AlertPanel.alertCommon(GameText.STR_IN_SHOP_NO_USE), !1 // 摆摊
    const s = new StringBuffer()
    const l = n.slotPos
    const _ = r.getBagItemBySlotPos(l)
    if (_ == null)
      return !1
    const h = ItemData.isValidEquipRequire(e, _)
    if (h != Define.OK)
      return AlertPanel.alertNotify(GameText.getText(GameText.TI_ERROR), h), !1
    if (_.isCanUse(1) == 0) {
      return (
        AlertPanel.alertNotify(
          GameText.getText(GameText.TI_ERROR),
          GameText.STR_CANNOT_USE_IN_WORD,
        ),
        !1
      )
    }
    if (n.isChangeNameItem())
      return GameWorld.doModifyActorName(!1, l)
    let u = ProtocolDefine.BAG_NO_WAIT
    Define.isChangeJobItem(n.id)
      ? (u = ProtocolDefine.BAG_CHANGE_JOB)
      : n.isPetEgg()
        ? (u = ProtocolDefine.BAG_USE_PET_EGG)
        : n.isChestItem()
          ? (u = ProtocolDefine.BAG_USE_CHEST)
          : n.isCountryBook()
            ? (u = ProtocolDefine.BAG_COMMAND_BOOK)
            : n.isOpenStoreItem()
              ? (u = ProtocolDefine.BAG_ADD_STORE_NUM)
              : n.isPetAddSkill()
                ? (u = ProtocolDefine.BAG_PET_ITEM_ADD_SKILLS)
                : n.isPetAgeItem()
                  ? (u = ProtocolDefine.BAG_PET_AGE)
                  : n.isPetResetItem()
                    ? (u = ProtocolDefine.BAG_PET_RESET)
                    : n.isPetExpItem()
                      ? (u = ProtocolDefine.BAG_ADD_PET_EXP)
                      : n.isPlayerExpItem()
                        ? (u = ProtocolDefine.BAG_ADD_EXP)
                        : n.isRepairItem()
                          ? (u = ProtocolDefine.BAG_REPAIR)
                          : n.isTitleItem()
                            ? (u = ProtocolDefine.BAG_GET_TITLE)
                            : n.isChangeSexItem()
                              ? (u = ProtocolDefine.BAG_ALERT_SEX)
                              : n.isCpPointAddItem()
                                ? (u = ProtocolDefine.BAG_ADD_CP)
                                : n.isSpPointAddItem()
                                  ? (u = ProtocolDefine.BAG_ADD_SP)
                                  : n.isProsperityDegreePointAddItem()
                                    ? (u = ProtocolDefine.BAG_ADD_PROSPERITY_DEGREE)
                                    : n.isSkillPlayerItem()
                                      ? (u = ProtocolDefine.BAG_SKILL_SLOT_PALYER)
                                      : n.isSkillPetItem()
                                        ? (u = ProtocolDefine.BAG_SKILL_SLOT_PET)
                                        : (n.isTimeItem() || n.isVipItem()) && (u = ProtocolDefine.BAG_WAIT)
    let c = -1
    if ((o != null && (c = o.slotPos), n.isPetCanUseItem() && c == -1)) {
      if (
        ((o = e.bag.getItem(PlayerBag.PET_POS)),
        (a = e.getPet()),
        o == null || a == null)
      )
        return AlertPanel.alertCommon(GameText.STR_PET_NOT_SET_FIGHT), !1
      c = o.slotPos
    }
    let p = 0
    let d = ''
    const E = MsgHandler.createPlayerBagMessage(
      u,
      ProtocolDefine.PLAYERBAG_USE,
      n,
      c,
    )
    if (u == ProtocolDefine.BAG_NO_WAIT) {
      const g = r.removeBagItemByPos(l, 1)
      if (g != Define.SUCCESS)
        return !1
      PanelManager.bagScene
        && PanelManager.bagScene.stage
        && PanelManager.bagScene.updatePanel(),
      PanelManager.closeItemView(),
      PanelManager.isPanelShow(DrugPanel)
          && PanelManager.getPanel(DrugPanel).update(),
      nato.Network.sendCmd(E, null, null)
    }
    else {
      const S = function (i: any) {
        PanelManager.closeWaitForServer()
        const h = i.getByte()
        if (h < 0)
          return void GameWorld.doErrorJumpShop(i, h)
        let c = r.removeBagItemByPos(l, 1)
        if (c != Define.SUCCESS)
          return !1
        switch ((u = h)) {
          case ProtocolDefine.BAG_GET_TITLE:
            d = i.getString()
            break
          case ProtocolDefine.BAG_CHANGE_JOB:
            MsgHandler.instance.processDataPlayerDetail(i, e),
            (e.skillList = MsgHandler.processDataPlayerSkillMsg(i, !0)),
            AlertPanel.alertNotify(
              '转职成功',
              Tool.manageStringU(
                GameText.STR_PLAYER_CHANGE_SUCCEE,
                Define.getJobString(e.getJob()),
              ),
            )
            break
          case ProtocolDefine.BAG_ADD_EXP:
            MsgHandler.instance.processUpLevelMsg(i, e, s)
            break
          case ProtocolDefine.BAG_ADD_PET_EXP:
            MsgHandler.parsePetReward(i, a, s), ItemData.fromBytesEdit(o, i)
            break
          case ProtocolDefine.BAG_PET_ITEM_ADD_SKILLS:
            MyPet.doPetAddSkill(e, a, i, r, _, n, o)
            var E = PanelManager.getPanel(PetDetailScene, !1)
            E
              && (E.setData(a),
              PopUpManager.removePopUp(PanelManager.getPanel(PetEquipDes, !1)))
            break
          case ProtocolDefine.BAG_PET_RESET:
            var g = MyPet.dogetResetItemInfo(a.grow)
            var S = MyPet.dogetResetItemInfo(a.compre)
            ItemData.fromBytesEdit(o, i), MyPet.fromBytesDetail(i, a)
            var m = MyPet.dogetResetItemInfo(a.grow)
            var f = MyPet.dogetResetItemInfo(a.compre)
            var I = r.getItemNumByID(Define.ITEM_ID_PET_RESET)
            var A = `${Tool.manageString(GameText.STR_PET_RESET_NUM, `${I}`)}\n`
            if (
              ((A
                += `${Tool.manageString(
                  GameText.STR_PET_RESET_ITEM_GROW,
                  `${g} --> ${m}`,
                )}\n`),
              (A
                += `${Tool.manageString(
                  GameText.STR_PET_RESET_ITME_COMPRE,
                  `${S} --> ${f}`,
                )}\n`),
              n.id == Define.ITEM_ID_PET_RESET)
            ) { MyPet.doPetUseResetItemMenu(e, a, o, A) }
            else if (n.id == Define.ITEM_ID_PET_RESET2) {
              var E = PanelManager.getPanel(PetDetailScene, !1)
              E && E.setData(a)
            }
            break
          case ProtocolDefine.BAG_PET_AGE:
            a != null
              && ((a.ageTime = i.getLong().value + new Date().getTime()),
              AlertPanel.alertCommon(GameText.STR_PET_RESET_AGE_INFO))
            break
          case ProtocolDefine.BAG_REPAIR:
            (p = PlayerBag.repairEquip(e, -1, !1)), xself.checkPower()
            break
          case ProtocolDefine.BAG_COMMAND_BOOK:
            break
          case ProtocolDefine.BAG_ADD_STORE_NUM:
            e.numStroe = i.getByte()
            break
          case ProtocolDefine.BAG_ALERT_SEX:
            var y = i.getInt()
            var R = i.getInt()
            var P = i.getInt()
            var C = i.getByte()
            var v = i.getString()
            e.setIcon1(y),
            e.setIcon2(R),
            e.setIcon3(P),
            e.setSex(C),
            e.refreshPlayerAllSprite(),
            AlertPanel.alertCommon(v)
            break
          case ProtocolDefine.BAG_ADD_CP:
            var M = i.getShort()
            var L = i.getString();
            (e.cp = M), AlertPanel.alertCommon(L)
            break
          case ProtocolDefine.BAG_ADD_SP:
            var O = i.getInt()
            var N = i.getString();
            (e.sp = O), AlertPanel.alertCommon(N)
            break
          case ProtocolDefine.BAG_ADD_PROSPERITY_DEGREE:
            var D = (i.getInt(), i.getString())
            AlertPanel.alertCommon(D)
            break
          case ProtocolDefine.BAG_SKILL_SLOT_PALYER:
            var B = i.getString()
            AlertPanel.alertCommon(B)
            break
          case ProtocolDefine.BAG_SKILL_SLOT_PET:
            var b = i.getString()
            AlertPanel.alertCommon(b)
            break
          case ProtocolDefine.BAG_USE_PET_EGG:
          case ProtocolDefine.BAG_USE_CHEST:
            var x = i.getByte()
            if (x != 0) {
              const G = i.getShort()
              const U = i.getInt()
              const w = r.getItem(G);
              (w == null || w.id != U)
                && WorldMessage.addSystemChat(
                  `checkItem.id != itemID, checkItem.id=${
                     w.id
                     }, -> itemID = ${
                     U}`,
                ),
              (c = r.removeBagItemByPos(G, x)),
              c != Define.SUCCESS
            }
            var F = MsgHandler.processAddItemMsg(
              i,
              ProtocolDefine.ADD_ITEM_USE_REWARD,
            )
            s.append(F),
            u == ProtocolDefine.BAG_USE_PET_EGG
                && window.ItemManager.doQuickEquipPet(e)
        }
        PanelManager.bagScene
          && PanelManager.bagScene.stage
          && PanelManager.bagScene.updatePanel(),
        PanelManager.isPanelShow(DrugPanel)
            && PanelManager.getPanel(DrugPanel).update()
      }
      nato.Network.sendCmd(E, S, this), PanelManager.openWaitForServer()
    }
    return !0
  }

  window.BattleInputHandler.prototype.getPlayerDesc = function (t: any) {
    const { StringBuffer, Tool, GameText, ModelConst } = window

    const e = new StringBuffer()
    return (
      e.append(
        `${t.getName()
        }(${
        Tool.manageString(
          GameText.getText(GameText.TI_LEVEL),
          `${t.getLevel()}`,
        )
        })\n`,
      ),
      e.append(
        `${GameText.STR_PLAYER_HP
        + t.get(ModelConst.HP)
        }/${
        t.get(ModelConst.HPMAX)
        }  `,
      ),
      e.append(
        `${GameText.STR_PLAYER_MP
        + t.get(ModelConst.MP)
        }/${
        t.get(ModelConst.MPMAX)
        }\n`,
      ),
      e.append(
        `${GameText.STR_ATTR_KEEPOUT_ATK_TIME}:${t.keepout_atk_time}\n`,
      ),
      e.append(`法力护盾:${t.get(ModelConst.DEF_FIELD)}\t` + `洞察:${t.get(ModelConst.INSIGHT)}\n`),
      e.append(`抵抗:${t.get(ModelConst.WIL)}\t` + `格挡:${t.get(ModelConst.BLOCK)}\n`),
      e.append(`反击:${t.get(ModelConst.BACK)}\t` + `闪避:${t.get(ModelConst.DODGE)}\n`),
      e.append(`劈砍防御力:${t.get(ModelConst.DEF_STR)}\n`),
      e.append(`穿刺防御力:${t.get(ModelConst.DEF_AGI)}\n`),
      e.append(`魔法防御力:${t.get(ModelConst.DEF_MAGIC)}\n`),
      e.append(this.getPlayerBufferMsg(t)),
      t.formationSkill != null
      && e.append(t.formationSkill.getFormationInfo()),
      e.toString()
    )
  }

  setupMsgHandler()
}
