//index.js
//获取应用实例
var api = require("../../api.js");
const app = getApp()

Page({
  data: {
    log_state: '',
    checkUserRoomExit: ""

  },
  onLoad: function() {},

  onShow() {
    let info = wx.getStorageSync("user_info");
    var log_state = wx.getStorageSync("user_info") == "" ? false : true;
    if (log_state) {
      this.checkUserRoomExit(wx.getStorageSync("user_info").id);
      this.template_list();
    }
    this.setData({
      log_state: log_state,
      info: info
    })
  },
  template_list() {
    app.request({
      url: api.room.template_list,
      data: {
        user_id: wx.getStorageSync("user_info").id
      },
      success: res => {
        this.setData({
          list: res.data
        })
      }
    })
  },
  create() {
    if (this.data.log_state) {

      if (this.data.info.mobile == null || this.data.info.mobile.length == 0) {
        wx.navigateTo({
          url: '/pages/login/login'
        })
        return;
      }
      if (this.data.code_id == 2) {
        wx.showToast({
          title: '你已经在房间中，不能创建活动',
          icon: 'none',
        })
      } else {
        app.request({
          url: api.room.getFaithCount + "?user_id=" + wx.getStorageSync("user_info").id,
          success: res => {
            if (res.code == 0) {
              wx.navigateTo({
                url: '/pages/role/role?id=2'
              })
            } else {
              wx.showToast({
                title: res.msg,
                icon: 'none',
              })
            }
          }
        })
      }
    } else {
      wx.navigateTo({
        url: '/pages/login/login'
      })
    }
  },
  //判断这个用户是否已经进入过房间
  checkUserRoomExit(user_id) {
    app.request({
      url: api.room.checkUserRoomExit,
      method: "POST",
      data: {
        user_id: user_id
      },
      success: res => {
        if (res.code == 0) {
          this.setData({
            code_id: res.code
          })
        } else if (res.code == 2) {
          this.setData({
            code_id: res.code,
            checkUserRoomExit: res.data
          })
        }

      }
    })
  },
  join_activity() {
    if (this.data.log_state) {
      if (this.data.info.mobile.length == 0) {
        wx.navigateTo({
          url: '/pages/login/login'
        })
        return;
      }
      wx.navigateTo({
        url: '/pages/role/role?id=1'
      })
    } else {
      wx.navigateTo({
        url: '/pages/login/login'
      })
    }
  },
  skip(e) {
    var url = e.currentTarget.dataset.url;
    if (this.data.log_state) {
      wx.navigateTo({
        url: url
      })
    } else {
      wx.navigateTo({
        url: '/pages/login/login'
      })
    }


  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      path: "/pages/index/index",
      title: "玩了这么多年的魔兽，居然不知道，团本打工还能用这个~",
      imageUrl: 'https://wowgame.yigworld.com/static/img/share.jpg'
    };
  }
})