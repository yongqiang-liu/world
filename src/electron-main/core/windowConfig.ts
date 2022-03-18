import {
  app,
  BrowserViewConstructorOptions,
  BrowserWindowConstructorOptions,
} from "electron";
import { resolvePreloadPath } from "./paths";

export const GameViewConfig: BrowserViewConstructorOptions = {
  webPreferences: {
    safeDialogs: true,
    nativeWindowOpen: false,
    nodeIntegration: false,
    nodeIntegrationInWorker: false,
    nodeIntegrationInSubFrames: false,
    backgroundThrottling: false,
    webviewTag: false,
    contextIsolation: false,
    spellcheck: false,
    enableWebSQL: false,
    devTools: !app.isPackaged,
    webSecurity: false,
    preload: resolvePreloadPath("preload.js"),
  },
};

export const MainWidowConfiguration: BrowserWindowConstructorOptions = {
  title: "世界H5",
  width: 600,
  height: 800,
  webPreferences: {
    safeDialogs: true,
    nativeWindowOpen: false,
    nodeIntegration: false,
    nodeIntegrationInWorker: false,
    nodeIntegrationInSubFrames: false,
    backgroundThrottling: true,
    webviewTag: false,
    contextIsolation: false,
    spellcheck: false,
    enableWebSQL: false,
    devTools: false,
    webSecurity: false,
  },
  show: true,
  transparent: true,
  autoHideMenuBar: false,
};
