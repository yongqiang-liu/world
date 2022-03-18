import { ControllerPayload, CONTROLLER_EVENT } from "common/controller";
import { EVENTS } from "common/eventConst";
import { ipcMain } from "electron";
import MainWidow from "./windows";

export class EscortMissionController {
  private position = 0;

  private inEscort = false;

  private inBattle = false;

  constructor(window: MainWidow) {
    this.initlize();
    this.registerListener();
  }

  initlize() {}

  move(position: number) {
    if (!this.canMove(position)) return;
  }

  canMove(position: number) {
    /**
     * 0    1   2   3
     * 4    5   6   7
     * 8    9  10  11
     * 12  13  14  15
     */

    return position - 1 > 0;
  }

  sendMove() {}

  getPosition() {
    return this.position;
  }

  handleEnter() {}

  handleExit() {}

  handleEvents(event: EVENTS, payload: any) {
    switch (event) {
      case EVENTS.ENTER_ESCORT_MAP:
        {
          // 进入护送地图
          this.inEscort = true;
          this.handleEnter();
        }
        break;
      case EVENTS.EXIT_ESCORT_MAP:
        {
          // 退出护送地图
          this.inEscort = false;
          this.handleExit();
        }
        break;
      case EVENTS.ENTER_BATTLE_MAP:
        {
          // 进入战斗地图
          this.inBattle = true;
        }
        break;
      case EVENTS.EXIT_BATTLE_MAP:
        {
          // 退出战斗地图
          this.inBattle = false;
        }
        break;
      default:
        break;
    }
  }

  registerListener() {
    ipcMain.on(CONTROLLER_EVENT, (_e, payload: ControllerPayload) => {
      this.handleEvents(payload.event, payload.payload);
    });
  }
}
