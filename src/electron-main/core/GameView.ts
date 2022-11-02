import type { Account, IRawBattleConfiguration } from 'common/configuration'
import { IPC_MAIN, IPC_RENDERER } from 'common/ipcEventConst'
import type { SellOptions } from 'common/sell'
import { BrowserView, app, ipcMain, session } from 'electron'
import { GameCommander } from './GameCommander'
import { GameViewConfig } from './windowConfig'

export const enum GameViewState {
  UNINITIALIZED = 'uninitialized',
  INITIALIZED = 'initialized',
}

export default class GameView extends GameCommander {
  private _view: BrowserView
  private _state: GameViewState = GameViewState.UNINITIALIZED
  private _oneKeyDailyMission = false
  private _repairEquip = false
  private _sellProduct = false
  private _refreshMonster = false
  private _onlineReward = false
  private _expandBag = false
  private _escort = false
  private _useRepairRoll = false
  private _sellOptions: SellOptions
  private setOptionLock = false
  private _offlineExpRate3 = false
  private _autoSkyArena = false

  constructor(
    private bounds: Electron.Rectangle,
    black: Array<string>,
    white: Array<string>,
    equipWhite: Array<string>,
  ) {
    const view = new BrowserView(GameViewConfig)
    super(view.webContents)
    this._view = view
    session.defaultSession.clearStorageData()
    this._view.webContents.setBackgroundThrottling(false)
    this._view.webContents.incrementCapturerCount(undefined, false, true)
    this._sellOptions = {
      buildMaterial: false,
      rareEquip: false,
      black,
      white,
      equipWhite,
    }

    this._view.setBackgroundColor('#3C3F41')
    this.initialize()
  }

  async openDevTools() {
    await this.whenInitialized()

    this.webContents.openDevTools()
  }

  initialize() {
    this._view.setBounds(this.bounds)
    this._view.setAutoResize({
      width: true,
      height: true,
      vertical: true,
      horizontal: true,
    })

    this.webContents.addListener('did-finish-load', async () => {
      this.setSellOption(this._sellOptions)
    })

    this.webContents.addListener('did-fail-load', () => {
      this.reload()
    })
  }

  whenInitialized() {
    return new Promise<void>((resolve) => {
      if (this._state === GameViewState.INITIALIZED)
        resolve()

      const t = setInterval(() => {
        if (this._state === GameViewState.INITIALIZED) {
          resolve()
          clearInterval(t)
        }
      }, 200)
    })
  }

  changeState(state: GameViewState) {
    this._state = state
  }

  async battle(config: IRawBattleConfiguration) {
    await this.whenInitialized()

    this.send(IPC_RENDERER.THOUSAND_BATTLE, config)
  }

  // 自动日常
  async setOneKeyDailyMission(v: boolean) {
    await this.whenInitialized()

    this._oneKeyDailyMission = v
    this.send(IPC_RENDERER.AUTO_ONE_DAILY_MISSION, this._oneKeyDailyMission)
  }

  // 自动修理
  async setAutoRepairEquip(v: boolean) {
    await this.whenInitialized()

    this._repairEquip = v
    this.send(IPC_RENDERER.AUTO_REPAIR_EQUIP, this._repairEquip)
  }

  // 自动天空竞技场
  async setAutoSkyArena(v: boolean) {
    await this.whenInitialized()

    this._autoSkyArena = v
    this.send(IPC_RENDERER.AUTO_SKY_ARENA, this._autoSkyArena)
  }

  // 自动出售
  async setAutoSellProduct(v: boolean) {
    await this.whenInitialized()

    this._sellProduct = v
    this.send(IPC_RENDERER.AUTO_ONE_DAILY_SELL, this._sellProduct)
  }

  // 自动刷怪
  async setAutoRefreshMonster(v: boolean) {
    await this.whenInitialized()

    this._refreshMonster = v
    this.send(IPC_RENDERER.AUTO_REFRESH_MONSTER, this._refreshMonster)
  }

  // 自动领取在线奖励
  async setAutoOnlineReward(v: boolean) {
    await this.whenInitialized()

    this._onlineReward = v
    this.send(IPC_RENDERER.AUTO_ONLINE_REWARD, this._onlineReward)
  }

  // 自动扩充背包
  async setAutoExpandBag(v: boolean) {
    await this.whenInitialized()

    this._expandBag = v
    this.send(IPC_RENDERER.AUTO_EXPAND_BAG, this._expandBag)
  }

  // 使用修理卷修理
  async setUseRepairRoll(v: boolean) {
    await this.whenInitialized()

    this._useRepairRoll = v
    this.send(IPC_RENDERER.SET_USE_REPAIR_ROLL, this._useRepairRoll)
  }

