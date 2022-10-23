import { IPC_MAIN } from 'common/ipcEventConst'
import { ipcRenderer } from 'electron'
import ExpandBagTool from './tools/AutoExpandBag'
import AutoOnlineReward from './tools/AutoOnlineReward'
import AutoRepairEquip from './tools/AutoRepairEquip'
import AutoSell from './tools/AutoSell'
import DefaultFunction from './tools/Default'
import setupFunction from './setupFunction'
import setupGameHook from './setupGameHook'
import TestRefreshGame from './tools/TestRefreshGame'
import EscortMissionController from './escortTool/escortMissionController'
import SkipBattleAnime from './tools/SkipAnime'
import AutoChatMsg from './tools/AutoChatMsg'
import ThousandBattle from './tools/ThousandBattle'
import { AutoSkyArena } from './tools/AutoSkyArena'

export function setupHooks() {
  ipcRenderer.send(IPC_MAIN.GAME_HOOK_STARTED)

  setupGameHook()

  setupFunction()

  window.defaultFunction = new DefaultFunction()
  window.defaultFunction.start()
  window.expandBagTool = new ExpandBagTool()
  window.testRefreshGame = new TestRefreshGame()
  window.autoOnlineReward = new AutoOnlineReward()
  window.autoRepairEquip = new AutoRepairEquip()
  window.autoSell = new AutoSell()
  window.autoEscortTools = new EscortMissionController()
  window.skipBattleAnime = new SkipBattleAnime()
  window.autoChatMsg = new AutoChatMsg()
  window.thousandBattle = new ThousandBattle()
  window.autoSkyArena = new AutoSkyArena()

  ipcRenderer.send(IPC_MAIN.GAME_HOOK_ENDED)
}
