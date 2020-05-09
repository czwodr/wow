var wxApp = getApp(),
  http = require("../../api.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    array: ['男', "女"],
    index: 0,
    user_info: '',
    nameShow: false,
    name_input: '',
    mobile: '',
    mobileShow: false,
    mobile_input: "",
    isCode: false,
    downTime: 180000,
    isdownTime: false,
    isSubmitCode: false,
    code_input: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu();
    if (wx.getStorageSync("user_info")) {
      // console.log(wx.getStorageSync("user_info"), "17");
      var user = wx.getStorageSync("user_info");
      this.setData({
        user_info: user,
        // index: parseInt(user.sex),
        index: 0,
        mobile: user.mobile
        // mobile: ""
      })
    }
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
  bindPickerChange: function (e) {
    this.setData({
      index: e.detail.value
    })
    this.data.user_info.sex = e.detail.value;
    this.editInfo(e.detail.value, "")
  },
  onConfirm(event) {
    var that = this;
    if (this.data.name_input.length > 0) {
      this.editInfo("", this.data.name_input);
      that.data.user_info.nickname = this.data.name_input;
      this.setData({
        user_info: that.data.user_info
      })
    }
  },
  name_input(e) {
    this.setData({
      name_input: e.detail.value
    })
  },
  code_input(event) {
    let value = this.validateNumber(event.detail.value);
    this.setData({
      code_input: value,
    });
  },
  popupClose() {
    this.setData({
      mobileShow: false
    });
  },
  setNameShow() {
    this.setData({
      nameShow: true
    });
  },
  editInfo(gender, name) {
    var that = this;
    wxApp.request({
      url: http.user.editInfo,
      data: {
        sex: gender,
        nickname: name
      },
      success: res => {
        if (res.code == 0) {
          wx.setStorageSync('user_info', that.data.user_info);
        }
      }
    })
  },
  setMobile() {
    this.setData({
      mobileShow: true
    });
  },
  arrow_left() {
    this.setData({
      mobileShow: false
    });
  },
  mobile_input(event) {
    // console.log(event.detail);
    // console.log(this.data.isCode);
    let value = this.validateNumber(event.detail.value);
    if (event.detail.cursor == 11) {
      this.data.isCode = true
    } else {
      this.data.isCode = false
    }
    this.setData({
      mobile_input: value,
      isCode: this.data.isCode
    });
  },
  getCode() {
    var that = this;
    if (this.data.isdownTime) {
      return;
    }
    if (that.checkPhone(that.data.mobile_input)) {

      wxApp.request({
        url: http.user.sms,
        data: {
          mobile: that.data.mobile_input,
          code: "reg"
        },
        success: res => {
          if (res.code == 0) {
            wx.showToast({
              title: "验证码已发送 注意查收~",
              icon: "none"
            });
            that.setData({
              isdownTime: true,
              isCode: false,
              isSubmitCode: true
            })
          }
          if (res.code == 1) {
            wx.showToast({
              title: res.msg,
              icon: "none"
            });
          } else {
            wx.showToast({
              title: "请稍候再试~",
              icon: "none"
            });
          }
        }
      })
    } else {
      wx.showToast({
        title: "请输入正确的手机号~",
        icon: "none"
      });
    }
  },
  submitCode() {
    var that = this;
    wxApp.request({
      url: http.user.smsLogin,
      data: {
        mobile: that.data.mobile_input,
        code: that.data.code_input,
        user_id: wx.getStorageSync("user_info").id
      },
      success: res => {
        console.log(res);
        if (res.code == 0) {
          wx.showToast({
            title: "手机号绑定成功",
            icon: "none"
          });
          that.data.user_info.mobile = that.data.mobile_input;
          wx.setStorageSync('user_info', that.data.user_info);
          that.setData({
            mobileShow: false,
            user_info: that.data.user_info,
            mobile: that.data.mobile_input,
          })
        } else {
          wx.showToast({
            title: res.msg,
            icon: "none"
          });
        }
      }
    })
  },
  setDownTime(e) {
    this.setData({
      isdownTime: false
    })
  },
  //数字限制
  validateNumber(val) {
    return val.replace(/\D/g, '')
  },
  checkPhone(value) {
    if (!(/^1(3|4|5|6|7|8|9)\d{9}$/.test(value))) {
      return false;
    } else {
      return true;
    }
  },
  getPhoneNumber: function (t) {
    var that = this;
    wx.login({
      success: function (i) {
        // console.log(res);
        if (i.code) {
          var o = i.code;
          wxApp.request({
            url: http.user.wxappInfo,
            method: "POST",
            data: {
              iv: t.detail.iv,
              encryptedData: t.detail.encryptedData,
              code: o
            },
            success: function (res) {
              // console.log("88", n);
              if (res.code == 0) {
                wx.showToast({
                  title: "手机号绑定成功",
                  icon: "none"
                });
                that.data.user_info.mobile = res.data.mobile;
                console.log(that.data.mobile_input);
                wx.setStorageSync('user_info', that.data.user_info);
                that.setData({
                  mobileShow: false,
                  user_info: that.data.user_info,
                  mobile: res.data.mobile,
                })
              } else {
                wx.showToast({
                  title: res.msg,
                  icon: "none"
                });
              }
            }
          });
        } else wx.showToast({
          title: "获取用户登录态失败！" + i.errMsg,
          image: "/images/icon-warning.png"
        });
      }
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