// pages/question/question.js
var api = require("../../api.js");
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    question: [{
      id: 0,
      content: "无法打开小程序"
    }, {
      id: 1,
      content: "卡顿"
    }, {
      id: 2,
      content: "小程序死机"
    }, {
      id: 3,
      content: "界面错误"
    }, {
      id: 4,
      content: "其他异常"
    },],
    radio: '',
    fileList: [],
    disabled: true,
    textarea: '',
    fileListImg: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let user_info = wx.getStorageSync("user_info");
    this.setData({
      user_id: user_info.id,
    })
    wx.hideShareMenu();
  },
  //问题提交
  feedback() {
    let that = this,
      arrImg = "";

    app.request({
      url: api.user.addQusetion,
      method: "POST",
      data: {
        user_id: this.data.user_id,
        content: {
          title: this.data.question[this.data.radio].content,
          content: that.data.textarea,
        },
      },
      success: res => {
        if (res.code == 0) {
          wx.showModal({
            title: '提示',
            content: "提交成功",
            showCancel: false,
            success(res) {
              if (res.confirm) {
                // console.log('用户点击确定')
                wx.switchTab({
                  url: '/pages/index/index'
                })
              }
            }
          })
        }
      }
    })
  },
  radioChange(event) {
    this.setData({
      radio: event.detail
    });
    if (this.data.radio.length > 0 && this.data.textarea.length > 0) {
      this.setData({
        disabled: false
      });
    }
  },
  onClick(event) {
    const {
      name
    } = event.currentTarget.dataset;
    this.setData({
      radio: String(name)
    });
    if (this.data.radio.length > 0 && this.data.textarea.length > 0) {
      this.setData({
        disabled: false
      });
    }
  },

  delete(event) {
    this.data.fileList.splice(event.detail.index, 1);
    this.setData({
      fileList: this.data.fileList
    });
  },
  bindtextarea(event) {
    const {
      value
    } = event.detail;
    let isdisabled = "";
    if (this.data.radio.length > 0 && value.length > 0) {
      isdisabled = false;
    } else if (this.data.radio.length == 0 || value.length == 0) {
      isdisabled = true;
    }
    this.setData({
      textarea: value,
      disabled: isdisabled
    });
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