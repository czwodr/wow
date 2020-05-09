// pages/room-code/room-code.js
var api = require("../../api.js");
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    top_bar_index: 0,
    group_info_popup: false,
    team_info: "",
    team_info_popup: false,
    open_game: false,
    equip_popup: false,
    select_boss: false,
    auction_type: ["现金", "金币"],
    auction_typeIndex: 1,
    add_equip_popup: false,
    floor_time_wap: ['5', '10', '15', '20', '25', '30'],
    floor_time_pay: ['5', '6', '7', '8', '9', '10'],
    floor_time_wap_index: 5,
    floor_time_pay_index: 0,
    pat_popup: false,
    team_list: "", //团员信息  
    identity: "", //当前用户信息
    team_id: "", //团队id
    user_id: "", //当前用户id
    room_info: "", //房间信息
    boss_list: [],
    auction_equipment: "", //当前竞价的装备的信息
    trading_list: "", //我的交易列表
    pay_setInterval: "", //点击竞价列表的竞价按钮
    info_setInterval: "", //点击竞价列表的竞价按钮
    teamInfo: '',
    select_boss_index: 0,
    equipment_popup: false,
    img_fuben: '',
    now_equip_info: '',
    select_nav_index: 0
  },

  /**
   * 生命周期函数--监听页面加载f
   */
  onLoad: function(options) {},
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let user_info = wx.getStorageSync("user_info");
    this.team_list(this.options.team_id, user_info.id);
    this.team_info(this.options.team_id);

    this.setData({
      user_id: user_info.id,
      team_id: this.options.team_id
    })
    let that = this;

    that.userTeamIdentity(that.options.team_id, user_info.id);
    that.teamStatus();
    this.set_timer();

  },
  //切换拍卖记录
  select_nav(e) {
    let id = e.currentTarget.dataset.id;
    let data = this.data.data_list;
    let a = "status_" + id;
    this.setData({
      select_nav_index: id,
      equipment_popup_list: data[a]
    })
  },
  //boss列表切换
  getboss_list(e) {
    let index = e.currentTarget.dataset.index;
    let id = 0;
    if (index != -1) {
      id = e.currentTarget.dataset.id;
    }

    this.setData({
      select_boss_index: index,
      boss_id: id,
      get_is_floor: false,
    })

    if (index != -1) {
      this.equipment_list();
    }

  },

  //定时任务
  set_timer() {
    let that = this;
    let info_setInterval = setInterval(e => {
      that.userTeamIdentity(that.data.team_id, that.data.user_id);
      that.teamStatus();
      that.team_list(that.data.team_id, that.data.user_id);
      that.equipment_list();
      that.set_equipment();
    }, 3000)
    this.setData({
      info_setInterval: info_setInterval
    })
  },
  //清除任务
  set_clear() {
    clearInterval(this.data.info_setInterval);
    this.setData({
      info_setInterval: null
    })
  },




  //地板金币 审核
  setReview(e) {
    let index = e.currentTarget.dataset.index;
    let order_id = "";

    if (index == "-1") {
      order_id = this.data.floor.order_id;
    } else if (this.data.equipment_popup) {
      order_id = this.data.equipment_popup_list[index].order_id;
    } else {
      order_id = this.data.equip_list[index].order_id;
    }


    app.request({
      url: api.equipment.review + "?order_id=" + order_id,
      method: "get",
      success: res => {
        wx.showModal({
          title: '提示',
          content: res.msg,
        })
        // this.set_clear();
        this.teamStatus();
        this.set_equipment();
        // this.team_info(this.data.team_id, this.data.user_id);
        // this.transaction();
        // this.set_timer();
      }
    })
  },

  //立即付钱、支付
  auction_pay(e) {
    var that = this;
    if (this.data.identity == 3) {
      wx.showModal({
        title: '提示',
        content: '还不是正式团员，不能参加竞价',
      })
      return;
    }
    let index = e.currentTarget.dataset.index;
    let room_info = this.data.room_info;
    let trading_list = "",
      trading_dan = "";
    let str = "";

    if (this.data.equipment_popup) {
      trading_list = this.data.equipment_popup_list[index];

    } else {
      trading_list = this.data.equip_list[index];

    }

    if (index == "-1") {
      let dan = room_info.floorInfo.currency_type == 2 ? '元' : '金币';
      str = {
        team_id: this.data.team_id,
        equipment_id: 0,
        confirm_payment_id: 0,
        equipment_name: 0,
        user_id: this.data.user_id,
        price: parseFloat(room_info.floorInfo.price),
        currency_type: room_info.floorInfo.currency_type,
        auction_log_id: 0,
      }
    } else {
      trading_dan = trading_list.currency_type == 2 ? '元' : '金币';
      str = {
        team_id: trading_list.team_id,
        equipment_id: trading_list.equipment_id,
        confirm_payment_id: trading_list.id,
        equipment_name: trading_list.equipment_name,
        user_id: this.data.user_id,
        price: parseFloat(trading_list.role.price),
        currency_type: trading_list.currency_type,
        auction_log_id: trading_list.role.id,
        auction_equipment_id: trading_list.id
      }
    }



    if (index == "-1") {
      let text = '';
      if (room_info.floorInfo.currency_type == 2) {
        text = '你确定要支付' + parseFloat(room_info.floorInfo.price) + "元成为了地板";
      } else {
        text = '你已经在游戏中向团长转' + parseFloat(room_info.floorInfo.price) + "金币了吗";
      }
      wx.showModal({
        title: '地板售卖',
        content: text,
        success(res) {
          if (res.confirm) {
            app.request({
              url: api.payment.auction_pay,
              method: "POST",
              data: str,
              success: res => {
                if (res.code == 0) {
                  let txt = '';
                  if (room_info.floorInfo.currency_type == 2) {
                    txt = '你已经成功成为地板';
                  } else {
                    txt = '请等待团长审核，你提交的金币';
                  }
                  wx.showToast({
                    title: txt,
                    icon: 'none'
                  })
                } else if (res.code == 1) {
                  wx.showModal({
                    title: '提示',
                    content: res.msg,
                    success(res) {
                      if (res.confirm) {
                        wx.navigateTo({
                          url: "/pages/account/account"
                        })
                      } else if (res.cancel) {}
                    }
                  })

                } else {
                  wx.showModal({
                    title: '提示',
                    content: res.msg
                  })
                }
                that.teamStatus();
              }
            })
          } else if (res.cancel) {}
        }
      })
    } else {
      app.request({
        url: api.payment.auction_pay,
        method: "POST",
        data: str,
        success: res => {
          let text = "";
          if (res.code == 0) {
            text = '你成功支付' + parseFloat(trading_list.role.price) + trading_dan;
            wx.showToast({
              title: text,
              icon: "none"
            })
            that.teamStatus();
            that.equipment_list();
            that.set_equipment();
          } else if (res.code == 1) {
            text = res.msg;
            wx.showModal({
              title: '提示',
              content: text,
              success(res) {
                if (res.confirm) {
                  wx.navigateTo({
                    url: "/pages/account/account"
                  })
                } else if (res.cancel) {}
              }
            })
          } else {
            wx.showModal({
              title: '提示',
              content: res.msg
            })
          }
        }
      })
    }


  },
  //房间信息
  set_room_info(room_id, team_id) {
    app.request({
      url: api.room.room_info + "?room_id=" + room_id + "&team_id=" + team_id,
      method: "get",
      success: res => {
        if (res.code == 0) {
          //获取boss 和 装备
          let id = res.data.transcript_id;
          var transcript_value = wx.getStorageSync("transcript" + id);
          let img_fuben = "https://wowgame.yigworld.com/static/img/b" + id + '.png';
          this.setData({
            img_fuben: img_fuben
          })
          if (transcript_value == "") {
            this.transcriptAndBoos(id);
          } else {
            let select_boss_index = 0;
            if (this.data.select_boss_index == -1) {
              select_boss_index = 0
            } else {
              select_boss_index = this.data.select_boss_index
            }

            // 最后的boss
            let last_Boss = transcript_value.length - 1;
            if (transcript_value[last_Boss].name == "小怪") {
              last_Boss = transcript_value.length - 2;
            }
            this.setData({
              boss_list: transcript_value,
              boss_id: transcript_value[select_boss_index].id,
              transcript_id: res.data.transcript_id,
              last_Boss: last_Boss
            })
            this.equipment_list();
          }

          //地板是否开启
          let is_floor = false;
          if (res.data.floor_status == 1) {
            is_floor = true,
              this.setData({
                select_boss_index: -1
              })
          } else {
            is_floor = false
          }
          this.setData({
            room_info: res.data,
            is_floor: is_floor,
            transcript_id: res.data.transcript_id,
          })
        }
      }
    })
  },
  //团信息
  team_info(team_id, user_id) {
    let that = this
    app.request({
      url: api.team.team_info + "?team_id=" + team_id,
      method: "get",
      success: res => {
        if (res.code == 0) {
          that.set_room_info(res.data.room_id, team_id);
          this.setData({
            team_info: res.data,
            room_id: res.data.room_id
          })

        }
      }
    })
  },
  //成员信息
  team_list(team_id, user_id) {
    app.request({
      url: api.team.team_list + "?team_id=" + team_id + "&user_id=" + user_id,
      method: "get",
      success: res => {
        let role_info = res.list.filter(e => {
          return user_id == e.user_id;
        })

        this.setData({
          team_list: res.data,
          role_info: role_info[0],
          team_list_li: res.list
        })
      }
    })
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
  //解散团队
  teamLeaderDissolutionTeam() {
    let that = this;
    wx.showModal({
      title: '提示',
      content: '你是否要解散团队？',
      success(res) {
        if (res.confirm) {
          app.request({
            url: api.team.teamLeaderDissolutionTeam,
            method: "POST",
            data: {
              team_id: that.data.team_id,
              user_id: that.data.user_id
            },
            success: res => {
              if (res.code == 0) {
                wx.showToast({
                  title: '解散团队成功',
                  icon: "none"
                });
                wx.switchTab({
                  url: '/pages/index/index'
                })
              } else {
                wx.showToast({
                  title: res.msg,
                  icon: "none"
                });
              }
            }
          })
        } else if (res.cancel) {}
      }
    })
  },
  //将成员踢出团队
  removeTeamMember(e) {
    let index_t = e.currentTarget.dataset.index_t;
    let index = e.currentTarget.dataset.index;
    let team_list = this.data.team_list;
    let that = this;
    wx.showModal({
      title: '提示',
      content: '你确定要踢出这个成员吗？',
      success(res) {
        if (res.confirm) {
          app.request({
            url: api.team.removeTeamMember,
            method: "POST",
            data: {
              team_id: that.data.team_id,
              user_leader_id: that.data.user_id,
              user_id: team_list[index_t].list[index].user_id,
            },
            success: res => {
              if (res.code == 0) {
                wx.showToast({
                  title: '踢出成功',
                  icon: "none"
                });
                team_list[index_t].list.splice(index, 1);
                that.setData({
                  team_list: team_list
                })
              }
            }
          })
        } else if (res.cancel) {}
      }
    })


  },
  //用户退出团
  userQuitTeam() {
    app.request({
      url: api.team.userQuitTeam,
      method: "POST",
      data: {
        team_id: this.data.team_id,
        user_id: this.data.user_id
      },
      success: res => {
        if (res.code == 0) {
          wx.showToast({
            title: '退出成功',
            icon: "none"
          });
          wx.switchTab({
            url: '/pages/index/index'
          })
        }
      }
    })
  },
  //审核成员
  checkTeamMember(e) {
    let that = this;
    let id = e.currentTarget.dataset.id;
    let index_t = e.currentTarget.dataset.index_t;
    let index = e.currentTarget.dataset.index;
    let team_list = this.data.team_list;
    let str = {
      team_id: this.data.team_id,
      user_leader_id: this.data.user_id,
      user_id: team_list[index_t].list[index].user_id,
      check_status: id,
    }

    app.request({
      url: api.team.checkTeamMember,
      method: "POST",
      data: str,
      success: res => {
        if (res.code == 0) {
          wx.showToast({
            title: res.msg,
            icon: "none"
          });
          if (id == 1) {
            team_list[index_t].list[index].identity = 2

          } else {
            team_list[index_t].list.splice(index, 1)
          }
          that.setData({
            team_list: team_list
          })
        }
      }
    })
  },
  //副本列表 / boss / 装备
  transcriptAndBoos(id) {
    app.request({
      url: api.boss.transcriptAndBoos,
      method: "POST",
      data: {
        parent_id: id
      },
      success: res => {
        res.forEach(e => {
          e.equipment.forEach(ee => {
            ee.currency_type = "0",
              ee.is_select = false
          })
        })

        // 最后的boss
        let last_Boss = res.length - 1;
        if (res[last_Boss].name == "小怪") {
          last_Boss = res.length - 2;
        }

        wx.setStorage({
          key: "transcript" + id,
          data: res
        })
        let aid = this.data.select_boss_index;
        this.setData({
          boss_list: res,
          boss_id: res[0].id,
          last_Boss: last_Boss
        })
        this.equipment_list();
      }

    })
  },
  //设置价格
  set_price(e) {
    let val = e.detail.value;
    let index = e.currentTarget.dataset.index;
    let b_list = this.data.boss_list;
    let b_index = this.data.boss_index;
    b_list[b_index].equipment[index].clap_price = val;
    this.setData({
      boss_list: b_list
    })
  },
  //全选设置价格
  set_check_price(e) {
    let val = e.detail.value;
    let b_list = this.data.boss_list;
    let b_index = this.data.boss_index;
    b_list[b_index].equipment.forEach(e => {
      if (e.is_select) {
        e.clap_price = val
      }
    })
    this.setData({
      boss_list: b_list
    })
  },
  //选择装备
  set_select_equip(e) {
    let index = e.currentTarget.dataset.index;
    let b_list = this.data.boss_list;
    let b_index = this.data.boss_index;
    let b_check = this.data.check_all;
    let is_check = false;
    let current_li = b_list[b_index].equipment[index];
    if (index == "-1") {
      if (b_check) {
        is_check = false
      } else {
        is_check = true
      }
      b_list[b_index].equipment = b_list[b_index].equipment.map(e => {
        e.is_select = is_check;
        return e
      })

    } else {
      if (current_li.is_select) {
        current_li.is_select = false
      } else {
        current_li.is_select = true
      }
    }
    this.setData({
      boss_list: b_list,
      check_all: is_check
    })
  },
  //选择装备起拍类型
  auction_typeChange(e) {
    let index = e.currentTarget.dataset.index;
    let val = e.detail.value;
    let b_list = this.data.boss_list;
    let b_index = this.data.boss_index;

    if (index == "-1") {
      b_list[b_index].equipment = b_list[b_index].equipment.map(e => {
        if (e.is_select) {
          e.currency_type = val;
        }
        return e
      })
    } else {
      b_list[b_index].equipment[index].currency_type = val;
    }
    this.setData({
      auction_typeIndex: val,
      boss_list: b_list
    })
  },

  skip(e) {
    var url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: url + "&room_id=" + this.data.room_id + "&currency_type=" + this.data.room_info.subsidy.currency_type
    })
  },
  //关闭竞价详情
  close_pat_popup() {
    let that = this;
    clearInterval(this.data.pay_setInterval);
    this.equipment_list(this.data.top_bar_index);
    this.setData({
      pat_popup: false,
      pay_setInterval: ''
    })
  },
  //我的交易
  transaction() {
    app.request({
      url: api.equipment.transaction,
      method: "post",
      data: {
        team_id: this.data.team_id,
        user_id: this.data.user_id
      },
      success: res => {
        if (res.code == 0) {
          this.setData({
            trading_list: res.data
          })
        }
      }
    })
  },


  //点击立即参加竞价
  add_auction(e) {
    if (this.data.identity == 3) {
      wx.showModal({
        title: '提示',
        content: '还不是正式团员，不能参加竞价',
      })
      return;
    }

    let price = 0;
    let equip;

    if (this.data.equipment_popup) {

      if (!this.data.pat_price_list || this.data.pat_price_list.pat_price == 0) {
        wx.showModal({
          title: '提示',
          content: '你的出价必须大于0',
        })
        return;
      }
      price = this.data.pat_price_list.pat_price;
      equip = this.data.equipment_popup_list;
    } else {

      if (!this.data.now_pat_price || this.data.now_pat_price.pat_price == 0) {
        wx.showModal({
          title: '提示',
          content: '你的出价必须大于0',
        })
        return;
      }
      price = this.data.now_pat_price.pat_price;
      equip = this.data.equip_list;
    }


    let index = e.currentTarget.dataset.index;
    console.log(equip, 111111111)

    let str = {
      team_id: this.data.team_id,
      user_id: this.data.user_id,
      auction_equipment_id: equip[index].id,
      equipment_id: equip[index].equipment_id,
      equipment_name: equip[index].equipment_name,
      currency_type: equip[index].currency_type,
      price: price,
      role_id: this.data.role_info.role_id,
      role_name: this.data.role_info.role_name,
    }
    app.request({
      url: api.equipment.add_auction,
      method: "POST",
      data: str,
      success: res => {
        if (res.code == 0) {
          // this.auction_equip();
          wx.showToast({
            title: '成功',
            icon: 'none',
          })
        } else {
          wx.showModal({
            title: '提示',
            content: res.msg
          })
        }
        equip[index].now_pat_price = '';
        this.data.now_pat_price.pat_price = '';
        this.setData({
          equip_list: equip,
          now_pat_price: this.data.now_pat_price
        })
        this.equipment_list();
      }
    })
  },

  //点击列表竞价
  set_pat_popup(e) {
    let index = e.currentTarget.dataset.index;
    let popup_pat = e.currentTarget.dataset.id;
    let equip_list = "";
    if (popup_pat == "popup_pat") {
      equip_list = this.data.equipment_popup_list;
    } else {
      equip_list = this.data.equip_list;
    }
    this.setData({
      pat_popup: true
    })
    this.auction_equip(equip_list[index].id);
  },
  //参加竞价填写金额
  pat_price(e) {
    let index = e.currentTarget.dataset.index;
    let now_pat_price = {
      index: index,
      pat_price: e.detail.value
    }
    // let equip_list = this.data.equip_list;
    // equip_list[index].now_pat_price = e.detail.value
    this.setData({
      now_pat_price: now_pat_price
    })
  },
  pat_price_list(e) {
    let index = e.currentTarget.dataset.index;
    let pat_price_list = {
      index: index,
      pat_price: e.detail.value
    }
    this.setData({
      pat_price_list: pat_price_list
    })
  },
  //竞价装备详情倒数时间结束
  set_equip_finish(e) {
    let index = e.currentTarget.dataset.index;
    let id = e.currentTarget.dataset.id;


    clearInterval(this.data.pay_setInterval);
    if (this.data.pat_popup) {
      wx.showToast({
        title: '竞价结束',
        icon: 'none',
      })
    } else {
      if (id == "0") {
        let auction_equip = this.data.equip_list[index];
        wx.showToast({
          title: "当前" + auction_equip.equipment_name + "装备竞价已结束",
          icon: 'none',
          duration: 5000
        })
        this.equipment_list(this.data.top_bar_index);

      } else if (id == "1") {
        this.transaction();
      }
    }

    this.setData({
      pay_setInterval: ""
    })
  },
  //参加竞价详情接口
  auction_equip(id) {
    app.request({
      url: api.equipment.auction_equip,
      method: "POST",
      data: {
        team_id: this.data.team_id,
        auction_equipment_id: id
      },
      success: res => {
        if (res.code == 0) {
          this.setData({
            now_equip_info: res.data.data
          })
        }
      }
    })
  },
  //填写竞价装备每次加价的金额
  equipIpunt(e) {
    let val = e.detail.value;
    this.setData({
      equip_val: val
    })
  },
  //确定竞价时间和竞价时间、支付时间
  set_eqiop_btn() {
    // if (!this.data.equip_val || this.data.equip_val.length == 0) {
    //   wx.showToast({
    //     title: '请添加每次加价不少于多少钱',
    //     icon: 'none',
    //   })
    //   return;
    // }
    let b_list = this.data.boss_list;
    let b_index = this.data.boss_index;
    let now_arr = this.data.now_arr_equip;
    let equipment_id = '',
      equipment_name = "",
      currency_type = "",
      arr_submit_data = [];
    now_arr.forEach(e => {
      let currency_type = e.currency_type;
      if (currency_type == "0") {
        currency_type = "2"
      }
      arr_submit_data.push({
        team_id: this.data.team_id,
        boss_id: b_list[b_index].id,
        finsih_after_time: this.data.floor_time_wap[this.data.floor_time_wap_index],
        pay_after_time: this.data.floor_time_pay[this.data.floor_time_pay_index],
        equipment_id: e.id,
        equipment_name: e.equipmentChineseName,
        price: e.clap_price,
        // add_price: this.data.equip_val, 目前加价_价格定死
        add_price: 1,
        currency_type: currency_type
      });
    })

    app.request({
      url: api.equipment.addequipment,
      method: "POST",
      data: arr_submit_data,
      success: res => {
        if (res.code == 0) {
          wx.showModal({
            title: '提示',
            content: '设置成功',
            success(res) {}
          })

          b_list[b_index].equipment.map(e => {
            e.is_select = false;
            return e;
          })

          wx.setStorage({
            key: "transcript" + this.data.transcript_id,
            data: b_list
          })
          this.setData({
            equip_popup: false,
            add_equip_popup: false
          })
          this.equipment_list(this.data.top_bar_index);
        }
      }
    })
  },

  //正在竞价列表/交易/流拍
  equipment_list(e) {
    app.request({
      url: api.equipment.getlist,
      method: "POST",
      data: {
        team_id: this.data.team_id,
        user_id: this.data.user_id,
        boss_id: this.data.boss_id,
        is_type: 0,
      },
      success: res => {
        this.setData({
          equip_list: res.data.data
        })
      }
    })
  },
  set_popup_trading() {
    this.setData({
      equipment_popup: true
    })
    this.set_equipment();
  },
  onClose_popup_trading() {
    this.setData({
      equipment_popup: false
    })
  },
  //交易审核
  set_equipment(e) {
    app.request({
      url: api.equipment.getlist,
      method: "POST",
      data: {
        team_id: this.data.team_id,
        user_id: this.data.user_id,
        is_type: 1,
      },
      success: res => {

        let status_0 = res.data.data.filter(e => {
          return e.type == 0;
        })
        let status_3 = res.data.data.filter(e => {
          return e.type == 3;
        })
        let status_4 = res.data.data.filter(e => {
          return e.type == 4;
        })
        let status_2 = res.data.data.filter(e => {
          return e.type == 2;
        })
        let status_1 = res.data.data.filter(e => {
          return e.type == 1 || e.type == 5;
        })
        let data_list = {
          status_0: status_0,
          status_3: status_3,
          status_4: status_4,
          status_2: status_2,
          status_1: status_1,
        }
        let a = "status_" + this.data.select_nav_index;

        this.setData({
          equipment_popup_list: data_list[a],
          data_list: data_list,
          team_num: res.data.team_num,
          team_member_num: res.data.team_member_num,
        })
      }
    })
  },
  add_equip_btn() {
    this.setData({
      equip_popup: true,
    })
  },
  //关闭boss装备起拍价
  close_boss_popup() {
    this.setData({
      equip_popup: false,
      select_boss: false
    })
  },

  //批量添加装备
  add_equip() {
    let b_list = this.data.boss_list;
    let b_index = this.data.boss_index;
    let now_arr = b_list[b_index].equipment.filter(e => {
      return e.is_select;
    })
    if (now_arr.length == 0) {
      wx.showModal({
        title: '提示',
        content: '请选择你要添加的装备',
        success(res) {}
      })
      return;
    }
    let isPrice = true;
    now_arr.forEach(e => {
      if (e.clap_price == "0" || !e.clap_price) {
        isPrice = false;
      }
    })
    if (isPrice) {

      this.setData({
        add_equip_popup: true,
        boss_list: b_list,
        now_arr_equip: now_arr
      })

      // this.set_eqiop_btn();


    } else {
      wx.showModal({
        title: '提示',
        content: '选择的装备要填写的价格不能低于等于0',
        success(res) {}
      })
    }
  },
  floor_time_Change(e) {
    let id = e.currentTarget.dataset.id;
    if (id == "wap") {
      this.setData({
        floor_time_wap_index: e.detail.value
      })
    } else {
      this.setData({
        floor_time_pay_index: e.detail.value
      })
    }
  },
  close_add_popup() {
    this.setData({
      add_equip_popup: false
    })
  },
  //选择boss
  set_select_boss(e) {
    let index = e.currentTarget.dataset.index;

    //最后一个boss装备设置时间 默认时间 设置 10分钟
    if (index == this.data.last_Boss) {
      this.setData({
        floor_time_wap_index: 1
      })
    }


    let id = e.currentTarget.dataset.id;
    this.setData({
      boss_index: index,
      boss_id: id,
      select_boss_index: index,
      select_boss: true
    })
  },

  //开始副本
  open_game() {
    let that = this;
    wx.showModal({
      title: '提示',
      content: '团长请确定所有团员进入房间！',
      success(res) {
        if (res.confirm) {
          app.request({
            url: api.team.startTeam,
            method: "post",
            data: {
              team_id: that.data.team_id,
              user_id: that.data.user_id
            },
            success: res => {
              wx.showToast({
                title: '开启副本成功',
                icon: 'none',
              })
              that.teamStatus();
            }
          })
        } else if (res.cancel) {
          // console.log('用户点击取消')
        }
      }
    })


  },
  //轮询信息已经开启
  teamStatus() {
    let that = this;
    app.request({
      url: api.team.teamStatus,
      method: "post",
      data: {
        team_id: this.data.team_id,
        user_id: this.data.user_id
      },
      success: res => {
        if (res.code == 0) {
          if (res.data.teamMemberInfo.is_del == 2) {
            this.set_clear();
            wx.showModal({
              title: '提示',
              content: '你已被团长踢出！',
              showCancel: false,
              success(res) {
                wx.switchTab({
                  url: "/pages/index/index"
                })
              }
            })
          }

          if (res.data.teamInfo.isdel == 2) {
            this.set_clear();
            wx.showModal({
              title: '提示',
              content: '团长已经解散这个团了！',
              showCancel: false,
              success(res) {
                wx.switchTab({
                  url: "/pages/index/index"
                })
              }
            })
          }

          if (res.data.distributionInfo == 1) {
            this.set_clear();
            wx.showModal({
              title: '提示',
              content: '团长已分账，请前往团账单页面查看。',
              showCancel: false,
              success(res) {
                wx.redirectTo({
                  url: "/pages/account-team/account-team"
                })
              }
            })
          }


          this.setData({
            teamInfo: res.data.teamInfo,
            floor: res.data.floor,
            amount: res.data.amount,
            gold_coin: res.data.gold_coin
          })
        }
      }
    })
  },
  //竞价导航切换
  sw_bar(e) {
    let index = e.currentTarget.dataset.index;
    this.setData({
      equip_list: '',
      trading_list: '',
      top_bar_index: index
    })
    if (index == 3) {
      this.transaction();
    } else {
      this.equipment_list(index);
    }
  },
  //关闭和打开成员详情
  team_popup() {
    this.setData({
      team_info_popup: true
    })
  },
  //关闭成员信息
  close_team_popup() {
    this.team_list(this.data.team_id, this.data.user_id);
    this.setData({
      team_info_popup: false
    })
  },
  //关闭和打开房间详情
  group_popup() {
    this.setData({
      group_info_popup: true
    })
  },
  close_group_popup() {
    this.setData({
      group_info_popup: false
    })
  },
  //返回首页
  handlerGohomeClick() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  //复制
  copyBtn() {
    var room_num = String(this.data.room_info.room_num);

    wx.setClipboardData({
      //去找上面的数据
      data: room_num,
      success: function(res) {
        wx.showToast({
          title: '复制成功',
        });
      }
    });


  },
  //返回首页
  handlerGohomeClick() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },


  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    this.set_clear();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    this.set_clear();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

    // // wx.showNavigationBarLoading()

    //  setTimeout(() => {
    //   // wx.hideNavigationBarLoading()
    //   this.userTeamIdentity(this.data.team_id, this.data.user_id);
    //   this.set_room_info(this.data.team_id, this.data.user_id);
    //   this.equipment_list(this.data.top_bar_index);
    //   this.teamStatus();
    //   this.transaction();

    //   wx.stopPullDownRefresh()
    // }, 2000);
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