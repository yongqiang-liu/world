/**
 * 版本切换
 */

export interface Version {
  name: string;
  url: string;
}

const enum VERSIONNAMES {
  XIAOQI = "小七",
  TIANYU = "天宇",
  GUANFANG = "官方",
}

export interface VersionMap {
  [key: string]: Version;
}

const VersionMap: VersionMap = {};

(function () {
  function Define(name: VERSIONNAMES, url: string) {
    VersionMap[name] = {
      name,
      url,
    };
  }

  Define(VERSIONNAMES.XIAOQI, "http://www.x7sy.com/h5game_play/182.html");
  Define(
    VERSIONNAMES.TIANYU,
    "https://m.tianyuyou.cn/index/h5game_jump.html?tianyuyou_agent_id=10114&game_id=66953"
  );
  Define(
    VERSIONNAMES.GUANFANG,
    "https://worldh5.gamehz.cn/version/world/publish/channel/res/index.html"
  );
})();

export default VersionMap;
