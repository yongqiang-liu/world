import { EVENTS, WroldEvent } from "../../electron-common/eventConst";
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
}
