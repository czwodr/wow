var api = require("../../api.js");
var utilMd5 = require('../../utils/md5.js');
const http = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: false,
    deposit: false,
    verification: false,
    downTime: 180000,
    isdownTime: false,
    p: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var mobile = wx.getStorageSync("user_info").mobile;
    var str2 = mobile.substr(0, 3) + "****" + mobile.substr(7);
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
    this.setData({
      mobile: str2,
      isiphone: isiphone
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
    // this.recod_money();
    this.get_userinfo();
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
          });

        }
      }
    })
  },
  money(e) {
    var n = e.detail.value;
    var y = String(n).indexOf(".") + 1;
    var money;
    if (/^(\d?)+(\.\d{0,2})?$/.test(e.detail.value)) { //正则验证，提现金额小数点后不能大于两位数字
      money = e.detail.value;
    } else {
      money = e.detail.value.substring(0, e.detail.value.length - 1);
    }
    this.setData({
      money: money
    })
  },
  deposit_money(e) {
    var money;
    if (/^(\d?)+(\.\d{0,2})?$/.test(e.detail.value)) { //正则验证，提现金额小数点后不能大于两位数字
      money = e.detail.value;
    } else {
      money = e.detail.value.substring(0, e.detail.value.length - 1);
    }
    this.setData({
      deposit_money: money
    })
  },
  getmoney() {
    this.setData({
      deposit: true
    })
    // wx.showToast({
    //   title: '敬请期待',
    //   icon: 'none',
    // })
  },
  money_pay() {
    var that = this;
    wx.showLoading({
        title: '正在加载',
      }),
      http.request({
        url: api.payment.pay,
        method: "POST",
        data: {
          id: 1,
          type: 4,
          user_id: wx.getStorageSync("user_info").id,
          price: this.data.money
        },
        success: res => {
          wx.hideLoading();
          var pay_data = res.data;
          0 == res.code && wx.requestPayment({
            timeStamp: pay_data.timeStamp,
            nonceStr: pay_data.nonceStr,
            package: pay_data.package,
            signType: pay_data.signType,
            paySign: pay_data.paySign,
            success(arr) {
              that.setData({
                show: false
              })
              that.get_userinfo();
              that.recod_money();
            },
            fail(arr) {},
            complete: function(e) {}
          })
        }
      })
  },
  recod_money() {
    wx.showLoading({
        title: '正在加载中',
      }),
      http.request({
        url: api.payment.recode_mony,
        data: {
          user_id: wx.getStorageSync("user_info").id
        },
        success: res => {
          wx.hideLoading();
          this.setData({
            recode: res.data.data,
            p: this.data.p + 1
          })
        }
      })
  },
  application() {
    if (this.data.deposit_money && this.data.deposit_money > 0) {
      if (this.data.deposit_money < 1) {
        return wx.showToast({
          title: '最少提现一元',
          icon: "none"
        })
      }
      if (Number(this.data.deposit_money) > Number(this.data.user_info.balance)) {
        return wx.showToast({
          title: '您余额不足',
          icon: "none"
        })
      }
      this.gain_code(),
        this.setData({
          verification: true,
          deposit: false
        })
    } else {
      return wx.showToast({
        title: '请输入正确金额',
        icon: "none"
      })
    }

  },
  close_verification() {
    this.setData({
      verification: false,
      downTime: 180000,
      isdownTime: false
    })
  },
  verification_code(e) {
    this.setData({
      code: e.detail.value
    })
  },
  gain_code() {
    console.log(111);
    http.request({
      url: api.account.encrypt,
      method: "POST",
      data: {
        user_id: wx.getStorageSync("user_info").id,
        mobile: wx.getStorageSync("user_info").mobile
      },
      success: res => {
        console.log(111);
        console.log(res, "164");
        this.gain_code_child(res.data)

      }
    })
  },
  gain_code_child(e) {
    var data = e;
    e.token = utilMd5.hexMD5(String(wx.getStorageSync("user_info").id))
    http.request({
      url: api.account.encrypt_child,
      method: "POST",
      data: data,
      success: res => {
        if (res.code == 1) {
          wx.showToast({
            title: res.msg,
            icon: 'none'
          })
        } else {
          this.setData({
            isdownTime: true
          })
        }
        console.log(res, "187");
      }
    })
  },
  verification_sure() {
    if (this.data.code) {
      http.request({
        url: api.account.pay_log,
        method: "POST",
        data: {
          user_id: wx.getStorageSync("user_info").id,
          mobile: wx.getStorageSync("user_info").mobile,
          total_price: this.data.deposit_money,
          code: this.data.code
        },
        success: res => {
          this.verification_sure_child(res.data);
        }
      })
    }
  },
  verification_sure_child(e) {
    var data = e;
    data.token = utilMd5.hexMD5(String(wx.getStorageSync("user_info").id))
    http.request({
      url: api.account.pay_log_child,
      method: "POST",
      data: data,
      success: res => {
        if (res.code == 1) {
          wx.showToast({
            title: res.msg,
            icon: 'none'
          })
        }
        if (res.code == 0) {
          var new_info = wx.getStorageSync("user_info");
          new_info.balance = res.data.balance;
          wx.setStorageSync("user_info", new_info)
          this.setData({
            isdownTime: false,
            verification: false,
            downTime: 180000,
            user_info: new_info
          })
          wx.showToast({
            title: res.msg,
            icon: 'none'
          })
        }
      }
    })
  },
  get_userinfo() {
    http.request({
      url: api.user.getuserinfo,
      data: {
        user_id: wx.getStorageSync("user_info").id
      },
      success: res => {
        if (res.code == 0) {
          wx.setStorageSync("user_info", res.data), this.setData({
            user_info: wx.getStorageSync("user_info")
          })
        } else {
          wx.showToast({
            title: res.msg,
            icon: "none"
          })
        }
      }
    })
  },
  setDownTime(e) {
    this.setData({
      isdownTime: false
    })
  },
  showPopup() {
    this.setData({
      show: !this.data.show
    });
  },
  showDeposit() {
    this.setData({
      deposit: !this.data.deposit
    });
  },
  skip(e) {
    var url = e.currentTarget.dataset.url;
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
    this.get_userinfo();
    setTimeout(e => {
      wx.stopPullDownRefresh();
    }, 2000)

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
      imageUrl:'https://wowgame.yigworld.com/static/img/share.jpg'
    };
  }
})