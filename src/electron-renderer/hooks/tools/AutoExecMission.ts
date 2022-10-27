import { delay, when } from 'common/functional'

interface AutoMoveMissionPathStep {
  id: number
  x: number
  y: number
}

interface Condition {
  id: number
  current: number
  isComplete: boolean
  total: number
}

interface KillMonsterCondition extends Condition {
  monsterName: string
}

interface CollectionCondition extends Condition {
  name: string
}

interface Mission {
  id: number
  setting: number
  level: number
  mapId: number
  npcId: number
  acceptBattleID: number
  submitBattleID: number
  getUnCompleteKillMonsterCondition(): KillMonsterCondition | null
  getUnCompleteCollectionCondition(): CollectionCondition | null
  isComplete(): boolean
  isCollectItemType: boolean
  isKillMonsterMission(): boolean
  isCanAccept(): boolean
}

interface NPC {
  id: number
  missions: Mission[]
  doGetMissionData(func1?: any, func2?: any): any
}

const COLLECTION_ITEM_FROM_MONSTER_GROUP_MAP: Record<number, number> = {
  1: 171,
  2: 174,
  3: 182,
  4: 5,
  5: 6,
  6: 188,
  8: 155,
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
  index = 0

  private Task_cityList = [
    [3061, 3065, 3069],
    [3060, 3064, 3068],
    [3062, 3066, 3070],
    [3063, 3067, 3071],
    [3072, 3074],
    [3073, 3075],
  ]

  private defaultMission: number[] = [
    733, 734, 735, 697, 698, 766, 767, 768, 811, 873, 841, 333, 2, 507, 508, 512, 522, 560, 561, 559, 558, 26, 570,
    ...window.OneKeyDailyMission.idList_yuangusenlin,
    2575, 2548, 2549, 2550, 2570, 2571, 2572, 2574, 2573, // 夜语森林
    2599, 1126, 1127, 1134, 1128, 1129, 1130, 1135, 1131, 1136, 1133, 1132, // 美女节
  ]

  private oneKeyMission: number[][] = [
    [2709, 2700],
    [2799, 1137, 1138, 1139, 1140, 1141, 1142, 1143, 1144, 1145, 1146, 1147], // 植树节
  ]

  _isStarting = false

  constructor() {
    window.COLLECTION_ITEM_FROM_MONSTER_GROUP_MAP = COLLECTION_ITEM_FROM_MONSTER_GROUP_MAP
  }

  start() {
    if (!this._isStarting) {
      this._isStarting = true
      this.run()
    }
  }

  stop() {
    if (this._isStarting)
      this._isStarting = false
  }

  isFinish() {
    return this.defaultMission.map(id => window.Mission.isMissionFinish(window.xself, id)).every(v => v)
  }

  checkFinish(missions: number[]) {
    return missions.map(id => window.Mission.isMissionFinish(window.xself, id)).every(v => v)
  }

  autoRunInDailyMissionEnd() {
    if (this.checkDailyMissionFinish() && window.xworld.isInCityNow())
      this.run()
  }

  /**
   * 1. 任务寻路
   * 2. 接受任务
   * 3. 完成任务
   * 4. 提交任务
   * 5. -> 1
   */
  async run() {
    if (!this._isStarting)
      return

    if (this.isFinish()) {
      if (!this.checkFinish([1552])) {
        if (!window.xworld.isInCityNow())
          await window.thousandBattle.enterCity()
        await when(() => window.xworld.isInCityNow())
        await delay(50)
        if (this.checkFinish([1703]))
          await window.thousandBattle.execJumpSteps(824, 825)
        if (!this.checkFinish([1703])) {
          window.AutoGamer.requestAutoFindPath(824, 15)
          await when(() => window.xself.autoMoveControlList.length > 0)
          await when(() => window.xself.autoMoveControlList.length <= 0)
          await delay(100)
          await this.acceptMission(1703)
          await delay(50)
          await this.submitMission(1703)
        }

        window.OneKeyDailyMission.start()
        while (this.checkFinish([1684]));
        window.OneKeyDailyMission.stop()
      }
      return
    }
    if (this.checkFashionDurability()) {
      await window.thousandBattle.enterCity()
      window.autoRepairEquip.repairEquip()
      await delay(1000)
    }
    window.OneKeyDailyMission.stop()
    window.AlertPanel.instance?.closePanel?.()
    window.PanelManager?.closeNPCDialogue?.()
    window.xworld.setAutoMissionFindPath(false)
    const index = this.getUncompletedIndex()
    const missionId = this.defaultMission[index]
    console.log('run starting, mission: ', missionId)

    const steps = await this.getMissionPathById(missionId)
    await this.jumpMapByStep(steps)
    await delay(50)
    const acceptedMission = await this.acceptMission(missionId)
    window.AlertPanel.instance?.closePanel?.()
    window.PanelManager?.closeNPCDialogue?.()
    let condition: Condition

    if (acceptedMission && acceptedMission.isCollectItemType) {
      window.skipBattleAnime.start()
      while (this.hasMissionById(missionId)!.getUnCompleteCollectionCondition()) {
        condition = this.hasMissionById(missionId)!.getUnCompleteCollectionCondition()!
        const monsterGroupId = COLLECTION_ITEM_FROM_MONSTER_GROUP_MAP[condition.id]
        if (!window.xworld.inBattle)
          window.xworld.toBattle(monsterGroupId)
        window.xworld.setAutoMissionFindPath(false)
        await when(window, () => window.PanelManager.battleResultPanel)
        await delay(100)
      }
    }

    if (acceptedMission && acceptedMission.isKillMonsterMission()) {
      window.skipBattleAnime.start()
      while (this.hasMissionById(missionId)!.getUnCompleteKillMonsterCondition()) {
        condition = this.hasMissionById(missionId)!.getUnCompleteKillMonsterCondition()!
        const monsterId = condition.id
        if (!window.xworld.inBattle) {
          const disabledGroups = [439]
          if (acceptedMission.acceptBattleID)
            window.xworld.toBattle(acceptedMission.acceptBattleID)
          if (acceptedMission.submitBattleID)
            window.xworld.toBattle(acceptedMission.submitBattleID)
          if (missionId === 2574)
            window.xworld.toBattle(1710)

          if (window.xworld.inBattle)
            continue

          const groups: any[] = Object.values(window.xworld.monsterGroupList)
            .filter((group: any) => !disabledGroups.includes(group.groupId))
            .filter((group: any) => group.monsters.includes(monsterId))

          const index = groups.map((group) => {
            let c = 0

            if (group && group.monsters) {
              for (const monster of group.monsters) {
                if (monster && monster === acceptedMission.id)
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
        window.xworld.setAutoMissionFindPath(false)
        await when(window, () => window.PanelManager.battleResultPanel)
        await delay(100)
      }
    }

    if (!(acceptedMission?.isCollectItemType && acceptedMission?.isKillMonsterMission()) || !acceptedMission) {
      window.OneKeyDailyMission.start()
      while (!this.checkFinish([missionId]))
        await delay(1000)
      window.OneKeyDailyMission.stop()
    }

    window.skipBattleAnime.stop()
    await this.submitMission(missionId)
    console.log('run ended, mission: ', missionId)
    this.run()
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

          console.log(`mapId: ${r} x: ${s} y: ${l}`)
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
    for (let i = 0; i < this.defaultMission.length; i++) {
      if (!this.checkFinish([this.defaultMission[i]]))
        return i
    }

    return 0
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
      await when(window, () => !!this.hasMissionById(id))
    }

    return this.hasMissionById(id)!
  }

  private async submitMission(id: number) {
    const mission = this.hasMissionById(id)
    if (!mission)
      return
    const npc = this.hasNpcById(mission.npcId)
    if (!npc)
      return

    window.Mission.doSubmitMissionMsg(window.xself, npc, mission)
    await when(window, () => !this.hasMissionById(mission.id))
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
      return dailyMission.map((id: number) => window.Mission.isMissionFinish(window.xself, id)).some(v => v)
    })
      .every((v: boolean) => v)
  }
}
