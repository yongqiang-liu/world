import type { COMMAND_PAYLOAD } from 'common/Command'
import { COMMAND } from 'common/Command'
import { ipcMain } from 'electron'

export class GameCommander {
  constructor(readonly webContents: Electron.WebContents) { }

  getId() {
    return new Promise<number>((resolve) => {
      ipcMain.once(COMMAND.BASE, (_, id: number) => {
        resolve(id)
      })

      this.send_command(COMMAND.GAME_USER_ID)
    })
  }

  getMissionCompleteStatusById(id: number) { }

  private send_command(cmd: string, data?: any) {
    this.webContents.send(COMMAND.BASE, {
      cmd,
      data,
    } as COMMAND_PAYLOAD)
  }
}
