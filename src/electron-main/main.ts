import { app, Tray, Menu, session, protocol } from "electron";
import fs from "fs";
import Configuration from "./core/Configuration";
import { resolveConfiguration, resolveAssets } from "./core/paths";
import ExceptionHandler from "./core/ExceptionHandler";
import { ApplicationWindow } from "./core/window";

let mainWindow: Electron.BrowserWindow, tray: Electron.Tray;

function createWindow() {
  mainWindow = new ApplicationWindow(
    new Configuration(resolveConfiguration("config.json"))
  );
}

function setupProtocol() {
  protocol.registerBufferProtocol("world", (_, cb) => {
    if (fs.existsSync(resolveAssets(_.url.slice(7)))) {
      const world = fs.readFileSync(resolveAssets(_.url.slice(7)));
      cb({
        headers: {
          "Content-Type": '"application/javascript"',
        },
        mimeType: "application/javascript",
        data: world,
      });
    }
  });

  session.defaultSession.webRequest.onBeforeRequest((details, cb) => {
    if (
      /https?:\/\/worldh5\.gamehz\.cn\/version\/world\/publish\/channel\/res\/gamecode\.js*/.test(
        details.url
      )
    ) {
      cb({
        cancel: false,
        redirectURL: "world://world.js",
      });
    } else if (/https?:\/\/worldh5\.gamehz\.cn\/version\/world\/publish\/channel\/res\/egretlib\.js*/.test(details.url)) {
      cb({
        cancel: false,
        redirectURL: "world://egretlib.js",
      });
    } else {
      cb({});
    }
  });
}

function setupTray() {
  tray = new Tray(resolveAssets("icons/win/icon.ico"));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '隐藏',
      type: 'normal',
      click: () => {
        mainWindow.hide()
      }
    },
    {
      label: "退出",
      type: "normal",
      click: () => {
        mainWindow.close()
        app.quit();
      },
    },
  ]);

  tray.setToolTip("世界OL");
  tray.setContextMenu(contextMenu);

  tray.on("double-click", () => {
    mainWindow.show();
  });
}

function requestSingleLock() {
  
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
      applicationName: "世界H5日常任务处理器",
      applicationVersion: app.getVersion(),
      copyright: "Copyright © 2022 Seven",
      iconPath: resolveAssets("icons/win/icon.ico"),
    });
  });

app.on("window-all-closed", function () {
  app.quit();
});
