import { IPCR } from "common/ipcEventConst";
import { SellOptions } from "common/Sell";
import { ipcRenderer } from "electron";
import { EVENTS } from "renderer/events/eventConst";
import { Define } from "renderer/gameConst";
import { gameStarted, transformFilter, whenGameStarted } from "renderer/gameFunctional";
import { isRegExp } from "util";

export default class AutoSell {
  _isStarting = false;

  private _sellOptions: SellOptions = {
    buildMaterial: false,
    rareEquip: false,
    black: [],
    white: [],
    equipWhite: [],
  };

  // @ts-ignore
  private _interval: number | null = null;

  constructor() {
    this._interval = window.setInterval(() => {
      if (gameStarted()) return;

      const { xself } = window;

      if (xself.bag.countFreePos() < 7) {
        window.__myEvent__.emit(EVENTS.BAG_WILL_FULL);
      }
    }, 10 * 1000);

    ipcRenderer.on(IPCR.SET_SELL_OPTIONS, (_e, options: SellOptions) => {
      this._sellOptions = {
        ...this._sellOptions,
        ...options,
      };
    });
  }

  start() {
    if (!this._isStarting) {
      this._isStarting = true;
      this.logic();
    }
  }

  stop() {
    if (this._isStarting) {
      this._isStarting = false;
      window.__myEvent__.removeListener(EVENTS.BAG_WILL_FULL, this.sell);
      window.__myEvent__.removeListener(EVENTS.BAG_FULL, this.sell);
    }
  }

