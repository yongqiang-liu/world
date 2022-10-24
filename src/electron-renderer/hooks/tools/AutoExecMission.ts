import { debounce, delay, when } from 'common/functional'

export class AutoExecMission {
  count = 0
  moveLock = false
  lock = false
  index = 0
  defaultMap = [
    [254, 115, [733, 734, 735]], [251, 107, [697, 698]], [908, 101, [766, 767, 768]],
    [914, 107, [811]], [916, 111, [873, 841]],
    [22, 44, [2, 333]],
    [920, 101, [507, 508, 512]], [921, 101, [522]], [922, 105, [560, 561]], [923, 102, [559, 558]],
    [822, 8, [26]],
    [926, 101, [...window.OneKeyDailyMission.idList_yuangusenlin]],
    // [824, 15, [1703]],
  ]

  private defaultMission = [
    733, 734, 735, 697, 698, 766, 767, 768, 811, 873, 841, 333, 2, 507, 508, 512, 522, 560, 561, 559, 558, 26, 570,
  ]

  private _isStarting = false

  constructor() {
    // 注入自动日常logic
    window.__myEvent__.on('auto:daily:logic', debounce(this.logic.bind(this), 1000))
  }

  start() {
    if (!this._isStarting)
      this._isStarting = true
  }

  stop() {
    if (this._isStarting) {
      this._isStarting = false
      this.index = 0
      this.count = 0
      this.moveLock = false
      this.lock = false
    }
  }

  isFinish() {
    return this.defaultMission.map(id => window.Mission.isMissionFinish(window.xself, id)).every(v => v)
  }

  checkFinish(missions: number[]) {
    return missions.map(id => window.Mission.isMissionFinish(window.xself, id)).every(v => v)
  }

  private async logic() {
    if (
      (this.moveLock || !this._isStarting || !this.checkDailyMissionFinish()
        || window.xworld.inBattle || window.xworld.isJumpingMap || window.xself.autoMoveControlList.length > 0)
      && this.count === 0
    )
      return

    this.count++

    if (this.isFinish()) {
      if (!this.checkFinish([1552])) {
        if (!window.xworld.isInCityNow())
          await window.thousandBattle.enterCity()
        if (!this.checkFinish([1703])) {
          window.AutoGamer.requestAutoFindPath(824, 15)
          await delay(100)
          window.PanelManager.closeWaitForServer()
          when(window, () => !window.xself.autoMoveControlList.length)
        }
        await window.thousandBattle.execJumpSteps(824, 825)
      }
      this.stop()
      return
    }

    let missionMap = this.defaultMap[this.index]
    const mapId = missionMap.at(0) ?? 0
    const missionsMap: number[] = (missionMap.at(2) ?? []) as number[]

    if (missionMap && (mapId === window.xworld.gameMap._mapId || this.lock)) {
      const missions = (await this.getNPCMission()).flat(3)
      if (missions.length === 0) {
        this.index++
        this.lock = false
      }
      else if (missions.map((mission: any) => mission.id === 2591 || window.Mission.isMissionFinish(window.xself, mission.id)).every(v => v)) {
        this.index++
        this.lock = false
      }
    }

    if (missionsMap && Array.isArray(missionsMap) && missionsMap.map(id => id === 2591 || window.Mission.isMissionFinish(window.xself, id)).every(v => v)) {
      this.moveLock = true
      this.index++
      missionMap = this.defaultMap[this.index]
    }

    if (this.lock) {
      this.count--
      return
    }

    if (missionMap && Array.isArray(missionMap) && missionMap[0] && missionMap[1]) {
      this.lock = true
      this.moveLock = true
      if (window.autoRepairEquip.getRepairEquipCount())
        await window.thousandBattle.enterCity()
      await delay(50)
      window.AutoGamer.requestAutoFindPath(missionMap[0], missionMap[1])
      await delay(50)
      await when(window, () => window.xworld._isAutoMissionFindPath)
      await when(window, () => window.xself.autoMoveControlList <= 0)
      this.moveLock = false
    }
    this.count--
  }

  async getNPCMission(): Promise<any[]> {
    const npcList = this.findMissionNPC()
    for (const npc of npcList) {
      if (!npc.missions)
        npc.doGetMissionData()

      await when(npc, () => npc.missions)
    }

    return npcList.map((npc: any) => npc.missions)
  }

  findMissionNPC() {
    return window.xworld.npcList.filter((npc: any) => npc.isVisible() && !npc.isMonster && npc.npcType === 0 && npc.name)
  }

  checkDailyMissionFinish() {
    return window.OneKeyDailyMission.Task_cityList.map((dailyMission: number[]) => {
      return dailyMission.map((id: number) => window.Mission.isMissionFinish(window.xself, id)).some(v => v)
    })
      .every((v: boolean) => v)
  }
}
