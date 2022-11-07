import { delay, when } from 'common/functional'
import type { AutoMoveMissionPathStep, Mission, NPC } from 'common/types'

const COLLECTION_ITEM_FROM_MONSTER_GROUP_MAP: Record<number, number> = {
  1: 171,
  2: 174,
  3: 182,
  4: 5,
  5: 6,
  6: 188,
  8: 230,
  9: 231,
  10: 232,
  28: 79,
  29: 80,
  303: 126,
  306: 171,
  510: 543,
  511: 411,
  512: 444,
  513: 559,
  514: 569,
  515: 502,
  516: 505,
  517: 511,
}
export class AutoExecMission {
  private Task_cityList = [
    [3061, 3065, 3069],
    [3060, 3064, 3068],
    [3062, 3066, 3070],
    [3063, 3067, 3071],
    [3072, 3074],
    [3073, 3075],
  ]

  // 732:[733]  精灵之森
  //

  private runMissions: number[] = []

  // 507, 508, 512, 522, 560, 561, 559, 558
  private defaultMission: number[] = [
    733, 734, 735, 697, 698, 766, 767, 768, // 精灵之森
    811, 873, 841, // 封印墓地
    333, 2, // 月牙山
    507, 508, 512, 522, 560, 561, 559, 558, // 绝望冰原
    26, 70, // 失魂沙漠
  ]

  private oneKeyMission: number[][] = [
    [2811, 1149, 1150, 1151, 1152, 1165, 1153, 1163, 1154, 1155, 1157, 1158, 1159, 1156, 1161, 1162, 1160, 1164], // 清明节
    [2799, 1137, 1138, 1139, 1140, 1141, 1142, 1143, 1144, 1145, 1146, 1147], // 植树节
    [2599, 1126, 1127, 1134, 1128, 1129, 1130, 1135, 1131, 1136, 1133, 1132], // 美女节
    [2575, 2548, 2549, 2550, 2570, 2571, 2572, 2574, 2573], // 夜语森林
  ]

  _isStarting = false

  constructor() {
    window.COLLECTION_ITEM_FROM_MONSTER_GROUP_MAP = COLLECTION_ITEM_FROM_MONSTER_GROUP_MAP
  }

  start() {
    if (!this._isStarting) {
      this._isStarting = true
      window.DISABLE_AUTO_FIND_MISSION = true
      window.AutoGamer.switchAutoGaming(false)
      window.OneKeyDailyMission.stop()
      this.runMissions = this.defaultMission
      this.run()
        .then(() => console.log('执行完毕'))
        .catch(err => console.error(err))
    }
  }

  stop() {
    if (this._isStarting) {
      this._isStarting = false
      window.AutoGamer.switchAutoGaming(false)
      window.OneKeyDailyMission.stop()
      window.DISABLE_AUTO_FIND_MISSION = false
      this.runMissions = []
    }
  }

  isFinish() {
    return this.runMissions.map(id => window.Mission.isMissionFinish(window.xself, id)).every(v => v)
  }

  isFinishDefaltMission() {
    return this.checkFinish(this.defaultMission)
  }

  checkFinish(missions: number[]) {
    return missions.map(id => window.Mission.isMissionFinish(window.xself, id)).every(v => v)
  }

  autoRunInDailyMissionEnd() {
    if (this.checkDailyMissionFinish() && window.xworld.isInCityNow())
      this.runOneKeyExtraMission()
  }

