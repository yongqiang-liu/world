import { IPC_MAIN, IPC_RENDERER } from "common/ipcEventConst";
import { TimeHelper } from "common/timer";
import { ipcRenderer } from "electron";
import { gameStarted, openDailyBox } from "./gameFunctional";

window.config = {
  autoDaily: false,
  autoRefreshMonster: false,
  skipBattleAnim: false,
  repairRoll: false,
  autoSell: false,
  autoChat: false,
  onlineReward: false,
  autoEscort: false,
  repairEquip: false,
  expandBag: false,
  autoChatMsg: false,
  offlineExpRate3: false
};

export function setupUnInitializeFunction() {
  // 获取账号信息
  ipcRenderer.on(IPC_RENDERER.GET_ACCOUNTS, () => {
    let accounts: string | Array<any> =
      localStorage.getItem("world-1000-1100-accountList") || "[]";
    try {
      accounts = <Array<any>>JSON.parse(accounts);
    } catch (error) {
      accounts = [];
    }

    ipcRenderer.send(IPC_MAIN.RECEIVE_ACCOUNTS, accounts);
  });

  // 获取当前版本的存号的URL
  ipcRenderer.on(IPC_RENDERER.GET_VERSION_URL, async () => {
    if (window.location.href.includes("worldh5")) {
      ipcRenderer.send(IPC_MAIN.RECEIVE_VERSION_URL, `${window.location.href}`);
      return;
    }

    const version = await ipcRenderer.invoke(IPC_MAIN.INVOKE_VERSION_INFO);

    if (version.name == "天宇") {
      let wrapIframe = <HTMLIFrameElement>document.getElementById("iframe_cen");

      if (wrapIframe) {
        const doc = wrapIframe.contentDocument;
        const game = doc?.getElementById("cpgame");

        if (game) {
          const iframe = game.getElementsByTagName("iframe")[0];
          if (iframe && iframe.src.includes("worldh5")) {
            ipcRenderer.send(IPC_MAIN.RECEIVE_VERSION_URL, `${iframe.src}`);
            return;
          }
        }
      }
    } else if (version.name == "小七") {
      const game = <HTMLIFrameElement>document.getElementById("frameGame");

      if (game?.src.includes("worldh5")) {
        ipcRenderer.send(IPC_MAIN.RECEIVE_VERSION_URL, `${game.src}`);
        return;
      }
    }

    ipcRenderer.send(IPC_MAIN.RECEIVE_VERSION_URL, "");
  });

  // 获取当前是否进入自动日常状态
  ipcRenderer.on(IPC_RENDERER.GET_IS_AUTO_DAILY, () => {
    ipcRenderer.send(
      IPC_MAIN.RECEIVE_IS_AUTO_DAILY,
      window?.OneKeyDailyMission?._isStarting
    );
  });

  // 获取当前是否已经进入游戏
  ipcRenderer.on(IPC_RENDERER.GET_IS_GAME_STARTED, () => {
    ipcRenderer.send(IPC_MAIN.RECEIVE_IS_GAME_STARTED, gameStarted());
  });
}

