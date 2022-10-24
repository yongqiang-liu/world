import { EVENTS } from 'common/eventConst'
import { delay, when } from 'common/functional'

export class AutoExecMission {
  /**
    906 254 251 908 909 // 精灵
    906 914 915 916 917 // 墓地
      5  22 // 月牙
      5 820 821 822 // 沙漠
    263 920 921 922 923 // 冰原 !2591
   */
  i = 0
  k = 0
  defaultMap = [
    [[906], [254, 251, 908, 909]],
    [[906], [914, 915, 916, 917]],
    [[5], [22]],
    [[5], [820, 821, 822]],
    [[263], [920, 921, 922, 923]],
  ]

  missionNpc: any[] = []
  private _isStarting = false

  constructor() {
    // 注入自动日常logic
    window.__myEvent__.on(EVENTS.AUTO_DAILY_LOGIC, this.logic)
  }

  start() {
    if (!this._isStarting)
      this._isStarting = true
  }

  stop() {
    if (this._isStarting)
      this._isStarting = false
  }

  private async logic() {
    if (!this._isStarting || !this.checkDailyMissionFinish())
      return

    const map = this.defaultMap[this.i]
    // 进入地图
    const ones = map[0]
    for (const mapId of ones)
      await this.jumpMap(mapId)
    const twos = map[1]
  }

  async jumpMap(id: number) {
    window.xworld.doJumpMap(id)
    await delay(100)
    await when(window, () => !window.xworld.isJumpingMap)
  }

  async getNPCMission() {
    const npcList = this.findMissionNPC()
    for (const npc of npcList) {
      if (!npc.missions)
        npc.doNPC()

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
      [634],
    ]

    return dailyMissionId.map((dailyMission) => {
      return dailyMission.map(id => window.Mission.isMissionFinish(window.xself, id)).some(v => v)
    })
      .every(v => v)
  }
}
