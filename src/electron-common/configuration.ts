export interface Account {
  account?: string;
  passwd?: string;
  url: string;
}

export interface ApplicationConfiguration {
  autoOnline: boolean;
  autoSellByBagWillFull: boolean;
  autoRepairEquip: boolean;
  repairRoll: boolean;
  autoExpandBag: boolean;
  sell_buildMaterial: boolean;
  sell_RareEquip: boolean;
  autoEscort: boolean;
}

export interface FilterList {
  black: Array<string>;
  white: Array<string>;
  equipWhite: Array<string>;
}

export interface IConfiguration {
  version: string;
  accounts: Array<Account>;
  app: ApplicationConfiguration;
  oaccounts: Array<Account>;
  list: FilterList;
  [key: string | symbol]: any;
}
