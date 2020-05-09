var api = require("../../api.js");
const http = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    grade: [],
    grade_index: 60,
    sever_index: 0,
    talent_index: 0,
    arr1: [{
        name: '联盟',
        id: '1',
        checked: 'true'
      },
      {
        name: '部落',
        id: '2',
      }
    ],
    currentItem: 0,
    tribetemArr: ["请选择", "", ""],
    selectItemArr: [],
    show_madel: false,
    show_tribe: false,
    server_index: 0,
    scrollTop: -1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var arr = [];
    for (let i = 0; i <= 60; i++) {
      arr.push(i)
    }
    this.setData({
      grade: arr
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
    this.server_list();
    this.tribe();
  },
  hint() {
    wx.showToast({
      title: "请选择职业后选择",
      icon: "none"
    })
  },
  server_cut(e) {
    var index = e.currentTarget.dataset.index;
    this.setData({
      server_index: index,
      scrollTop: 0
    })
  },
  search(e) {
    var word = "";
    // if (search_list.length > 0) {

    // }
    console.log(word, "61");
    if (e.detail.value == "") {
      this.server_list();
    } else {
      var word = e.detail.value;
      var search_list = []
      var server_list = this.data.server_list[this.data.server_index].list;
      // for (let i in server_list) {
      //   var code = server_list[i].name.search(word);
      //   if (code != -1) {
      //     search_list.push(server_list[i]);
      //   }
      // }
      server_list.forEach(item => {
        var code = item.name.search(word);
        if (code != -1) {
          search_list.push(item);
        }
      })
      if (search_list.length > 0) {
        this.data.server_list[this.data.server_index].list = search_list
        this.setData({
          server_list: this.data.server_list
        })
      } else {
        wx.showToast({
          title: '您搜索的结果不存在请重新输入',
          icon: 'none',
          duration: 2000,
        })
      }
    }
  },
  scrollNext(e) {
    var now_mesage = e.currentTarget.dataset.item;
    if (this.data.currentItem == 0) {
      wx.showLoading({
        title: '正在加载',
      })
      this.tribe(now_mesage.id),
        this.data.selectItemArr = [now_mesage], this.setData({
          tribetemArr: [now_mesage.name, "请选择", ""],
          selectItemArr: this.data.selectItemArr
        })
    }
    if (this.data.currentItem == 1) {
      wx.showLoading({
        title: '正在加载',
      }), this.tribe(now_mesage.id), this.data.selectItemArr.push(now_mesage)
      this.data.tribetemArr[1] = now_mesage.name,
        this.data.tribetemArr[2] = "请选择"
      this.setData({
        tribetemArr: this.data.tribetemArr,
        selectItemArr: this.data.selectItemArr
      })
    }
    if (this.data.currentItem == 2) {
      wx.showLoading({
        title: '正在加载',
      }), this.tribe(now_mesage.id), this.data.selectItemArr.push(now_mesage)
      this.data.tribetemArr[2] = now_mesage.name
      this.setData({
        tribetemArr: this.data.tribetemArr,
        selectItemArr: this.data.selectItemArr
      }), this.select_talent();
    }
    if (this.data.currentItem < 2) {
      this.setData({
        currentItem: this.data.currentItem + 1
      })
    } else {
      this.setData({
        show_tribe: false
      })
    }
  },
  select_server(e) {
    var index = e.currentTarget.dataset.index;
    var new_index = this.data.server_index
    var list = this.data.server_list[new_index].list;
    for (let i in list) {
      list[i].checked = i == index ? true : false;
    }
    this.data.server_list[new_index].list = list
    this.setData({
      server_list: this.data.server_list
    })
  },
  select_talent() {
    http.request({
      url: api.role.talent,
      data: {
        occupation: this.data.selectItemArr[2].name
      },
      success: res => {
        this.setData({
          talent_list: res.data
        })
      }
    })
  },
  server_save() {
    var select = this.data.server_list[this.data.server_index].list.filter(item => {
      return item.checked == true
    });
    this.setData({
      selec_sever: select[0],
      show_madel: false
    })
  },
  server_list() {
    http.request({
      url: api.role.server,
      data: {
        numPerPage: 100
      },
      success: res => {
        this.setData({
          server_list: res.data.data
        })
      }
    })
  },
  gain_name(e) {
    this.setData({
      game_name: e.detail.value
    })
  },
  rank(e) {
    let val = parseFloat(e.detail.value);
    if (val > 10000) {
      wx.showToast({
        title: '装备评分不能大于10000',
        icon: 'none'
      })
      this.setData({
        new_rank: ""
      })
      return;
    }

    this.setData({
      new_rank: e.detail.value
    })
  },
  increase() {
    if (!this.data.selec_sever) {
      return (
        wx.showToast({
          title: '请选择服务器',
          icon: 'none'
        })
      )
    }
    if (this.data.selectItemArr.length != 3) {
      return (
        wx.showToast({
          title: '请选择阵营',
          icon: 'none'
        })
      )
    }
    if (!this.data.game_name) {
      return (
        wx.showToast({
          title: '请输入名字',
          icon: 'none'
        })
      )
    }
    if (!this.data.new_rank) {
      return (
        wx.showToast({
          title: '请输入装备评分',
          icon: 'none'
        })
      )
    }
    http.request({
      url: api.role.add_role,
      method: "POST",
      data: {
        user_id: wx.getStorageSync("user_info").id,
        service_id: this.data.selec_sever.id,
        service_name: this.data.selec_sever.name,
        camp_id: this.data.selectItemArr[0].id,
        camp_name: this.data.selectItemArr[0].name,
        race_id: this.data.selectItemArr[1].id,
        race_name: this.data.selectItemArr[1].name,
        occupation_id: this.data.selectItemArr[2].id,
        occupation_name: this.data.selectItemArr[2].name,
        role_name: this.data.game_name,
        grade: this.data.grade_index,
        equipment_grade: this.data.new_rank,
        talent: this.data.talent_list[this.data.talent_index].name
      },
      success: res => {
        if (res.code == 0) {
          return wx.showModal({
            title: '提示',
            content: '添加成功',
            showCancel: false,
            success: function(res) {
              wx.navigateBack({
                delta: 1
              })
            }
          })
        } else {
          wx.showModal({
            title: '提示',
            content: res.msg
          })
        }
        if (res.code == 1) {
          wx.showToast({
            title: res.msg,
            icon: "none"
          })
        }
      }
    })
  },
  show_sel() {
    this.server_list(),
      this.setData({
        show_madel: !this.data.show_madel
      })
  },
  show_tribe() {
    this.setData({
      show_tribe: !this.data.show_tribe
    })
  },
  tribe(e) {
    http.request({
      url: api.role.profession,
      data: {
        parent_id: e,
        numPerPage: 100
      },
      success: res => {
        wx.hideLoading();
        if (this.data.currentItem == 1) {
          this.setData({
            arr2: res.data.data
          })
        }
        if (this.data.currentItem == 2) {
          this.setData({
            arr3: res.data.data
          })
        }
      }
    })
  },
  tab_select(e) {
    var index = e.currentTarget.dataset.index;
    if (index == 1) {
      this.data.selectItemArr.splice(1, 1);
      console.log(this.data.selectItemArr.splice(1, 1))
    }
    this.setData({
      currentItem: index,
      selectItemArr: this.data.selectItemArr
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
  bindPickerChange: function(e) {
    this.setData({
      grade_index: e.detail.value
    })
  },
  tralentChange(e) {
    this.setData({
      talent_index: e.detail.value
    })
  },
  bindMultiPickerChange: function(e) {
    this.setData({
      multiIndex: e.detail.value
    })
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