  async run() {
    if (!this._isStarting)
      return

    if (this.hasMissionById(2591))
      this.deleteMission(2591)

    window.AutoGamer.switchAutoGaming(false)
    window.skipBattleAnime.stop()
    window.OneKeyDailyMission.stop()

    // if (this.isFinish()) {
    //   if (!this.checkFinish([1552])) {
    //     window.DISABLE_AUTO_FIND_MISSION = false
    //     if (!window.xworld.isInCityNow())
    //       await window.thousandBattle.enterCity()
    //     await when(() => window.xworld.isInCityNow())
    //     await delay(50)
    //     if (this.checkFinish([1703]))
    //       await window.thousandBattle.execJumpSteps(824, 825)
    //     if (!this.checkFinish([1703])) {
    //       window.AutoGamer.requestAutoFindPath(824, 15)
    //       await when(() => window.xself.autoMoveControlList.length > 0)
    //       await when(() => window.xself.autoMoveControlList.length <= 0)
    //       await delay(100)
    //       await this.acceptMission(1703)
    //       await delay(50)
    //       await this.submitMission(1703)
    //     }

    //     window.OneKeyDailyMission.start()
    //     while (!this.checkFinish([1684]))
    //       await delay(1000)

    //     window.OneKeyDailyMission.stop()
    //   }
    //   return
    // }

    if (this.checkFashionDurability()) {
      await window.thousandBattle.enterCity()
      await delay(1000)
    }

    const index = this.getUncompletedIndex()
    if (index === -1) {
      this.stop()
      return
    }
    const missionId = this.runMissions[index]
    const steps = await this.getMissionPathById(missionId)
      .catch(() => [])
    await this.jumpMapByStep(steps)
    await this.acceptMission(missionId)
    window.OneKeyDailyMission.start()
    await when(() => this.checkFinish([missionId]))
    window.AutoGamer.switchAutoGaming(false)
    window.OneKeyDailyMission.stop()

    await this.run()

    //   const acceptedMission = await this.ensureAcceptMission(missionId)!
    //   let f = false

    //   if (acceptedMission && acceptedMission.isCollectItemType) {
    //     window.DISABLE_AUTO_FIND_MISSION = true
    //     f = true
    //     while (!this.ensureMissionCompleted(missionId)) {
    //       if (window.xworld.inBattle)
    //         continue
    //       this.toCollectMissionBattle(acceptedMission)
    //     }

    //     await this.ensureSubmitMission(missionId)
    //   }

    //   if (acceptedMission && acceptedMission.isKillMonsterMission()) {
    //     window.DISABLE_AUTO_FIND_MISSION = true
    //     f = true
    //     while (!this.ensureMissionCompleted(missionId)) {
    //       function exitBattle() {

    //       }
    //       if (window.xworld.inBattle)
    //         continue
    //       this.toKillMonsterMissionBattle(acceptedMission)
    //     }

    //     await this.ensureSubmitMission(missionId)
    //   }

    //   if (this.ensureMissionCompleted(missionId)) {
    //     f = true
    //     await this.ensureSubmitMission(missionId)
    //   }

    //   if (!f) {
    //     window.DISABLE_AUTO_FIND_MISSION = false
    //     window.skipBattleAnime.stop()
    //     window.OneKeyDailyMission.start()
    //     await when(() => this.checkFinish([missionId]))
    //     window.OneKeyDailyMission.stop()
    //   }

    //   window.skipBattleAnime.stop()
    //   this.run()
  }

  async runOneKeyExtraMission() {
    this._isStarting = true
    this.runMissions = this.defaultMission
    window.DISABLE_AUTO_FIND_MISSION = true
    await this.run()
  }

  async runExtraMission() {
    for (const missions of this.oneKeyMission) {
      this.runMissions = missions
      this._isStarting = true
      await this.run()
    }
    this.stop()
  }

  private toCollectMissionBattle(mission: Mission) {
    const condition = mission.getUnCompleteCollectionCondition()!
    if (!condition)
      return false
    const monsterGroupId = COLLECTION_ITEM_FROM_MONSTER_GROUP_MAP[condition.id]
    if (!window.xworld.inBattle)
      window.xworld.toBattle(monsterGroupId)
    return true
  }

  private toKillMonsterMissionBattle(mission: Mission) {
    const condition = mission.getUnCompleteKillMonsterCondition()!
    if (!condition)
      return false
    const monsterId = condition.id
    if (!window.xworld.inBattle) {
      const disabledGroups = [439]
      if (mission.acceptBattleID)
        window.xworld.toBattle(mission.acceptBattleID)
      if (mission.submitBattleID)
        window.xworld.toBattle(mission.submitBattleID)
      if (mission.id === 2574)
        window.xworld.toBattle(1710)

      if (window.xworld.inBattle)
        return true

      const groups: any[] = Object.values(window.xworld.monsterGroupList)
        .filter((group: any) => !disabledGroups.includes(group.groupId))
        .filter((group: any) => group.monsters.includes(monsterId))

      const index = groups.map((group) => {
        let c = 0

        if (group && group.monsters) {
          for (const monster of group.monsters) {
            if (monster && monster === mission.id)
              c++
          }
        }

        return c
      })
      let max = -1
      let _index = 0
      for (let i = 0; i < index.length; i++) {
        const ii = index[i]
        if (ii >= max) {
          max = ii
          _index = i
        }
      }

      if (groups[_index])
        window.xworld.toBattle(groups[_index].groupId)
    }

    return true
  }

  private ensureMissionCompleted(id: number) {
    const mission: Mission | undefined = window.xself.missionList.find((mission: Mission) => mission.id === id)

    if (!mission)
      return false

    return mission.isComplete()
  }

  private async ensureAcceptMission(id: number) {
    while (1) {
      const mission = this.hasMissionById(id)
      if (mission)
        return mission

      await this.acceptMission(id)
    }

    return undefined
  }

  private async ensureSubmitMission(id: number) {
    while (1) {
      if (!this.hasMissionById(id))
        break

      await this.submitMission(id)
    }
  }

  private checkFashionDurability() {
    const fashion = window.xself.bag.getItem(window.PlayerBag.ARMOR_FASHION_POS)
    if (fashion) {
      const durability = fashion.durability
      if (durability <= 0)
        return true
    }

    return false
  }