function setupAutoFunction() {
  ipcRenderer.on(IPC_RENDERER.THOUSAND_BATTLE, (_e, v: number) => {
    if (!gameStarted()) return;

    if (v && !window.thousandBattle._isStarting) {
      window.thousandBattle.start(v);
      return;
    }

    if (window.thousandBattle._isStarting) {
      window.thousandBattle.stop();
      return;
    }
  });

  // 自动完成每日
  ipcRenderer.on(IPC_RENDERER.AUTO_ONE_DAILY_MISSION, (_e, v: boolean) => {
    if (!gameStarted()) return;

    if (v && !window.OneKeyDailyMission._isStarting) {
      if (window.xself.getTitle() !== "努力升级") {
        // 查看背包是否有努力升级称号
        for (let i = 30; i < window.xself.bag.bagEnd; i++) {
          const item = window.xself.bag.store[i];
          if (item && item.id == 40645) {
            window.ItemManager.doItem(item);
          }
        }

        setTimeout(async () => {
          const titleList = await window.defaultFunction.getTitleList();
          const title = titleList.find((item) => item[0] == 505);
          if (title) {
            window.defaultFunction.useTitle(505);
          }
        }, TimeHelper.second(2));
      }

      window.OneKeyDailyMission.start();
      window.config.autoDaily = true;
    }

    if (!v && window.OneKeyDailyMission._isStarting) {
      window.OneKeyDailyMission.stop();
      window.config.autoDaily = false;
    }

    ipcRenderer.send(
      IPC_MAIN.RECEIVE_IS_AUTO_DAILY,
      window.OneKeyDailyMission._isStarting
    );
  });

  // 自动刷怪
  ipcRenderer.on(IPC_RENDERER.AUTO_REFRESH_MONSTER, (_e, v: boolean) => {
    if (!gameStarted()) return;

    if (v && !window.testRefreshGame._isStarting) {
      window.testRefreshGame.start();
      window.config.autoRefreshMonster = true;
    }

    if (!v && window.testRefreshGame._isStarting) {
      window.testRefreshGame.stop();
      window.config.autoRefreshMonster = false;
    }

    ipcRenderer.send(
      IPC_MAIN.RECEIVE_IS_REFRESH_MONSTER,
      window.testRefreshGame._isStarting
    );
  });

  // 自动扩展背包
  ipcRenderer.on(IPC_RENDERER.AUTO_EXPAND_BAG, (_e, v: boolean) => {
    if (!gameStarted()) return;

    if (v && !window.expandBagTool._isStarting) {
      window.expandBagTool.start();
      window.config.expandBag = true;
    }

    if (!v && window.expandBagTool._isStarting) {
      window.expandBagTool.stop();
      window.config.expandBag = false;
    }
  });

  // 领取在线奖励
  ipcRenderer.on(IPC_RENDERER.AUTO_ONLINE_REWARD, (_e, v: boolean) => {
    if (!gameStarted()) return;

    if (v && !window.autoOnlineReward._isStarting) {
      window.autoOnlineReward.start();
      window.config.onlineReward = true;
    }

    if (!v && window.autoOnlineReward._isStarting) {
      window.autoOnlineReward.stop();
      window.config.onlineReward = false;
    }
  });

  // 自动修理装备
  ipcRenderer.on(IPC_RENDERER.AUTO_REPAIR_EQUIP, (_e, v: boolean) => {
    if (!gameStarted()) return;

    if (v && !window.autoRepairEquip._isStarting) {
      window.autoRepairEquip.start();
      window.config.repairEquip = true;
    }

    if (!v && window.autoRepairEquip._isStarting) {
      window.autoRepairEquip.stop();
      window.config.repairEquip = false;
    }
  });

  // 自动出售
  ipcRenderer.on(IPC_RENDERER.AUTO_ONE_DAILY_SELL, (_e, v: boolean) => {
    if (!gameStarted()) return;

    if (v && !window.autoSell._isStarting) {
      window.autoSell.start();
      window.config.autoSell = true;
    }

    if (!v && window.autoSell._isStarting) {
      window.autoSell.stop();
      window.config.autoSell = false;
    }
  });

  // 自动护送任务
  ipcRenderer.on(IPC_RENDERER.AUTO_ESCORT, (_e, v: boolean) => {
    if (!gameStarted()) return;

    if (v && !window.autoEscortTools._isStarting) {
      window.autoEscortTools.start();
      window.config.autoEscort = true;
    }

    if (!v && window.autoSell._isStarting) {
      window.autoEscortTools.stop();
      window.config.autoEscort = false;
    }
  });

  // 跳过战斗动画
  ipcRenderer.on(IPC_RENDERER.AUTO_SKIP_BATTLE_ANIM, (_e, v: boolean) => {
    if (!gameStarted()) return;

    if (v && !window.skipBattleAnime._isStarting) {
      window.skipBattleAnime.start();
      window.config.skipBattleAnim = true;
    }

    if (!v && window.autoSell._isStarting) {
      window.skipBattleAnime.stop();
      window.config.skipBattleAnim = false;
    }
  });

  ipcRenderer.on(IPC_RENDERER.AUTO_CHAT_MSG, (_e, v: boolean) => {
    if (!gameStarted()) return;

    if (v && !window.autoChatMsg._isStarting) {
      window.autoChatMsg.start();
      window.config.autoChatMsg = true;
    }

    if (!v && window.autoSell._isStarting) {
      window.autoChatMsg.stop();
      window.config.autoChatMsg = false;
    }
  });
}

function setupOptions() {
  ipcRenderer.on(IPC_RENDERER.SET_USE_REPAIR_ROLL, (_e, v: boolean) => {
    window?.autoRepairEquip.setRepairRoll(!!v);
  });
}

export function setupFunction() {
  ipcRenderer.send(IPC_MAIN.SETUP_FUNCTION_STARTED);

  setupAutoFunction();

  setupOptions();

  // 开日常箱子
  ipcRenderer.on(IPC_RENDERER.OPEN_DAILY_BOX, () => {
    if (!gameStarted()) return;

    openDailyBox();
  });

  // 领取微端奖励
  ipcRenderer.on(IPC_RENDERER.MICRO_REWARD, () => {
    if (!gameStarted()) return;

    window.nato.Network.sendCmd(window.MsgHandler.createDrawMicroReward());
  });

  // 出售垃圾
  ipcRenderer.on(IPC_RENDERER.SELL_PRODUCT, () => {
    if (!gameStarted()) return;

    window.autoSell.ai_sell();
  });

  ipcRenderer.send(IPC_MAIN.SETUP_FUNCTION_ENDED);
}
