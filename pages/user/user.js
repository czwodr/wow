var api = require("../../api.js");
const http = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isiphone: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    let isiphone = true;
    wx.getSystemInfo({
      success: function(res) {
        if (res.platform == "devtools") {
          isiphone = true
        } else if (res.platform == "ios") {
          isiphone = true
        } else if (res.platform == "android") {
          isiphone = false
        }
      }
    })

    that.setData({
      isiphone: isiphone
    })

  },
  clear_data() {
    var user_info = wx.getStorageSync("user_info");
    wx.clearStorage();
    wx.showToast({
      title: '清除成功',
      icon: "none"
    });
    wx.setStorageSync("user_info", user_info)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var log_state = wx.getStorageSync("user_info") == "" ? false : true;
    var a = {
      user_info: log_state ? wx.getStorageSync("user_info") : '',
      log_state: log_state
    }
    if (log_state) {
      this.get_userinfo();
    }
    this.setData(a)
  },
  get_userinfo() {
    http.request({
      url: api.user.getuserinfo,
      data: {
        user_id: wx.getStorageSync("user_info").id
      },
      success: res => {
        if (res.code == 0) {
          wx.setStorageSync("user_info", res.data);
          this.setData({
            user_info: res.data
          })
        }
      }
    })
  },
  skip(e) {
    if (!this.data.log_state) {
      return wx.showModal({
        title: '提示',
        content: '您还未登录，请登录后操作',
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: "/pages/login/login"
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
    var url = e.currentTarget.dataset.url
    wx.navigateTo({
      url: url
    })
  },
  go_login(e) {
    var url = e.currentTarget.dataset.url
    wx.navigateTo({
      url: url
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      path: "/pages/index/index",
      title: "玩了这么多年的魔兽，居然不知道，团本打工还能用这个~",
      imageUrl: 'https://wowgame.yigworld.com/static/img/share.jpg'
    };


  }
})