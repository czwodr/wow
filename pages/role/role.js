var api = require("../../api.js");
const http = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '角色列表'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (this.options.id) {
      this.setData({
        id: this.options.id
      })
      let tit = "角色列表";
      if (this.options.id == 1) {
        tit = "加入活动"
      } else if (this.options.id == 2) {
        tit = "创建活动"
      }

      this.setData({
        title: tit
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
    this.gain_role();
    this.template_list();
    let data = wx.getStorageSync('role-info-index');

    let indexdata = {
      index: data.index,
      wx_index: data.wx_index,
    }
    this.checkUserRoomExit();
    this.setData({
      indexdata: indexdata
    })
  },
  // 模板列表
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
  //判断这个用户是否已经进入过房间
  checkUserRoomExit() {
    http.request({
      url: api.room.checkUserRoomExit,
      method: "POST",
      data: {
        user_id: wx.getStorageSync("user_info").id
      },
      success: res => {
        if (res.code == 0) {
          this.setData({
            code_id: res.code
          })
        } else if (res.code == 2) {
          this.setData({
            code_id: res.code,
            checkUserRoomExit: res.data
          })
        }

      }
    })
  },
  role_delete(e) {
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确定要删除这个角色吗？',
      success(res) {
        if (res.confirm) {
          if (that.data.code_id == 0) {
            var index = e.currentTarget.dataset.index;
            var wx_index = e.currentTarget.dataset.wx_index;
            var role_message = that.data.role_lsit[wx_index].list[index];
            http.request({
              url: api.role.role_delete,
              data: {
                id: role_message.id,
                user_id: wx.getStorageSync("user_info").id,
              },
              success: res => {
                if (res.code == 0) {
                  wx.showToast({
                    title: res.data,
                    icon: 'none'
                  })
                  that.data.role_lsit[wx_index].list.splice(index, 1);
                  that.setData({
                    role_lsit: that.data.role_lsit
                  })
                } else {
                  wx.showToast({
                    title: res.msg,
                  })
                }
              }
            })
          } else {
            wx.showToast({
              title: '你当前正在房间中，请结束之后再来删除',
              icon: 'none'
            })
          }
        } else if (res.cancel) {
        }
      }
    })


  },
  gain_role() {
    http.request({
      url: api.role.role_lsit,
      data: {
        user_id: wx.getStorageSync("user_info").id,
      },
      success: res => {
        this.setData({
          role_lsit: res.data.data
        })
      }
    })
  },
  skip(e) {
    var url = e.currentTarget.dataset.url
    wx.navigateTo({
      url: url
    })
  },
  go_back(e) {
    var index = e.currentTarget.dataset.index;
    var wx_index = e.currentTarget.dataset.wx_index;
    let indexdata = {
      index: index,
      wx_index: wx_index,
    }
    this.setData({
      indexdata: indexdata
    })
    var role_message = this.data.role_lsit[wx_index].list[index];
    wx.setStorageSync("role-info", role_message);
    wx.setStorageSync("role-info-index", indexdata);

    if (this.data.id) {

      if (this.data.id == 1) {
        wx.navigateTo({
          url: "/pages/join-us/join"
        })
      } else if (this.data.id == 2) {
        if (this.data.list.length > 0) {
          wx.navigateTo({
            url: '/pages/template/template'
          })
        } else {
          wx.navigateTo({
            url: "/pages/creative/creative"
          })
        }
      }
    }


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