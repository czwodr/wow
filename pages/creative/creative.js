var api = require("../../api.js");
var app = getApp();
Page({
  data: {
    transcript: "",
    transcriptText: {
      id: -1,
      name: "选择副本"
    },
    transcript_popup: false,
    subsidies_type: [{
        type: 2,
        value: '现金',
        checked: false
      },
      {
        type: 1,
        value: '金币',
        checked: true
      }
    ],
    subsidies_index: 1,
    allot_type: [{
        type: 1,
        value: '百分比',
        checked: false
      },
      {
        type: 2,
        value: '固定',
        checked: true
      }
    ],
    allot_index: 2,
    popupshow: false,
    subsidyPopup: false,
    subsidyData: [{
        type: 2,
        value: '不开启',
        checked: true
      },
      {
        type: 1,
        value: '开启',
        checked: false
      }
    ],
    subsidyNum:2,
    subsidy_data: [{
        "name": "指挥",
        "list": [{
          "name": "指挥",
          "value": ""
        }]
      },
      {
        "name": "T",
        "list": [{
            "name": "MT",
            "value": ""
          }, {
            "name": "FT",
            "value": ""
          }, {
            "name": "抗性",
            "value": ""
          },
          {
            "name": "酱油",
            "value": ""
          }
        ]
      }, {
        "name": "HPS",
        "list": [{
          "name": "H1st",
          "value": ""
        }, {
          "name": "H2nd",
          "value": ""
        }, {
          "name": "H3rd",
          "value": ""
        }, {
          "name": "H4th",
          "value": ""
        }, {
          "name": "H5th",
          "value": ""
        }]
      }, {
        "name": "DPS",
        "list": [{
          "name": "D1st",
          "value": ""
        }, {
          "name": "D2nd",
          "value": ""
        }, {
          "name": "D3rd",
          "value": ""
        }, {
          "name": "D4th",
          "value": ""
        }, {
          "name": "D5th",
          "value": ""
        }]
      }, {
        "name": "其他",
        "list": [{
          "name": "驱散",
          "value": ""
        }, {
          "name": "灭火",
          "value": ""
        }, {
          "name": "召唤",
          "value": ""
        }]
      }
    ],
    output: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    high_dps: {
      key: 1,
      value: "0"
    },
    high_hps: {
      key: 1,
      value: "0"
    },
    floor_time_wap: ['5', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55', '60'],
    floor_time_pay: ['5', '6', '7', '8', '9', '10'],
    floor_time_wap_index: 5,
    floor_time_pay_index: 0,
    floor: [{
        type: 2,
        value: '不开启',
        checked: true
      },
      {
        type: 1,
        value: '开启',
        checked: false
      }
    ],
    floorNum: 1,
    floorEquip: [{
        name: 1,
        value: '紫',
        checked: false
      },
      {
        name: 2,
        value: '蓝',
        checked: false
      },
      {
        name: 3,
        value: '绿',
        checked: false
      }
    ],
    floorEquipNum: "",
    equip_popup: false,
    boss_list: [],
    boss_index: "", //选择当前第几个boss
    select_boss: false,
    check_all: false, //全选
    auction_type: ["现金", "金币"],
    auction_typeIndex: 1,
    floor_popup: false,
    floor_way: [{
        type: 2,
        value: '现金',
        checked: false
      },
      {
        type: 1,
        value: '金币',
        checked: true
      }
    ],
    floor_info: { //起拍地板信息
      currency_type: 2, //币种，2-现金，1-金币
      price: "", //价格
      add_price: "", //每次加价
      purple: 2, //紫 1-开启，2-不开启
      blue: 2, //蓝 1-开启，2-不开启
      green: 2, //绿 1-开启，2-不开启
      end_time: "30", //结束时间
      pay_end_time: "5", //支付时间
    },
    user_info: "", //用户信息,
    role_info: "", //角色信息
    roomNumber: "", //房间号
    yy_room_number: "", //YY房间号
    expenditure: "", //支出
    note: "", //团长备注
    floor_status: 2,
    modify:false
  },
  onLoad: function(options) {

    // if (this.options.template_id == -2){
    //   this.setData({
    //     modify:true
    //   })
    // }


    if (this.options.template_id && (this.options.template_id != -1 && this.options.template_id != -2)) {
      this.template(this.options.template_id);
    }
    var role_info = wx.getStorageSync("role-info");
    if (role_info) {
      this.setData({
        role_info: role_info
      })
    } else {
      wx.redirectTo({
        url: '/pages/role/role'
      })
    }


    var user_info = wx.getStorageSync("user_info");
    this.setData({
      user_info: user_info
    })
    this.createRoomNumber();
    this.transcriptAndBoos(0);


    let subsidies_index = this.data.subsidies_index;
    let allot_index = this.data.allot_index;
    let danwei = subsidies_index == 2 && allot_index == 2 ? '元' : subsidies_index == 1 && allot_index == 2 ? "币" : subsidies_index == 2 && allot_index == 1 ? '%-元' : subsidies_index == 1 && allot_index == 1 ? "%-币" : '';

    this.setData({
      danwei: danwei
    })
  },
  //确定房间创建
  confirm_Start() {
    var that = this;
    let current_data = this.data;
    let subsidy_data = this.data.subsidy_data;
    let expenditure = this.data.expenditure;
    if (this.data.subsidyNum==2){
      expenditure = '';
      subsidy_data.forEach(e => {
        e.list.forEach(elist => {
          elist.value = '';
        })
      })
    }


    let subsidy = {
      currency_type: this.data.subsidies_index,
      status: this.data.allot_index,
      subsidy: subsidy_data
    }

    let id = this.data.transcriptText.id;
    if (id == -1) {
      wx.showToast({
        title: '请选择副本',
        icon: 'none',
      })
      return;
    }

    let createRoomStr = {
      room_num: current_data.roomNumber, //房间号
      service_id: this.data.role_info.service_id, //服务器id
      service_name: this.data.role_info.service_name, //服务器名称
      camp_id: this.data.role_info.camp_id, //阵营id
      camp_name: this.data.role_info.camp_name, //阵营名称
      transcript_id: current_data.transcriptText.id, //副本id 
      transcript_name: current_data.transcriptText.name, //副本id 
      team_type: "自强", //
      equipment_score: 0, //装备评分
      subsidy: subsidy, //补贴方式
      yy_room_number: current_data.yy_room_number, //YY房间号
      expenditure: expenditure, //支出
      high_dps: current_data.high_dps, //DPS需高于第一名的百分比
      high_hps: current_data.high_hps, //HPS需高于第一名的百分比
      floor_status: current_data.floor_status, //是否开启底板，1-开启，2-不开启
      floor_info: current_data.floor_info, //底板信息 
      note: current_data.note, //底板信息 
      user_info: {
        user_id: this.data.user_info.id,
        user_role_name: this.data.role_info.role_name,
        role_id: this.data.role_info.id,
        avatar: this.data.user_info.avatar,
      }, //用户信息 
    }
    var subsidy_template = createRoomStr;
    // subsidy_template.subsidy = createRoomStr.subsidy.subsidy;
    // subsidy_template.high_dps = createRoomStr.high_dps;
    // subsidy_template.high_hps = createRoomStr.high_hps;

    // this.savetemplate(subsidy_template);
    // return;
    app.request({
      url: api.room.createRoom,
      method: "POST",
      data: createRoomStr,
      success: res => {
        if (res.code == 0) {
          if (this.options.template_id && this.options.template_id != -1) {
            wx.showModal({
              title: '提示',
              content: '是否更新当前模板？',
              showCancel: true,
              success: function(arr) {
                if (arr.confirm) {
                  that.updatatemplate(subsidy_template);
                }
                wx.redirectTo({
                  url: '/pages/room-code/room-code?team_id=' + res.data.team_id
                })
              },
            })

          } else {
            if (this.options.template_id && this.options.template_id == -1) {
              that.savetemplate(subsidy_template, res.data.team_id);
            } else {
              wx.showModal({
                title: '提示',
                content: '是否保存为模板？',
                showCancel: true,
                success: function(arr) {
                  if (arr.confirm) {
                    that.savetemplate(subsidy_template, "");
                  }
                  wx.redirectTo({
                    url: '/pages/room-code/room-code?team_id=' + res.data.team_id
                  })
                }
              })
            }
          }
        } else {
          wx.showToast({
            title: res.msg,
            icon: 'none',
          })
        }
      }
    })

  },
  savetemplate(e, d) {
    e.room_num = '';

    app.request({
      url: api.room.template,
      method: "POST",
      data: {
        subsidy_template: e,
        user_id: wx.getStorageSync("user_info").id
      },
      success: res => {
        if (this.options.template_id && this.options.template_id == -1) {
          wx.redirectTo({
            url: '/pages/room-code/room-code?team_id=' + d
          })
        }
      }
    })
  },
  updatatemplate(e) {
    e.room_num = '';
    app.request({
      url: api.room.template_updata,
      method: "POST",
      data: {
        subsidy_template: e,
        id: this.options.template_id
      },
      success: res => {}
    })
  },
  setNote(e) {
    this.setData({
      note: e.detail.value
    })
  },
  //设置yy 房间号
  set_yy(e) {
    this.setData({
      yy_room_number: e.detail.value
    })
  },
  //设置支出
  // set_expenditure(e) {
  //   this.setData({
  //     expenditure: e.detail.value
  //   })
  // },

  //补贴方式
  subsidiesChange(e) {
    let id = e.currentTarget.dataset.id;
    if (id == "0") {
      this.setData({
        subsidies_index: e.detail.value
      })
    } else if (id == "1") {
      this.setData({
        allot_index: e.detail.value
      })
    }
    let subsidies_index = this.data.subsidies_index;
    let allot_index = this.data.allot_index;
    let danwei = subsidies_index == 2 && allot_index == 2 ? '元' : subsidies_index == 1 && allot_index == 2 ? "币" : subsidies_index == 2 && allot_index == 1 ? '%-元' : subsidies_index == 1 && allot_index == 1 ? "%-币" : '';

    this.setData({
      danwei: danwei
    })
  },
  //设置补贴
  subsidiesInput(e) {
    let val = e.detail.value;
    let index = e.currentTarget.dataset.index;
    let idx = e.currentTarget.dataset.idx;
    let subsidy_data = this.data.subsidy_data;

    subsidy_data[index].list[idx].value = val
    let isval = 0;
    subsidy_data.forEach(e => {
      e.list.forEach(elist => {
        if (elist.value) {
          isval = isval + parseFloat(elist.value);
        }
      })
    })
    if (this.data.allot_index == 1) {


      if (isval >= 100) {
        wx.showToast({
          title: '你的补贴百分比已超过百分之百',
          icon: 'none'
        })
        subsidy_data[index].list[idx].value = "";
        isval = 0;
        subsidy_data.forEach(e => {
          e.list.forEach(elist => {
            if (elist.value) {
              isval = isval + parseFloat(elist.value);
            }
          })
        })
      }
    }

    this.setData({
      subsidy_data: this.data.subsidy_data,
      expenditure: isval
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



  //副本选择
  transcriptConfirm(e) {
    this.setData({
      transcriptText: e.detail.value,
      transcript_popup: false
    })
  },
  //副本关闭
  transcriptCancel() {
    this.setData({
      transcript_popup: false
    })
  },
  //副本打开
  set_transcript_popup() {
    this.setData({
      transcript_popup: true
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
        if (id == 0) {
          let str = res.map(e => {
            if (e.type == "0") {
              e.disabled = true;
            }
            return e;
          })
          this.setData({
            transcript: str
          })
        } else {
          res.forEach(e => {
            e.equipment.forEach(ee => {
              ee.currency_type = "1"
            })
          })


          wx.setStorage({
            key: "transcript" + id,
            data: res
          })
          this.setData({
            boss_list: res
          })
        }
      }
    })
  },
  // 生成房间号
  createRoomNumber() {

    let user = {
      user_id: this.data.user_info.id,
      user_role_name: "地域之门",
      role_id: "1",
      avatar: this.data.user_info.avatar
    }
    app.request({
      url: api.room.createRoomNumber,
      method: "POST",
      data: {
        user_info: user
      },
      success: res => {

        if (res.code == 0) {
          this.setData({
            roomNumber: res.data.roomNumber
          })
        }
      }
    })
  },


  //设置地板
  set_floor_btn() {
    if (this.data.floor_info.price.length == 0) {
      wx.showToast({
        title: '售买价不能为空',
        icon: 'none',
      })
      return;
    }

    if (this.data.floor_info.purple == 1 || this.data.floor_info.blue == 1 || this.data.floor_info.green == 1) {
      this.setData({
        floor_popup: false
      })
    } else {
      wx.showToast({
        title: '地板收购装备颜色勾选不能为空',
        icon: 'none',
      })
    }


  },
  close_floor_btn() {
    // let arr = this.data.floor.map(e => {
    //   if (e.type == this.data.floorNum) {
    //     e.checked = false;
    //   } else {
    //     e.checked = true;
    //   }
    //   return e;
    // })
    this.data.floor[0].checked = true;
    this.data.floor[1].checked = false;

    this.setData({
      floor_popup: false,
      floor: this.data.floor
    })
  },
  //选择boss
  set_select_boss(e) {
    let index = e.currentTarget.dataset.index;
    this.setData({
      boss_index: index,
      select_boss: true
    })
  },
  //确定装备起拍价格和选择的币种
  set_boss_equip_btn() {
    this.data.boss_list.forEach(e => {
      e.equipment.forEach(ee => {
        ee.is_select = false
      })
    })


    wx.setStorage({
      key: "transcript" + this.data.transcriptText.id,
      data: this.data.boss_list
    })
    this.setData({
      select_boss: false,
      check_all: false,
      boss_list: this.data.boss_list
    })
  },
  //选择boss装备起拍价
  equip_boss_Start() {
    let id = this.data.transcriptText.id;
    if (id == -1) {
      wx.showToast({
        title: '请选择副本',
        icon: 'none',
      })
      return;
    }

    var transcript_value = wx.getStorageSync("transcript" + id);
    if (transcript_value == "") {
      this.transcriptAndBoos(id);
    } else {
      this.setData({
        boss_list: transcript_value
      })
    }
    this.setData({
      equip_popup: true
    })
  },


  //关闭boss装备起拍价
  close_boss_popup() {
    this.data.boss_list.forEach(e => {
      e.equipment.forEach(ee => {
        ee.is_select = false
      })
    })
    this.setData({
      boss_list: this.data.boss_list,
      check_all:false,
      equip_popup: false,
      select_boss: false
    })
  },

  //副本的选择
  checkpointChange(e) {
    this.setData({
      checkpointIndex: e.detail.value
    })
  },

  //选择虚高第几名
  outputChange(e) {
    let id = e.currentTarget.dataset.id;
    let DPS = this.data.high_dps;
    let HPS = this.data.high_hps;
    if (id == "DPS") {
      DPS.key = this.data.output[e.detail.value]
    } else {
      HPS.key = this.data.output[e.detail.value]
    }
    this.setData({
      high_dps: DPS,
      high_hps: HPS,
    })
  },
  //虚高多少的百分比
  outputInput(e) {
    let id = e.currentTarget.dataset.id;
    let DPS = this.data.high_dps;
    let HPS = this.data.high_hps;
    if (id == "DPS") {
      DPS.value = e.detail.value
    } else {
      HPS.value = e.detail.value
    }
    this.setData({
      high_dps: DPS,
      high_hps: HPS,
    })
  },

  //选择地板
  floorChange(e) {
    if (e.detail.value == 1) {
      this.setData({
        floor_popup: true,
        floor_status: 1,
        floorNum: e.detail.value,
      })
    } else {
      this.setData({
        floorNum: e.detail.value,
        floor_status: 2
      })
    }

  },
  floorTap() {
    if (this.data.floor_status == 1) {
      this.setData({
        floor_popup: true
      })
    }
  },
  //补贴关闭
  subsidyPopup_close() {
    let subsidyData = this.data.subsidyData;
    subsidyData[0].checked = true
    subsidyData[1].checked = false

    this.setData({
      subsidyPopup: false,
      subsidyData: subsidyData
    })
  },
  //确定补贴方式
  set_subsidy() {


    if (this.data.expenditure.length == 0) {
      wx.showToast({
        title: '你的补贴方式不能为空！',
        icon: 'none',
        duration: 3000
      })
      return;
    }

    this.setData({
      subsidyPopup: false,
    })

  },
  //补贴设置
  subsidyChange(e) {
    if (e.detail.value == 1) {
      this.setData({
        subsidyPopup: true,
        subsidyNum: e.detail.value,
      })
    } else {
      this.setData({
        subsidyPopup: false,
        subsidyNum: e.detail.value,
      })
    }
  },
  subsidyTap() {
    if (this.data.subsidyNum == 1) {
      this.setData({
        subsidyPopup: true
      })
    }
  },
  //选择地板起拍币种
  floor_way_Change: function(e) {
    let val = e.detail.value;
    let floor_way = this.data.floor_way;
    floor_way.forEach(s => {
      if (s.type == val) {
        s.checked = true
      } else {
        s.checked = false
      }
    })
    this.data.floor_info.currency_type = val;
    this.setData({
      floor_info: this.data.floor_info,
      floor_way: floor_way
    })
  },
  //设置地板起拍价格/每次加价金额
  floor_price(e) {
    let id = e.currentTarget.dataset.id;
    let val = e.detail.value;
    if (id == "0") {
      this.data.floor_info.price = val;
      // this.data.floor_info.price = 0;
    } else {
      // this.data.floor_info.add_price = val;
      this.data.floor_info.add_price = 0;
    }
    this.setData({
      floor_info: this.data.floor_info
    })
  },
  //选择地板装备颜色
  floorEquipcheckbox(e) {
    let arr = e.detail.value;
    let floorEquip = this.data.floorEquip;
    let floor_info = this.data.floor_info;
    floor_info.purple = 2;
    floor_info.blue = 2;
    floor_info.green = 2;
    floorEquip = floorEquip.map(s => {
      s.checked = false;
      return s;
    })
    arr.forEach(s => {
      floorEquip = floorEquip.map(a => {
        if (s == a.name) {
          a.checked = true;
        }
        return a;
      })

      if (s == "1") {
        floor_info.purple = 1;
      } else if (s == "2") {
        floor_info.blue = 1
      } else if (s == '3') {
        floor_info.green = 1
      }
    })


    this.setData({
      floor_info: floor_info,
      floorEquip: floorEquip
    })
  },

  //设置地板时间
  floor_time_Change(e) {
    let id = e.currentTarget.dataset.id;
    let val = e.detail.value;
    let floor_info = this.data.floor_info;
    let floor_time_wap = this.data.floor_time_wap;
    let floor_time_pay = this.data.floor_time_pay;
    if (id == "wap") {
      // floor_info.end_time = floor_time_wap[val]
      floor_info.end_time = 0
    } else {
      // floor_info.pay_end_time = floor_time_pay[val]
      floor_info.pay_end_time = 0
    }
    this.setData({
      floor_info: floor_info
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
  }, // 模板详情
  template(e) {
    app.request({
      url: api.room.template_detail,
      data: {
        id: e
      },
      success: res => {
        let subsidy_data = '',
          yy_room_number = '';
        if (res.data.subsidy_template.subsidy.subsidy) {
          subsidy_data = res.data.subsidy_template.subsidy.subsidy;
          yy_room_number = res.data.subsidy_template.yy_room_number;
          let subsidies_type = this.data.subsidies_type;
          let allot_type = this.data.allot_type;
          let floor = this.data.floor;
          let floorEquip = this.data.floorEquip;
          let floor_way = this.data.floor_way;
          let currency_type = res.data.subsidy_template.subsidy.currency_type;
          let status = res.data.subsidy_template.subsidy.status;
          let floor_status = res.data.subsidy_template.floor_status;
          let floor_info = res.data.subsidy_template.floor_info;
          let expenditure = res.data.subsidy_template.expenditure;
          let transcriptText_id = res.data.subsidy_template.transcript_id;
          let transcriptText_name = res.data.subsidy_template.transcript_name;
          this.data.transcriptText.id = transcriptText_id;
          this.data.transcriptText.name = transcriptText_name;
          subsidies_type = subsidies_type.map(e => {
            e.checked = false;
            if (currency_type == e.type) {
              e.checked = true
            }
            return e;
          })
          allot_type = allot_type.map(e => {
            e.checked = false;
            if (status == e.type) {
              e.checked = true
            }
            return e;
          })

          floor_way = floor_way.map(e => {
            e.checked = false;
            if (floor_info.currency_type == e.type) {
              e.checked = true
            }
            return e;
          })
          floor = floor.map(e => {
            e.checked = false;
            if (floor_status == e.type) {
              e.checked = true
            }
            return e;
          })

          floorEquip = floorEquip.map(e => {
            if (e.name == 1) {
              if (floor_info.purple == 1) {
                e.checked = true
              } else {
                e.checked = false
              }
            } else if (e.name == 2) {
              if (floor_info.blue == 1) {
                e.checked = true
              } else {
                e.checked = false
              }
            } else if (e.name == 3) {
              if (floor_info.green == 1) {
                e.checked = true
              } else {
                e.checked = false
              }
            }
            return e;
          })

          let subsidyData = this.data.subsidyData;
          let subsidyNum = this.data.subsidyNum;

          if (expenditure.length>0){
            subsidyData[0].checked = false
            subsidyData[1].checked = true
            subsidyNum = 1
          }

          



          this.setData({
            subsidies_index: currency_type,
            allot_index: status,
            subsidies_type: subsidies_type,
            allot_type: allot_type,
            floor: floor,
            floor_way: floor_way,
            floor_status: floor_status,
            floorEquip: floorEquip,
            floor_info: floor_info,
            note: res.data.subsidy_template.note,
            subsidyData: subsidyData,
            subsidyNum: subsidyNum,
            transcriptText: this.data.transcriptText
          })
        } else {
          subsidy_data = res.data.subsidy_template.subsidy;
        }


        let isval = 0;
        subsidy_data.forEach(e => {
          e.list.forEach(elist => {
            if (elist.value) {
              isval = isval + parseFloat(elist.value);
            }
          })
        })
        this.setData({
          subsidy_data: subsidy_data,
          yy_room_number: yy_room_number,
          high_dps: res.data.subsidy_template.high_dps,
          high_hps: res.data.subsidy_template.high_hps,
          old_subsidy_data: res.data.subsidy_template.subsidy,
          old_high_dps: res.data.subsidy_template.high_dps,
          old_high_hps: res.data.subsidy_template.high_hps,
          expenditure: isval
        })
      }
    })
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
});