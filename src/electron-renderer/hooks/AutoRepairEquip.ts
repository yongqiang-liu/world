export default class AutoRepairEquip {
  _isStarting = false;

  private _interval: null | number = null;

  private repairEquipTimer = false;

  private useRepairRoll = false;

  setRepairRoll(v: boolean) {
    this.useRepairRoll = v;
  }

  start(d = 1000) {
    if (!this._isStarting && !this._interval) {
      this._interval = window.setInterval(() => {
        if (!this.repairEquipTimer) this.logic();
      }, d);
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

  private setRepairTimer() {
    /** 修理的内置计时器 */
    if (this.repairEquipTimer)
      setTimeout(() => (this.repairEquipTimer = false), 5 * 60 * 1000);
  }

  private doUseRepairRoll() {
    /** 使用修理卷进行修理 */
    if (
      window?.xself?.bag.getRepaireItemCount() > 0 &&
      window?.xself?.bag.getRepairEquipCount() > 3
    ) {
      // 检测修理卷数量和需要维修的装备数量
      window.xself.bag.useRepaireItem();
    }
  }

  private logic() {
    if (window?.xworld.isInCityNow()) {
      window?.xworld?.doRepairEquipNoAlert();
      this.repairEquipTimer = true;
    } else if (!window?.xworld.isInCityNow() && this.useRepairRoll) {
      this.doUseRepairRoll();
      this.repairEquipTimer = true;
    }

    this.setRepairTimer();
  }
}
