import type EventEmitter from 'events'
import type { IBattleConfiguration, IConfiguration } from 'common/configuration'
import { BrowserWindow, shell } from 'electron'
import { KEY_MAP, combineKeys } from 'common/key_map'
import { IPC_RENDERER } from 'common/ipcEventConst'
import VERSION_MAP from '../../electron-common/versions'
import type Configuration from './Configuration'
import type GameView from './GameView'
import { GameViewState } from './GameView'
import type { MenuTemplate } from './menuHelper'
import { buildFromTemplateWrapper, hookWindowMenuClick } from './menuHelper'
import { MainWidowConfiguration } from './windowConfig'
import type { ViewState } from './shared'
import { ADD_ACCOUNT, AUTO_ESCORT, AUTO_EXPAND_PACKAGE, AUTO_ONLINE_REWARD, AUTO_REFRESH_MONSTER, AUTO_REPAIR, AUTO_SELL, AUTO_SKIP_BATTLE_ANIM, CHANGE_WINDOW_MODE, DELETE_ACCOUNT, ONE_KEY_AUTO_MISSION, ONE_KEY_REPAIR, ONE_KEY_REWARD, ONE_KEY_SELL, OPTION_OFFLINE_RATE3, OPTION_SELL_BUILD_MATERIAL, OPTION_SELL_RARE_EQUIP, OPTION_USE_REPAIR_ROLL, VIEWS_RELOAD } from './shared'

import type { ApplicationWindow } from './window'
import { aboutPath, battleConfigurationPath, resolveAssets } from './paths'

export default class GameWindow extends BrowserWindow {
  protected windowMenus: MenuTemplate[] = []
  protected config: IConfiguration
  protected enable = false
  protected registerAccelerator = false
  private state!: ViewState
  private view!: GameView
  private win!: ApplicationWindow
  private mode: 'merge' | 'split' = 'merge'
  private timer: NodeJS.Timer | null = null
  private battleConfig: IBattleConfiguration

  constructor(private readonly _configuration: Configuration, private readonly emitter: EventEmitter) {
    super(MainWidowConfiguration)
    this.config = _configuration.configuration
    this.battleConfig = _configuration.battleConfiguration
    this.autoHideMenuBar = true
    this.setMenu(null)
    this.registerWindowListener()
    this.timer = setInterval(() => {
      this.buildWindowMenu()
    }, 100)
  }

  initializeMerge() {
    this.mode = 'merge'
    this.center()
    this.buildWindowMenu()
    this.show()
  }

  initializeSplit(view: GameView, state: ViewState) {
    this.view = view
    this.state = state
    this.mode = 'split'
    this.buildWindowMenu()
  }

  setApplicationWindow(win: ApplicationWindow) {
    this.win = win
  }

  private createBattleMenu(view: GameView) {
    return this.battleConfig.battle.map<MenuTemplate>((config) => {
      return {
        id: `${config.name}:${config.id}`,
        label: config.name,
        click: () => view.battle(config),
      }
    })
  }

