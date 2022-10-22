import { Account } from "common/configuration";
import { debounce } from "common/functional";
import { IPC_MAIN } from "common/ipcEventConst";
import { combineKey, KEY_MAP } from "common/key_map";
import { ipcMain, app } from "electron";
import EventEmitter from "events";
import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import Configuration, { ConfigurationEvents } from "./Configuration";
import GameView, { GameViewState } from "./GameView";
import GameWindow from "./GameWindow";
import { MenuTemplate } from "./menuHelper";
import { ADD_ACCOUNT, AUTO_ESCORT, AUTO_EXPAND_PACKAGE, AUTO_ONLINE_REWARD, AUTO_REPAIR, AUTO_SELL, CHANGE_WINDOW_MODE, ONE_KEY_AUTO_MISSION, ONE_KEY_REPAIR, ONE_KEY_REWARD, ONE_KEY_SELL, OPTION_OFFLINE_RATE3, OPTION_SELL_BUILD_MATERIAL, OPTION_SELL_RARE_EQUIP, OPTION_USE_REPAIR_ROLL, REFRESH_MONSTER } from "./shared";
import VERSION_MAP from "./versions";
import { ViewState } from "./shared";

export class ApplicationWindow extends GameWindow {
  autoChat: boolean[] = [];
  oneKeyDailyMission = false;
  oneKeyRefreshMonster = false;
  oneKeyEscort = false;
  skipBattleAnime: boolean[] = [];
  active_view = 0;
  views: Array<GameView> = [];
  viewsState: Array<ViewState> = [];
  accounts: Array<Account> = [];
  windows: GameWindow[] = [this]

  private eventEmitter: EventEmitter

  constructor(private readonly configuration: Configuration) {
    const emitter = new EventEmitter({
      captureRejections: true
    })
    super(configuration, emitter)
    this.config = configuration.configuration
    this.eventEmitter = emitter
    this.eventEmitter.setMaxListeners(Infinity)
    this.accounts = this.config.accounts
    this.setApplicationWindow(this)
    this.registerListener()
    this.initial()
  }

  initial() {
    this.accounts.map((v) => {
      const view = this.createView(v?.url ?? (VERSION_MAP[this.config.version].url || "https://m.tianyuyou.cn/index/h5game_jump.html?tianyuyou_agent_id=10114&game_id=66953"));
      view.webContents.addListener('did-finish-load', () => {
        view.executeJavaScript(
          `window.localStorage.setItem('world-1000-1100-accountList', '${JSON.stringify(
            this.config.oaccounts || []
          )}')`
        );
      })
      return view
    });

    if (this.views.length === 0) {
      this.createView(VERSION_MAP[this.config.version].url ||
        "https://m.tianyuyou.cn/index/h5game_jump.html?tianyuyou_agent_id=10114&game_id=66953");
    }

    if (this.config.app.mode === 'merge')
      this.initialMerge()
    else
      this.initialSplit()
  }

  initialMerge() {
    for (let i = 0; i < this.views.length; i++) {
      let window = this.windows[i]
      const view = this.views[i]
      if (window && window.id !== this.id) {
        window.destroy()
        this.windows.splice(i, 1)
      }
      this.active_view = i
      this.addBrowserView(view.view)
      this.setTopView(i)
    }

    super.initialMerge()
  }

  initialSplit() {
    for (let i = 0; i < this.views.length; i++) {
      const view = this.views[i]
      this.removeBrowserView(view.view)
      let window = this.windows[i]
      const state = this.viewsState[i]
      this.active_view = i
      if (!window) {
        window = new GameWindow(this.configuration, this.eventEmitter)
        window.setApplicationWindow(this)
        this.windows.push(window)
      }

      if (window) {
        window.addBrowserView(view.view)
        window.setTopBrowserView(view.view)
      }

      if (window !== this)
        window.initialSplit(view, state)
      else
        super.initialSplit(view, state)

      window.setBounds({
        x: (i * 10) + i * window.getBounds().width
      }, true)
    }
  }

