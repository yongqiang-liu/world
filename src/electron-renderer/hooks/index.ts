import { IPCM } from "common/ipcEventConst";
import { ipcRenderer } from "electron";
import ExpandBagTool from "./tools/AutoExpandBag";
import AutoOnlineReward from "./tools/AutoOnlineReward";
import AutoRepairEquip from "./tools/AutoRepairEquip";
import AutoSell from "./tools/AutoSell";
import DefaultFunction from "./tools/Default";
import setupFunction from "./setupFunction";
import setupGameHook from "./setupGameHook";
import TestRefreshGame from "./tools/TestRefreshGame";
import EscortMissionController from "./escortTool/escortMissionController";

export function setupHooks() {
  ipcRenderer.send(IPCM.GAME_HOOK_STARTED);

  setupGameHook();

  setupFunction();

  window.defaultFunction = new DefaultFunction();
  window.defaultFunction.start();
  window.expandBagTool = new ExpandBagTool();
  window.testRefreshGame = new TestRefreshGame();
  window.autoOnlineReward = new AutoOnlineReward();
  window.autoRepairEquip = new AutoRepairEquip();
  window.autoSell = new AutoSell();
  window.autoEscortTools = new EscortMissionController();

  ipcRenderer.send(IPCM.GAME_HOOK_ENDED);
}