  private async prebuildWindowMenu() {
    if (!this.win)
      return

    let index = 0
    const viewIndex = this.mode === 'merge' ? this.win?.active_view ?? 0 : this.win.getViewIndexById(this.view.id)
    const view = this.mode === 'merge' ? this.win.views[viewIndex] : this.view
    const oneKeyDailyMission = !!view?.getAutoDaily()
    const allOneKeyDailyMission = this.win.views.map(view => view.getAutoDaily()).some(v => v)
    const started = view.getGameStarted()
    if (started)
      this.enable = true
    else
      this.enable = false

    this.windowMenus[index++] = {
      label: '常用功能',
      submenu: [
        {
          label: '日常相关',
          submenu: [
            {
              label: '自动日常',
              type: 'checkbox',
              checked: oneKeyDailyMission || allOneKeyDailyMission,
              accelerator: KEY_MAP.F1,
              click: () => {
                view?.setOneKeyDailyMission(
                  !(oneKeyDailyMission || allOneKeyDailyMission),
                )
              },
            },
            {
              label: '自动天空',
              type: 'checkbox',
              checked: !!this.win.autoSkyArena[viewIndex],
              click: () => {
                this.win.autoSkyArena[viewIndex] = !this.win.autoSkyArena[viewIndex]
                view?.setAutoSkyArena(this.win.autoSkyArena[viewIndex])
              },
            },
            {
              label: '开启日常箱子',
              click: () => {
                view?.openDailyBox()
              },
            },
          ],
        },
        {
          label: '战斗相关',
          submenu: [
            {
              label: '跳过战斗动画',
              type: 'checkbox',
              checked: !!this.win.skipBattleAnime[viewIndex],
              accelerator: KEY_MAP.F2,
              click: () => {
                this.win.skipBattleAnime[viewIndex] = !this.win.skipBattleAnime[viewIndex]
                view.setSkipBattleAnime(this.win.skipBattleAnime[viewIndex])
              },
            },
            ...this.createBattleMenu(view),
            {
              label: '自定义战斗',
              enable: true,
              click: () => shell.openPath(battleConfigurationPath),
            },
            {
              label: '重载战斗文件',
              click: () => this._configuration.loadBattle(),
            },
          ],
        },
        {
          label: '窗口模式',
          enable: true,
          submenu: [
            {
              label: '融合模式',
              type: 'checkbox',
              checked: this.mode === 'merge',
              click: () => this.emitter.emit(CHANGE_WINDOW_MODE, 'merge'),
            },
            {
              label: '分离模式',
              type: 'checkbox',
              checked: this.mode === 'split',
              click: () => this.emitter.emit(CHANGE_WINDOW_MODE, 'split'),
            },
          ],
        },
        {
          label: '附加选项',
          enable: true,
          submenu: [
            {
              label: '出售建筑材料',
              type: 'checkbox',
              checked: !!this.config.app.sell_buildMaterial,
              click: () => {
                this.emitter.emit(OPTION_SELL_BUILD_MATERIAL)
              },
            },
            {
              label: '出售稀有装备(<50)',
              type: 'checkbox',
              checked: !!this.config.app.sell_RareEquip,
              click: () => {
                this.emitter.emit(OPTION_SELL_RARE_EQUIP)
              },
            },
            {
              label: '使用修理卷',
              type: 'checkbox',
              checked: !!this.config.app.repairRoll,
              click: () => {
                this.emitter.emit(OPTION_USE_REPAIR_ROLL)
              },
            },
            {
              label: '3倍领取经验(金叶)',
              type: 'checkbox',
              checked: !!this.config.app.rate3,
              click: () => {
                this.emitter.emit(OPTION_OFFLINE_RATE3)
              },
            },
          ],
        },
        {
          label: '页面相关',
          enable: true,
          submenu: [
            {
              label: '切换版本',
              enable: true,
              submenu: this.createVersionMenu(),
            },
            {
              label: '跳转登录',
              enable: true,
              click: () => {
                view?.jumpLogin()
                view.webContents.session.clearStorageData({
                  storages: ['localStorage', 'cookies'],
                })
                view?.webContents.loadURL(VERSION_MAP[this.config.version].url || 'https://m.tianyuyou.cn/index/h5game_jump.html?tianyuyou_agent_id=10114&game_id=66953')
              },
            },
            {
              label: '刷新页面',
              accelerator: KEY_MAP.F5,
              click: (_, __, e) => {
                if (e.ctrlKey) {
                  this.emitter.emit(VIEWS_RELOAD)
                }
                else {
                  view?.reload()
                  this.win.autoChat[viewIndex] = false
                  this.win.autoSkyArena[viewIndex] = false
                }
              },
            },
          ],
        },
      ],
    }

    switch (this.mode) {
      case 'merge':
        {
          const { state } = this.win.viewsState[viewIndex]

          if (state === GameViewState.INITIALIZED)
            this.enable = true
          else
            this.enable = false

          // common
          index++

          // common
          index++

          this.windowMenus[index++] = {
            label: `小号( ${viewIndex + 1}/${this.win.views.length} )`,
            submenu: this.createAccountMenuByMerge(view),
            enable: true,
          }
        }
        break
      case 'split':
        {
          if (this.state.state === GameViewState.INITIALIZED)
            this.enable = true
          else
            this.enable = false

          // common
          index++

          // common
          index++

          this.windowMenus[index++] = {
            label: `小号( ${viewIndex + 1}/${this.win.views.length} )`,
            enable: true,
            submenu: this.createAccountMenuBySplit(view),
          }
        }
        break
    }

    this.windowMenus[1] = {
      label: '快捷功能',
      submenu: [
        {
          label: '一键自动日常',
          type: 'checkbox',
          checked: allOneKeyDailyMission,
          accelerator: combineKeys(KEY_MAP.CTRL, KEY_MAP.F1),
          click: () => this.emitter.emit(ONE_KEY_AUTO_MISSION),
        },
        {
          label: '一键出售垃圾',
          click: () => this.emitter.emit(ONE_KEY_SELL),
        },
        {
          label: '一键修理装备',
          click: () => this.emitter.emit(ONE_KEY_REPAIR),
        },
        {
          label: '一键领取微端奖励',
          click: () => this.emitter.emit(ONE_KEY_REWARD),
        },
        {
          label: '快速出售',
          click: () => view?.sellProduct(),
        },
      ],
    }

    this.windowMenus[2] = {
      label: '自动功能',
      submenu: [
        {
          label: '自动跳过战斗动画',
          type: 'checkbox',
          accelerator: combineKeys(KEY_MAP.CTRL, KEY_MAP.F2),
          checked: this.win.skipBattleAnime[viewIndex],
          click: () => this.emitter.emit(AUTO_SKIP_BATTLE_ANIM),
        },
        {
          label: '自动出售',
          type: 'checkbox',
          checked: !!this.config.app.autoSellByBagWillFull,
          click: () => this.emitter.emit(AUTO_SELL),
        },
        {
          label: '自动修理',
          type: 'checkbox',
          checked: !!this.config.app.autoRepairEquip,
          click: () => this.emitter.emit(AUTO_REPAIR),
        },
        {
          label: '自动护送',
          type: 'checkbox',
          checked: !!this.config.app.autoEscort,
          click: () => this.emitter.emit(AUTO_ESCORT),
        },
        {
          label: '自动喊话',
          type: 'checkbox',
          checked: !!this.win.autoChat[viewIndex],
          click: () => {
            this.win.autoChat[viewIndex] = !this.win.autoChat[viewIndex]
            view.setAutoChat(this.win.autoChat[viewIndex])
          },
        },
        {
          label: '自动刷怪',
          type: 'checkbox',
          checked: this.win.oneKeyRefreshMonster,
          click: () => this.emitter.emit(AUTO_REFRESH_MONSTER),
        },
        {
          label: '自动领取在线奖励',
          type: 'checkbox',
          checked: !!this.config.app.autoOnline,
          click: () => this.emitter.emit(AUTO_ONLINE_REWARD),
        },
        {
          label: '自动开启背包',
          type: 'checkbox',
          checked: !!this.config.app.autoExpandBag,
          click: () => this.emitter.emit(AUTO_EXPAND_PACKAGE),
        },
      ],
    }

    this.windowMenus[index++] = {
      label: '测试功能',
      submenu: [
        {
          label: '日常扩展',
          type: 'checkbox',
          checked: !!this.win.extendsDailyMission[viewIndex],
          click: () => {
            this.win.extendsDailyMission[viewIndex] = !this.win.extendsDailyMission[viewIndex]
            view.send(IPC_RENDERER.EXTENDS_DAILY_MISSION, this.win.extendsDailyMission[viewIndex])
          },
        },
      ],
    }

    this.windowMenus[index++] = {
      label: view?.webContents.isDevToolsOpened() ? '关闭控制台' : '打开控制台',
      enable: true,
      click: () => view?.webContents.toggleDevTools(),
    }

    this.windowMenus[index++] = {
      label: '关于',
      enable: true,
      click: () => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const openAboutWindow = require('about-window').default
        openAboutWindow({
          icon_path: resolveAssets('icons/win/icon.ico'),
          win_options: {
            title: '关于本应用',
          },
          homepage: 'https://github.com/starknt/world',
          license: 'MIT',
          copyright: 'Copyright © 2021 starknt',
          bug_report_url: 'tencent://AddContact/?fromId=45&fromSubId=1&subcmd=all&uin=1431880400&website=www.starknt.me',
          bug_link_text: '报告BUG',
          description: '世界OL日常脚本电脑版',
          product_name: '世界之手',
          about_page_dir: aboutPath,
        })
      },
    }

