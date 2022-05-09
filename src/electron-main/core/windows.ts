import { BrowserWindow, Notification, ipcMain, app, globalShortcut } from "electron";
import { resolveAssets } from "./paths";
import Configuration, { ConfigurationEvents } from "./Configuration";
import GameView, { GameViewState } from "./GameView";
import { combineKey, KEYMAP } from "../../electron-common/keymap";
import VERSIONMAP from "./versions";
import { debounce } from "common/functional";
import { Account, IConfiguration } from "common/configuration";
import { IPCM } from "common/ipcEventConst";
import { MainWidowConfiguration } from "./windowConfig";
import AutoUpdater from "./updater";
import {
  buildFromTemplateWrapper,
  hookWindowMenuClick,
  MenuTemplate,
} from "./menuHelper";
import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";

ipcMain.setMaxListeners(30);

export const enum WindowState {
  UNINITALIZE = "uninitalize",
  MIN = "minimize",
  MAX = "maximize",
  HIDE = "hide",
  FOCUS = "focus",
  INITALIZED = "initalized",
}

export interface ViewOptions {}

export interface ViewState {
  id: number;
  state: GameViewState;
  options: ViewOptions;
}

// 再三思考决定采用 BrowserView 来实现窗口的堆叠
export default class MainWidow extends BrowserWindow {
  private autoChat: boolean[] = []

  private oneKeyDailyMission = false;

  private oneKeyRefreshMonster = false;

  private oneKeyEscort = false;

  private skipBattleAnime = false;

  private actived_view = 0;

  private views: Array<GameView> = [];

  private viewsState: Array<ViewState> = [];

  private accounts: Array<Account> = [];

  private activedView: GameView | null = null;

  windowMenus: MenuTemplate[] = [];

  private config: IConfiguration;

  private enable = false;

  private registerAccelerator = false;

  private readonly updater = new AutoUpdater(this);

  constructor(private readonly configuration: Configuration) {
    super(MainWidowConfiguration);

    this.config = this.configuration.configuration;

    this.accounts.push(...configuration.configuration.accounts);

    this.setMenu(null);

    this.initalize();
  }

  initalize() {
    this.accounts.map((v) => {
      const view = this.createView();
      if (v.url) {
        view.loadURL(v.url);
      } else {
        view.loadURL(
          VERSIONMAP[this.config.version].url ||
            "https://m.tianyuyou.cn/index/h5game_jump.html?tianyuyou_agent_id=10114&game_id=66953"
        );
      }
    });

    if (this.views.length === 0) {
      const view = this.createView();
      view.loadURL(
        VERSIONMAP[this.config.version].url ||
          "https://m.tianyuyou.cn/index/h5game_jump.html?tianyuyou_agent_id=10114&game_id=66953"
      );
    }

    this.registerListener();
    this.buildWindowMenu();
    this.updateViewConfiguration();
  }

