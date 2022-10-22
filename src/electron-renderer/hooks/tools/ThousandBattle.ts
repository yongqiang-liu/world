import { EVENTS } from "common/eventConst";
import { delay, when } from "common/functional";
import EventEmitter from "events";

export default class ThousandBattle extends EventEmitter {
  battleCount = 0;
  battleMax = 0;  // 0 无限制
  battleStep = 120;
  _isStarting = false;
  stopBattle = false;
  stepsId: number[] = []
  battleIds: number[] = []

  started: (() => void) | null = null
  step: (() => Promise<void>) | null = null
  ended: (() => void) | null = null
  commonStep = async () => {
    await when(window, () => !window.xworld.isJumpingMap);
    //回城
    this.enterCity();

    await when(window, () => !window.xworld.isJumpingMap);

    //修理装备
    window.autoRepairEquip.repairEquip();
  }

  readonly _onBattleMax = Symbol("_onBattleEnd");

  async killDragon() {
    this._isStarting = true;
    this.battleMax = 1000;
    const stepsId = [263, 907]
    const battleIds = [1710]
    this.stepsId = stepsId
    this.battleIds = battleIds

    await this.commonStep()
    await this.execJumpSteps(...stepsId)

    const start = () => {
      this.handleBattleEnter();
    };

    const ended = () => {
      this.handleBattleEnd();
    };

    const step = async () => {
      this.stopBattle = true
      await this.commonStep()
      await this.execJumpSteps(...stepsId)
      this.stopBattle = false
    }

    window.__myEvent__.addListener(EVENTS.ENTER_BATTLE_MAP, start);
    window.__myEvent__.addListener(EVENTS.EXIT_BATTLE_MAP, ended);

    this.ended = ended;
    this.started = start;
    this.step = step
    setTimeout(async () => {
      await this.ensureEnterBattle(...battleIds)
    });
  }

  async forbiddenCity() {
    this._isStarting = true;
    this.battleMax = 1000;
    const stepsId = [824, 300]
    const battleIds = [2315]
    this.stepsId = stepsId
    this.battleIds = battleIds

    await this.commonStep()
    await this.execJumpSteps(...stepsId)

    const start = () => {
      this.handleBattleEnter();
    };

    const ended = () => {
      this.handleBattleEnd();
    };

    const step = async () => {
      this.stopBattle = true
      await this.commonStep()
      await this.execJumpSteps(...stepsId)
      this.stopBattle = false
    }

    window.__myEvent__.addListener(EVENTS.ENTER_BATTLE_MAP, start);
    window.__myEvent__.addListener(EVENTS.EXIT_BATTLE_MAP, ended);

    this.ended = ended;
    this.started = start;
    this.step = step
    setTimeout(async () => {
      await this.ensureEnterBattle(...battleIds)
    });
  }

  async podi() {
    this._isStarting = true;
    this.battleMax = 120;
    this.stepsId = []
    this.battleIds = [133]

    setTimeout(() => this.toBattle(133));

    const start = () => {
      this.handleBattleEnter();
    };

    const ended = () => {
      this.handleBattleEnd();
    };

    window.__myEvent__.addListener(EVENTS.ENTER_BATTLE_MAP, start);
    window.__myEvent__.addListener(EVENTS.EXIT_BATTLE_MAP, ended);

    this.ended = ended;
    this.step = async () => {}
    this.started = start;
  }

  async topOne() {
    this._isStarting = true;
    this.battleMax = 1000;
    const stepsId = [5, 820, 819, 821, 822, 823]
    const battleIds = [8, 9, 196]
    this.stepsId = stepsId
    this.battleIds = battleIds

    await this.commonStep()

    await this.execJumpSteps(...stepsId)

    const start = () => {
      this.handleBattleEnter();
    };

    const ended = () => {
      this.handleBattleEnd();
    };

    const step = async () => {
      this.stopBattle = true

      await this.commonStep()

      await this.execJumpSteps(...stepsId)

      this.stopBattle = false
    }

    window.__myEvent__.addListener(EVENTS.ENTER_BATTLE_MAP, start);
    window.__myEvent__.addListener(EVENTS.EXIT_BATTLE_MAP, ended);

    this.ended = ended;
    this.step = step
    this.started = start;

    setTimeout(async () => {
      await this.ensureEnterBattle(...battleIds)
    });
  }

  async handleBattleEnter() {
    // 自动战斗
    if (!window.skipBattleAnime._isStarting) {
      window.skipBattleAnime.start();
    }
  }

  async handleBattleEnd() {
    this.battleCount++;
    if (window.skipBattleAnime._isStarting && !window.config.skipBattleAnim) {
      window.skipBattleAnime.stop();
    }

    if(this.battleMax !== 0 && this.battleCount >= this.battleMax) {
      this.stop();
    }

    if(this.battleCount % this.battleStep === 0) {
      await this.step?.()
    }

    await when(this, () => !this.stopBattle)

    setTimeout(async() => {
      await this.ensureEnterBattle(...this.battleIds)
    });
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
      this.started!
    );
    window.__myEvent__.removeListener(
      EVENTS.EXIT_BATTLE_MAP,
      this.ended!
    );
    this.started = null
    this.step = null
    this.ended = null
    this.stepsId = []
    this.battleIds = []
  }

  async toBattle(id: number) {
    const { xworld } = window;

    if (!xworld.inBattle) {
      xworld.toBattle(id);

      await delay(500)
    }
  }

  async execJumpSteps(...ids: number[]) {
    for (let id of ids) {
      window.xworld.doJumpMap(id);
      await delay(100);
      await when(window, () => !window.xworld.isJumpingMap);
    }
  }

  async ensureEnterBattle(...ids: number[]) {
    for (let id of ids) {
      if(!window.xworld.inBattle)
        await this.toBattle(id)
    }
  }

  enterCity() {
    const { City, xself } = window;

    City.doEnterCity(xself.getId());
  }
}
