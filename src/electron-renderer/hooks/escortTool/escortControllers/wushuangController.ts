import { IPC_MAIN, IPC_RENDERER } from 'common/ipcEventConst'
import { TimeHelper } from 'common/timer'
import { ipcRenderer } from 'electron'

export async function wushuangController(this: any) {
  let loginCount = 0
  let moveCount = 0
  let channel: any

  const paths = [1, 2, 3, 7, 11, 10, 14, 13, 12, 8, 9, 5, 6]

  const events = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]

  this.onEnterEscort = function () {
    this.paths = paths
    this.events = events
    this.moveLock = true
    if (window.xself.isInTeam() && window.xself.isMember()) {
      this.moveLock = true
      channel = new window.BroadcastChannel('wushuang')

      channel.addEventListener('message', (e: any) => {
        if (e.data === 'reload') {
          const members = JSON.parse(localStorage.getItem('wushuang')!)

          members.map((member: any) => {
            if (member.id == window.xself.getId())
              ipcRenderer.send(IPC_MAIN.RELOAD)
          })
        }
      })

      if (localStorage.getItem('status')) {
        channel.postMessage({
          id: window.xself.getId(),
          name: window.xself.playerName,
        })
      }
    }

    if (window.xself.isInTeam() && window.xself.isLeader()) {
      channel = new window.BroadcastChannel('wushuang')
      const members = window.xself.getMembers() || []

      const arr = []
      for (let i = 0; i < members.length; i++) {
        const member = members[i]
        arr.push({
          id: member.id,
          name: member.playerName,
        })
      }

      localStorage.setItem('wushuang', JSON.stringify(arr))
      channel.postMessage('reload')
      setTimeout(() => (this.moveLock = false), 300)
    }
  }

  this.onEnterBattle = function () {}

  this.onExitBattle = function () {}

  this.onExitEscort = function () {
    // 监听退出护送地图
    if (window.xself.isInTeam() && window.xself.isLeader())
      channel.postMessage('exit')

    // setTimeout(() => Mission.doDeleteMissionMsg(xself, xself.missions[0]));
  }

  this.onEscortMove = function () {
    moveCount++
    if (moveCount == 1 && window.xself.isInTeam() && window.xself.isLeader()) {
      this.moveLock = true
      // 这个时候需要发送一个自动登录的指令
      setTimeout(() => {
        ipcRenderer.send(IPC_MAIN.EXECUTE_OTHER, IPC_RENDERER.AUTO_ENTER_GAME)
        localStorage.setItem('status', 'login')
      }, TimeHelper.second(1))
      channel.addEventListener('message', (event: any) => {
        const { id } = event.data

        if (window.xself.getMembers().find((v: any) => v.id === id))
          loginCount++

        if (loginCount === window.xself.getMembers().length)
          this.moveLock = false

        console.log(event.data)
      })
    }

    console.log('移动计数: ', moveCount)
  }
}
