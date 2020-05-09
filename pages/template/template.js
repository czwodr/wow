var http = getApp(),
  api = require("../../api.js");
Page({
  /**
   * 页面的初始数据
   */
  data: {
    id: -1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    
    if (this.options.way && this.options.way == 1) {
      this.setData({
        id: -2
      })
    }
    console.log(this.data.id);
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
    this.template_list();
  },
  template_list() {
    http.request({
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
  skip(e) {
    var index = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "/pages/creative/creative?template_id=" + index
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