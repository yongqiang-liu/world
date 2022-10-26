import type {
  BrowserViewConstructorOptions,
  BrowserWindowConstructorOptions,
} from 'electron'
import { resolvePreloadPath } from './paths'

export const TITLE_BAR_HEIGHT = 56

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
    // devTools: !app.isPackaged,
    webSecurity: false,
    preload: resolvePreloadPath('preload.js'),
  },
}

export const MainWidowConfiguration: BrowserWindowConstructorOptions = {
  title: '世界H5',
  width: 480,
  height: 700 + TITLE_BAR_HEIGHT,
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
    devTools: false,
    webSecurity: false,
  },
  show: true,
}
