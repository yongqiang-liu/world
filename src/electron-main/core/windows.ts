import {
  BrowserWindow,
  Menu,
  Notification,
  ipcMain,
  session,
  app,
  MenuItemConstructorOptions,
} from "electron";
import { resolveAssets } from "./paths";
import Configuration from "./Configuration";
import GameView, { GameViewState } from "./GameView";
import { combineKey, KEYMAP } from "./keymap";
import VERSIONMAP from "./versions";
import { debounce } from "common/functional";
import { Account, IConfiguration } from "common/configuration";
import { IPCM } from "common/ipcEventConst";
import { MainWidowConfiguration } from "./windowConfig";

ipcMain.setMaxListeners(30);

export const enum WindowState {
  UNINITALIZE = "uninitalize",
  MIN = "minimize",
  MAX = "maximize",
  HIDE = "hide",
  FOCUS = "focus",
  INITALIZED = "initalized",
}

export const enum FunctionState {
  SETUP_FUNCTION_STARTED = "function:started",
  SETUP_FUNCTION_ENDED = "function:ended",
  SETUP_HOOKS_STARTED = "hooks:started",
  SETUP_HOOKS_ENDED = "hooks:ended",
  REDAY = "reday",
}

export interface ViewOption {
  view: GameView;
  registerAccelerator: boolean;
  enable: boolean;
}

// 再三思考决定采用 BrowserView 来实现窗口的堆叠
export default class MainWidow extends BrowserWindow {
  refreshMonster = false;

  autoOneKey = false;

  autoOnline = false;

  actived_view = 0;

  views: Array<GameView> = [];

  accounts: Array<Account> = [];

  config: IConfiguration;

  registerAccelerator = false;

  constructor(private readonly configuration: Configuration) {
    super(MainWidowConfiguration);

    this.config = this.configuration.configuration;

    this.accounts.push(...configuration.configuration.accounts);

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

    this.setupMenu();
    this.registerListener();
    this.updateViewConfiguration();
  }