  async setOfflineExpRate3(v: boolean) {
    await this.whenInitialized()

    this._offlineExpRate3 = v
    this.send(IPC_RENDERER.SET_OFFLINE_EXP_RATE3, this._offlineExpRate3)
  }

  // 发送消息
  async setAutoChat(v: boolean) {
    await this.whenInitialized()

    this.send(IPC_RENDERER.AUTO_CHAT_MSG, v)
  }

  // 自动护送任务
  async setAutoEscort(v: boolean) {
    await this.whenInitialized()
    this._escort = v
    this.send(IPC_RENDERER.AUTO_ESCORT, this._escort)
  }

  // 自动护送任务
  async setSkipBattleAnime(v: boolean) {
    await this.whenInitialized()

    this.send(IPC_RENDERER.AUTO_SKIP_BATTLE_ANIM, v)
  }

  // 出售建筑道具
  async setSellBuildMaterial(v: boolean) {
    this.setSellOption({
      ...this._sellOptions,
      buildMaterial: v,
    })
  }

  // 出售稀有装备
  async setSellRareEquip(v: boolean) {
    this.setSellOption({
      ...this._sellOptions,
      rareEquip: v,
    })
  }

  private async setSellOption(options: SellOptions) {
    this._sellOptions = options

    if (this.setOptionLock)
      return

    this.setOptionLock = true
    await this.whenInitialized()

    this.send(
      IPC_RENDERER.SET_SELL_OPTIONS,
      JSON.parse(JSON.stringify(this._sellOptions)),
    )
    this.setOptionLock = false
  }

  // 开启日常箱子
  async openDailyBox() {
    await this.whenInitialized()
    this.send(IPC_RENDERER.OPEN_DAILY_BOX)
  }

  // 修理装备
  async repairEquip() {
    await this.whenInitialized()
    this.send(IPC_RENDERER.REPAIR_EQUIP)
  }

  // 出售垃圾
  async sellProduct() {
    await this.whenInitialized()
    this.send(IPC_RENDERER.SELL_PRODUCT)
  }

  // 领取微端奖励
  async microReward() {
    await this.whenInitialized()
    this.send(IPC_RENDERER.MICRO_REWARD)
  }

  //
  getRefreshMonster() {
    return this._refreshMonster
  }

  getAutoDaily() {
    return this._oneKeyDailyMission
  }

  getAccounts(): Promise<Account[]> {
    return new Promise((resolve) => {
      ipcMain.once(IPC_MAIN.RECEIVE_ACCOUNTS, (_e, accounts) => {
        resolve(accounts)
      })

      this.send(IPC_RENDERER.GET_ACCOUNTS)
    })
  }

  getVersionURL(): Promise<string> {
    return new Promise((resolve) => {
      ipcMain.once(IPC_MAIN.RECEIVE_VERSION_URL, (_e, url: string) => {
        resolve(url)
      })

      this.send(IPC_RENDERER.GET_VERSION_URL)
    })
  }

  getGameStarted() {
    return this._state === GameViewState.INITIALIZED
  }

  async executeJavaScript(code: string) {
    try {
      return await this.webContents.executeJavaScript(
        `((window) => {${code}})(window)`,
        true,
      )
    }
    catch (err) {
      if (err && !app.isPackaged)
        console.error(err)
    }
  }

  reload() {
    this.changeState(GameViewState.UNINITIALIZED)
    this._oneKeyDailyMission = false
    this._autoSkyArena = false
    this.webContents.reloadIgnoringCache()
  }

  jumpLogin() {
    this.changeState(GameViewState.UNINITIALIZED)
  }

  get view() {
    return this._view
  }

  get id() {
    return this._view.webContents.id
  }

  send(channel: string, ...args: any[]) {
    this._view.webContents.send(channel, ...args)
  }

  async executeCommand(command: string, ...args: any[]) {
    this.send(command, ...args)
  }

  loadURL(url: string, options?: Electron.LoadURLOptions) {
    return this._view.webContents.loadURL(url, options)
  }

  loadFile(filePath: string, options?: Electron.LoadFileOptions) {
    return this._view.webContents.loadFile(filePath, options)
  }

  setMute(value: boolean) {
    this._view.webContents.setAudioMuted(value)
  }

  get mute() {
    return this._view.webContents.audioMuted
  }

  destroy() {
    this._view.webContents.removeAllListeners('did-finish-load')
    this._view.webContents.removeAllListeners('did-fail-load')
    // @ts-expect-error type ok
    this._view = null
  }
}
