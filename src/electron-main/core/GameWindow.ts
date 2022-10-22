import { IConfiguration } from "common/configuration";
import { BrowserWindow } from "electron";
import Configuration from "./Configuration";
import GameView, { GameViewState } from "./GameView";
import { buildFromTemplateWrapper, hookWindowMenuClick, MenuTemplate } from "./menuHelper";
import { MainWidowConfiguration } from "./windowConfig";
import VERSION_MAP from "../../electron-common/versions";
import { KEY_MAP } from "common/key_map";
import EventEmitter from "events";
import { ONE_KEY_AUTO_MISSION, REFRESH_MONSTER, ViewState } from "./shared";
import { ADD_ACCOUNT, AUTO_ESCORT, AUTO_EXPAND_PACKAGE, AUTO_ONLINE_REWARD, AUTO_REPAIR, AUTO_SELL, CHANGE_WINDOW_MODE, ONE_KEY_REPAIR, ONE_KEY_REWARD, ONE_KEY_SELL, OPTION_OFFLINE_RATE3, OPTION_SELL_BUILD_MATERIAL, OPTION_SELL_RARE_EQUIP, OPTION_USE_REPAIR_ROLL } from "./shared";
import { ApplicationWindow } from "./window";

export default class GameWindow extends BrowserWindow {
  protected windowMenus: MenuTemplate[] = [];
  protected config: IConfiguration;
  protected enable = false;
  protected registerAccelerator = false;
  private state!: ViewState
  private view!: GameView
  private win!: ApplicationWindow
  private mode: 'merge' | 'split' = 'merge'
  private timer: NodeJS.Timer | null = null

  constructor(configuration: Configuration, private readonly emitter: EventEmitter) {
    super(MainWidowConfiguration);
    this.config = configuration.configuration;
    this.setMenu(null);
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

  protected setApplicationWindow(win: ApplicationWindow) {
    this.win = win
  }

  private async prebuildWindowMenu() {
    if (!this.win)
      return

    let index = 0
    const viewIndex = this.mode === 'merge' ? this.win?.active_view ?? 0 : this.win.getViewIndexById(this.view.id)
    const view = this.mode === 'merge' ? this.win.views[viewIndex] : this.view
    const oneKeyDailyMission: boolean = !!view?.getAutoDaily();
    const allOneKeyDailyMission = this.win.views.map((view) => view.getAutoDaily()).some(v => v)
    const started = view.getGameStarted()
    if (started)
      this.enable = true;
    else
      this.enable = false;

    this.windowMenus[index++] = {
      label: "常用功能",
      submenu: [
        {
          label: '经验千场',
          submenu: [
            {
              label: "紫禁城千场",
              click: () => {
                view?.forbiddenCity();
              },
            },
            {
              label: "破敌(120)",
              click: () => {
                view?.podi();
              },
            },
            {
              label: "最强妖兽",
              click: () => {
                view?.topOne();
              },
            },
            {
              label: "重复战斗",
              click: () => view?.repeatBattle()
            }
          ]
        },
        {
          label: '窗口模式',
          enable: true,
          submenu: [
            {
              label: '融合模式',
              type: 'checkbox',
              checked: this.mode === 'merge',
              click: () => this.emitter.emit(CHANGE_WINDOW_MODE, 'merge')
            },
            {
              label: '分离模式',
              type: 'checkbox',
              checked: this.mode === 'split',
              click: () => this.emitter.emit(CHANGE_WINDOW_MODE, 'split')
            }
          ]
        },
        {
          label: "跳过战斗动画",
          type: "checkbox",
          checked: !!this.win.skipBattleAnime[viewIndex],
          click: () => {
            this.win.skipBattleAnime[viewIndex] = !!!this.win.skipBattleAnime[viewIndex]
            view.setSkipBattleAnime(this.win.skipBattleAnime[viewIndex])
          },
        },
        {
          label: "开启日常箱子",
          click: () => {
            view?.openDailyBox();
          },
        },
        {
          label: "自动日常",
          type: "checkbox",
          checked: oneKeyDailyMission,
          click: async () => {
            view?.setOneKeyDailyMission(
              !(oneKeyDailyMission)
            );
          },
        },
        {
          label: "快速出售",
          click: () => view?.sellProduct()
        },
        {
          label: "刷新页面",
          enable: true,
          registerAccelerator: this.registerAccelerator,
          accelerator: KEY_MAP.F5,
          click: () => view?.reload()
        },
        {
          label: '跳转登录',
          enable: true,
          click: () => {
            view?.jumpLogin();
            view.webContents.session.clearStorageData({
              storages: ['localStorage', 'cookies']
            })
            view?.webContents.loadURL(VERSION_MAP[this.config.version].url || 'https://m.tianyuyou.cn/index/h5game_jump.html?tianyuyou_agent_id=10114&game_id=66953')
          }
        },

      ],
    };

    switch (this.mode) {
      case 'merge':
        {
          const { state } = this.win.viewsState[viewIndex];

          if (state === GameViewState.INITIALIZED)
            this.enable = true;
          else
            this.enable = false;

          // common
          index++

          // common
          index++

          this.windowMenus[index++] = {
            label: `小号( ${viewIndex + 1}/${this.win.views.length} )`,
            submenu: this.win.createAccountMenu(),
            enable: true,
          };
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
            label: '添加小号',
            enable: true,
            click: () => this.emitter.emit(ADD_ACCOUNT)
          };
        }
        break
    }

    this.windowMenus[1] = {
      label: "快捷功能",
      submenu: [
        {
          label: "一键自动日常",
          type: "checkbox",
          checked: allOneKeyDailyMission,
          registerAccelerator: this.registerAccelerator,
          accelerator: KEY_MAP.F2,
          click: () => this.emitter.emit(ONE_KEY_AUTO_MISSION)
        },
        {
          label: "一键出售垃圾",
          click: () => this.emitter.emit(ONE_KEY_SELL),
        },
        {
          label: "一键修理装备",
          click: () => this.emitter.emit(ONE_KEY_REPAIR)
        },
        {
          label: "一键领取微端奖励",
          click: () => this.emitter.emit(ONE_KEY_REWARD)
        },
      ],
    };

    this.windowMenus[2] = {
      label: "自动化功能",
      submenu: [
        {
          label: "自动出售",
          type: "checkbox",
          checked: !!this.config.app.autoSellByBagWillFull,
          click: () => this.emitter.emit(AUTO_SELL)
        },

        {
          label: "自动护送",
          type: "checkbox",
          checked: !!this.config.app.autoEscort,
          click: () => this.emitter.emit(AUTO_ESCORT)
        },
        {
          label: "自动喊话",
          type: "checkbox",
          checked: !!this.win.autoChat[viewIndex],
          click: () => {
            this.win.autoChat[viewIndex] = !!!this.win.autoChat[viewIndex]
            this.view.setAutoChat(this.win.autoChat[viewIndex])
          },
        },
        {
          label: "自动修理",
          type: "checkbox",
          checked: !!this.config.app.autoRepairEquip,
          click: () => this.emitter.emit(AUTO_REPAIR)
        },
        {
          label: "加速刷怪",
          type: "checkbox",
          checked: this.win.oneKeyRefreshMonster,
          click: () => this.emitter.emit(REFRESH_MONSTER)
        },
        {
          label: "自动领取在线奖励",
          type: "checkbox",
          checked: !!this.config.app.autoOnline,
          click: () => this.emitter.emit(AUTO_ONLINE_REWARD)
        },
        {
          label: "自动开启背包格子",
          type: "checkbox",
          checked: !!this.config.app.autoExpandBag,
          click: () => this.emitter.emit(AUTO_EXPAND_PACKAGE)
        },
      ],
    };

    this.windowMenus[index++] = {
      label: "附加选项",
      submenu: [
        {
          label: "出售建筑材料",
          type: "checkbox",
          checked: !!this.config.app.sell_buildMaterial,
          click: () => {
            this.emitter.emit(OPTION_SELL_BUILD_MATERIAL)
          },
        },
        {
          label: "出售稀有装备",
          type: "checkbox",
          checked: !!this.config.app.sell_RareEquip,
          click: () => {
            this.emitter.emit(OPTION_SELL_RARE_EQUIP)
          },
        },
        {
          label: "使用修理卷",
          type: "checkbox",
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
          }
        }
      ],
    };

