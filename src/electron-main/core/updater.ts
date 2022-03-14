import { dialog, nativeImage } from "electron";
import { autoUpdater, ProgressInfo, UpdateInfo } from "electron-updater";
import { resolveAssets } from "./paths";
import MainWidow from "./windows";

export const enum UPDATER_EVENT {
  CHECKING_FOR_UPDATE = "checking-for-update",
  UPDATE_AVAILABLE = "update-available",
  UPDATE_NOT_AVAILABLE = "update-not-available",
  DOWNLOAD_PROGRESS = "download-progress",
  UPDATE_DOWNLOADED = "update-downloaded",
  ERROR = "error",
}

export default class AutoUpdater {
  constructor(window: MainWidow) {
    autoUpdater.on(UPDATER_EVENT.CHECKING_FOR_UPDATE, () => {
      console.log("检查更新中...");
    });

    autoUpdater.on(UPDATER_EVENT.UPDATE_AVAILABLE, (info: UpdateInfo) => {
      console.log("有更新可用...", info);
      autoUpdater.downloadUpdate();
    });

    autoUpdater.on(UPDATER_EVENT.UPDATE_NOT_AVAILABLE, (info: UpdateInfo) => {
      console.log("无更新可用...", info);
    });

    autoUpdater.on(UPDATER_EVENT.ERROR, (err: Error) => {
      console.log("更新遇到错误...", err);
    });

    autoUpdater.on(
      UPDATER_EVENT.DOWNLOAD_PROGRESS,
      (progressObj: ProgressInfo) => {
        let log_message = "Download speed: " + progressObj.bytesPerSecond;
        log_message =
          log_message + " - Downloaded " + progressObj.percent + "%";
        log_message =
          log_message +
          " (" +
          progressObj.transferred +
          "/" +
          progressObj.total +
          ")";

        console.log(log_message);
      }
    );

    autoUpdater.on(UPDATER_EVENT.UPDATE_DOWNLOADED, (info: UpdateInfo) => {
      console.log("下载更新完成...", info);
      dialog
        .showMessageBox(window, {
          title: "世界OL脚本更新",
          message: "新版本已下载完成...",
          type: "none",
          icon: nativeImage.createFromPath(resolveAssets("icons/win/icon.ico")),
          buttons: ["立即退出并更新", "退出时自动更新"],
        })
        .then((v) => {
          if (v.response === 0) {
            autoUpdater.quitAndInstall();
          }
          if (v.response === 1) {
            autoUpdater.autoInstallOnAppQuit = true;
          }
        })
        .catch((err) => console.error(err));
    });
  }

  checkUpdate() {
    autoUpdater.checkForUpdatesAndNotify();
  }
}
