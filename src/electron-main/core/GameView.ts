import { Account } from "common/configuration";
import { IPCM, IPCR } from "common/ipcEventConst";
import { SellOptions } from "common/Sell";
import { BrowserView, app, ipcMain, session } from "electron";
import { GameViewConfig } from "./windowConfig";

export const enum GameViewState {
  UNINITALIZE = "uninitalize",
  INITALIZED = "initalized",
}

export default class GameView {
  private readonly _view = new BrowserView(GameViewConfig);

  private _state: GameViewState = GameViewState.UNINITALIZE;

  private _oneKeyDailyMission = false;

  private _repairEquip = false;

  private _sellProduct = false;

  private _refreshMonster = false;

  private _onlineReward = false;

  private _expandBag = false;

  private _escort = false;

  private _useRepairRoll = false;

  private _sellOptions: SellOptions;

  private setOptionLock = false;

  constructor(
    private bounds: Electron.Rectangle,
    black: Array<string>,
    white: Array<string>,
    equipWhite: Array<string>
  ) {
    session.defaultSession.clearStorageData();

    this._sellOptions = {
      buildMaterial: false,
      rareEquip: false,
      black,
      white,
      equipWhite,
    };

    if (!app.isPackaged) this.openDevTools();

    this._view.setBackgroundColor("#3C3F41");
    this.initialize();
  }

  async openDevTools() {
    await this.whenInitalized();

    this.webContents.openDevTools();
  }

  initialize() {
    this._view.setBounds(this.bounds);
    this._view.setAutoResize({
      width: true,
      height: true,
      vertical: true,
      horizontal: true,
    });

    this.executeJavaScript(`
      //  通过 Proxy 对 Proxy 本身做代理，然后赋值给 Proxy
      window.Proxy = new window.Proxy(Proxy, {
        //拦截 new 操作符，生成 Proxy 实例的时候来拦截
        construct: function (target, argumentsList) {
          //result是new Proxy()生成的原本的实例
          const result = new target(...argumentsList);
          //获取原本实例reslut的类型
          const originToStringTag = Object.prototype.toString.call(result).slice(1,-1).split(' ')[1]
          //改写result的[Symbol.toStringTag]属性，加上被代理的标志
          result[Symbol.toStringTag] = 'Proxy-' + originToStringTag;
          return result;
        },
      });
    `);

    this.webContents.addListener("did-finish-load", async () => {
      this.setSellOption(this._sellOptions);
    });

    this.webContents.addListener("did-fail-load", () => {
      this.reload();
    });
  }

  whenInitalized() {
    return new Promise<void>((resolve) => {
      if (this._state === GameViewState.INITALIZED) resolve();

      const t = setInterval(() => {
        if (this._state === GameViewState.INITALIZED) {
          resolve();
          clearInterval(t);
        }
      }, 200);
    });
  }

  changeState(state: GameViewState) {
    this._state = state;
  }

  async forbiddenCity() {
    await this.whenInitalized();

    this.send(IPCR.THOUSANDBATTLE, 1);
  }

  async podi() {
    await this.whenInitalized();

    this.send(IPCR.THOUSANDBATTLE, 2);
  }

  async topOne() {
    await this.whenInitalized();

    this.send(IPCR.THOUSANDBATTLE, 3);
  }

  // 自动日常
  async setOneKeyDailyMission(v: boolean) {
    await this.whenInitalized();

    this._oneKeyDailyMission = v;
    this.send(IPCR.AUTO_ONE_DAILY_MISSION, this._oneKeyDailyMission);
  }

  // 自动修理
  async setRepairEquip(v: boolean) {
    await this.whenInitalized();

    this._repairEquip = v;
    this.send(IPCR.AUTO_REPAIR_EQUIP, this._repairEquip);
  }

  // 自动出售
  async setSellProduct(v: boolean) {
    await this.whenInitalized();

    this._sellProduct = v;
    this.send(IPCR.AUTO_ONE_DAILY_SELL, this._sellProduct);
  }

  // 自动刷怪
  async setRefreshMonster(v: boolean) {
    await this.whenInitalized();

    this._refreshMonster = v;
    this.send(IPCR.AUTO_REFRESH_MONSTER, this._refreshMonster);
  }

  // 自动领取在线奖励
  async setOnlineReward(v: boolean) {
    await this.whenInitalized();

    this._onlineReward = v;
    this.send(IPCR.AUTO_ONLINE_REWARD, this._onlineReward);
  }