    this.windowMenus = hookWindowMenuClick(this.windowMenus, async () => {
      console.time('builded window menu cost time: ')
      await this.buildWindowMenu()
      console.timeEnd('builded window menu cost time: ')
    })
  }

  protected async buildWindowMenu() {
    await this.prebuildWindowMenu()

    const windowMenu = buildFromTemplateWrapper(this.windowMenus, {
      enable: this.enable,
      registerAccelerator: this.registerAccelerator,
    })

    if (!this.isDestroyed()) {
      this.autoHideMenuBar = false
      this.setMenu(windowMenu)
    }
  }

  private createAccountMenuByMerge(view: GameView) {
    const menu: MenuTemplate[] = []

    menu.push({
      label: '添加小号',
      accelerator: combineKeys(KEY_MAP.CTRL, KEY_MAP.KEY_N),
      click: () => this.emitter.emit(ADD_ACCOUNT),
    })

    menu.push({
      label: '删除小号',
      accelerator: combineKeys(KEY_MAP.CTRL, KEY_MAP.KEY_D),
      click: () => this.emitter.emit(DELETE_ACCOUNT, view.id),
    })

    this.win.views.forEach((_, index) => {
      menu.push({
        label: `小号(${index + 1})`,
        click: () => {
          this.win.setTopView(index)
        },
      })
    })

    return menu
  }

  private createAccountMenuBySplit(view: GameView): MenuTemplate[] {
    const menu: MenuTemplate[] = []

    menu.push({
      label: '添加小号',
      accelerator: combineKeys(KEY_MAP.CTRL, KEY_MAP.KEY_N),
      click: () => this.emitter.emit(ADD_ACCOUNT),
    })

    menu.push({
      label: '删除小号',
      accelerator: combineKeys(KEY_MAP.CTRL, KEY_MAP.KEY_D),
      click: () => {
        this.emitter.emit(DELETE_ACCOUNT, view.id)
      },
    })

    return menu
  }

  protected createVersionMenu() {
    const menu: MenuTemplate[] = []

    const keys = Object.keys(VERSION_MAP)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const v = VERSION_MAP[key]
      menu.push({
        label: v.name,
        type: 'checkbox',
        checked: this.config.version === v.name,
        click: () => {
          this.config.version = v.name
          if (!this.view.getGameStarted())
            this.view.loadURL(VERSION_MAP[this.config.version].url)

          if (this.config.accounts[i])
            this.config.accounts[i].url = VERSION_MAP[this.config.version].url
        },
      })
    }

    return menu
  }

  protected setRegisterAccelerator(v: boolean) {
    this.registerAccelerator = v
    this.buildWindowMenu()
  }

  protected onClose(e: Electron.Event) {
    if (this.id === this.win.id) {
      if (this.mode === 'merge') { this.win?.close() }
      else {
        if (this.win.windows.length !== 1) {
          e.preventDefault()
          this.hide()
        }
      }
    }
    else { this.destroy() }
  }

  private registerWindowListener() {
    this.on('close', this.onClose)

    this.on('show', () => {
      this.setRegisterAccelerator(true)
    })

    this.on('focus', () => {
      this.setRegisterAccelerator(true)
    })

    this.on('hide', () => {
      this.setRegisterAccelerator(false)
    })

    this.on('minimize', () => {
      this.setRegisterAccelerator(false)
    })

    this.on('maximize', () => {
      this.setRegisterAccelerator(true)
    })
  }

  destroy(): void {
    clearInterval(this.timer!)
    super.destroy()
  }
}
