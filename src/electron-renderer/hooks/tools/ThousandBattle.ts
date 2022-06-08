import { EVENTS } from "common/eventConst";
import { when } from "common/functional";

export default class ThousandBattle {
  battleCount = 0;

  battleMax = 0;  // 0 无限制 

  _isStarting = false;

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

    window.__myEvent__.addListener(EVENTS.ENTER_BATTLE_MAP, start);
    window.__myEvent__.addListener(EVENTS.EXIT_BATTLE_MAP, ended);

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
