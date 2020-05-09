var api = require("../../api.js");
const http = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    legal_show: false,
    certigier: true,
    img_fuben: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.message(this.options.room_id);
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

  },
  message(e) {
    http.request({
      url: api.room.room_number,
      data: {
        number: e
      },
      success: res => {
        if (res.code == 0) {
          let id = res.data.transcript_id;
          let img_fuben = "https://wowgame.yigworld.com/static/img/b" + id + '.png';
          this.setData({
            img_fuben: img_fuben
          })
        }

        if (res.code == 1) {
          wx.showModal({
            title: '提示',
            content: res.msg,
            showCancel: false,
            success: function (res) {
              wx.navigateBack({
                delta: 1
              })
            },
          })
        } else {
          let subsidies_index = res.data.subsidy.currency_type;
          let allot_index = res.data.subsidy.status;
          let danwei = subsidies_index == 2 && allot_index == 2 ? '元' : subsidies_index == 1 && allot_index == 2 ? "币" : subsidies_index == 2 && allot_index == 1 ? '%-元' : subsidies_index == 1 && allot_index == 1 ? "%-币" : '';

          this.setData({
            room_message: res.data,
            floor_status: res.data.floor_status,
            danwei: danwei
          })
        }
      }
    })
  },
  join() {
    var role_mesage = wx.getStorageSync("role-info");
    var user_info = wx.getStorageSync("user_info")
    var user = {};
    user.user_id = user_info.id;
    user.user_role_name = role_mesage.role_name;
    user.role_id = role_mesage.id;
    user.avatar = user_info.avatar;
    http.request({
      url: api.user.room,
      method: "POST",
      data: {
        room_number: this.options.room_id,
        role_id: role_mesage.id,
        service_id: role_mesage.service_id,
        camp_id: role_mesage.camp_id,
        user_info: user
      },
      success: res => {
        if (res.code == 1) {
          return wx.showToast({
            title: res.msg,
            icon: 'none'
          })
        }
        if (res.code == 0) {
          wx.redirectTo({
            url: '/pages/room-code/room-code?team_id=' + res.data
          })
        }
      }
    })
  },
  reject() {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  certigier() {
    this.setData({
      certigier: !this.data.certigier
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
  legalClose() {
    this.setData({
      legal_show: false
    });
  },
  go_legal_show() {
    this.setData({
      legal_show: true
    });
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