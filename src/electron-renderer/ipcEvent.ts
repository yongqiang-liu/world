import { IPCM, IPCR } from "common/ipcEventConst";
import { ipcRenderer } from "electron";
import { gameStarted, openDailyBox } from "./gameFunctional";

export function setupUnInitalizeFunction() {
  // 获取账号信息
  ipcRenderer.on(IPCR.GET_ACCOUNTS, () => {
    let accounts: string | Array<any> =
      localStorage.getItem("world-1000-1100-accountList") || "[]";
    try {
      accounts = <Array<any>>JSON.parse(accounts);
    } catch (error) {
      accounts = [];
    }

    ipcRenderer.send(IPCM.RECEIVE_ACCOUNTS, accounts);
  });

  // 获取当前版本的存号的URL
  ipcRenderer.on(IPCR.GET_VERSION_URL, async () => {
    if (window.location.href.includes("worldh5")) {
      ipcRenderer.send(IPCM.RECEIVE_VERSION_URL, `${window.location.href}`);
      return;
    }

    const version = await ipcRenderer.invoke(IPCM.INVOKE_VERSION_INFO);

    if (version.name == "天宇") {
      let wrapIframe = <HTMLIFrameElement>document.getElementById("iframe_cen");

      if (wrapIframe) {
        const doc = wrapIframe.contentDocument;
        const cpgame = doc?.getElementById("cpgame");

        if (cpgame) {
          const iframe = cpgame.getElementsByTagName("iframe")[0];
          if (iframe && iframe.src.includes("worldh5")) {
            ipcRenderer.send(IPCM.RECEIVE_VERSION_URL, `${iframe.src}`);
            return;
          }
        }
      }
    } else if (version.name == "小七") {
      const game = <HTMLIFrameElement>document.getElementById("frameGame");

      if (game?.src.includes("worldh5")) {
        ipcRenderer.send(IPCM.RECEIVE_VERSION_URL, `${game.src}`);
        return;
      }
    }

    ipcRenderer.send(IPCM.RECEIVE_VERSION_URL, "");
  });

  // 获取当前是否进入自动日常状态
  ipcRenderer.on(IPCR.GET_IS_AUTO_DAILY, () => {
    ipcRenderer.send(
      IPCM.RECEIVE_IS_AUTO_DAILY,
      window?.OneKeyDailyMission?._isStarting
    );
  });

  // 获取当前是否已经进入游戏
  ipcRenderer.on(IPCR.GET_IS_GAME_STARTED, () => {
    ipcRenderer.send(IPCM.RECEIVE_IS_GAME_STARTED, gameStarted());
  });
}

function setupAutoFunction() {
  // 自动完成每日
  ipcRenderer.on(IPCR.AUTO_ONE_DAILY_MISSION, (_e, v: boolean) => {
    if (!gameStarted()) return;

    if (v && !window.OneKeyDailyMission._isStarting)
      window.OneKeyDailyMission.start();

    if (!v && window.OneKeyDailyMission._isStarting) {
      window.OneKeyDailyMission.stop();
    }

    ipcRenderer.send(
      IPCM.RECEIVE_IS_AUTO_DAILY,
      window.OneKeyDailyMission._isStarting
    );
  });

  // 自动刷怪
  ipcRenderer.on(IPCR.AUTO_REFRESH_MONSTER, (_e, v: boolean) => {
    if (!gameStarted()) return;

    if (v && !window.testRefreshGame._isStarting) {
      window.testRefreshGame.start();
    }

    if (!v && window.testRefreshGame._isStarting) {
      window.testRefreshGame.stop();
    }

    ipcRenderer.send(
      IPCM.RECEIVE_IS_REFESH_MONSTER,
      window.testRefreshGame._isStarting
    );
  });

  // 自动扩展背包
  ipcRenderer.on(IPCR.AUTO_EXPAND_BAG, (_e, v: boolean) => {
    if (!gameStarted()) return;

    if (v && !window.expandBagTool._isStarting) {
      window.expandBagTool.start();
    }

    if (!v && window.expandBagTool._isStarting) {
      window.expandBagTool.stop();
    }
  });

  // 领取在线奖励
  ipcRenderer.on(IPCR.AUTO_ONLINE_REWARD, (_e, v: boolean) => {
    if (!gameStarted()) return;

    if (v && !window.autoOnlineReward._isStarting) {
      window.autoOnlineReward.start();
    }

    if (!v && window.autoOnlineReward._isStarting) {
      window.autoOnlineReward.stop();
    }
  });

  // 自动修理装备
  ipcRenderer.on(IPCR.AUTO_REPAIR_EQUIP, (_e, v: boolean) => {
    if (!gameStarted()) return;

    if (v && !window.autoRepairEquip._isStarting) {
      window.autoRepairEquip.start();
    }

    if (!v && window.autoRepairEquip._isStarting) {
      window.autoRepairEquip.stop();
    }
  });

  // 自动出售
  ipcRenderer.on(IPCR.AUTO_ONE_DAILY_SELL, (_e, v: boolean) => {
    if (!gameStarted()) return;

    if (v && !window.autoSell._isStarting) {
      window.autoSell.start();
    }

    if (!v && window.autoSell._isStarting) {
      window.autoSell.stop();
    }
  });
}

function setupOptions() {
  ipcRenderer.on(IPCR.SET_USE_REPAIR_ROLL, (_e, v: boolean) => {
    window?.autoRepairEquip.setRepairRoll(!!v);
  });
}

export function setupFunction() {
  ipcRenderer.send(IPCM.SETUP_FUNCTION_STARTED);

  setupAutoFunction();

  setupOptions();

  // 开日常箱子
  ipcRenderer.on(IPCR.OPEN_DAILY_BOX, () => {
    if (!gameStarted()) return;

    openDailyBox();
  });

  // 领取微端奖励
  ipcRenderer.on(IPCR.MICRO_REWARD, () => {
    if (!gameStarted()) return;

    window.nato.Network.sendCmd(window.MsgHandler.createDrawMicroReward());
  });

  // 出售垃圾
  ipcRenderer.on(IPCR.SELL_PRODUCT, () => {
    if (!gameStarted()) return;

    window.autoSell.ai_sell();
  });

  ipcRenderer.send(IPCM.SETUP_FUNCTION_ENDED);
}
