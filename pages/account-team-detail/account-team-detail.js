var api = require("../../api.js");
const http = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lodingtiem: '',
    end_Time: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      room_message: JSON.parse(this.options.room_message)
    })
  },
  // 倒计时
  countDown: function() {
    var that = this;
    var new_endTime = that.data.endTime
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
    });
    if (isiphone) {

      var date = new Date();
      //年  
      var Y = date.getFullYear();
      //月  
      var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
      //日  
      var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
      //时  
      var h = date.getHours();
      //分  
      var m = date.getMinutes();
      //秒  
      var s = date.getSeconds();
      var abcd = Y + "/" + M + "/" + D + " " + h + ":" + m + ":" + s;
      var timestamp = Date.parse(new Date(abcd));
      new_endTime = that.data.endTime.replace(/-/g, '/');
      var nowTime = timestamp; //现在时间（时间戳）;
    } else {
      var nowTime = new Date().getTime(); //现在时间（时间戳）
    }
    var endTime = new Date(new_endTime).getTime() + 10 * 60 * 1000; //结束时间（时间戳）
    var time = (endTime - nowTime) / 1000;
    // 获取天、时、分、秒
    let day = parseInt(time / (60 * 60 * 24));
    let hou = parseInt(time % (60 * 60 * 24) / 3600);
    let min = parseInt(time % (60 * 60 * 24) % 3600 / 60);
    let sec = parseInt(time % (60 * 60 * 24) % 3600 % 60);
    // console.log(day + "," + hou + "," + min + "," + sec)
    day = that.timeFormin(day),
      hou = that.timeFormin(hou),
      min = that.timeFormin(min),
      sec = that.timeFormin(sec)
    that.setData({
      day: that.timeFormat(day),
      hou: that.timeFormat(hou),
      min: that.timeFormat(min),
      sec: that.timeFormat(sec)
    })
    // 每1000ms刷新一次
    if (time > 0) {
      that.setData({
        countDown: true
      })
      that.setData({
        end_Time: setTimeout(that.countDown, 1000)
      })
    } else {
      clearTimeout(that.data.end_Time);
      that.setData({
        countDown: false,
        end_Time: ""
      })
    }
  },
  //小于10的格式化函数（2变成02）
  timeFormat(param) {
    return param < 10 ? '0' + param : param;
  },
  //小于0的格式化函数（不会出现负数）
  timeFormin(param) {
    return param < 0 ? 0 : param;
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
    // this.get_team();
    this.team_king();
    this.team_status();
  },
  team_king() {
    http.request({
      url: api.team.userTeamIdentity,
      method: "POST",
      data: {
        user_id: wx.getStorageSync("user_info").id,
        team_id: this.data.room_message.team_id
      },
      success: res => {
        this.setData({
          identity: res.data.identity
        })
      }
    })
  },
  team_status() {
    http.request({
      url: api.account.team_status,
      data: {
        team_id: this.data.room_message.team_id
      },
      success: res => {
        console.log(res, "104");
        if (res.data == null) {
          return wx.showModal({
            title: '提示',
            content: '该团暂没有产生账单',
            showCancel: false,
            success: function(res) {
              wx.navigateBack({
                delta: 1
              })
            },
          });
        }
        if (res.data.status == 3 || res.data.status == 2) {
          clearTimeout(this.data.lodingtiem);
          clearTimeout(this.data.end_Time);
          this.setData({
            new_status: res.data.status,
            countDown: false
          })
          this.team_message(res.data.id);
        } else {
          this.setData({
            endTime: res.data.create_time,
            countDown: true
          })
          this.get_team();
          this.countDown();
        }
      }
    })
  },
  team_message(e) {
    http.request({
      url: api.account.team_message,
      data: {
        id: e
      },
      success: res => {
        var team_list = res.data.content;
        var new_list = team_list.filter(item => {
          return item.userId == wx.getStorageSync("user_info").id
        })
        var show_vote;
        if (new_list.length > 0) {
          show_vote = true
        } else {
          show_vote = false
        }
        this.setData({
          allot: res.data.content,
          voteDate: res.voteDate,
          show_vote: show_vote,
          endTime: res.data.create_time
        });
        if (res.data.status != 2 && res.data.status != 3) {
          this.countDown();
        }
      }
    })
  },
  get_team() {
    var new_message = this.data.room_message;
    http.request({
      url: api.account.account_detail,
      method: "POST",
      data: {
        team_id: this.data.room_message.team_id,
        user_id: wx.getStorageSync("user_info").id
      },
      success: res => {
        var new_list = res.data.filter(item => {
          return item.userId == wx.getStorageSync("user_info").id;
        });
        var show_vote;
        if (new_list.length > 0) {
          show_vote = true
        } else {
          show_vote = false
        }
        this.setData({
          allot: res.data,
          allot_info: res,
          voteDate: res.voteDate,
          new_userid: wx.getStorageSync("user_info").id,
          show_vote: show_vote
        });
        if (res.status == 2 || res.status == 3) {
          clearTimeout(this.data.lodingtiem);
          clearTimeout(this.data.end_Time);
          this.setData({
            countDown: false
          })
          if (res.status == 3) {
            wx.showModal({
              title: '提示',
              content: '若您的分配因连续三次同意人数不足3/4，将被系统强制平分',
              showCancel: false,
              success: arr => {
                wx.redirectTo({
                  url: '/pages/room-code/room-code?team_id=' + new_message.team_id
                })
              }
            })
          }
        } else {
          this.setData({
            lodingtiem: setTimeout(this.get_team, 1000)
          })
        }
      }
    })
  },
  save_select(e) {
    var status = e.currentTarget.dataset.status;
    var allot_list = this.data.allot
    allot_list[0].vote_status = status;
    http.request({
      url: api.account.startVote,
      method: "POST",
      data: {
        params: allot_list
      },
      success: res => {
        if (res.code == 1) {
          wx.showToast({
            title: res.msg,
            icon: "none"
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

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    clearTimeout(this.data.lodingtiem);
    clearTimeout(this.data.end_Time);
  },
  anew() {
    let new_message = this.data.room_message;
    wx.navigateTo({
      url: '/pages/distributor/distributor?team_id=' + new_message.team_id + "&room_id=" + new_message.room_id,
    })
  },
  skip(e) {
    var url = e.currentTarget.dataset.url;

    wx.navigateTo({
      url: url
    })


  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    clearTimeout(this.data.lodingtiem);
    clearTimeout(this.data.end_Time);
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