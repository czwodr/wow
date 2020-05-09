var util = require('./utils/util.js');
App({
  globalData: {
    isIphonex: ""
  },
  onLaunch: function() {
    var that = this;
    let isiphone = util.isIphoneX()
    that.globalData.isIphonex = isiphone;
  },
  onShow() {
    this.setApi()
  },

  request: require("utils/request.js"),
  api: require("api.js"),
  setApi: function() {
    function e(n) {
      for (var a in n) "string" == typeof n[a] ? n[a] = n[a].replace("{$_api_root}", t) : n[a] = e(n[a]);
      return n;
    }
    var t = "https://wowgame.yigworld.com/index.php";
    // var t = "https://wowgametest.yigworld.com/index.php";
    t = t.replace("index.php", ""), t += "index.php/api/",
      this.api = e(this.api); 
    var n = this.api.default.index,
      a = n.substr(0, n.indexOf("/index.php"));
    this.webRoot = a;
  },
  webRoot: null
})