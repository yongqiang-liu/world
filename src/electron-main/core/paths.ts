import path from 'path'
import fs from 'fs'
import { app, ipcMain } from 'electron'
import { IPC_RENDERER } from 'common/ipcEventConst'

const isPackaged = app.isPackaged

const rootPath = isPackaged
  ? path.join(process.resourcesPath)
  : path.join(__dirname, '../../..')
const assetsPath = isPackaged
  ? path.join(process.resourcesPath, 'buildResources')
  : path.join(rootPath, 'assets')
const preloadPath = isPackaged
  ? path.join(__dirname, '../renderer')
  : path.join(rootPath, 'release', 'app', 'dist', 'renderer')

export const worldH5DataPath = path.join(app.getPath('userData'), 'worldh5')
export const battleConfigurationPath = path.join(worldH5DataPath, 'battle.json5')

if (!fs.existsSync(worldH5DataPath))
  fs.mkdirSync(worldH5DataPath)

export function resolvePreloadPath(name: string) {
  return path.join(preloadPath, name)
}

export function resolveConfiguration(name: string) {
  return path.join(worldH5DataPath, name)
}

export function resolveAssets(...paths: string[]) {
  return path.join(assetsPath, ...paths)
}

export const aboutPath = isPackaged
  ? path.join(__dirname, '../../node_modules/about-window')
  : undefined

ipcMain.handle(IPC_RENDERER.INVOKE_USER_DATA_PATH, () => {
  return app.getPath('userData')
})
