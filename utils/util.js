var app = getApp();
const Promise = require('es6-promise.min.js');
const QQMapWX = require('qqmap-wx-jssdk.js');
const demo = new QQMapWX({
    key: '3D6BZ-P2T3Q-NNZ5P-GD6C2-4T6PJ-RRFDQ' // 必填
});

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  // return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// 显示繁忙提示
const showBusy = text => wx.showToast({
    title: text,
    icon: 'loading',
    duration: 3000
})

// 显示成功提示
const showSuccess = text => wx.showToast({
    title: text,
    icon: 'success'
})

// 显示失败提示
const showModel = (title, content) => {
    wx.hideToast();

    wx.showModal({
        title,
        content: JSON.stringify(content),
        showCancel: false
    })
}

const showTips = tips => wx.showToast({
    title: tips,
    image: '../img/warning.png',
    duration: 2000
})

const getUnique = () => 15970706944 * Math.ceil(Math.random());

// 将小程序API封装成支持Promise的API
const wxPromisify = fn => {
    return function(obj = {}) {
      return new Promise((resolve, reject) => {
        obj.success = res => { resolve(res); }
        obj.fail = res => { reject(res); }
        fn(obj)
      })
    }
}

// 时间差判断
const setInter = time => {
    setInterval(function(){
        // console.log("checking");
        var txt = wx.getStorageSync("txt");
        if (txt) {
            txt.forEach(function(item) {
                if (Math.abs(Date.now() - new Date(padAlarm(item.alarmTime)).valueOf()) <= time) {
                    wx.vibrateLong({
                        success: function(res) {
                            console.log(res);
                        },
                        fail: function(res) {
                            console.log(res);
                        }
                    });
                }
            });
        }
    }, time);
}

// 扩展闹钟时间加上年月日
const padAlarm = time => {
    const now = new Date(Number(Date.now()));
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    return [year, month, day].map(formatNumber).join('/') + ' ' + time;
}

function didianmoban(res){
    var openid = app.globalData.openid;
    var access_token=app.globalData.access_token;
    var template_id='FT-OtZQaJjZrAY0VtJm-19em3K_wlt9KB84sePM0rE0';
    var formid = res.formid;
    var l = "https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token="+access_token;
    var title = res[0].place.title;
    var content = res[0].content;
    var times = res[0].time;
    var time = formatTime(new Date(times));
    var address = res[0].place.address;
     demo.geocoder({
          address: address,
          success: function(res) {
              var lat = res.result.location.lat;
              var lng = res.result.location.lng;
              demo.calculateDistance({
                    to:[{
                        latitude: lat,
                        longitude: lng
                    }],
                    success: function(res) {
                        var distance = res.result.elements[0].distance;
                        console.log(distance);
                        console.log(res);
                        if (distance<3000) {
                              var d = {  
                                    touser: openid,  
                                    template_id: template_id,//这个是1、申请的模板消息id，  
                                    page: '/pages/index/index',  
                                    form_id: formid,  
                                    data: {//测试完发现竟然value或者data都能成功收到模板消息发送成功通知，是bug还是故意？？【鄙视、鄙视、鄙视...】 下面的keyword*是你1、设置的模板消息的关键词变量  
                                
                                      "keyword1": {  
                                        "value": content  
                                      },  
                                      "keyword2": {  
                                        "value": time
                                      },  
                                      "keyword3": {  
                                        "value": title
                                      }
                                      
                                    },  
                                    // color: '#ccc',  
                                    emphasis_keyword: 'keyword1.DATA'  
                                  }  
                                  wx.request({  
                                    url: l,  
                                    data: d,  
                                    method: 'POST',  
                                    success: function(res){  
                                      console.log("push msg");  
                                      console.log(res);  
                                    },  
                                    fail: function(err) {  
                                      console.log("push err")  
                                      console.log(err);  
                                    }  
                                  });
                                   // console.log(title);
                                  // console.log(content);
                         }
                      },
                    fail: function(res) {
                        console.log("距离计算失败");
                    }
                });
          },
          fail: function(res) {
              console.log("解析位置经纬度出错");
          },
          complete: function(res) {
              console.log(res);
          }
        });
 
   
}
module.exports = { formatTime, formatNumber, showBusy, showSuccess, showModel, showTips, getUnique, wxPromisify, demo, setInter,didianmoban }
