import EventEmitter from "events";
import EscortMissionController from "./hooks/escortTool/escortMissionController";
import AutoChatMsg from "./hooks/tools/AutoChatMsg";
import ExpandBagTool from "./hooks/tools/AutoExpandBag";
import AutoOnlineReward from "./hooks/tools/AutoOnlineReward";
import AutoRepairEquip from "./hooks/tools/AutoRepairEquip";
import AutoSell from "./hooks/tools/AutoSell";
import { AutoSkyArena } from "./hooks/tools/AutoSkyArena";
import DefaultFunction from "./hooks/tools/Default";
import SkipBattleAnime from "./hooks/tools/SkipAnime";
import TestRefreshGame from "./hooks/tools/TestRefreshGame";
import ThousandBattle from "./hooks/tools/ThousandBattle";

interface Config {
  autoDaily: boolean;
  autoRefreshMonster: boolean;
  skipBattleAnim: boolean;
  repairRoll: boolean;
  autoSell: boolean;
  autoChat: boolean;
  onlineReward: boolean;
  autoEscort: boolean;
  repairEquip: boolean;
  expandBag: boolean;
  autoChatMsg: boolean;
  offlineExpRate3: boolean
}

declare global {
  interface Window {
    config: Config;
    // Hooks
    thousandBattle: ThousandBattle;
    expandBagTool: ExpandBagTool;
    testRefreshGame: TestRefreshGame;
    autoOnlineReward: AutoOnlineReward;
    autoRepairEquip: AutoRepairEquip;
    autoSell: AutoSell;
    skipBattleAnime: SkipBattleAnime;
    autoChatMsg: AutoChatMsg;
    autoEscortTools: EscortMissionController;
    autoSkyArena: AutoSkyArena;
    defaultFunction: DefaultFunction;
    doGetMoney: Function;
    doGetExp: Function;
    doAcceptWushuangMission: Function;
    doEnterGame: Function;
    doLoginLottery: Function

    __myEvent__: EventEmitter;
    __escortEmitter__: EventEmitter;

    xself: any;
    xevent: any;
    xworld: any;
    nato: any;

    LoginLotteryDraw: any
    Main: any;
    Player: any;
    Battle: any;
    TodayEvent: any;
    DrugPanel: any;
    BattleConst: any;
    GameWorld: any;
    OneKeyDailyMission: any;
    OnlineReward: any;
    ItemManager: any;
    PlayerBag: any;
    MsgHandler: any;
    AutoSell: any;
    Tool: any;
    AlertPanel: any;
    PanelManager: any;
    BattleInputHandler: any;
    BattleView: any;
    ModelConst: any;
    GameText: any;
    ProtocolDefine: any;
    OfflineExp: any

    PowerString: any;
    ColorUtils: any;
    WorldMessage: any;
    WorldEvent: any;
    Achieve: any;
    AchieveScene: any;

    City: any;
    Login: any;
    Escort: any;
    MenuActionData: any;
    PopUpManager: any;
    GameSprite: any;
    NewEscort: any;
    GameMap: any;
    Define: any;
    SkyArena: any;
    CountryBoss: any;
    TeamBoss: any;
    Mission: any;
    AutoGamer: any;
    MyPet: any;
    PetDetailScene: any;
    PetEquipDes: any;
    StringBuffer: any;
    ItemData: any;
    GameText2: any;
    SafeLock: any;
    ForgeScene: any;
    Skill: any;
    PetGuide: any;
    MountGuide: any;
    Enchant: any;
    PlayerTurnMonster: any;
    Model: any;
    CountryTaskListPanel: any;
    GuideHandler: any;
    AreaLineListPanel: any;
    SkyArenaScene: any
  }
}