  async prebuildWindowMenu() {
    const state = this.viewsState[this.actived_view];

    if (state?.state === GameViewState.INITALIZED) {
      this.enable = true;
    } else {
      this.enable = false;
    }

    if (this.activedView) {
      const oneKeyDailyMission: boolean = !!this.activedView.getAutoDaily();

      const allOneKeyDailyMission: boolean = this.views
        .map((view) => view.getAutoDaily())
        .some((v) => v);

      this.windowMenus[0] = {
        label: "功能",
        submenu: [
          {
            label: "快速存号",
            enable: true,
            accelerator: combineKey(KEYMAP.CTRL, KEYMAP.KEY_S),
            registerAccelerator: this.registerAccelerator,
            click: () => this.saveAccounts(),
          },
          {
            label: "自动日常",
            type: "checkbox",
            checked: oneKeyDailyMission || allOneKeyDailyMission,
            click: async () => {
              this.activedView?.setOneKeyDailyMission(
                !(oneKeyDailyMission || this.oneKeyDailyMission)
              );
            },
          },
          {
            label: "快速出售",
            click: () => {
              this.activedView?.sellProduct();
            },
          },
          {
            label: "刷新页面",
            enable: true,
            click: () => {
              this.activedView?.reload();
            },
          },
        ],
      };

      this.windowMenus[1] = {
        label: "快捷功能",
        submenu: [
          {
            label: "一键自动日常",
            type: "checkbox",
            checked: allOneKeyDailyMission,
            click: () => {
              this.oneKeyDailyMission = !this.oneKeyDailyMission;
              this.views.map(async (view) => {
                view.setOneKeyDailyMission(this.oneKeyDailyMission);
              });
            },
          },
          {
            label: "自动护送任务",
            type: "checkbox",
            checked: this.oneKeyEscort,
            click: () => {
              this.oneKeyEscort = !this.oneKeyEscort;
              this.views.map((view) => view.setAutoEscort(this.oneKeyEscort));
            },
          },
          {
            label: "一键出售垃圾",
            click: () => {
              this.views.map((view) => view.sellProduct());
            },
          },
          {
            label: "一键修理装备",
            click: () => {
              this.views.map((view) => view.repairEquip());
            },
          },
          {
            label: "一键领取微端奖励",
            click: () => {
              this.views.map((view) => view.microReward());
            },
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
            click: () => {
              this.config.app.autoSellByBagWillFull =
                !!!this.config.app.autoSellByBagWillFull;
              this.views.map((view) => {
                view.setSellProduct(this.config.app.autoSellByBagWillFull);
              });
            },
          },
          {
            label: "跳过战斗动画",
            type: "checkbox",
            checked: !!this.skipBattleAnime,
            click: () => {
              this.skipBattleAnime = !this.skipBattleAnime;
              this.views.map((view) => {
                view.setSkipBattleAnime(this.skipBattleAnime);
              })
            }
          },
          {
            label: "自动护送",
            type: "checkbox",
            checked: !!this.config.app.autoEscort,
            click: () => {
              this.config.app.autoEscort = !!!this.config.app.autoEscort;
              this.views.map((view) => {
                view.setAutoEscort(this.config.app.autoEscort);
              });
            },
          },
          {
            label: "自动喊话",
            type: "checkbox",
            checked: !!this.autoChat[this.actived_view],
            click: () => {
              this.autoChat[this.actived_view] = !this.autoChat[this.actived_view];
              this.views[this.actived_view].setAutoChat(this.autoChat[this.actived_view]);
            }
          },
          {
            label: "自动修理",
            type: "checkbox",
            checked: !!this.config.app.autoRepairEquip,
            click: () => {
              this.config.app.autoRepairEquip =
                !!!this.config.app.autoRepairEquip;
              this.views.map((view) => {
                view.setSellProduct(this.config.app.autoRepairEquip);
              });
            },
          },
          {
            label: "自动刷怪",
            type: "checkbox",
            checked: this.oneKeyRefreshMonster,
            click: () => {
              this.oneKeyRefreshMonster = !this.oneKeyRefreshMonster;
              this.views.map((view) => {
                view.setRefreshMonster(this.oneKeyRefreshMonster);
              });
            },
          },
          {
            label: "自动领取在线奖励",
            type: "checkbox",
            checked: !!this.config.app.autoOnline,
            click: () => {
              this.config.app.autoOnline = !!!this.config.app.autoOnline;
              this.views.map((view) =>
                view.setOnlineReward(this.config.app.autoOnline)
              );
            },
          },
          {
            label: "自动开启背包格子",
            type: "checkbox",
            checked: !!this.config.app.autoExpandBag,
            click: () => {
              this.config.app.autoExpandBag = !!!this.config.app.autoExpandBag;
              this.views.map((view) =>
                view.setExpandBag(this.config.app.autoExpandBag)
              );
            },
          },
        ],
      };

      this.windowMenus[3] = {
        label: `小号( ${this.actived_view + 1}/${this.views.length} )`,
        submenu: this.createAccountMenu(),
        enable: true,
      };

      this.windowMenus[4] = {
        label: "附加选项",
        submenu: [
          {
            label: "出售建筑材料",
            type: "checkbox",
            checked: !!this.config.app.sell_buildMaterial,
            click: () => {
              this.config.app.sell_buildMaterial =
                !!!this.config.app.sell_buildMaterial;
              this.views.map((view) =>
                view.setSellBuildMaterial(this.config.app.sell_buildMaterial)
              );
            },
          },
          {
            label: "出售稀有装备",
            type: "checkbox",
            checked: !!this.config.app.sell_RareEquip,
            click: () => {
              this.config.app.sell_RareEquip =
                !!!this.config.app.sell_RareEquip;
              this.views.map((view) =>
                view.setSellBuildMaterial(this.config.app.sell_RareEquip)
              );
            },
          },
          {
            label: "使用修理卷",
            type: "checkbox",
            checked: !!this.config.app.repairRoll,
            click: () => {
              this.config.app.repairRoll = !!!this.config.app.repairRoll;
              this.views.map((v) => {
                v.setUseRepairRoll(this.config.app.repairRoll);
              });
            },
          },
        ],
      };

      this.windowMenus[5] = {
        id: "version",
        label: "版本切换",
        enable: true,
        submenu: this.createVersionMenu(),
      };

      this.windowMenus[6] = {
        label: "测试功能",
        submenu: [
          {
            label: "开启日常箱子",
            click: () => {
              this.activedView?.openDailyBox();
            },
          },
          {
            label: "自动无双",
            click: () => {
              this.views.map((view) => {
                view.startWushuangEscort();
              });
            },
          },
        ],
      };

      this.windowMenus[7] = {
        label: "关于",
        enable: true,
        click: () => {
          app.showAboutPanel();
        },
      };

      this.windowMenus = hookWindowMenuClick(this.windowMenus, async () => {
        console.time("builded window menu cost time: ");
        await this.buildWindowMenu();
        console.timeEnd("builded window menu cost time: ");
      });
    }
  }

