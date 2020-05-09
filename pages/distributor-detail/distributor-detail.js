var http = getApp(),
  api = require("../../api.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show_member: false,
    show_punishment: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    this.get_message();
    this.member();
    this.getPayList();
  },
  getPayList() {
    http.request({
      url: api.team.getPayList + "?team_id=" + this.options.team_id,
      method: "get",
      success: res => {
        this.setData({
          teaminfo: res.data.teaminfo
        })
      }
    })
  },
  member() {
    http.request({
      url: api.room.member,
      data: {
        team_id: this.options.team_id
      },
      success: res => {
        var troops = res.data;
        for (let i in troops) {
          troops[i].checked = false;
          troops[i].select = false;
        }
        var team_k = res.data.filter(item => {
          return item.identity == 1
        });
        this.setData({
          team_list: res.data,
          team_k: team_k
        })
      }
    })
  },
  get_message() {
    if (!wx.getStorageSync("subsidy") == "") {
      return (this.setData({
        subsidy: wx.getStorageSync("subsidy").subsidy,
        subsidy_list: wx.getStorageSync("subsidy").subsidy_list
      }))
    }
    http.request({
      url: api.room.room_detail,
      data: {
        room_id: this.options.room_id,
        team_id: this.options.team_id
      },
      success: res => {

        let subsidies_index = res.data.subsidy.currency_type;
        let allot_index = res.data.subsidy.status;
        let danwei = subsidies_index == 2 && allot_index == 2 ? '元' : subsidies_index == 1 && allot_index == 2 ? "币" : subsidies_index == 2 && allot_index == 1 ? '%-元' : subsidies_index == 1 && allot_index == 1 ? "%-币" : '';
        this.setData({
          expenditure: res.data.expenditure,
          subsidy: res.data.subsidy,
          subsidy_list: res.data.subsidy.subsidy,
          danwei: danwei
        })
      }
    })
  },
  show_madel(e) {
    var profession = e.currentTarget.dataset.index;

    this.data.team_list.forEach(e => {
      e.checked = false
    })


    this.setData({
      show_member: !this.data.show_member,
      prof_index: profession,
      team_list: this.data.team_list
    })
  },
  show_punishment() {
    var seat = this.data.subsidy_list;
    var team_list = this.data.team_list;
    team_list.forEach(item => {
      item.select = false;
    })
    var seat_list = [];
    seat.forEach(res => {
      if (res.user_id)
        seat_list = [...seat_list, ...res.user_id]
    })
    seat_list = Array.from(new Set(seat_list));
    seat_list.forEach(res => {
      team_list.forEach(item => {
        if (res == item.user_id) {
          item.select = true;
        }
      })
    })
    this.setData({
      show_punishment: !this.data.show_punishment,
      team_list: team_list
    })
  },
  sure_people() {
    var new_index = this.data.prof_index;
    var people_id = [];
    var select_people = this.data.team_list.filter(res => {
      return res.checked == true
    });
    for (let i in select_people) {
      people_id.push(select_people[i].user_id);
    }
    this.data.subsidy_list[new_index].user_id = people_id;
    this.data.subsidy_list[new_index].user_info = select_people;



    let subsidy_list = this.data.subsidy_list;
    let now_price = 0;
    subsidy_list.forEach(e => {
      if (e.value) {
        let num = 0,
          num_price = 0
        if (e.user_id) {
          num = e.user_id.length;
          num_price = num * parseFloat(e.value);
        }
        now_price = now_price + num_price;
      }
    })

    if (this.data.subsidy.status == 1) {
      if (now_price > 100) {
        wx.showToast({
          title: '当前选择的人数累计百分比' + now_price + '%，已超过100%',
          icon: 'none',
          duration: 3000
        })
        return;
      }
    } else {
      if (this.data.subsidy.currency_type == 2) {
        if (now_price > parseFloat(this.data.teaminfo.amount)) {
          wx.showToast({
            title: '当前选择的人数累计补贴' + now_price + '元，已超过当前总金额' + this.data.teaminfo.amount + '元',
            icon: 'none',
            duration: 3000
          })
          return;
        }
      } else {
        if (now_price > parseInt(this.data.gold_coin)) {
          wx.showToast({
            title: '当前选择的人数累计补贴' + now_price + '金币，已超过当前总金币' + this.data.teaminfo.amount + '金币',
            icon: 'none',
            duration: 3000
          })
          return;
        }
      }
    }



    this.setData({
      show_member: !this.data.show_member,
      subsidy_list: this.data.subsidy_list
    });
  },
  sure_punishment() {
    var select_punishment = this.data.team_list.filter(res => {
      return res.punishment == true
    });
    console.log(select_punishment, "198");
    this.setData({
      punishment_list: select_punishment,
      show_punishment: !this.data.show_punishment
    })
  },
  close_madel() {
    this.setData({
      show_member: false
    })
  },
  close_punishment() {
    this.setData({
      show_punishment: false
    })
  },
  checkboxChange: function (e) {
    var checked = e.detail.value
    var changed = {}
    for (var i = 0; i < this.data.team_list.length; i++) {
      if (checked.indexOf(this.data.team_list[i].user_role_name) !== -1) {
        changed['team_list[' + i + '].checked'] = true;
      } else {
        changed['team_list[' + i + '].checked'] = false;
      }
    }
    this.setData(changed)
  },
  check_punishment: function (e) {
    var checked = e.detail.value
    var changed = {}
    for (var i = 0; i < this.data.team_list.length; i++) {
      if (checked.indexOf(this.data.team_list[i].user_role_name) !== -1) {
        changed['team_list[' + i + '].punishment'] = true
      } else {
        changed['team_list[' + i + '].punishment'] = false
      }
    }
    this.setData(changed);
  },
  allowance() {
    var new_subsidy = this.data.subsidy_list.filter(item => {
      return item.user_id && item.user_id.length > 0
    });
    if (this.data.punishment_list) {
      var punitive = [];
      for (let i in this.data.punishment_list) {
        punitive.push(this.data.punishment_list[i].user_id);
      }
      new_subsidy.push({
        name: "不分钱",
        user_id: punitive,
        value: 0
      })
    }
    var new_message = {};
    new_message.subsidy = this.data.subsidy;
    new_message.subsidy_list = this.data.subsidy_list;
    wx.setStorageSync("subsidy", new_message);
    http.request({
      url: api.room.allowance,
      method: "POST",
      data: {
        room_id: this.options.room_id,
        team_id: this.options.team_id,
        currency_type: this.data.subsidy.currency_type,
        status: this.data.subsidy.status,
        user_id: this.data.team_k[0].user_id,
        subsidy: new_subsidy
      },
      success: res => {
        if (res.code == 0) {
          wx.navigateTo({
            url: '/pages/distributor-sure/distributor-sure?allocation=' + JSON.stringify(res.data) + "&team_id=" + this.options.team_id + "&currency_type=" + this.data.subsidy.currency_type
          })
        }
      }
    })
  },
  skip(e) {
    var url = e.currentTarget.dataset.url
    wx.navigateTo({
      url: url
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
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    wx.removeStorageSync('subsidy');
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