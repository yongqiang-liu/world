import { TimeHelper } from 'common/timer'
import { EVENTS } from 'common/eventConst'
import { ipcRenderer } from 'electron'
import { IPC_RENDERER } from 'common/ipcEventConst'
import { whenGameStarted } from 'renderer/gameFunctional'

export default class AutoRepairEquip {
  _isStarting = false

  private _interval: null | number = null

  private repairEquipTimer: null | number = null

  private requireEquipTimer = false

  private useRepairRoll = false

  constructor() {
    this.registerListener()
  }

  setRepairRoll(v: boolean) {
    this.useRepairRoll = v
  }

  start(d = 1000) {
    if (!this._isStarting && !this._interval) {
      this._interval = window.setInterval(async () => {
        await whenGameStarted()

        this.logic()
      }, d)
      this._isStarting = true

      window.__myEvent__.on(EVENTS.ENTER_CITY, this.enterCity)
    }
  }

  stop() {
    if (this._isStarting && this._interval) {
      clearInterval(this._interval)
      this._interval = null
      this._isStarting = false
      window.__myEvent__.removeListener(EVENTS.ENTER_CITY, this.enterCity)
    }
  }

  private enterCity() {
    if (this.repairEquipTimer)
      clearTimeout(this.repairEquipTimer)
    this.requireEquipTimer = false
    this.repairEquipTimer = null
  }

  private setRepairTimer() {
    /** 修理的内置计时器 */
    if (this.requireEquipTimer) {
      this.repairEquipTimer = window.setTimeout(() => {
        this.requireEquipTimer = false
        this.repairEquipTimer = null
      }, TimeHelper.minute(2))
    }
  }

  private doUseRepairRoll() {
    /** 使用修理卷进行修理 */
    if (window?.xself?.bag.getRepairEquipCount() >= 3) {
      // 检测修理卷数量和需要维修的装备数量
      window.xself.bag.useRepaireItem()
    }
  }

  getRepairEquipCount(c = 2) {
    if (!window.xself)
      return false

    const t = window.PlayerBag
    let e = 0
    for (let n = t.EQUIP_POS_START; n < 30; n++) {
      if (n != t.PET_POS && n != t.SPIRIT_POS) {
        const i = window.xself.bag.getItem(n)
        if (i && i.isEquipClass() && (i.durability + 20 < i.durMax))
          e++
      }
    }

    return e >= c
  }

  registerListener() {
    ipcRenderer.on(IPC_RENDERER.REPAIR_EQUIP, () => {
      this.logic()
    })
  }

  repairEquip() {
    if (!this.useRepairRoll) {
      window.xworld?.doRepairEquipNoAlert()
      this.requireEquipTimer = true
    } {
      this.doUseRepairRoll()
      this.requireEquipTimer = true
    }
  }

  private logic() {
    if (!window?.xworld.isInCityNow() || !this.getRepairEquipCount())
      return

    this.repairEquip()

    this.setRepairTimer()
  }
}
