var util = require("../../utils/util");
Page({
    data: {
        markers:[{
          latitude:28.68263,
          longitude:116.030532
        }],
        address:'',
    },
    onReady: function (e) {
        // 使用 wx.createMapContext 获取 map 上下文
        this.mapCtx = wx.createMapContext('myMap');
        this.mapCtx.moveToLocation();
    },
    onLoad: function(options){
        const context = this;
            wx.connectSocket({
              url:wsApi,
              data:{},
              header:{
                'content-type':'application/json'
              },
              method:"GET",
              success:function(){
                console.log("客户端连接成功");
              }
            });
            wx.onSocketOpen(function(){
              console.log("webSocket连接已打开");
              socketBol = true;
            });
            wx.getLocation({
              type: 'wgs84',
              success: function (res) {
                wx.sendSocketMessage({
                        data: JSON.stringify(data)
                    });
              },
              fail: function(){
                console.log("获取本地位置信息失败");
              }
            })
            wx.onSocketMessage(function(msg) {
                var data = JSON.parse(msg.data);
                console.log(data);
                context.setData({
                    isServer: true
                });
                context.mapLoad();
            });
    },
    mapLoad: function() {
            var latitude = this.data.markers[0].latitude
            var longitude = this.data.markers[0].longitude
            var _this = this;
            util.demo.calculateDistance({
                mode:'driving',
                to:[{
                    latitude: latitude,
                    longitude:longitude
                }],
                success: function(res) {
                    var distance = res['result']['elements'][0].distance;
                    if(distance < 300)
                    _this.setData({
                        rcles: [{
                            latitude: latitude,
                            longitude:longitude,
                            color: '#E0E0E0',
                            fillColor: '#7cb5ec88',
                            radius: 300,
                            strokeWidth: 1
                       }]
                    })
                   },
            });
            util.demo.reverseGeocoder({
                location: {
                    latitude: latitude,
                    longitude: longitude
                },
                success: function(res) {
                    console.log(res);
                    _this.setData({
                      address : res['result'].address
                    })
                },
            })
      },
})
//bindcontroltap 用于点击marker所标记的点时所触发的方法
//组件 circles 圆 以markers为中心的