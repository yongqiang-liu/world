import type { GameViewState } from './GameView'

export const ONE_KEY_AUTO_MISSION = Symbol()
export const ONE_KEY_SELL = Symbol()
export const ONE_KEY_REPAIR = Symbol()
export const ONE_KEY_REWARD = Symbol()

export const AUTO_SELL = Symbol()
export const AUTO_ESCORT = Symbol()
export const AUTO_CHAT = Symbol()
export const AUTO_REPAIR = Symbol()
export const AUTO_ONLINE_REWARD = Symbol()
export const AUTO_EXPAND_PACKAGE = Symbol()
export const AUTO_REFRESH_MONSTER = Symbol()
export const AUTO_SKIP_BATTLE_ANIM = Symbol()

export const OPTION_SELL_BUILD_MATERIAL = Symbol()
export const OPTION_SELL_RARE_EQUIP = Symbol()
export const OPTION_USE_REPAIR_ROLL = Symbol()
export const OPTION_OFFLINE_RATE3 = Symbol()

export const SAVE_ACCOUNT = Symbol()
export const CHANGE_WINDOW_MODE = Symbol()
export const ADD_ACCOUNT = Symbol()
export const DELETE_ACCOUNT = Symbol()

export const VIEWS_RELOAD = Symbol()

export const enum WindowState {
  UNINITIALIZED = 'uninitialized',
  MIN = 'minimize',
  MAX = 'maximize',
  HIDE = 'hide',
  FOCUS = 'focus',
  INITIALIZED = 'initialized',
}

export interface ViewOptions { }

export interface ViewState {
  id: number
  state: GameViewState
  options: ViewOptions
}
