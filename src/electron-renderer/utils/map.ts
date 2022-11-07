import { delay, when } from 'common/functional'
import type { JumpMapOption, NPC } from 'common/types'

export async function jumpMaps(steps: (number | JumpMapOption)[]) {
  for (const step of steps) {
    if (typeof step === 'number') {
      const npcs: NPC[] = window.xworld.npcList.filter((npc: NPC) => npc.isJumpIcon() || Array.isArray(npc.jumpMapID))
      let index = -1
      let _npc
      for (const npc of npcs) {
        index = npc.jumpMapID.findIndex((mapId: number) => mapId === step)
        if (index !== -1) {
          _npc = npc
          break
        }
      }

      if (index === -1 || !_npc)
        window.xworld.doJumpMap(step)
      else
        window.xworld.doJumpMap(step, _npc.jumpMapGx[index], _npc.jumpMapGy[index])
      await delay(100)
      await when(window, () => !window.xworld.isJumpingMap)
    }
    else {
      const npcs: NPC[] = window.xworld.npcList.filter((npc: NPC) => npc.isJumpIcon() || Array.isArray(npc.jumpMapID))
    }
  }
}