  async buildWindowMenu() {
    await this.prebuildWindowMenu();

    const windowMenu = buildFromTemplateWrapper(this.windowMenus, {
      enable: this.enable,
      registerAccelerator: this.registerAccelerator,
    });

    if(this.registerAccelerator) {
      globalShortcut.register("CommandOrControl+Shift+I", () => {
        this.activedView?.openDevTools();
      })
    }

    if (!this.isDestroyed()) this.setMenu(windowMenu);
  }

  async saveAccounts() {
    for (let index = 0; index < this.views.length; index++) {
      const v = this.views[index];
      const url = await v.getVersionURL();

      if (index < this.config.accounts.length) {
        this.config.accounts[index].url =
          url || VERSIONMAP[this.config.version].url;
      } else {
        this.configuration.configuration.accounts.push({
          url: url || VERSIONMAP[this.config.version].url,
        });
      }
    }

    if (this.views.length > 0)
      this.config.oaccounts = await this.views[0].getAccounts();

    this.configuration.save();
    if (Notification.isSupported()) {
      const n = new Notification({
        icon: resolveAssets("icons/win/icon.ico"),
      });
      n.title = "世界OL脚本设置提醒";
      n.body = "存号成功";
      n.show();
    }
  }

  getActivedView() {
    if (this.views.length <= 0 || this.actived_view > this.views.length) {
      return null;
    }

    return this.views[this.actived_view];
  }

  createAccountMenu() {
    const menu: MenuTemplate[] = [];

    menu.push({
      label: "添加小号",
      registerAccelerator: this.registerAccelerator,
      accelerator: combineKey(KEYMAP.CTRL, KEYMAP.KEY_N),
      click: () => {
        const view = this.createView();
        view.loadURL(
          VERSIONMAP[this.config.version].url ||
            "https://m.tianyuyou.cn/index/h5game_jump.html?tianyuyou_agent_id=10114&game_id=66953"
        );
      },
    });

    menu.push({
      label: "删除小号",
      registerAccelerator: this.registerAccelerator,
      accelerator: combineKey(KEYMAP.CTRL, KEYMAP.KEY_D),
      click: () => {
        const view = this.getActivedView();
        if (this.views.length !== 1 && view) {
          this.removeBrowserView(view.view);
        } else if (view) {
          view.reload();
        }

        this.views.splice(this.actived_view, 1);
        this.viewsState.splice(this.actived_view, 1);
        this.config.accounts.splice(this.actived_view, 1);
        this.actived_view = this.actived_view - 1;
        this.activedView = this.views[this.actived_view];
        this.configuration.save();
      },
    });

    this.views.map((_, index) => {
      menu.push({
        label: `小号(${index + 1})`,
        click: () => {
          this.setTopView(index);
        },
      });
    });

    return menu;
  }

  createVersionMenu() {
    const menu: MenuTemplate[] = [];

    const keys = Object.keys(VERSIONMAP);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const v = VERSIONMAP[key];
      menu.push({
        label: v.name,
        type: "checkbox",
        checked: this.config.version === v.name,
        click: () => {
          this.switchVersion(v.name);
        },
      });
    }