    this.windowMenus[index++] = {
      label: "切换版本",
      enable: true,
      submenu: this.createVersionMenu(),
    };

    this.windowMenus[index++] = {
      label: view?.webContents.isDevToolsOpened() ? "关闭控制台" : '打开控制台',
      enable: true,
      registerAccelerator: this.registerAccelerator,
      accelerator: KEY_MAP.F12,
      click: async () => {
        view?.webContents.toggleDevTools()
      },
    };

    this.windowMenus = hookWindowMenuClick(this.windowMenus, async () => {
      console.time("builded window menu cost time: ");
      await this.buildWindowMenu();
      console.timeEnd("builded window menu cost time: ");
    });
  }

  protected async buildWindowMenu() {
    await this.prebuildWindowMenu();

    const windowMenu = buildFromTemplateWrapper(this.windowMenus, {
      enable: this.enable,
      registerAccelerator: this.registerAccelerator,
    });

    if (!this.isDestroyed())
      this.setMenu(windowMenu);
  }

  protected createVersionMenu() {
    const menu: MenuTemplate[] = [];

    const keys = Object.keys(VERSION_MAP);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const v = VERSION_MAP[key];
      menu.push({
        label: v.name,
        type: "checkbox",
        checked: this.config.version === v.name,
        click: () => {
          this.config.version = v.name;
          if (!this.view.getGameStarted()) {
            this.view.loadURL(VERSION_MAP[this.config.version].url);
          }

          if (this.config.accounts[i])
            this.config.accounts[i].url = VERSION_MAP[this.config.version].url;
        }
      })
    }

    return menu;
  }

  protected setRegisterAccelerator(v: boolean) {
    this.registerAccelerator = v;
    this.buildWindowMenu();
  }

  protected onClose(e: Electron.Event) {
    if (this.id === this.win.id) {
      e.preventDefault()
      this.hide()
    }
    else
      this.destroy()
  }

  private registerWindowListener() {
    this.on('close', this.onClose)

    this.on("focus", () => {
      this.setRegisterAccelerator(true);
    });

    this.on("hide", () => {
      this.setRegisterAccelerator(false);
    });

    this.on("minimize", () => {
      this.setRegisterAccelerator(false);
    });

    this.on("maximize", () => {
      this.setRegisterAccelerator(true);
    });
  }

  destroy(): void {
    clearInterval(this.timer!)
    super.destroy()
  }
}