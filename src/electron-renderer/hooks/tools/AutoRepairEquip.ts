import { TimeHelper } from "common/timer";
import { EVENTS } from "renderer/events/eventConst";

export default class AutoRepairEquip {
  _isStarting = false;

  private _interval: null | number = null;

  private repairEquipTimer: null | number = null;

  private requireEquipTimer = false;

  private useRepairRoll = false;

  setRepairRoll(v: boolean) {
    this.useRepairRoll = v;
  }

  start(d = 1000) {
    if (!this._isStarting && !this._interval) {
      this._interval = window.setInterval(() => {
        if (!this.requireEquipTimer) this.logic();
      }, d);
      this._isStarting = true;

      window.__myEvent__.on(EVENTS.ENTER_CITY, this.enterCity);
    }
  }

  stop() {
    if (this._isStarting && this._interval) {
      clearInterval(this._interval);
      this._interval = null;
      this._isStarting = false;
      window.__myEvent__.removeListener(EVENTS.ENTER_CITY, this.enterCity);
    }
  }

  private enterCity() {
    if (this.repairEquipTimer) clearTimeout(this.repairEquipTimer);
    this.requireEquipTimer = false;
  }

  private setRepairTimer() {
    /** 修理的内置计时器 */
    if (this.requireEquipTimer)
      this.repairEquipTimer = window.setTimeout(() => {
        this.requireEquipTimer = false;
        this.repairEquipTimer = null;
      }, TimeHelper.minute(10));
  }

  private doUseRepairRoll() {
    /** 使用修理卷进行修理 */
    if (window?.xself?.bag.getRepairEquipCount() >= 3) {
      // 检测修理卷数量和需要维修的装备数量
      window.xself.bag.useRepaireItem();
    }
  }

  private logic() {
    if (window?.xworld.isInCityNow()) {
      window?.xworld?.doRepairEquipNoAlert();
      this.requireEquipTimer = true;
    } else if (!window?.xworld.isInCityNow() && this.useRepairRoll) {
      this.doUseRepairRoll();
      this.requireEquipTimer = true;
    }

    this.setRepairTimer();
  }
}