  // 自动扩充背包
  async setExpandBag(v: boolean) {
    await this.whenInitalized();

    this._expandBag = v;
    this.send(IPCR.AUTO_EXPAND_BAG, this._expandBag);
  }

  // 使用修理卷修理
  async setUseRepairRoll(v: boolean) {
    await this.whenInitalized();

    this._useRepairRoll = v;
    this.send(IPCR.SET_USE_REPAIR_ROLL, this._useRepairRoll);
  }

  // 发送消息
  async setAutoChat(v: boolean) {
    await this.whenInitalized();

    this.send(IPCR.AUTO_CHAT_MSG, v);
  }

  // 自动护送任务
  async setAutoEscort(v: boolean) {
    await this.whenInitalized();
    this._escort = v;
    this.send(IPCR.AUTO_ESCORT, this._escort);
  }

  // 自动护送任务
  async setSkipBattleAnime(v: boolean) {
    await this.whenInitalized();

    this.send(IPCR.AUTO_SKIP_BATTLE_ANIM, v);
  }

  // 自动无双
  async startWushuangEscort() {
    this.send(IPCR.WUSHUANG_START);
  }

  // 出售建筑道具
  async setSellBuildMaterial(v: boolean) {
    this.setSellOption({
      ...this._sellOptions,
      buildMaterial: v,
    });
  }

  // 出售稀有装备
  async setSellRareEquip(v: boolean) {
    this.setSellOption({
      ...this._sellOptions,
      rareEquip: v,
    });
  }

  private async setSellOption(options: SellOptions) {
    this._sellOptions = options;

    if (this.setOptionLock) return;

    this.setOptionLock = true;
    await this.whenInitalized();

    this.send(
      IPCR.SET_SELL_OPTIONS,
      JSON.parse(JSON.stringify(this._sellOptions))
    );
    this.setOptionLock = false;
  }

  // 开启日常箱子
  async openDailyBox() {
    await this.whenInitalized();
    this.send(IPCR.OPEN_DAILY_BOX);
  }

  // 修理装备
  async repairEquip() {
    await this.whenInitalized();
    this.send(IPCR.REPAIR_EQUIP);
  }

  // 出售垃圾
  async sellProduct() {
    await this.whenInitalized();
    this.send(IPCR.SELL_PRODUCT);
  }

  // 领取微端奖励
  async microReward() {
    await this.whenInitalized();
    this.send(IPCR.MICRO_REWARD);
  }

  //
  getRefreshMonster() {
    return this._refreshMonster;
  }

  getAutoDaily() {
    return this._oneKeyDailyMission;
  }

  getAccounts(): Promise<Account[]> {
    return new Promise((resolve) => {
      ipcMain.once(IPCM.RECEIVE_ACCOUNTS, (_e, accounts) => {
        resolve(accounts);
      });

      this.send(IPCR.GET_ACCOUNTS);
    });
  }

  getVersionURL(): Promise<string> {
    return new Promise((resolve) => {
      ipcMain.once(IPCM.RECEIVE_VERSION_URL, (_e, url: string) => {
        resolve(url);
      });

      this.send(IPCR.GET_VERSION_URL);
    });
  }

  getGameStarted() {
    return this._state === GameViewState.INITALIZED;
  }

  async executeJavaScript(code: string) {
    try {
      return await this.webContents.executeJavaScript(
        `((window) => {${code}})(window)`,
        true
      );
    } catch (err) {
      if (err && !app.isPackaged) {
        console.error(err);
      }
    }
  }

  reload() {
    this.changeState(GameViewState.UNINITALIZE);
    this.webContents.reloadIgnoringCache();
  }

  jumpLogin() {
    this.changeState(GameViewState.UNINITALIZE);
  }

  get webContents() {
    return this._view.webContents;
  }

  get view() {
    return this._view;
  }

  get id() {
    return this._view.webContents.id;
  }

  send(channel: string, ...args: any[]) {
    this._view.webContents.send(channel, ...args);
  }

  async executeCommand(command: string, ...args: any[]) {
    this.send(command, ...args);
  }

  loadURL(url: string, options?: Electron.LoadURLOptions) {
    return this._view.webContents.loadURL(url, options);
  }

  loadFile(filePath: string, options?: Electron.LoadFileOptions) {
    return this._view.webContents.loadFile(filePath, options);
  }

  setMute(value: boolean) {
    this._view.webContents.setAudioMuted(value);
  }

  get mute() {
    return this._view.webContents.audioMuted;
  }

  destroy() {
    this._view.webContents.removeAllListeners("did-finish-load");
    this._view.webContents.removeAllListeners("did-fail-load");
  }
}
