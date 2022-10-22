/** @description 渲染进程 */
export const enum IPC_RENDERER {
  INITIALIZED = "initialized",
  UNINITIALIZED = "uninitialized",

  SELL_PRODUCT = "sell:product",
  REPAIR_EQUIP = "repair:equip",
  REPAIR_EQUIP_IN_CITY = "repair:equip:in:city",
  REPAIR_EQUIP_IN_MAP = "repair:equip:in:map",
  OPEN_DAILY_BOX = "open:daily:box",

  AUTO_REPAIR_EQUIP = "auto:repair:equip",
  AUTO_ONE_DAILY_MISSION = "auto:daily:mission",
  AUTO_ONE_DAILY_SELL = "auto:daily:sell",
  AUTO_REFRESH_MONSTER = "auto:refresh:monster",
  AUTO_EXPAND_BAG = "auto:expand:bag",
  AUTO_ONLINE_REWARD = "auto:online:reward",
  AUTO_ESCORT = "auto:escort",
  AUTO_SKIP_BATTLE_ANIM = "auto:skip:battle:anim",
  AUTO_CHAT_MSG = "auto:chat:msg",
  AUTO_SKY_ARENA = 'auto:sky:arena',
  THOUSAND_BATTLE = "thousand:battle",

  MICRO_REWARD = "micro:reward",

  GET_VERSION_URL = "get:version:url",
  GET_IS_AUTO_DAILY = "get:auto:daily",
  GET_IS_GAME_STARTED = "get:game:started",
  GET_IS_REFRESH_MONSTER = "get:refresh:monster",
  GET_ACCOUNTS = "get:accounts",
  GET_CHAT_MSG = "get:auto:chat:msg",

  SET_USE_REPAIR_ROLL = "set:repair:roll",
  SET_SELL_OPTIONS = "set:sell:options",
  SET_OFFLINE_EXP_RATE3 = "set:offline:exp:rate3",

  AUTO_ENTER_GAME = "auto:enter:game",

  EXIT_ESCORT = "exit:escort",

  INVOKE_VERSION_INFO = "invoke:version:info",
}

// receive
/** @description 主进程 */
export const enum IPC_MAIN {
  INITIALIZED = "initialized",
  UNINITIALIZED = "uninitialized",

  RECEIVE_VERSION_URL = "receive:version:url",
  RECEIVE_IS_AUTO_DAILY = "receive:auto:daily",
  RECEIVE_IS_GAME_STARTED = "receive:game:started",
  RECEIVE_IS_REFRESH_MONSTER = "receive:refresh:monster",
  RECEIVE_CHAT_MSG = "receive:auto:chat:msg",

  RECEIVE_ACCOUNTS = "receive:accounts",

  GAME_WILL_READY = "game:will:ready",

  INVOKE_VERSION_INFO = "invoke:version:info",
  HANDLE_VERSION_INFO = "handle:version:info",

  SETUP_FUNCTION_STARTED = "setup:function:started",
  SETUP_FUNCTION_ENDED = "setup:function:ended",

  GAME_HOOK_STARTED = "game:hook:started",
  GAME_HOOK_ENDED = "game:hook:ended",

  RELOAD = "reload",
  EXECUTE = "execute",
  EXECUTE_OTHER = "execute:other",

  MOUSE_WHEEL = "mouse:wheel",
}
