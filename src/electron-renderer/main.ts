import { EventEmitter } from 'events'
import path from 'path'
import { when } from 'common/functional'
import { IPC_MAIN, IPC_RENDERER } from 'common/ipcEventConst'
import { ipcRenderer } from 'electron'
import Store from 'electron-store'
import type { RateConfiguration } from 'common/configuration'
import { setupEvent } from './events'
import { checkGameStart, whenGameStarted, whenGameWillReady } from './gameFunctional'
import { setupHooks } from './hooks'
import { setupFunction, setupUnInitializeFunction } from './ipcEvent'

ipcRenderer.setMaxListeners(30)
window.__myEvent__ = new EventEmitter()
window.__myEvent__.setMaxListeners(50)
window.__escortEmitter__ = new EventEmitter()

window.addEventListener('load', async () => {
  document.addEventListener('wheel', (e) => {
    ipcRenderer.send(IPC_MAIN.MOUSE_WHEEL, e.deltaY)
  })

  const user_data = await ipcRenderer.invoke(IPC_RENDERER.INVOKE_USER_DATA_PATH)

  window.STORE = new Store<RateConfiguration>({
    name: 'rate.controller',
    cwd: path.join(user_data, 'worldh5'),
    defaults: {
      AUTO_MISSION_RATE: 5,
      MOVE_SPEED: 12,
      BATTLE_RATE: 15,
      TICKER_RATE: 1,
    },
    migrations: {
      '2.1.2': (store) => {
        store.set('TICKER_RATE', 1)
      },
    },
    watch: true,
  })

  checkGameStart()

  ipcRenderer.on(IPC_RENDERER.SET_OFFLINE_EXP_RATE3, (_, v: boolean) => {
    window.config.offlineExpRate3 = !!v
  })

  // 自动登录
  ipcRenderer.on(IPC_RENDERER.AUTO_ENTER_GAME, async () => {
    await when(window.xworld, (xworld) => {
      return !!xworld
    })

    window.doEnterGame()
  })

  ipcRenderer.on(IPC_RENDERER.EXIT_ESCORT, () => {
    window.Escort.doEscortPostQuitMsgNoAlert()
  })

  setupUnInitializeFunction()

  await whenGameWillReady()

  setupHooks()

  await whenGameStarted()

  window.AUTO_MISSION_RATE = 1000 / window.STORE.get('AUTO_MISSION_RATE')
  window.MOVE_SPEED = window.STORE.get('MOVE_SPEED')
  window.TICKER_RATE = window.STORE.get('TICKER_RATE')

  window.STORE.onDidChange('AUTO_MISSION_RATE', v => window.AUTO_MISSION_RATE = v ?? 12)
  window.STORE.onDidChange('MOVE_SPEED', v => window.MOVE_SPEED = v ?? 12)
  window.STORE.onDidChange('TICKER_RATE', v => window.TICKER_RATE = v ?? 1)

  setupEvent()

  setupFunction()
})
