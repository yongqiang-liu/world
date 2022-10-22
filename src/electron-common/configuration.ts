export interface Account {
  username?: string;
  password?: string;
  account?: string
  passwd?: string
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
  rate3: boolean
  mode: 'merge' | 'split'
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
  list: FilterList;
  [key: string | symbol]: any;
}

export interface IRawBattleConfiguration {
  id: number
  name: string
  max?: number
  stepsId: number[]
  battleIds: number[]
  battleStep?: number
  usePrevBattleId?: boolean
}

export interface IBattleConfiguration {
  battle: IRawBattleConfiguration[]
}