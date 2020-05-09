var api = require("../../api.js");
const http = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    p: 1,
    header_lsit: [{
      name: "全部"
    }, {
      name: "收入"
    }, {
      name: "支出"
    }],
    header_index: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      user_info: wx.getStorageSync("user_info")
    })
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
    this.recod_money();
  },
  recod_money() {
    wx.showLoading({
        title: '正在加载中',
      }),
      http.request({
        url: api.payment.recode_mony,
        data: {
          user_id: wx.getStorageSync("user_info").id,
          numPerPage: 10000
        },
        success: res => {
          wx.hideLoading();
          var amount_list = res.data.data;
          amount_list.forEach(item => {
            item.amount = Number(item.amount)
          })
          var add = [],
            lsoe = [];
          amount_list.map(item => {
            if (item.amount > 0) {
              add.push(item)
            } else {
              lsoe.push(item)
            }
          })
          console.log(add, lsoe, "57");
          this.setData({
            recode: amount_list,
            add: add,
            lsoe: lsoe,
            p: this.data.p + 1
          })
        }
      })
  },
  cut(e) {
    var index = e.currentTarget.dataset.index;
    this.setData({
      header_index: index
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
    wx.showLoading({
        title: '正在加载中',
      }),
      http.request({
        url: api.payment.recode_mony,
        data: {
          user_id: wx.getStorageSync("user_info").id,
          p: this.data.p
        },
        success: res => {
          wx.hideLoading();
          if (res.data.data.length > 0) {
            var new_list = [...this.data.recode, ...res.data.data];
            this.setData({
              p: this.data.p + 1,
              recode: new_list
            })
          } else {
            wx.showToast({
              title: "没有更多了",
              icon: "none"
            })
          }
        }
      })
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