    return menu;
  }

  createView() {
    const view = new GameView(
      {
        x: 0,
        y: 0,
        width: this.getBounds().width,
        height: this.getBounds().height,
      },
      this.config.list.black || [],
      this.config.list.white || [],
      this.config.list.equipWhite || []
    );

    this.addBrowserView(view.view);
    this.views.push(view);
    this.viewsState.push({
      id: view.id,
      state: view.getGameStarted()
        ? GameViewState.INITALIZED
        : GameViewState.UNINITALIZE,
      options: [],
    });
    this.actived_view = this.views.length - 1;
    view.executeJavaScript(
      `window.localStorage.setItem('world-1000-1100-accountList', '${JSON.stringify(
        this.config.oaccounts || []
      )}')`
    );

    this.updateViewConfiguration();

    this.activedView = view;

    return view;
  }

  updateViewConfiguration() {
    this.views.map((view) => {
      view.setSellProduct(!!this.config.app.autoSellByBagWillFull);
      view.setRepairEquip(!!this.config.app.autoRepairEquip);
      view.setOnlineReward(!!this.config.app.autoOnline);
      view.setUseRepairRoll(!!this.config.app.repairRoll);
      view.setExpandBag(!!this.config.app.autoExpandBag);
      view.setSellBuildMaterial(!!this.config.app.sell_buildMaterial);
      view.setSellRareEquip(!!this.config.app.sell_RareEquip);
      view.setAutoEscort(!!this.config.app.autoEscort);
    });
  }

  setTopView(top: number) {
    if (top > this.views.length - 1) {
      top = 0;
    }

    if (top < 0) {
      top = this.views.length - 1;
    }

    const view = this.views[top];
    this.setTopBrowserView(view.view);
    this.actived_view = top;
    this.activedView = view;
    this.buildWindowMenu();
  }

  switchVersion(name: string) {
    this.config.version = name;
    const view = this.getActivedView();
    const i = this.actived_view;

    if (!view?.getGameStarted()) {
      view?.loadURL(VERSIONMAP[name].url);
      if (this.config.accounts[i])
        this.config.accounts[i].url = VERSIONMAP[name].url;
    }
  }

  setViewOptionById(id: number, viewState: GameViewState) {
    this.viewsState.map((state) => {
      if (state.id === id) {
        state.state = viewState;
      }
    });

    this.buildWindowMenu();
  }

  setRegisterAccelerator(v: boolean) {
    this.registerAccelerator = v;
    this.buildWindowMenu();
  }

  registerListener() {
    // 自动更新配置
    this.configuration.on(ConfigurationEvents.SAVED, () => {
      this.updateViewConfiguration();
      this.buildWindowMenu();
    });

    ipcMain.handle(IPCM.INVOKE_VERSION_INFO, () => {
      return VERSIONMAP[this.config.version];
    });

    ipcMain.on(IPCM.SETUP_FUNCTION_STARTED, (e) => {
      console.log("开始安装程序功能...", e.sender.id);
    });

    ipcMain.on(IPCM.SETUP_FUNCTION_ENDED, async (e) => {
      console.log("安装程序功能结束...", e.sender.id);

      // 该 BrowserView 的功能初始化完毕
      const view = this.getViewById(e.sender.id);
      view?.changeState(GameViewState.INITALIZED);
      this.setViewOptionById(e.sender.id, GameViewState.INITALIZED);

      for (let index = 0; index < this.views.length; index++) {
        const v = this.views[index];
        const url = await v.getVersionURL();

        if (index < this.config.accounts.length) {
          this.config.accounts[index].url =
            url || VERSIONMAP[this.config.version].url;
        } else {
          this.configuration.configuration.accounts.push({
            url: url || VERSIONMAP[this.config.version].url,
          });
        }
      }

      if (this.views.length > 0)
        this.config.oaccounts = await this.views[0].getAccounts();
    });

    ipcMain.on(IPCM.GAME_HOOK_STARTED, (e) => {
      console.log("开始安装游戏钩子...", e.sender.id);
    });

    ipcMain.on(IPCM.GAME_HOOK_ENDED, (e) => {
      console.log("安装游戏钩子结束...", e.sender.id);
    });

    ipcMain.on(IPCM.GAME_WILL_READY, (e, url: string) => {
      const view = this.getViewById(e.sender.id);

      setTimeout(() => {
        view?.loadURL(url);
      }, 1000);
    });

    ipcMain.on(IPCM.RELOAD, (e) => {
      const view = this.getViewById(e.sender.id);

      view?.reload();
    });

    ipcMain.on(IPCM.EXECUTE, (e) => {
      console.log("execute");
      this.views
        .filter((v) => v.id !== e.sender.id)
        .map((view) => view.reload());
    });

    ipcMain.on(IPCM.EXECUTE_OTHER, (e, command: string, ...args: any[]) => {
      this.views
        .filter((v) => v.id !== e.sender.id)
        .map((view) => view.executeCommand(command, ...args));
    });

    ipcMain.on(IPCM.RECEIVE_CHAT_MSG, (e) => {
      const view = this.getViewById(e.sender.id);

      const desktopPath = app.getPath('desktop');

      const chatTextPath = path.join(desktopPath, 'chat.txt');

      if(existsSync(chatTextPath)) {
        const chatText = readFileSync(chatTextPath, 'utf8');
      
        view?.send(IPCM.RECEIVE_CHAT_MSG, chatText);
      } else {
        view?.send(IPCM.RECEIVE_CHAT_MSG, '');
        writeFileSync(chatTextPath, "", { flag: 'w+' })
      }
    })

    // 监听鼠标滚轮
    ipcMain.on(
      IPCM.MOUSE_WHEEL,
      debounce((_e: any, d: number) => {
        if (d > 0) {
          this.setTopView(this.actived_view + 1);
        }

        if (d < 0) {
          this.setTopView(this.actived_view - 1);
        }
      }, 200)
    );

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
      this.focus();
    });
  }

  getViewById(id: number) {
    for (let i = 0; i < this.views.length; i++) {
      const view = this.views[i];

      if (view.id === id) {
        return view;
      }
    }

    return null;
  }
}
