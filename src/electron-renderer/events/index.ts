import { EVENTS, WroldEvent } from "./eventConst";

export function setupEvent() {
  window.__myEvent__.on(EVENTS.BAG_FULL, () => {
    console.log("背包已满");
  });

  window.__myEvent__.on(EVENTS.BAG_WILL_FULL, () => {
    console.log("背包将满，请尽快清理");
  });

  window.__myEvent__.on(WroldEvent.SUPPLY_SUCCESS, () => {
    console.log("出售成功");
  });

  window.__myEvent__.on(EVENTS.ENTER_ESCORT_MAP, () => {
    console.log("进入护送任务");
  });

  window.__myEvent__.on(EVENTS.MOVE_ESCORT_MAP, () => {
    console.log("护送任务: 移动");
  });

  window.__myEvent__.on(EVENTS.CHECK_ESCORT_EVENT, () => {
    console.log("护送任务: 选择");
  });

  window.__myEvent__.on(EVENTS.ESCORT_EVENT_LIST, (list: any[]) => {
    console.log("护送任务: 选择事件列表", list);
  });

  window.__myEvent__.on(EVENTS.EXIT_ESCORT_MAP, () => {
    console.log("退出护送任务");
  });

  window.__myEvent__.on(EVENTS.ENTER_BATTLE_MAP, () => {
    console.log("进入战斗");
  });

  window.__myEvent__.on(EVENTS.UPDATE_BATTLE, () => {
    console.log("战斗中...");
  });

  window.__myEvent__.on(EVENTS.EXIT_BATTLE_MAP, () => {
    console.log("退出战斗");
  });
}
