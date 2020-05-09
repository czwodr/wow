var api = require("../../api.js");
const http = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var allocation = JSON.parse(this.options.allocation);
    var status = this.options.status ? this.options.status : 0;
    this.setData({
      allocation_list: allocation,
      status: status
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
  onShow: function() {},
  show_modal(e) {
    var index = e.currentTarget.dataset.index;
    this.setData({
      new_index: index,
      show: true
    })
  },
  showPopup() {
    this.setData({
      show: !this.data.show
    });
  },
  deduct(e) {
    this.setData({
      money: e.detail.value
    })
  },
  money_pay() {
    var index = this.data.new_index;
    var team_list = this.data.allocation_list;
    var new_mesage = team_list[index];
    if (this.data.money) {
      var deduction = this.data.money;
    } else {
      return wx.showToast({
        title: '请输入扣钱金额',
        icon: 'none',
        duration: 2000
      })
    }
    new_mesage.deduction = deduction;
    var channel = (deduction / (team_list.length - 1)).toFixed(2);
    if (new_mesage.currency_type == 1) {
      new_mesage.goldGoin = (new_mesage.goldGoin - deduction).toFixed(2);
      team_list.forEach(item => {
        if (item.userId != new_mesage.userId) {
          item.goldGoin = (parseFloat(item.goldGoin) + parseFloat(channel)).toFixed(2);
        }
      })
    }
    if (new_mesage.currency_type == 2) {
      new_mesage.money = (new_mesage.money - deduction).toFixed(2);
      team_list.forEach(item => {
        if (item.userId != new_mesage.userId) {
          item.money = (parseFloat(item.money) + parseFloat(channel)).toFixed(2);
        }
      })
    }
    team_list[index] = new_mesage;
    this.setData({
      allocation_list: team_list,
      show: !this.data.show
    })

  },
  hint() {
    var that = this;
    http.request({
      url: api.room.promise,
      method: "POST",
      data: {
        team_id: this.options.team_id,
        user_id: wx.getStorageSync("user_info").id,
        currency_type: this.options.currency_type
      },
      success: res => {
        console.log(res.data == 0, "95");
        if (res.data == 3) {
          wx.showModal({
            title: '提示',
            content: '您的分配因连续三次同意人数不足3/4，将被系统强制平分',
            showCancel: false,
            success(res) {
              that.suer_distribution()
            }
          })
        } else {
          that.suer_distribution();
        }
      }
    })
  },
  suer_distribution() {
    http.request({
      url: api.room.distribution,
      method: "POST",
      data: {
        params: this.data.allocation_list,
        user_id: wx.getStorageSync("user_info").id
      },
      success: res => {
        if (res.code == 0) {
          wx.removeStorageSync('subsidy');
          wx.reLaunch({
            url: '/pages/account-team/account-team',
          })
        }
        console.log(res, "42");

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
      wx.navigateTo({
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