  private getMissionPathById(id: number): Promise<AutoMoveMissionPathStep[]> {
    return new Promise((resolve) => {
      const message = window.MsgHandler.createAutoMoveMsgByMisssion(id)
      function onMissionAutoPathMsg(byte: any) {
        const i = byte.getByte()
        if (i < 0) {
          console.error(byte.getString())
          return
        }

        const length = byte.getByte()
        const steps = []
        for (let i = 0; i < length; i++) {
          byte.getByte()
          byte.getByte()
          const r: number = byte.getShort()
          const s: number = byte.getByte()
          const l: number = byte.getByte()

          // console.log(`mapId: ${r} x: ${s} y: ${l}`)
          const step = {
            id: r,
            x: s,
            y: l,
          }
          steps.push(step)
        }

        resolve(steps)
      }
      window.nato.Network.sendCmd(message, onMissionAutoPathMsg, this)
    })
  }

  private getUncompletedIndex() {
    for (let i = 0; i < this.runMissions.length; i++) {
      if (!this.checkFinish([this.runMissions[i]]))
        return i
    }

    return -1
  }

  private async jumpMapByStep(steps: AutoMoveMissionPathStep[] | AutoMoveMissionPathStep) {
    if (!Array.isArray(steps))
      steps = [steps]
    for (const step of steps) {
      await this.jumpMapPatch(step.id)
      window.xworld.doJumpMap(step.id, step.x, step.y)
      await delay(100)
      await when(window, () => !window.xworld.isJumpingMap)
    }
  }

  private async acceptMission(id: number) {
    const mission = this.hasMissionById(id)
    if (mission)
      return mission

    const npcs = await this.getNPCAndMission()
    let targetMission
    let targetNpc

    for (const npc of npcs) {
      const missions = npc.missions
      targetMission = missions.find(mission => mission.id === id)
      if (targetMission) {
        targetNpc = npc
        break
      }
    }

    if (targetMission) {
      window.Mission.doAcceptMissionMsg(window.xself, targetNpc, targetMission)
      window.PanelManager?.closeNPCDialogue?.()
      await when(() => !!this.hasMissionById(id))
    }

    return this.hasMissionById(id)
  }

  private async submitMission(id: number) {
    const mission = this.hasMissionById(id)
    if (!mission)
      return
    const npc = this.hasNpcById(mission.npcId)
    if (!npc)
      return

    window.Mission.doSubmitMissionMsg(window.xself, npc, mission)
    window.PanelManager?.closeNPCDialogue?.()
    await when(window, () => !this.hasMissionById(mission.id))
  }

  private async deleteMission(id: number) {
    if (this.hasMissionById(id))
      window.Mission.doDeleteMissionMsg(window.xself, this.hasMissionById(id))
  }

  private async jumpMapPatch(mapId: number) {
    if (mapId === 907) {
      const mission = (await this.getNPCAndMission()).map(npc => npc.missions).flat(3)
        .find(mission => mission.id === 2575)
      if (mission && mission.isCanAccept())
        await this.acceptMission(mission.id)
    }
    if (mapId === 927) {
      const mission = (await this.getNPCAndMission()).map(npc => npc.missions).flat(3)
        .find(mission => mission.id === 582)
      if (mission && mission.isCanAccept())
        await this.acceptMission(mission.id)
    }
    if (mapId === 929) {
      const mission = (await this.getNPCAndMission()).map(npc => npc.missions).flat(3)
        .find(mission => mission.id === 605)
      if (mission && mission.isCanAccept())
        await this.acceptMission(mission.id)
    }
    await when(window, () => !window.xworld.isJumpingMap)
  }

  private async missionPathPatch(id: number) {

  }

  private hasMissionById(id: number): Mission | undefined {
    return window.xself.missionList.find((mission: Mission) => mission.id === id)
  }

  private hasNpcById(id: number): NPC | undefined {
    return window.xworld.npcList.find((npc: NPC) => npc.id === id)
  }

  private async getNPCAndMission(): Promise<NPC[]> {
    function noop() {}
    const npcList: NPC[] = this.findMissionNPC()
    for (const npc of npcList) {
      if (!npc.missions)
        npc.doGetMissionData(noop, noop)

      await when(npc, () => !!npc.missions)
    }

    return npcList.filter(npc => !!npc.missions)
  }

  private findMissionNPC() {
    return window.xworld.npcList.filter((npc: any) => npc.isVisible() && !npc.isMonster && this.isMissionNPC(npc) && npc.name)
  }

  private isMissionNPC(npc: any) {
    return npc.npcType === 0 || npc.npcType === 5
  }

  checkDailyMissionFinish() {
    return this.Task_cityList.map((dailyMission: number[]) => {
      return dailyMission.map((id: number) => window.Mission.isMissionFinish(window.xself, id))
        .some(Boolean)
    })
      .every(Boolean)
  }
}

