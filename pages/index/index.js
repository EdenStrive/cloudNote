var util = require("../../utils/util.js");
const INFO_URL = 'https://login.jeremygo.cn/getInfo';
const UPLOAD_URL = 'https://login.jeremygo.cn/upload';
var requestPromised = util.wxPromisify(wx.request);
// const App = getApp();
Page({
  data: {
    mylists: [
        {
            id: "",
            content: "欢迎使用云笔记~",
            indexCon: "欢迎使用云笔记~",
            time: "18:32",
            place: {},
            pin: 0
        },
        {
            id: "",
            content: "欢迎使用云笔记~",
            indexCon: "左滑查看更多功能",
            time: "18:32",
            place: {},
            pin: 0
        }
    ],
    pressFlag: true,
    logining: false
  },
  onLoad: function(e) {
    util.setInter(1000);
    wx.showToast({
        title: '加载中',
        icon: 'loading',
        duration: 1500
    });
    var session_id = wx.getStorageSync("session_id");
    var email = wx.getStorageSync("email");
    if (session_id || email) {
        this.setData({
            logining: true
        });
    }
    typeof this.initData == "function" && this.initData(this);
  },
  initData: function(page) {
    console.log(new Date(Date.now()));
    const _this = this;
    var txt = wx.getStorageSync("txt");
    console.log(txt);
    if(txt.length) {
        txt.forEach(function(item, i) {
            item = _this.timeHandler(item);
        })
        console.log(txt);
        if(!txt.length) return;
        page.setData({
            mylists: txt
        });
        wx.hideToast();
    } else if(this.data.logining) { // 从服务器取数据
        console.log("logining");
        var openid = wx.getStorageSync("openid");
        requestPromised({
            url: INFO_URL,
            data: {
                openid: openid
            }
        }).then(function(res) {
            console.log(res.data);
            txt = res.data.data;
            wx.setStorageSync("txt", txt);
            var newTxt = [];
            if(txt.length) {
                txt.forEach(function(item, i) {
                    item = _this.timeHandler(item);
                    console.log(item);
                    newTxt.unshift(item);
                })
            } else return;
            page.setData({
                mylists: newTxt
            });
            wx.setStorageSync("txt", newTxt);
            wx.hideToast();
            return;
        }).catch(function(res) {
            console.log(res);
        })
    }
  },
  timeHandler: function(item) {
    var t = new Date(Number(item.time));
    var now = new Date(Number(Date.now()));
    if (now.getDate() - t.getDate() === 0) {
        item.time = t.getHours() +':'+ t.getMinutes();
        item.time = [t.getHours(), t.getMinutes()].map(util.formatNumber).join(':');
    } else {
        item.time = [t.getMonth()+1, t.getDate()].map(util.formatNumber).join('/') + ' ' + [t.getHours(), t.getMinutes()].map(util.formatNumber).join(':');
    }
    item.indexCon = item.content.length > 20 ? item.content.slice(0, 20)+'…' : item.content;
    console.log(item.time);
    return item;
  },
  press: function(e) {
    console.log(e);
    this.setData({
      pressFlag: false
    })
  },
  edit: function(e) {
    console.log(e);
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
        url: "../addnote/addnote?id="+id
    })
  },
  add: function() {
    console.log("Add");
    wx.navigateTo({
        url: "../addnote/addnote"
    })
  },
  delete: function(e) {
    const id = e.currentTarget.dataset.id;
    const context = this;
    wx.showModal({
        content: "确认删除？",
        confirmText: "确认",
        cancelText: "取消",
        success: res => {
            if(res.confirm) {
              typeof context.delNote == "function" && context.delNote(context, id);
            } else {
                console.log("用户点击取消");
            }
        }
    });
  },
  delNote: function(page, id) {
    var arr = wx.getStorageSync("txt");
    var data = [];
    if(arr.length) {
        arr.forEach(function(item) {
            if(item.id !== id) {
              data.push(item);
            }
        })
    }
    wx.setStorageSync("txt", data);
    console.log("delete success");
    page.setData({
        mylists: data
    });
    this.initData(this);
  },
  pinItem: function(e) {
    const id = e.currentTarget.dataset.id;
    var arr = wx.getStorageSync("txt");
    var data = [];
    var pinItem = {};
    if (arr.length) {
        arr.forEach(function(item) {
            if (item.id !== id) {
              data.push(item);
            } else {
              item.pin = 1;
              pinItem = item;
            }
        });
        data.unshift(pinItem);
    }
    wx.setStorageSync("txt", data);
    console.log(data);
    this.setData({
        mylists: data
    });
    this.initData(this);
  },
  cancelPin: function(e) {
    const id = e.currentTarget.dataset.id;
    var arr = wx.getStorageSync("txt");
    var data = [];
    var pinData = [];
    if (arr.length) {
        arr.forEach(function(item) {
            if (item.id !== id && item.pin == 0) {
                data.push(item);
            } else if (item.id == id) {
              item.pin = 0;
                data.push(item);
            } else if (item.pin == 1) {
                pinData.push(item);
            }
        });
        data.sort(function(pre, next) {
            return next.time - pre.time;
        });
        var newData = pinData.concat(data);
    }
    wx.setStorageSync("txt", newData);
    this.setData({
        mylists: newData
    });
    this.initData(this);
    },
    upload: function (e) {
        var id = e.currentTarget.dataset.id;
        var txt = wx.getStorageSync('txt');
        var u_openid = wx.getStorageSync('openid');
        var data = [];
        txt.forEach(function(item) {
            if (item.id == id) {
                data.push(item);
            }
        });
        var u_openid = wx.getStorageSync('openid');
        if (txt) {
            wx.request({
                url: UPLOAD_URL,
                // method: 'POST',
                data: {
                    txt: data,
                    u_openid: u_openid
                },
                success: function (res) {
                    console.log(res.data);
                    if (res.data.statusCode === 200) {
                        util.showSuccess("笔记上传成功");
                        setTimeout(function() {   // 笔记上传至数据库后跳转回首页
                            wx.redirectTo({
                                url: '../index/index'
                            });
                        }, 100);
                    } else {
                        util.showBusy("网络繁忙，请重试");
                    }
                },
                fail: function (res) {
                    console.log(res);
                }
            });
        } else {
            wx.redirectTo({
                url: '../index/index'
            });
        }
    },
  login: function() {
    console.log("Login");
    wx.navigateTo({
        url: "../login/login"
    })
  },
  userinfo: function() {
    wx.navigateTo({
        url: "../userinfo/userinfo"
    })
  },
  touchS: function(e) {
    if (e.touches.length == 1) {
        this.setData({
            startX: e.touches[0].clientX
        });
    }
  },
  touchM: function(e) {
    const _this = this;
    if (e.touches.length == 1) {
        var moveX = e.touches[0].clientX;
        var disX = _this.data.startX - moveX;
        var delBtnWidth = 230;
        var txtStyle = "";
        if (disX == 0 || disX < 0) {
            txtStyle = "left: 0px";
        } else if (disX > 0) {
            txtStyle = "left:-"+ disX + "px";
            if (disX >= delBtnWidth) {
                txtStyle = "left:-"+ delBtnWidth + "px";
            }
        }
        var index = e.currentTarget.dataset.index;
        var list = _this.data.mylists;
        list[index].txtStyle = txtStyle;
        this.setData({
            mylists: list
        });
    }
  },
  touchE: function(e) {
    const _this = this;
    if (e.touches.length == 1) {
        var endX = e.changedTouches[0].clientX;
        var disX = _this.data.startX - endX;
        var delBtnWidth = 230;
        var txtStyle = disX > delBtnWidth/2 ? "left:-"+ delBtnWidth +"px" : "left: 0px";
        var index = e.currentTarget.dataset.index;
        var list = _this.data.mylists;
        list[index].txtStyle = txtStyle;
        _this.setData({
            mylists: list
        });
    }
  },
  noteSearch: function(e) {
    console.log(e);
    const _this = this;
    const content = e.detail.value;
    if (!content) _this.initData(_this);
    var txt = wx.getStorageSync("txt");
    var data = [];
    txt.forEach(function(item) {
        if (item.content.indexOf(content) !== -1) {
            item = _this.timeHandler(item);
            data.push(item);
        }
    });
    this.setData({
        mylists: data
    });
  }
})
