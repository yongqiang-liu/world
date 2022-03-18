import { EVENTS } from "common/eventConst";
import { when } from "common/functional";
import { IPCM, IPCR } from "common/ipcEventConst";
import { TimeHelper } from "common/timer";
import { ipcRenderer } from "electron";
import EscortMissionController from "../escortMissionController";

export async function wushuangController() {
  let battleCounter = 0;
  let loginCount = 0;
  let moveCount = 0;
  let channel;

  const paths = [1, 2, 3, 7, 11, 10, 14, 13, 12, 8, 9, 5, 6];

  const events = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  this.onEnterEscort = function () {
    this.paths = paths;
    this.events = events;
    this.moveLock = true;
    if (window.xself.isInTeam() && window.xself.isMember()) {
      this.moveLock = true;
      channel = new window.BroadcastChannel("wushuang");

      channel.addEventListener("message", (e) => {
        if (e.data === "reload") {
          const members = JSON.parse(localStorage.getItem("wushuang"));

          members.map((member) => {
            if (member.id == window.xself.getId()) {
              ipcRenderer.send(IPCM.RELOAD);
            }
          });
        }
      });

      if (localStorage.getItem("status")) {
        channel.postMessage({
          id: window.xself.getId(),
          name: window.xself.playerName,
        });
      }
    }

    if (window.xself.isInTeam() && window.xself.isLeader()) {
      channel = new window.BroadcastChannel("wushuang");
      const members = window.xself.getMembers() || [];

      const arr = [];
      for (let i = 0; i < members.length; i++) {
        const member = members[i];
        arr.push({
          id: member.id,
          name: member.playerName,
        });
      }

      localStorage.setItem("wushuang", JSON.stringify(arr));
      channel.postMessage("reload");
      setTimeout(() => (this.moveLock = false), 300);
    }
  };

  this.onEnterBattle = function () {};

  this.onExitBattle = function () {};

  this.onExitEscort = function () {
    // 监听退出护送地图
    if (window.xself.isInTeam() && window.xself.isLeader()) {
      channel.postMessage("exit");
    }
    // setTimeout(() => Mission.doDeleteMissionMsg(xself, xself.missions[0]));
  };

  this.onEscortMove = function () {
    moveCount++;
    if (moveCount == 1 && window.xself.isInTeam() && window.xself.isLeader()) {
      this.moveLock = true;
      // 这个时候需要发送一个自动登录的指令
      setTimeout(() => {
        ipcRenderer.send(IPCM.EXECUTE_OTHER, IPCR.AUTO_ENTER_GAME);
        localStorage.setItem("status", "login");
      }, TimeHelper.second(1));
      channel.addEventListener("message", (event) => {
        const { id, name } = event.data;

        if (members.find((v) => v.id === id)) {
          loginCount++;
        }

        if (loginCount === members.length) {
          this.moveLock = false;
        }

        console.log(event.data);
      });
    }

    console.log("移动计数: ", moveCount);
  };
}
