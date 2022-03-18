import { IConfiguration } from "common/configuration";
import { deepProxy } from "common/functional";
import EventEmitter from "events";
import fs from "fs";

const defaultConfigurtion: IConfiguration = {
  version: "天宇", // 天宇
  accounts: [],
  app: {
    autoOnline: false,
    autoSellByBagWillFull: false,
    autoRepairEquip: false,
    repairRoll: false,
    autoExpandBag: false,
    sell_buildMaterial: false,
    sell_RareEquip: false,
    autoEscort: false,
  },
  oaccounts: [],
  list: {
    black: ["豹皮", "腐鹰羽毛", "月狼之石"],
    white: [],
    equipWhite: [".护符$", ".书."],
  },
};

export const enum ConfigurationEvents {
  SAVED = "saved",
}

export default class Configuration extends EventEmitter {
  configuration!: IConfiguration;

  constructor(private configurationPath: string) {
    super();
    this.load();
  }

  load() {
    if (!this.isExist()) {
      this.create();
    }

    try {
      this.configuration = JSON.parse(
        fs.readFileSync(this.configurationPath, "utf-8")
      );
    } catch (error) {
      this.configuration = defaultConfigurtion;
    }

    this.configuration = deepProxy(this.configuration, {
      set: (target, p, value) => {
        target[p] = value;

        this.save();

        return true;
      },
    });
  }

  create() {
    fs.writeFileSync(
      this.configurationPath,
      JSON.stringify(defaultConfigurtion),
      {
        flag: "w+",
      }
    );
  }

  save() {
    fs.writeFile(
      this.configurationPath,
      JSON.stringify(this.configuration || defaultConfigurtion),
      {
        flag: "w+",
      },
      (err) => {
        if (err) console.error(err);
      }
    );

    this.emit("saved");
  }

  isExist() {
    return fs.existsSync(this.configurationPath);
  }
}
