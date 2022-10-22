export const enum EVENTS {
  ENTER_CITY = "enter:city",

  DO_JUMP_MAP = "do:jump:map",

  SELL_ENDED = "sell:ended",
  USED_ITEM = "used:item",

  BAG_WILL_FULL = "bag:will:full",
  BAG_FULL = "bag:full",
  BAG_CLEAN = "bag:clean",
  BAG_REFRESH = "bag:refresh",

  ACCEPT_MISSION = "accept:mission",
  ACCEPT_MISSION_ENDED = "accept:mission:ended",

  ENTER_BATTLE_MAP = "enter:battle:map",
  UPDATE_BATTLE = "update:battle",
  EXIT_BATTLE_MAP = "exit:battle:map",

  ENTER_ESCORT_MAP = "enter:escort:map",
  MOVE_ESCORT_MAP = "move:escort:map",
  ESCORT_EVENT_LIST = "escort:event:list",
  ESCORT_REFRESH = "escort:refresh",
  CHECK_ESCORT_EVENT = "check:escort:event",
  EXIT_ESCORT_MAP = "exit:escort:map",
  ESCORT_ENDED = "escort:ended",
  ACCEPT_ESCORT = "accept:escort",
}

export const enum WorldEvent {
  PLAYER_ACTIVE_SKILL_SELECTED = "player_active_skill_selected",
  AROUND_LOOK_PLAYER_INFO = "around_look_player_info",
  AROUND__REFRESH_TEAM_INFO = "around_refresh_team_info",
  HANG_SELL_READY = "HANG_SELL_READY",
  HANG_SELL_SUCCESS = "hang_sell_success",
  CANCEL_HANG_SELL_SUCCESS = "cancel_hang_sell_success",
  HANG_SELL_BUY_SUCCESS = "hang_sell_buy_success",
  SUPPLY_SUCCESS = "suply_success",
  SUPPLY_IN_BAG = "supply_in_bag",
  RETURN_SEE_ORDER = "return_see_order",
  PUBLIC_ORDER = "PUBLIC_ORDER",
  MERCENARY_REFRESH_INFO = "mercenary_refresh_info",
  SELL_VIEW_UPDATE = "sell_view_update",
  ITEM_SELL_START_SUCCESS = "item_sell_start_success",
  ITEM_SELL_END = "item_sell_end",
  SELL_TYPE_CHANGE = "sell_type_change",
  RETURN_RANK_TYPE_LIST = "return_rank_type_list",
  RETURN_RANK_INFO_LIST = "return_rank_info_list",
  RETURN_MY_RANK_INFO = "RETURN_MY_RANK_INFO",
  ACHIEVE_GET_AWARD = "achieve_get_award",
  RETURN_MASTER_LIST = "RETURN_MASTER_LIST",
  RETURN_DAILY_LOTTERY_DATA = "RETURN_DAILY_LOTTERY_DATA",
  RETURN_DAILY_LOTTERY_DATA_HISTORY = "RETURN_DAILY_LOTTERY_DATA_HISTORY",
  RETURN_FRIEND_ID = "RETURN_FRIEND_ID",
  MANOR_TASK_DOT = "MANOR_TASK_DOT",
  MY_UNION_UPDATE = "MY_UNION_UPDATE",
  COUNTRY_ARMY_BUILD_UPDATE = "COUNTRY_ARMY_BUILD_UPDATE",
  GET_WAR_LIST_BACK = "GET_WAR_LIST_BACK",
  GET_UNION_LIST_BACK = "GET_UNION_LIST_BACK",
  COUNTRY_ARMY_SOLDIER_UPDATE = "COUNTRY_ARMY_SOLDIER_UPDATE",
  COUNTRY_WAR_ARMY_LIST_UPDATE = "COUNTRY_WAR_ARMY_LIST_UPDATE",
  BAG_SHOW_CHECK_STAR = "BAG_SHOW_CHECK_STAR",
  AUTO_ADD_POINT_FINISH = "AUTO_ADD_POINT_FINISH",
  GET_LEVEL_REWARD_SUCCESS = "GET_LEVEL_REWARD_SUCCESS",
  MODE_SHOP_CHANGE = "MODE_SHOP_CHANGE",
  ACTOR_SELL_LIST = "ACTOR_SELL_LIST",
  ACTOR_BUY_LIST = "ACTOR_BUY_LIST",
  ACTOR_SELL_READY = "ACTOR_SELL_READY",
  ACTOR_CANCEL_SELL = "ACTOR_CANCEL_SELL",
  ACTOR_SELL_PANEL_UPDATE = "ACTOR_SELL_PANEL_UPDATE",
  ACTOR_BUY_PANEL_UPDATE = "ACTOR_BUY_PANEL_UPDATE",
}
