import EventEmitter from "events";
import ExpandBagTool from "./hooks/tools/AutoExpandBag";
import AutoOnlineReward from "./hooks/tools/AutoOnlineReward";
import AutoRepairEquip from "./hooks/tools/AutoRepairEquip";
import AutoSell from "./hooks/tools/AutoSell";
import DefaultFunction from "./hooks/tools/Default";
import TestRefreshGame from "./hooks/tools/TestRefreshGame";

declare global {
  interface Window {
    // Hooks
    expandBagTool: ExpandBagTool;
    testRefreshGame: TestRefreshGame;
    autoOnlineReward: AutoOnlineReward;
    autoRepairEquip: AutoRepairEquip;
    autoSell: AutoSell;
    defaultFunction: DefaultFunction;
    doGetMoney: Function;
    doGetExp: Function;

    __myEvent__: EventEmitter;

    xself: any;
    xevent: any;
    xworld: any;
    nato: any;

    Main: any;
    Player: any;
    Battle: any;
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

    PowerString: any;
    ColorUtils: any;
    WorldMessage: any;

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

    GuideHandler: any;
  }
}
