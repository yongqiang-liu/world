import { debounce, delay, when } from 'common/functional'

export class AutoExecMission {
  moveLock = false
  lock = false
  index = 0
  defaultMap = [
    [254, 115, [733, 734, 735]], [251, 107, [697, 698]], [908, 101, [766, 767, 768]],
    [914, 107, [811]], [916, 111, [873, 841]],
    [22, 44, [2, 333]],
    [920, 101, [507, 508, 512]], [921, 101, [522]], [922, 105, [560, 561]], [923, 102, [559, 558]],
    [822, 8, [26]],
    // [824, 15, [570]],
    // [824, 15, [1703]],
  ]

  private defaultMission = [
    733, 734, 735, 697, 698, 766, 767, 768, 811, 873, 841, 333, 2, 507, 508, 512, 522, 560, 561, 559, 558, 26,
  ]

  private _isStarting = false

  constructor() {
    // 注入自动日常logic
    window.__myEvent__.on('auto:daily:logic', debounce(this.logic.bind(this), 600))
  }

  start() {
    if (!this._isStarting)
      this._isStarting = true
  }

  stop() {
    if (this._isStarting) {
      this._isStarting = false
      this.index = 0
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
      this.moveLock || !this._isStarting || !this.checkDailyMissionFinish()
      || window.xworld.inBattle || window.xworld.isJumpingMap || window.xself.controlList.length > 0
    )
      return

    if (this.isFinish()) {
      if (!this.checkFinish([1552])) {
        if (!window.xworld.isInCityNow())
          await window.thousandBattle.enterCity()
        await window.thousandBattle.execJumpSteps(824, 825)
      }
      this.stop()
      return
    }

    const missionMap = this.defaultMap[this.index]
    const mapId = missionMap[0]
    const missionsMap: number[] = (missionMap[2] ?? []) as number[]

    if (mapId === window.xworld.gameMap._mapId) {
      const missions = (await this.getNPCMission()).flat(3)
      if (missions.length === 0) {
        this.index++
        this.lock = false
      }
      else if (missions.map((mission: any) => mission.id === 2591 || window.Mission.isMissionFinish(window.xself, mission.id)).every(v => v)) {
        this.index++
        this.lock = false
      }
      else {
        return
      }
    }

    if (missionsMap && Array.isArray(missionsMap) && missionsMap.map(id => id === 2591 || window.Mission.isMissionFinish(window.xself, id)).every(v => v)) {
      this.index++
      return
    }

    if (this.lock)
      return

    if (missionMap && missionMap[0] && missionMap[1]) {
      this.moveLock = true
      if (window.autoRepairEquip.getRepairEquipCount())
        await window.thousandBattle.enterCity()
      await delay(200)
      window.AutoGamer.requestAutoFindPath(missionMap[0], missionMap[1])
      await when(window, () => window.xworld._isAutoMissionFindPath)
      await when(window, () => window.xself.autoMoveControlList <= 0)
      this.moveLock = false
      this.lock = true
    }
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
    const dailyMissionId = [
      [3061, 3065, 3069],
      [3060, 3064, 3068],
      [3062, 3066, 3070],
      [3063, 3067, 3071],
      [3072, 3074],
      [3073, 3075],
      // [634],
    ]

    return dailyMissionId.map((dailyMission) => {
      return dailyMission.map(id => window.Mission.isMissionFinish(window.xself, id)).some(v => v)
    })
      .every(v => v)
  }
}
