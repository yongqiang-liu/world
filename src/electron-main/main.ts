import { app, Tray, Menu, session, protocol } from "electron";
import fs from "fs";
import Configuration from "./core/Configuration";
import MainWidow from "./core/windows";
import { resolveConfiguration, resolveAssets } from "./core/paths";
import ExceptionHandler from "./core/ExceptionHandler";

let mainWindow: Electron.BrowserWindow, tray: Electron.Tray;

function createWindow() {
  mainWindow = new MainWidow(
    new Configuration(resolveConfiguration("config.json"))
  );
}

function setupProtocol() {
  protocol.registerBufferProtocol("world", (_, cb) => {
    if (fs.existsSync(resolveAssets("world.js"))) {
      const world = fs.readFileSync(resolveAssets("world.js"));
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
    } else {
      cb({});
    }
  });
}

function setupTray() {
  tray = new Tray(resolveAssets("icons/win/icon.ico"));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "退出",
      type: "normal",
      click: () => {
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

function requsetSingleLock() {
  
}

app
  .whenReady()
  .then(requsetSingleLock)
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
