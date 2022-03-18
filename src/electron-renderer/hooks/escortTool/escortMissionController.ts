import { EVENTS } from "common/eventConst";
import { TimeHelper } from "common/timer";
import { ProtocolDefine } from "renderer/gameConst";
import { wushuangController } from "./escortControllers/wushuangController";

export default class EscortMissionController {
  _isStarting = false;

  private lock = false;

  private moveLock = false;

  private escort: any = null;

  private position = 0;

  private paths: number[] = [4, 8, 12, 13, 14, 15];

  private events: number[][] = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  private readonly defaultPaths: number[] = [4, 8, 12, 13, 14, 15];

  private readonly defaultEvents: number[][] = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]; // 没有就选 0

  private onEnterEscort: Function | null = null;

  private onEscortRefresh: Function | null = null;

  private onEscortMove: Function | null = null;

  private onEnterBattle: Function | null = null;

  private onExitBattle: Function | null = null;

  private onExitEscort: Function | null = null;

  private _logicCount: number = 0;

  _mission = null;

  private readonly controllers = new Map<number, Function>();

  constructor() {
    // 团队无双
    this.registerController(3046, wushuangController);
  }

  /**
   *
   * @param id 任务Id
   * @param controller 控制器
   */
  registerController(id: number, controller: () => any) {
    this.controllers.set(id, controller);
  }

  private execute(id: number) {
    if (this.controllers.has(id)) {
      const controller = this.controllers.get(id);
      controller?.bind(this, this)();
      return true;
    }

    return false;
  }

  start() {
    if (this._isStarting) return;

    window.__escortEmitter__.on(EVENTS.ACCEPT_MISSION, (mission) => {
      if (!mission.isEscort()) return;

      if (this.controllers.has(mission.id)) {
        console.log(this.execute(mission.id));
      }
    });

    window.__escortEmitter__.on(
      EVENTS.ENTER_ESCORT_MAP,
      this.handleEnter.bind(this)
    );

    // 处理队员同意任务问题
    window.__escortEmitter__.on(EVENTS.ACCEPT_ESCORT, (n: number) => {
      if (window.xself.isInTeam() && window.xself.isMember()) {
        var e = window.MsgHandler.createPlayerEvent(
          n,
          ProtocolDefine.PLAYER_EVENT_CHOOSE_YES
        );
        setTimeout(() => window.nato.Network.sendCmd(e), TimeHelper.second(2));
      }
    });

    this._isStarting = true;
  }

  stop() {
    if (!this._isStarting) return;

    window.__escortEmitter__.removeAllListeners(EVENTS.ENTER_ESCORT_MAP);
    window.__escortEmitter__.removeAllListeners(EVENTS.ACCEPT_MISSION);
    this._isStarting = false;
    this.handleExit();
  }

  private logic(t: number) {
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

  async controller() {
    this.onEscortRefresh?.();
    // 如果设置了移动锁, 则不进行移动
    if (this.moveLock) return;

    // 队员不需要操作
    if (window.xself.isInTeam() && window.xself.isMember()) return;

    if (!window.GameWorld.getEscort()) return;

    if (!window.GameWorld.getEscort().isMoveTime()) return;

    if (!(window.GameWorld.getEscort().nextMoveTime < Date.now())) return;

    const escort = window.GameWorld.getEscort();

    console.log("当前行: ", escort.getNowRow(), "当前列: ", escort.getNowCol());

    // 主动退出护送任务
    if (
      this.position >= this.paths.length &&
      escort.getIndexNow(escort.escortModel) ===
        this.paths[this.paths.length - 1]
    ) {
      window.Escort.doEscortPostQuitMsgNoAlert();

      return;
    }

    if (
      window.Escort.isCanMove(
        window.GameWorld.getEscort(),
        this.paths[this.position]
      )
    ) {
      window.Escort.doEscortMove(this.escort, this.paths[this.position]);
    }
  }

  private async handleEnter() {
    if (this.lock) return;

    console.log("进入");

    this.lock = true;
    this.escort = window.GameWorld.getEscort();
    this.position = 0;
    this.onEnterEscort?.();

    const index = this.escort.getIndexNow(this.escort.escortModel);

    this.position = this.paths.findIndex((v) => v === index);

    if (this.position < 0) this.position = 0;

    window.__escortEmitter__.on(
      EVENTS.MOVE_ESCORT_MAP,
      this.handleMove.bind(this)
    );
    window.__escortEmitter__.on(
      EVENTS.ESCORT_EVENT_LIST,
      this.handleEvent.bind(this)
    );
    window.__escortEmitter__.on(
      EVENTS.ENTER_BATTLE_MAP,
      this.handleBattleEnter.bind(this)
    );
    window.__escortEmitter__.on(
      EVENTS.UPDATE_BATTLE,
      this.handleBattleUpdate.bind(this)
    );
    window.__escortEmitter__.on(
      EVENTS.EXIT_BATTLE_MAP,
      this.handleBattleExit.bind(this)
    );
    window.__escortEmitter__.on(EVENTS.ESCORT_ENDED, () => this.handleExit());
    window.__escortEmitter__.on(EVENTS.EXIT_ESCORT_MAP, () =>
      this.handleExit()
    );
    window.__escortEmitter__.on(
      EVENTS.ESCORT_REFRESH,
      this.controller.bind(this)
    );
  }

  private handleMove() {
    this.position += 1;
    this.onEscortMove?.(this.position);
    const escort = window.GameWorld.getEscort();
    if (!escort) return;

    console.log("移动");
    // console.log(
    //   "行: " + escort?.getRowByIndex(this.paths[4]),
    //   "列: " + escort?.getColByIndex(this.paths[4])
    // );
  }

  private handleEvent(list: any[]) {
    const escort = window.GameWorld.getEscort();
    if (!escort) return;

    if (this.position >= this.paths.length) return;
    const row = escort?.getRowByIndex(this.paths[this.position]);
    const col = escort?.getColByIndex(this.paths[this.position]);
    const event = this.events[row][col] || 0;
    const targetEvent = list[event] ? list[event] : list[0];

    window.Escort.doEscortEventMsg(this.escort, targetEvent.action);
  }

  private handleBattleEnter() {
    this.onEnterBattle?.();

    window.nato.WorldTicker.instance.register(this.logic, this);
  }

  private handleBattleUpdate() {
    const { AlertPanel, xworld, PanelManager, BattleInputHandler, BattleView } =
      window;

    if (AlertPanel.instance && AlertPanel.instance.stage) {
      return AlertPanel.instance.closePanel();
    }

    if (xworld.inBattle) {
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

  private handleBattleExit() {
    if (window.BattleView.instance.isWin()) {
      // 战斗失败
      console.log("战斗失败...");
      this.handleExit();
    }

    this.onExitBattle?.();
  }

  private handleExit() {
    // 这里指的是正常退出
    console.log("退出");
    this.onExitEscort?.();
    this.escort = null;
    this.lock = false;
    this.moveLock = false;
    this.position = 0;
    this.paths = this.defaultPaths;
    this.events = this.defaultEvents;
    this.onEnterBattle = null;
    this.onEnterEscort = null;
    this.onExitBattle = null;
    this.onExitEscort = null;
    this.onEscortMove = null;
    this.onEscortRefresh = null;

    window.nato.WorldTicker.instance.unregister(this.logic, this);
    window.__escortEmitter__.removeAllListeners(EVENTS.MOVE_ESCORT_MAP);
    window.__escortEmitter__.removeAllListeners(EVENTS.ESCORT_REFRESH);
    window.__escortEmitter__.removeAllListeners(EVENTS.ESCORT_EVENT_LIST);
    window.__escortEmitter__.removeAllListeners(EVENTS.ENTER_BATTLE_MAP);
    window.__escortEmitter__.removeAllListeners(EVENTS.EXIT_BATTLE_MAP);
    window.__escortEmitter__.removeAllListeners(EVENTS.EXIT_ESCORT_MAP);
  }
}
