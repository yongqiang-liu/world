import fs from 'fs'
import { Menu, Tray, app, protocol, session } from 'electron'
import Configuration from './core/Configuration'
import { resolveAssets, resolveConfiguration } from './core/paths'
import ExceptionHandler from './core/ExceptionHandler'
import { ApplicationWindow } from './core/window'

app.commandLine.appendSwitch('--disable-renderer-backgrounding')
app.commandLine.appendSwitch('--force_high_performance_gpu')

let mainWindow: Electron.BrowserWindow, tray: Electron.Tray

function createWindow() {
  mainWindow = new ApplicationWindow(
    new Configuration(resolveConfiguration('config.json')),
  )
}

function setupProtocol() {
  protocol.registerBufferProtocol('world', (_, cb) => {
    if (fs.existsSync(resolveAssets(_.url.slice(7)))) {
      const world = fs.readFileSync(resolveAssets(_.url.slice(7)))
      cb({
        headers: {
          'Content-Type': '"application/javascript"',
        },
        mimeType: 'application/javascript',
        data: world,
      })
    }
  })

  session.defaultSession.webRequest.onBeforeRequest((details, cb) => {
    if (
      /https?:\/\/worldh5\.gamehz\.cn\/version\/world\/publish\/channel\/res\/gamecode\.js*/.test(
        details.url,
      )
    ) {
      cb({
        cancel: false,
        redirectURL: 'world://world.js',
      })
    }
    else if (/https?:\/\/worldh5\.gamehz\.cn\/version\/world\/publish\/channel\/res\/egretlib\.js*/.test(details.url)) {
      cb({
        cancel: false,
        redirectURL: 'world://egretlib.js',
      })
    }
    else {
      cb({})
    }
  })
}

function setupTray() {
  tray = new Tray(resolveAssets('icons/win/icon.ico'))

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '退出应用',
      type: 'normal',
      click: () => {
        mainWindow.close()
        app.quit()
      },
    },
  ])

  tray.setToolTip('世界OL')
  tray.setContextMenu(contextMenu)

  tray.on('double-click', () => {
    mainWindow.show()
  })
}

function requestSingleLock() {
  const isSecond = app.requestSingleInstanceLock()

  if (!isSecond)
    app.quit()

  app.on('second-instance', () => {
    mainWindow?.show()
  })
}

app
  .whenReady()
  .then(requestSingleLock)
  .then(setupProtocol)
  .then(createWindow)
  .then(setupTray)
  .then(() => new ExceptionHandler())
  .then(() => {
    app.setAboutPanelOptions({
      applicationName: '世界H5日常任务处理器',
      applicationVersion: app.getVersion(),
      copyright: 'Copyright © 2022 Seven',
      iconPath: resolveAssets('icons/win/icon.ico'),
    })
  })

app.on('window-all-closed', () => {
  app.quit()
})
