import EventEmitter from 'events'
import type { COMMAND_PAYLOAD } from 'common/Command'
import { COMMAND } from 'common/Command'
import { ipcRenderer } from 'electron'

export class Commander extends EventEmitter {
  constructor() {
    super()
    this.setMaxListeners(Infinity)
  }
}

export function setupCommander() {
  const commander = new Commander()

  ipcRenderer.on(COMMAND.BASE, (e, payload: COMMAND_PAYLOAD) => {
    commander.emit(payload.cmd, e, payload)
  })

  window.COMMAND_MANAGER = commander
}
