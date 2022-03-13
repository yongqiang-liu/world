import { delay } from "common/functional";
import { IPCM } from "common/ipcEventConst";
import { ipcRenderer } from "electron";

export function gameStarted() {
  if (!window.xself) {
    return false;
  }

  return true;
}

export function checkGameStart() {
  if (!window.location.href.includes("worldh5")) {
    const t = setInterval(async () => {
      const version = await ipcRenderer.invoke(IPCM.INVOKE_VERSION_INFO);

      if (version.name == "天宇") {
        const wrapIframe = <HTMLIFrameElement>(
          document.getElementById("iframe_cen")
        );

        if (wrapIframe && wrapIframe.src) {
          const doc = wrapIframe.contentDocument;

          const cpgame = doc?.getElementById("cpgame");

          if (!cpgame) {
            return;
          }

          const iframe = cpgame.getElementsByTagName("iframe")[0];
          if (iframe && iframe.src.includes("worldh5")) {
            ipcRenderer.send(IPCM.GAME_WILL_READY, `${iframe.src}`);
            clearInterval(t);
          }
        }
      } else if (version.name == "小七") {
        const game = <HTMLIFrameElement>document.getElementById("frameGame");

        if (game) {
          if (game && game.src.includes("worldh5")) {
            ipcRenderer.send(IPCM.GAME_WILL_READY, `${game.src}`);
            clearInterval(t);
          }
        }
      }
    }, 500);
  }
}

/**
 *  @description 进入游戏并选择角色时触发
 */
export function whenGameStarted() {
  return new Promise<void>((resolve) => {
    const t = setInterval(() => {
      if (gameStarted()) {
        console.log("点击进入游戏按钮");
        clearInterval(t);
        resolve();
      }
    }, 200);
  });
}

/**
 * @description 这个函数用于当游戏页面出现时, 但 xself 的变量未初始化时, 用于 Hook 游戏
 */
export function whenGameWillReady() {
  return new Promise<void>((resolve) => {
    const t = setInterval(() => {
      if (window.xself === null) {
        console.log("进入 -> 进入游戏界面...");
        clearInterval(t);
        resolve();
      }
    }, 50);
  });
}

export function transformFilter(filter: (string | RegExp)[]) {
  return filter.map((v) => {
    try {
      if (typeof v === "string" && (v.includes("$") || v.includes("."))) {
        return new RegExp(v);
      }
    } catch (error) {}

    return v;
  });
}

export async function openDailyBox() {
  for (let n = window.PlayerBag.BAG_START; n <= window.xself.bag.bagEnd; n++) {
    var i = window.xself.bag.store[n];
    if (i == null) continue;

    if (
      ((i.name.includes("月牙山") ||
        i.name.includes("封印古墓") ||
        i.name.includes("精灵森林") ||
        i.name.includes("汉王古墓") ||
        i.name.includes("绝望冰原") ||
        i.name.includes("失魂沙漠")) &&
        i.name.includes("奖励")) ||
      (i.name.includes("级") &&
        i.name.includes("盒") &&
        i.info.includes("有机会") &&
        i.info.includes("装备"))
    ) {
      if (window.xself.bag.countFreePos() < 4) {
        // 检测当前背包容量
        window.autoSell?.ai_sell();
        await delay(2000);
        if (window.xself.bag.countFreePos() < 4) {
          // 中断开箱
          break;
        }
      }

      for (let j = 0; j < i.quantity; j++) {
        window?.ItemManager.doItem(i);
        await delay(2000);
      }

      await openDailyBox();
    }
  }

  return;
}
