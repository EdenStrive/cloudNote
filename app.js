//app.js
App({  
    onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // console.log(logs);
    var d=this.globalData;
    // console.log(d);
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
          var that = this;
          console.log(res);
          var code = res.code;
          var d=this.globalData;//这里存储了appid、secret、token串  
          var l='https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+d.appid+'&secret='+d.secret;  
          wx.request({  
            url: l,  
            data: {},  
            method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT  
            // header: {}, // 设置请求的 header  
            
            success: function(res){  
              var ob={};  
 
              ob.expires_in=Date.now()+res.data.expires_in;  
              that.globalData.expires_in = ob.expires_in;
              that.globalData.access_token=res.data.access_token
              console.log(ob);
              // console.log(res.data.access_token);
            }  
          });
          wx.request({  
            url:'https://api.weixin.qq.com/sns/jscode2session',  
            data: {
              grant_type:'authorization_code',
              appid:d.appid,
              secret:d.secret,
              js_code:code
            },  
            success: function(res){
              console.log(res.data);  
              var obj={}; 
              obj.openid=res.data.openid;  
              that.globalData.openid = obj.openid;
              console.log(obj);
            }  
          });
       
      }    
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              console.log(this.globalData.userInfo);
              console.log(res);
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
   
},
    onLoad: function() {
    },
    getLocationInfo: function (cb) {
      var that = this;
      if (this.globalData.locationInfo) {
        cb(this.globalData.locationInfo)
      } else {
        wx.getLocation({
          type: 'gcj02', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
          success: function (res) {
            that.globalData.locationInfo = res;
            cb(that.globalData.locationInfo)
          },
          fail: function () {
            // fail
          },
          complete: function () {
            // complete
          }
        })
      }
    },
    globalData: {
      appid: 'wx58cb9a0e27c46700', 
      secret: '1fffbb71ee6b0a7bb9d5a82d2f50d0e8',//secret需自己提供，此处的secret我随机编写   
      userInfo: null,
      expires_in:null,
      openid:null,
      access_token:null
    }
})