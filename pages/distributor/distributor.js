var api = require("../../api.js");
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.hideShareMenu();
    let user_info = wx.getStorageSync("user_info");
    this.userTeamIdentity(this.options.team_id, user_info.id);
    this.getPayList();
    this.get_message();
  },
  //当前用户的身份
  userTeamIdentity(team_id, user_id) {
    app.request({
      url: api.team.userTeamIdentity,
      method: "POST",
      data: {
        team_id: team_id,
        user_id: user_id
      },
      success: res => {
        if (res.code == 0) {
          this.setData({
            identity: res.data.identity
          })
        }
      }
    })
  },
  getPayList() {
    app.request({
      url: api.team.getPayList + "?team_id=" + this.options.team_id,
      method: "get",
      success: res => {
        this.setData({
          currencyMoney: res.data.currencyMoney,
          currencyCoin: res.data.currencyCoin,
          teaminfo: res.data.teaminfo
        })
      }
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

  },
  /**
   * 没有补贴的跳转 
   */
  get_message() {
    app.request({
      url: api.room.room_detail,
      data: {
        room_id: this.options.room_id,
        team_id: this.options.team_id
      },
      success: res => {
        var subsidy_list = res.data.subsidy.subsidy;
        var select_list = subsidy_list.filter(item => {
          return item.value
        });
        var skip = select_list.length > 0 ? true : false;
        this.setData({
          expenditure: res.data.expenditure,
          subsidy: res.data.subsidy,
          subsidy_list: res.data.subsidy.subsidy,
          select_skip: skip
        })
      }
    })
  },
  allowance() {
    app.request({
      url: api.room.allowance,
      method: "POST",
      data: {
        room_id: this.options.room_id,
        team_id: this.options.team_id,
        currency_type: this.data.subsidy.currency_type,
        status: this.data.subsidy.status,
        user_id: wx.getStorageSync("user_info").id,
        subsidy: []
      },
      success: res => {
        if (res.code == 0) {
          wx.navigateTo({
            url: '/pages/distributor-sure/distributor-sure?allocation=' + JSON.stringify(res.data) + "&team_id=" + this.options.team_id + "&currency_type=" + this.data.subsidy.currency_type + "&status=1"
          })
        }
      }
    })
  },
  hint() {
    var that = this;
    app.request({
      url: api.room.promise,
      method: "POST",
      data: {
        team_id: this.options.team_id,
        user_id: wx.getStorageSync("user_info").id,
        currency_type: this.options.currency_type
      },
      success: res => {
        if (res.data == 3) {
          wx.showModal({
            title: '提示',
            content: '您的分配因连续三次同意人数不足3/4，将被系统强制平分',
            showCancel: false,
            success(res) {
              wx.reLaunch({
                url: '/pages/account-team/account-team',
              })
            }
          })
        } else {
          that.skip();
        }
      }
    })
  },
  skip() {
    var that = this;
    app.request({
      url: api.account.distribution + "?team_id=" + this.options.team_id,
      method: "get",
      success: res => {
        if (res.code == 0) {

          var url = "/pages/distributor-detail/distributor-detail";
          if (parseFloat(this.data.teaminfo.amount) > 0 || parseFloat(this.data.teaminfo.gold_coin) > 0) {
            if (that.data.select_skip) {
              wx.navigateTo({
                url: url + "?team_id=" + this.options.team_id + "&room_id=" + this.options.room_id,
              })
            } else {
              that.allowance();
            }
          } else {
            wx.showToast({
              title: '分配总金额和金币不能都等于0,如需解散请到团员列表',
              icon: "none",
              duration: 3000
            })
            return;
          }
        } else {
          wx.showToast({
            title: res.msg,
            icon: "none"
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