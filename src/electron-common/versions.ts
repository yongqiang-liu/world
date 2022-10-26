/**
 * 版本切换
 */

export interface Version {
  name: string
  url: string
}

export const enum VERSION_KEY {
  XIAOQI = '小七',
  TIANYU = '天宇',
  GUANFANG = '官方',
}

export interface VersionMap {
  [key: string]: Version
}

const VersionMap: VersionMap = {};

(function () {
  function Define(name: VERSION_KEY, url: string) {
    VersionMap[name] = {
      name,
      url,
    }
  }

  Define(VERSION_KEY.XIAOQI, 'http://www.x7sy.com/h5game_play/182.html')
  Define(
    VERSION_KEY.TIANYU,
    'https://m.tianyuyou.cn/index/h5game_jump.html?tianyuyou_agent_id=10114&game_id=66953',
  )
  Define(
    VERSION_KEY.GUANFANG,
    'https://worldh5.gamehz.cn/version/world/publish/channel/res/index.html',
  )
})()

export default VersionMap