  setupMenu() {
    const menu = Menu.buildFromTemplate([
      {
        label: "功能",
        submenu: [
          {
            label: "自动日常",
            type: "checkbox",
            checked: !!this.autoOneKey,
            click: () => {
              const view = this.getActivedView();
              this.autoOneKey = !this.autoOneKey;
              if (view) {
                view.setOneKeyDailyMission(this.autoOneKey);
              }
            },
          },
          {
            label: "快速修理",
            type: "normal",
            click: () => {
              const view = this.getActivedView();
              view?.repairEquip();
            },
          },
          {
            label: "快速出售",
            type: "normal",
            click: () => {
              const view = this.getActivedView();
              view?.sellProduct();
            },
          },
          {
            label: "刷新页面",
            type: "normal",
            click: () => {
              const view = this.getActivedView();
              view?.reload();
            },
          },
          {
            label: "跳到登录",
            type: "normal",
            click: () => {
              const view = this.getActivedView();
              session.defaultSession.clearStorageData();
              view?.loadURL(VERSIONMAP[this.config.version].url);
            },
          },
          {
            label: "开启日常箱子(测试中)",
            click: () => {
              const view = this.getActivedView();

              view?.openDailyBox();
            },
          },
        ],
      },
      {
        label: "快捷功能",
        submenu: [
          {
            label: "一键自动",
            type: "checkbox",
            checked: !!this.autoOneKey,
            registerAccelerator: this.registerAccelerator,
            accelerator: combineKey(KEYMAP.CTRL, KEYMAP.KEY_A),
            click: () => {
              this.autoOneKey = !this.autoOneKey;
              this.views.map((v) => {
                v.setOneKeyDailyMission(this.autoOneKey);
              });

              this.setupMenu();
            },
          },
          {
            label: "一键出售",
            type: "normal",
            registerAccelerator: this.registerAccelerator,
            accelerator: combineKey(KEYMAP.CTRL, KEYMAP.KEY_T),
            click: () => {
              this.views.map((v) => {
                v.sellProduct();
              });
            },
          },
          {
            label: "一键修理",
            registerAccelerator: this.registerAccelerator,
            accelerator: combineKey(KEYMAP.CTRL, KEYMAP.KEY_R),
            click: () => {
              this.views.map((v) => {
                v.repairEquip();
              });
            },
          },
          {
            label: "一键存号",
            type: "normal",
            registerAccelerator: this.registerAccelerator,
            accelerator: combineKey(KEYMAP.CTRL, KEYMAP.KEY_S),
            click: async () => {
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
                  icon: resolveAssets("icon.ico"),
                });
                n.title = "世界OL脚本设置提醒";
                n.body = "存号成功";
                n.show();
              }
            },
          },
          {
            label: "一键领取微端奖励",
            type: "normal",
            click: () => {
              this.views.map((v) => {
                v.microReward();
              });
            },
          },
        ],
      },
      {
        label: "自动化功能",
        submenu: [
          {
            label: "自动出售",
            type: "checkbox",
            checked: !!this.config.app.autoSellByBagWillFull,
            click: () => {
              this.config.app.autoSellByBagWillFull =
                !!!this.config.app.autoSellByBagWillFull;
              this.views.map((v) => {
                v.setSellProduct(this.config.app.autoSellByBagWillFull);
              });
              this.configuration.save();
              this.setupMenu();
            },
            toolTip: "当你的启用该功能并且背包快满时, 它会自动出售物品",
          },
          {
            label: "自动修理",
            type: "checkbox",
            checked: !!this.config.app.autoRepairEquip,
            click: () => {
              this.config.app.autoRepairEquip =
                !!!this.config.app.autoRepairEquip;

              this.views.map((v) => {
                v.setRepairEquip(this.config.app.autoRepairEquip);
              });

              this.configuration.save();

              this.setupMenu();
            },
            toolTip:
              "当你的启用该功能并且处于自动日常状态时回到城市, 会自动修理装备",
          },
          {
            label: "自动刷怪",
            type: "checkbox",
            checked: this.refreshMonster,
            click: () => {
              this.refreshMonster = !this.refreshMonster;
              this.views.map((v) => {
                v.setRefreshMonster(this.refreshMonster);
              });
            },
          },
          {
            label: "自动领取在线奖励",
            type: "checkbox",
            checked: !!this.config.app.autoOnline,
            click: () => {
              this.config.app.autoOnline = !!!this.config.app.autoOnline;

              this.views.map((v) => {
                v.setOnlineReward(this.config.app.autoOnline);
              });

              this.setupMenu();
              this.configuration.save();
            },
          },
          {
            label: "自动开启背包格子",
            type: "checkbox",
            checked: !!this.config.app.autoExpandBag,
            click: () => {
              this.config.app.autoExpandBag = !!!this.config.app.autoExpandBag;
              this.views.map((v) => {
                v.setExpandBag(this.config.app.autoExpandBag);
              });
              this.configuration.save();
            },
          },
        ],
      },
      {
        label: `小号( ${this.actived_view + 1}/${this.views.length} )`,
        submenu: this.genAccountMenu(),
      },
      {
        label: "附加选项",
        submenu: [
          {
            label: "出售建筑材料",
            type: "checkbox",
            checked: !!this.config.app.sell_buildMaterial,
            click: () => {
              this.config.app.sell_buildMaterial =
                !!!this.config.app.sell_buildMaterial;
              this.configuration.save();
            },
          },
          {
            label: "出售稀有装备",
            type: "checkbox",
            checked: !!this.config.app.sell_RareEquip,
            click: () => {
              this.config.app.sell_RareEquip =
                !!!this.config.app.sell_RareEquip;
              this.configuration.save();
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
              this.configuration.save();
            },
          },
        ],
      },
      {
        label: "版本切换",
        submenu: this.genVersionMenu(),
      },
      {
        label: "关于",
        click: () => {
          app.showAboutPanel();
        },
      },
    ]);

    this.setMenu(menu);
  }

  getActivedView() {
    if (this.views.length <= 0 || this.actived_view > this.views.length) {
      return null;
    }

    return this.views[this.actived_view];
  }

  genAccountMenu() {
    const menu = [];

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
        this.configuration.configuration.accounts.splice(this.actived_view, 1);
        this.actived_view = this.actived_view - 1;
        this.setupMenu();
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

  genVersionMenu(): Array<MenuItemConstructorOptions> {
    const menu: Array<MenuItemConstructorOptions> = [];

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
          this.setupMenu();
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
    this.actived_view = this.views.length - 1;
    view.executeJavaScript(
      `window.localStorage.setItem('world-1000-1100-accountList', '${JSON.stringify(
        this.config.oaccounts || []
      )}')`
    );

    this.setupMenu();
    this.updateViewConfiguration();

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
    });
    this.setupMenu();
  }

  async setTopView(top: number) {
    if (top > this.views.length - 1) {
      top = 0;
    }

    if (top < 0) {
      top = this.views.length - 1;
    }

    const view = this.views[top];
    this.setTopBrowserView(view.view);
    this.actived_view = top;
    this.setupMenu();
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

    this.configuration.save();
  }

  registerListener() {
    ipcMain.handle(IPCM.INVOKE_VERSION_INFO, () => {
      return VERSIONMAP[this.config.version];
    });

    ipcMain.on(IPCM.SETUP_FUNCTION_STARTED, (e) => {
      console.log("开始安装程序功能...", e.sender.id);
    });

    ipcMain.on(IPCM.SETUP_FUNCTION_ENDED, (e) => {
      console.log("安装程序功能结束...", e.sender.id);

      // 该 BrowserView 的功能初始化完毕
      const view = this.getViewById(e.sender.id);
      view?.changeState(GameViewState.INITALIZED);
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
      this.registerAccelerator = true;
      this.setupMenu();
    });

    this.on("hide", () => {
      this.registerAccelerator = false;
      this.setupMenu();
    });

    this.on("minimize", () => {
      this.registerAccelerator = false;
      this.setupMenu();
    });

    this.on("maximize", () => {
      this.registerAccelerator = true;
      this.focus();
      this.setupMenu();
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
