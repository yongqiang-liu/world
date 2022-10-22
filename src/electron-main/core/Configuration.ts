import { IConfiguration } from "common/configuration";
import { deepProxy } from "common/functional";
import EventEmitter from "events";
import fs from "fs";

const defaultConfiguration: IConfiguration = {
  version: "天宇", // 天宇
  accounts: [],
  app: {
    autoOnline: true,
    autoSellByBagWillFull: true,
    autoRepairEquip: false,
    repairRoll: false,
    autoExpandBag: true,
    sell_buildMaterial: false,
    sell_RareEquip: false,
    autoEscort: false,
    rate3: false,
    mode: 'merge'
  },
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
      if (!this.configuration.app.mode) {
        this.configuration.app.mode = defaultConfiguration.app.mode
      }
    } catch (error) {
      this.configuration = defaultConfiguration;
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
      JSON.stringify(defaultConfiguration),
      {
        flag: "w+",
      }
    );
  }

  save() {
    fs.writeFile(
      this.configurationPath,
      JSON.stringify(this.configuration || defaultConfiguration),
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
