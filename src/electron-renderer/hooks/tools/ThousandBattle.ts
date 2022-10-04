import { EVENTS } from "common/eventConst";
import { delay, when } from "common/functional";
import EventEmitter from "events";

export default class ThousandBattle extends EventEmitter {
  battleCount = 0;
  battleMax = 0;  // 0 无限制
  battleStep = 120;
  _isStarting = false;
  stopBattle = false;

  readonly _onBattleSetp = Symbol("_onBattleSetp");
  readonly _onBattleMax = Symbol("_onBattleEnd");

  async forbiddenCity() {
    const { xworld } = window;

    this._isStarting = true;
    this.battleMax = 1000;

    await when(window, () => !xworld.isJumpingMap);
    //回城
    this.enterCity();

    //修理装备
    window.autoRepairEquip.repairEquip();

    await when(window, () => !xworld.isJumpingMap);

    // 跳转紫禁城
    xworld.doJumpMap(824);

    await when(window, () => !xworld.isJumpingMap);
    // 跳转葬送
    xworld.doJumpMap(300);

    await when(window, () => !xworld.isJumpingMap);

    setTimeout(() => this.toBattle(2315));

    const start = () => {
      this.handleBattleEnter();
    };

    const ended = () => {
      this.handleBattleEnd(2315);
    };

    const setp = async () => {
      this.stopBattle = true

      await when(window, () => !xworld.isJumpingMap);
      //回城
      this.enterCity();

      //修理装备
      window.autoRepairEquip.repairEquip();

      await when(window, () => !xworld.isJumpingMap);

      // 跳转紫禁城
      xworld.doJumpMap(824);

      await when(window, () => !xworld.isJumpingMap);
      // 跳转葬送
      xworld.doJumpMap(300);

      await when(window, () => !xworld.isJumpingMap);

      this.stopBattle = false
    }

    window.__myEvent__.addListener(EVENTS.ENTER_BATTLE_MAP, start);
    window.__myEvent__.addListener(EVENTS.EXIT_BATTLE_MAP, ended);

    this.addListener(this._onBattleSetp, setp)
    // @ts-ignore
    this.ended = ended;
    // @ts-ignore
    this.started = start;
  }

  async podi() {
    this._isStarting = true;
    this.battleMax = 120;

    setTimeout(() => this.toBattle(133));

    const start = () => {
      this.handleBattleEnter();
    };

    const ended = () => {
      this.handleBattleEnd(133);
    };

    window.__myEvent__.addListener(EVENTS.ENTER_BATTLE_MAP, start);
    window.__myEvent__.addListener(EVENTS.EXIT_BATTLE_MAP, ended);

    // @ts-ignore
    this.ended = ended;
    // @ts-ignore
    this.started = start;
  }

  async topOne() {
    const { xworld } = window;

    this._isStarting = true;
    this.battleMax = 1000;

    await when(window, () => !xworld.isJumpingMap);
    //回城
    this.enterCity();

    //修理装备
    window.autoRepairEquip.repairEquip();

    await when(window, () => !xworld.isJumpingMap);

    // 跳转新月古镇
    xworld.doJumpMap(5);

    await when(window, () => !xworld.isJumpingMap);
    // 跳转沙漠
    xworld.doJumpMap(820);

    await when(window, () => !xworld.isJumpingMap);

    // 跳转沙漠二
    xworld.doJumpMap(819);

    await when(window, () => !xworld.isJumpingMap);

    // 跳转沙漠地狱一
    xworld.doJumpMap(821);

    await when(window, () => !xworld.isJumpingMap);

    // 跳转沙漠地狱二
    xworld.doJumpMap(822);

    await when(window, () => !xworld.isJumpingMap);

    // 跳转沙漠地狱三
    xworld.doJumpMap(823);

    await when(window, () => !xworld.isJumpingMap);

    setTimeout(() => this.toBattle(8));

    const start = () => {
      this.handleBattleEnter();
    };

    const ended = () => {
      this.handleBattleEnd(8);
    };

    const setp = async () => {
      this.stopBattle = true

      await when(window, () => !xworld.isJumpingMap);
      //回城
      this.enterCity();

      //修理装备
      window.autoRepairEquip.repairEquip();

      await when(window, () => !xworld.isJumpingMap);

      // 跳转新月古镇
      xworld.doJumpMap(5);

      await when(window, () => !xworld.isJumpingMap);
      // 跳转沙漠
      xworld.doJumpMap(820);

      await when(window, () => !xworld.isJumpingMap);

      // 跳转沙漠二
      xworld.doJumpMap(819);

      await when(window, () => !xworld.isJumpingMap);

      // 跳转沙漠地狱一
      xworld.doJumpMap(821);

      await when(window, () => !xworld.isJumpingMap);

      // 跳转沙漠地狱二
      xworld.doJumpMap(822);

      await when(window, () => !xworld.isJumpingMap);

      // 跳转沙漠地狱三
      xworld.doJumpMap(823);

      await when(window, () => !xworld.isJumpingMap);

      this.stopBattle = false
    }

    window.__myEvent__.addListener(EVENTS.ENTER_BATTLE_MAP, start);
    window.__myEvent__.addListener(EVENTS.EXIT_BATTLE_MAP, ended);

    this.addListener(this._onBattleSetp, setp)
    // @ts-ignore
    this.ended = ended;
    // @ts-ignore
    this.started = start;
  }

  async handleBattleEnter() {
    // 自动战斗
    if (!window.skipBattleAnime._isStarting) {
      window.skipBattleAnime.start();
    }
  }

  async handleBattleEnd(id: number) {
    this.battleCount++;
    if (window.skipBattleAnime._isStarting && !window.config.skipBattleAnim) {
      window.skipBattleAnime.stop();
    }

    if(this.battleMax !== 0 && this.battleCount >= this.battleMax) {
      this.stop();
    }

    if(this.battleCount % this.battleStep === 0) {
      this.emit(this._onBattleSetp);

      await when(window, () => !window.xworld.inBattle);
    }

    await when(this, () => !this.stopBattle)

    await delay(1000);

    setTimeout(() => this.toBattle(id));
  }

  start(id: number) {
    switch (id) {
      case 1:
        this.forbiddenCity();
        break;
      case 2:
        this.podi();
        break;
      case 3:
        this.topOne()
        break;
    }
  }

  stop() {
    this._isStarting = false;

    this.battleCount = 0;
    this.battleMax = 0;

    window.__myEvent__.removeListener(
      EVENTS.ENTER_BATTLE_MAP,
      // @ts-ignore
      this.started
    );
    window.__myEvent__.removeListener(
      EVENTS.EXIT_BATTLE_MAP,
      // @ts-ignore
      this.ended
    );
    this.removeAllListeners(this._onBattleSetp)
  }

  toBattle(id: number) {
    const { xworld } = window;

    if (!xworld.inBattle) {
      xworld.toBattle(id);
    }
  }

  enterCity() {
    const { City, xself } = window;

    City.doEnterCity(xself.getId());
  }
}
