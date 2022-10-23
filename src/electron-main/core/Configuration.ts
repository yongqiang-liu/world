import EventEmitter from 'events'
import fs from 'fs'
import type { IBattleConfiguration, IConfiguration } from 'common/configuration'
import { deepProxy } from 'common/functional'
import json5 from 'json5'
import { battleConfigurationPath } from './paths'

const defaultConfiguration: IConfiguration = {
  version: '天宇', // 天宇
  accounts: [],
  app: {
    autoOnline: true,
    autoSellByBagWillFull: true,
    autoRepairEquip: false,
    repairRoll: false,
    autoExpandBag: true,
    sell_buildMaterial: false,
    sell_RareEquip: false,
    autoEscort: false,
    rate3: false,
    mode: 'merge',
  },
  list: {
    black: ['豹皮', '腐鹰羽毛', '月狼之石'],
    white: [],
    equipWhite: ['.护符$', '.书.'],
  },
}

const defaultBattleConfiguration: IBattleConfiguration = {
  battle: [
    {
      id: 0,
      name: '紫禁城千场',
      stepsId: [824, 300],
      battleIds: [2315],
      battleStep: 120,
    },
    {
      id: 1,
      name: '破敌(120)',
      stepsId: [],
      battleIds: [133],
      battleStep: 120,
      max: 120,
    },
    {
      id: 2,
      name: '屠龙(120)',
      stepsId: [263, 907],
      battleIds: [1710],
      battleStep: 120,
      max: 120,
    },
    {
      id: 3,
      name: '最强妖兽',
      stepsId: [5, 820, 819, 821, 822, 823],
      battleIds: [8, 9, 196],
      battleStep: 120,
    },
    {
      id: 9999,
      name: '重复战斗',
      stepsId: [],
      battleIds: [],
      battleStep: 120,
      usePrevBattleId: true,
    },
  ],
}

export const enum ConfigurationEvents {
  SAVED = 'saved',
}

export default class Configuration extends EventEmitter {
  configuration!: IConfiguration
  battleConfiguration!: IBattleConfiguration

  constructor(private configurationPath: string) {
    super()
    this.load()
    this.loadBattle()
  }

  load() {
    if (!this.isExist())
      this.create()

    try {
      this.configuration = JSON.parse(
        fs.readFileSync(this.configurationPath, 'utf-8'),
      )
      if (!this.configuration.app.mode)
        this.configuration.app.mode = defaultConfiguration.app.mode
    }
    catch (error) {
      this.configuration = defaultConfiguration
    }

    this.configuration = deepProxy(this.configuration, {
      set: (target, p, value) => {
        target[p] = value

        this.save()

        return true
      },
    })
  }

  loadBattle() {
    if (!this.isBattleExist())
      this.createBattleConfiguration()

    try {
      this.battleConfiguration = json5.parse(
        fs.readFileSync(battleConfigurationPath, 'utf-8'),
      )
    }
    catch (error) {
      this.battleConfiguration = defaultBattleConfiguration
    }
  }

  create() {
    fs.writeFileSync(
      this.configurationPath,
      JSON.stringify(defaultConfiguration),
      {
        flag: 'w+',
      },
    )
  }

  save() {
    fs.writeFile(
      this.configurationPath,
      JSON.stringify(this.configuration || defaultConfiguration),
      {
        flag: 'w+',
      },
      (err) => {
        if (err)
          console.error(err)
      },
    )

    this.emit('saved')
  }

  isExist() {
    return fs.existsSync(this.configurationPath)
  }

  isBattleExist() {
    return fs.existsSync(battleConfigurationPath)
  }

  createBattleConfiguration() {
    fs.writeFileSync(
      battleConfigurationPath,
      `
{
  battle: [
    {
      id: 0, // 唯一Id
      name: "紫禁城千场", // Battle名字, 会显示在菜单中
      stepsId: [824, 300], // 到达目标地点的路过的地图 Id(不包括自己的城市)
      battleIds: [2315], // 战斗的怪物组 Id, 可传入多个, 当战斗次数满后, 会自动切换
      battleStep: 120 // 战斗 120 次后回城修理, stepsId 长度 > 0 才有效
    },
    {
      id: 1,
      name: "破敌(120)",
      stepsId: [],
      battleIds: [133],
      battleStep: 120,
      max: 120  // 最大战斗次数
    },
    {
      id: 2,
      name: "屠龙(120)",
      stepsId: [263, 907],
      battleIds: [1710],
      battleStep: 120,
      max: 120
    },
    {
      id: 3,
      name: "最强妖兽",
      stepsId: [5, 820, 819, 821, 822, 823],
      battleIds: [8, 9, 196],
      battleStep: 120,
    },
    {
      id: 9999,
      name: "重复战斗(120)",
      stepsId: [],
      battleIds: [],
      battleStep: 120,
      max: 120,
      usePrevBattleId: true // 使用上一次战斗Id
    },
  ]
}
      `,
      {
        flag: 'w+',
      },
    )
  }
}
