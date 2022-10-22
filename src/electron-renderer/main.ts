import { when } from "common/functional";
import { IPCM, IPCR } from "common/ipcEventConst";
import { ipcRenderer } from "electron";
import { EventEmitter } from "events";
import { setupEvent } from "./events";
import {
  checkGameStart,
  whenGameStarted,
  whenGameWillReady,
} from "./gameFunctional";
import { setupHooks } from "./hooks";
import { setupFunction, setupUnInitializeFunction } from "./ipcEvent";

ipcRenderer.setMaxListeners(30);
window.__myEvent__ = new EventEmitter();
window.__myEvent__.setMaxListeners(50);
window.__escortEmitter__ = new EventEmitter();



window.addEventListener("load", async () => {
  document.addEventListener("wheel", (e) => {
    ipcRenderer.send(IPCM.MOUSE_WHEEL, e.deltaY);
  });

  checkGameStart();

  ipcRenderer.on(IPCR.SET_OFFLINE_EXP_RATE3, (_, v: boolean) => {
    window.config.offlineExpRate3 = !!v
  })

  // 自动登录
  ipcRenderer.on(IPCR.AUTO_ENTER_GAME, async () => {
    await when(window.xworld, (xworld) => {
      return !!xworld;
    });

    window.doEnterGame();
  });

  ipcRenderer.on(IPCR.EXIT_ESCORT, () => {
    window.Escort.doEscortPostQuitMsgNoAlert();
  });

  setupUnInitializeFunction();

  await whenGameWillReady();

  setupHooks();

  await whenGameStarted();
  console.log("进入游戏并选择角色...");

  setupEvent();

  setupFunction();
});
