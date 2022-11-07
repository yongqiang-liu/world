export interface AutoMoveMissionPathStep {
  id: number
  x: number
  y: number
}

export interface Condition {
  id: number
  current: number
  isComplete: boolean
  total: number
}

export interface KillMonsterCondition extends Condition {
  monsterName: string
}

export interface CollectionCondition extends Condition {
  name: string
}

export interface Mission {
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

export interface NPC {
  id: number
  jumpMapID: number[]
  jumpMapGx: number[]
  jumpMapGy: number[]
  missions: Mission[]
  doGetMissionData(func1?: any, func2?: any): any
  isJumpIcon(): boolean
}

export interface JumpMapOption {
  npcId: number
  mapId: number
  jumpMapReqMissionID: number
  jumpMapReqMissionState: number
}