  ai_sell() {
    const { _sellOptions } = this;
    const white = transformFilter(_sellOptions.white);
    const black = transformFilter(_sellOptions.black);
    const equipWhite = transformFilter(_sellOptions.equipWhite);

    var t = [],
      e = window.xself.getLevel(),
      n = (10 * Math.floor((2 * e) / 10)) / 2,
      i = window.xself.bag;
    if (null == i) return null;
    for (var o = window.PlayerBag.BAG_START; o <= i.bagEnd; o++) {
      var a = i.store[o];
      // 该背包格为空
      if (a == null) continue;

      for (let q = 0; q < white.length; q++) {
        const v = white[q];
        if (isRegExp(v)) {
          if (v.test(a.name)) continue;
        }

        if (typeof v === "string") {
          if (v.includes(a.name)) continue;
        }
      }

      for (let q = 0; q < black.length; q++) {
        const v = black[q];
        if (isRegExp(v)) {
          if (v.test(a.name)) {
            t.push(a);
            continue;
          }
        }

        if (typeof v === "string") {
          if (v.includes(a.name)) {
            t.push(a);
            continue;
          }
        }
      }

      // 不出售升星过的物品
      if (a.star > 0) continue;

      // 不出售钥匙、钻石
      if (a.name.includes("钥匙") || a.name.includes("钻石")) continue;

      // 不出售坐骑
      if (a.type == Define.ITEM_TYPE_ARMOR_TRANSPORT) continue;
      // 不出售时装
      if (a.type == Define.ITEM_TYPE_ARMOR_FASHION) continue;
      // 不出售时效道具
      if (a.isTimeItem()) continue;

      // 出售任务物品
      // if (
      //   a.type === Define.ITEM_TYPE_TASK &&
      //   (a.grade < 2 || TASK_BlackList.includes(a.name)) &&
      //   !TASK_WhiteList.map((v) => {
      //     if (isRegExp(v)) {
      //       return v.test(a.name);
      //     } else {
      //       v.includes(a.name);
      //     }
      //   }).some((v) => v)
      // ) {
      //   let result = false;
      //   // 检测当前得任务列表是否需要该物品, 如果不需要则卖出
      //   for (let i = 0; i < xself.missionList.length; i++) {
      //     const ms = xself.missionList[i];
      //     for (let j = 0; j < ms.submitCondition.length; j++) {
      //       if (!ms.submitCondition || Array.isArray(ms.submitCondition)) break;

      //       const c = ms.submitCondition[j];

      //       if (c.type === 7) {
      //         c.data, (c.data.position = 0);
      //         try {
      //           c.readInt();
      //           if (c.data && a.name.includes(c.data.readUTF())) {
      //             result = true;
      //             break;
      //           }
      //         } catch (error) {}
      //       }
      //     }
      //   }

      //   if (!result) {
      //     t.push(a);
      //     done[o] = true;
      //   }
      //   continue;
      // }

      // GroupWhiteList.map((v) => {
      //   if (isRegExp(v) && v.test(a.name) && a.grade < 3) {
      //     for (let j = PlayerBag.BAG_START; j <= i.bagEnd; j++) {
      //       let p = i.store[j];

      //       if (p == null) continue;

      //       if (j !== o && !done[j] && v.test(a.name) && a.grade < 3) {
      //         if (a.quantity == 99 && p.quantity < 99) {
      //           t.push(p);
      //           done[j] = true;
      //           return;
      //         }

      //         if (p.quantity == 99) {
      //           // 找到一组相同的物品
      //           t.push(a);
      //           done[o] = true;
      //           return;
      //         }
      //       }
      //     }
      //   } else if (typeof v === "string" && a.name.includes(v) && a.grade < 3) {
      //     for (let j = PlayerBag.BAG_START; j <= i.bagEnd; j++) {
      //       let p = i.store[j];

      //       if (p == null) continue;

      //       if (j !== o && !done[j] && a.name.includes(v) && a.grade < 3) {
      //         if (a.quantity == 99 && p.quantity < 99) {
      //           t.push(p);
      //           done[j] = true;
      //           return;
      //         }

      //         if (p.quantity == 99) {
      //           // 找到一组相同的物品
      //           t.push(a);
      //           done[o] = true;
      //           return;
      //         }
      //       }
      //     }
      //   }
      // });

      // 出售非史诗建筑道具
      if (
        _sellOptions.buildMaterial &&
        a.type == Define.ITEM_TYPE_BUILD_MATERIAL &&
        a.grade < 2
      ) {
        t.push(a);
        continue;
      }

      // 出售锁的箱子
      if (
        a.type === Define.ITEM_TYPE_NOT_BATTLE_USE &&
        a.grade < 2 &&
        a.info.includes("装备") &&
        a.name.includes("级") &&
        a.name.includes("锁")
      ) {
        t.push(a);
        continue;
      }

      // 出售材料箱
      if (
        _sellOptions.rareEquip &&
        a.type === Define.ITEM_TYPE_NOT_BATTLE_USE &&
        a.grade < 2 &&
        a.info.includes("建筑材料")
      ) {
        t.push(a);
        continue;
      }

      // 不出售任务物品和可使用道具
      if (
        (a.type >= Define.ITEM_TYPE_TASK &&
          a.type <= Define.ITEM_TYPE_NOT_BATTLE_USE) ||
        a.type == Define.ITEM_TYPE_SKILL_BOOK
      )
        continue;
      // 不出售特殊道具
      if (
        a.type >= Define.ITEM_TYPE_SPECEAIL &&
        a.type <= Define.ITEM_TYPE_WEAPON_TWOHAND_GUN
      )
        continue;

      // 出售绿色以下的装备
      if (
        a.grade < 2 &&
        ((a.type >= Define.ITEM_TYPE_ARMOR_HEAD &&
          a.type <= Define.ITEM_TYPE_ARMOR_HAND) || // 头 - 手
          (a.type >= Define.ITEM_TYPE_WEAPON_ONEHAND_SWORD &&
            a.type <= Define.ITEM_TYPE_WEAPON_TWOHAND_BOW)) // 单手剑 - 弓
      ) {
        for (let q = 0; q < equipWhite.length; q++) {
          const v = equipWhite[q];
          if (isRegExp(v)) {
            if (v.test(a.name)) {
              t.push(a);
              continue;
            }
          }

          if (typeof v === "string") {
            if (v.includes(a.name)) {
              t.push(a);
              continue;
            }
          }
        }

        // 暂时不出售 法器、重枪、副手、轻枪
        t.push(a);
        continue;
      }

      if (
        ((a.type >= Define.ITEM_TYPE_ARMOR_HEAD &&
          a.type <= Define.ITEM_TYPE_ARMOR_HAND) || // 头 - 手
          (a.type >= Define.ITEM_TYPE_WEAPON_ONEHAND_SWORD &&
            a.type <= Define.ITEM_TYPE_WEAPON_TWOHAND_BOW)) && // 单手剑 - 弓
        a.grade === 2 &&
        _sellOptions.rareEquip
      ) {
        if (a.grade === 2 && a.reqLv >= 50) continue;
        for (let q = 0; q < equipWhite.length; q++) {
          const v = equipWhite[q];
          if (isRegExp(v)) {
            if (v.test(a.name)) {
              t.push(a);
              continue;
            }
          }

          if (typeof v === "string") {
            if (v.includes(a.name)) {
              t.push(a);
              continue;
            }
          }
        }

        t.push(a);
        continue;
      }

      if (a.isEquipClass() && a.reqLv < n) {
        0 == a.grade && t.push(a);
      }
    }

    window.AutoSell.sendToSellNoAlert(t);
  }

  private async sell() {
    await whenGameStarted();

    window?.AutoSell?.autoSell_onekeyDailyMission();
  }

  private logic() {
    window.__myEvent__.on(EVENTS.BAG_WILL_FULL, this.sell);
    window.__myEvent__.on(EVENTS.BAG_FULL, this.sell);
  }
}
