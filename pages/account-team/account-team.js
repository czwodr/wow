var api = require("../../api.js");
const http = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.team_account();
  },
  countDown() {
    this.setData({
      lodingtiem: setTimeout(this.countDown, 1000)
    })
  },
  skip(e) {
    var index = e.currentTarget.dataset.index;
    var message = this.data.account_list[index];
    // wx.navigateTo({
    //   url: "/pages/account-team-detail/account-team-detail?room_message=" + JSON.stringify(message)
    // })
    if (message.isdel != 2 && message.distributionInfo == 0) {
      wx.navigateTo({
        url: "/pages/room-code/room-code?team_id=" + message.team_id
      })
    } else {
      wx.navigateTo({
        url: "/pages/account-team-detail/account-team-detail?room_message=" + JSON.stringify(message)
      })
    }
  },
  team_account() {
    http.request({
      url: api.account.team_account,
      method: "POST",
      data: {
        user_id: wx.getStorageSync("user_info").id
      },
      success: res => {
        if (res.code == 0) {
          this.setData({
            account_list: res.data
          })
        }
      }
    })
  },
  handlerGobackClick(delta) {
    const pages = getCurrentPages();
    if (pages.length >= 2) {
      wx.navigateBack({
        delta: delta
      });
    } else {
      wx.switchTab({
        url: '/pages/index/index'
      });
    }
  },
  handlerGohomeClick() {
    wx.navigateTo({
      url: '/pages/index/index'
    });
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

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