  createAccountMenu() {
    const menu: MenuTemplate[] = [];

    menu.push({
      label: "添加小号",
      registerAccelerator: this.registerAccelerator,
      accelerator: combineKey(KEY_MAP.CTRL, KEY_MAP.KEY_N),
      click: () => {
        this.eventEmitter.emit(ADD_ACCOUNT)
      },
    });

    menu.push({
      label: "删除小号",
      registerAccelerator: this.registerAccelerator,
      accelerator: combineKey(KEY_MAP.CTRL, KEY_MAP.KEY_D),
      click: () => {
        let view = this.views[this.active_view];
        if (this.views.length !== 1 && view) {
          this.removeBrowserView(view.view);
        } else if (view) {
          view.reload();
        }

        this.views.splice(this.active_view, 1);
        this.viewsState.splice(this.active_view, 1);
        this.config.accounts.splice(this.active_view, 1);
        view?.destroy()
        this.active_view = this.views.length - 1;
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

  getViewById(id: number) {
    for (let i = 0; i < this.views.length; i++) {
      const view = this.views[i];

      if (view.id === id) {
        return view;
      }
    }

    return null;
  }

  getViewIndexById(id: number) {
    return this.views.findIndex(v => v.id === id)
  }

  private createView(url: string) {
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

    view.webContents.addListener('did-finish-load', () => {
      view.executeJavaScript(
        `window.localStorage.setItem('world-1000-1100-accountList', '${JSON.stringify(
          this.config.oaccounts || []
        )}')`
      );
    })

    const state: ViewState = {
      id: view.id,
      state: view.getGameStarted()
        ? GameViewState.INITIALIZED
        : GameViewState.UNINITIALIZED,
      options: []
    }
    this.viewsState.push(state)
    this.views.push(view)
    view.loadURL(url)

    return view
  }

  private updateViewConfiguration() {
    this.views.map((view) => {
      view.setAutoSellProduct(!!this.config.app.autoSellByBagWillFull);
      view.setAutoRepairEquip(!!this.config.app.autoRepairEquip);
      view.setAutoOnlineReward(!!this.config.app.autoOnline);
      view.setUseRepairRoll(!!this.config.app.repairRoll);
      view.setAutoExpandBag(!!this.config.app.autoExpandBag);
      view.setSellBuildMaterial(!!this.config.app.sell_buildMaterial);
      view.setSellRareEquip(!!this.config.app.sell_RareEquip);
      view.setAutoEscort(!!this.config.app.autoEscort);
      view.setOfflineExpRate3(!!this.config.app.rate3);
    });
  }

  private setTopView(top: number) {
    if (top > this.views.length - 1) {
      top = 0;
    }

    if (top < 0) {
      top = this.views.length - 1;
    }

    switch (this.config.app.mode) {
      case 'merge':
        {
          const view = this.views[top];
          this.setTopBrowserView(view.view);
          this.active_view = top;
        }
        break
      case 'split':
        {
          const window = this.windows[top];

          window?.show();
          this.active_view = top;
        }
        break
    }


    this.buildWindowMenu();
  }

  private registerListener() {
    // 自动更新配置
    this.configuration.on(ConfigurationEvents.SAVED, () => {
      this.updateViewConfiguration();
    });

    this.registerEmitterListener()
    this.registerIPCListener()
  }

  private registerEmitterListener() {
    this.eventEmitter.on(ONE_KEY_AUTO_MISSION, () => {
      this.oneKeyDailyMission = !this.oneKeyDailyMission
      this.views.map(view => view.setOneKeyDailyMission(this.oneKeyDailyMission))
    })

    this.eventEmitter.on(ONE_KEY_REPAIR, () => {
      this.views.map(view => view.repairEquip())
    })

    this.eventEmitter.on(ONE_KEY_REWARD, () => {
      this.views.map(view => view.microReward())
    })

    this.eventEmitter.on(ONE_KEY_SELL, () => {
      this.views.map(view => view.sellProduct())
    })

    this.eventEmitter.on(AUTO_SELL, () => {
      this.config.app.autoSellByBagWillFull = !!!this.config.app.autoSellByBagWillFull
      this.views.map(view => view.setAutoSellProduct(this.config.app.autoSellByBagWillFull))
    })

    this.eventEmitter.on(AUTO_ESCORT, () => {
      this.config.app.autoEscort = !!!this.config.app.autoEscort
      this.views.map(view => view.setAutoEscort(this.config.app.autoEscort))
    })

    this.eventEmitter.on(AUTO_REPAIR, () => {
      this.config.app.autoRepairEquip = !!!this.config.app.autoRepairEquip
      this.views.map(view => view.setAutoRepairEquip(this.config.app.autoRepairEquip))
    })

    this.eventEmitter.on(AUTO_ONLINE_REWARD, () => {
      this.config.app.autoOnline = !!!this.config.app.autoOnline
      this.views.map(view => view.setAutoOnlineReward(this.config.app.autoOnline))
    })

    this.eventEmitter.on(AUTO_EXPAND_PACKAGE, () => {
      this.config.app.autoExpandBag = !!!this.config.app.autoExpandBag
      this.views.map(view => view.setAutoExpandBag(this.config.app.autoExpandBag))
    })

    this.eventEmitter.on(OPTION_OFFLINE_RATE3, () => {
      this.config.app.rate3 = !!!this.config.app.rate3
      this.views.map(view => view.setOfflineExpRate3(this.config.app.rate3))
    })

    this.eventEmitter.on(OPTION_SELL_BUILD_MATERIAL, () => {
      this.config.app.sell_buildMaterial = !!!this.config.app.sell_buildMaterial
      this.views.map(view => view.setSellBuildMaterial(this.config.app.sell_buildMaterial))
    })

    this.eventEmitter.on(OPTION_SELL_RARE_EQUIP, () => {
      this.config.app.sell_RareEquip = !!!this.config.app.sell_RareEquip
      this.views.map(view => view.setSellRareEquip(this.config.app.sell_RareEquip))
    })

    this.eventEmitter.on(OPTION_USE_REPAIR_ROLL, () => {
      this.config.app.repairRoll = !!!this.config.app.repairRoll
      this.views.map(view => view.setUseRepairRoll(this.config.app.repairRoll))
    })

    this.eventEmitter.on(REFRESH_MONSTER, () => {
      this.oneKeyRefreshMonster = this.oneKeyRefreshMonster
      this.views.map(view => view.setAutoRefreshMonster(this.oneKeyRefreshMonster))
    })

    this.eventEmitter.on(CHANGE_WINDOW_MODE, (mode: 'merge' | 'split') => {
      this.config.app.mode = mode ?? 'merge'
      switch (this.config.app.mode) {
        case 'merge':
          this.initialMerge()
          break
        case 'split':
          this.initialSplit()
          break
      }
    })

    this.eventEmitter.on(ADD_ACCOUNT, () => {
      this.createView(VERSION_MAP[this.config.version].url ||
        "https://m.tianyuyou.cn/index/h5game_jump.html?tianyuyou_agent_id=10114&game_id=66953");
      this.eventEmitter.emit(CHANGE_WINDOW_MODE, this.config.app.mode)
    })
  }

  private registerIPCListener() {
    ipcMain.handle(IPC_MAIN.INVOKE_VERSION_INFO, () => {
      return VERSION_MAP[this.config.version];
    });

    ipcMain.on(IPC_MAIN.SETUP_FUNCTION_ENDED, async (e) => {
      // 该 BrowserView 的功能初始化完毕
      const view = this.getViewById(e.sender.id);
      view?.changeState(GameViewState.INITIALIZED);

      for (let index = 0; index < this.views.length; index++) {
        const v = this.views[index];
        const url = await v.getVersionURL();

        if (index < this.config.accounts.length) {
          this.config.accounts[index].url =
            url || VERSION_MAP[this.config.version].url;
        } else {
          this.configuration.configuration.accounts.push({
            url: url || VERSION_MAP[this.config.version].url,
          });
        }
      }

      if (this.views.length > 0)
        this.config.oaccounts = await this.views[0].getAccounts();
    });

    ipcMain.on(IPC_MAIN.GAME_WILL_READY, (e, url: string) => {
      const view = this.getViewById(e.sender.id);

      setTimeout(() => {
        view?.loadURL(url);
      }, 1000);
    });

    ipcMain.on(IPC_MAIN.RELOAD, (e) => {
      const view = this.getViewById(e.sender.id);

      view?.reload();
    });

    ipcMain.on(IPC_MAIN.EXECUTE_OTHER, (e, command: string, ...args: any[]) => {
      this.views
        .filter((v) => v.id !== e.sender.id)
        .map((view) => view.executeCommand(command, ...args));
    });

    ipcMain.on(IPC_MAIN.RECEIVE_CHAT_MSG, (e) => {
      const view = this.getViewById(e.sender.id);

      const desktopPath = app.getPath("desktop");

      const chatTextPath = path.join(desktopPath, "chat.txt");

      if (existsSync(chatTextPath)) {
        const chatText = readFileSync(chatTextPath, "utf8");

        view?.send(IPC_MAIN.RECEIVE_CHAT_MSG, chatText);
      } else {
        view?.send(IPC_MAIN.RECEIVE_CHAT_MSG, "");
        writeFileSync(chatTextPath, "", { flag: "w+" });
      }
    });

    // 监听鼠标滚轮
    ipcMain.on(
      IPC_MAIN.MOUSE_WHEEL,
      debounce((_e: any, d: number) => {
        if (d > 0) {
          this.setTopView(this.active_view + 1);
        }

        if (d < 0) {
          this.setTopView(this.active_view - 1);
        }
      }, 100)
    );
  }
}