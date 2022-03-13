import { IPCM } from "common/ipcEventConst";
import { ipcRenderer } from "electron";
import { EventEmitter } from "events";
import { setupEvent } from "./events";
import {
  checkGameStart,
  whenGameStarted,
  whenGameWillReady,
} from "./gameFunctional";
import { setupHooks } from "./hooks";
import { setupFunction } from "./ipcEvent";

ipcRenderer.setMaxListeners(30);
window.__myEvent__ = new EventEmitter({ captureRejections: true });
window.__myEvent__.setMaxListeners(30);

window.addEventListener("load", async () => {
  checkGameStart();

  document.addEventListener("wheel", (e) => {
    ipcRenderer.send(IPCM.MOUSE_WHEEL, e.deltaY);
  });

  await whenGameWillReady();

  setupHooks();

  await whenGameStarted();

  setupEvent();

  setupFunction();
});
