var util = require("../../utils/util.js");
Page({
    data: {
        userinfo: '',
        avatarUrl: '',
        count: 0,
    },
    onLoad: function () {
        var userinfo = wx.getStorageSync("userInfo");
        var email = wx.getStorageSync("email");
        var userName = userinfo ? userinfo.nickName : email;
        var avatarUrl = userinfo ? userinfo.avatarUrl : 'https://ws1.sinaimg.cn/large/e4336439gy1fqs83nja08j205u063t8m.jpg';
        var count = wx.getStorageSync("txt");
        console.log(userinfo);
        this.setData({
            userinfo: userName,
            avatarUrl: avatarUrl,
            count: count.length
        });
    },
    aboutUs: function () {
        wx.navigateTo({
            url: '../aboutus/aboutus'
        });
    },
    logout: function() {
        console.log("logout");
        wx.removeStorageSync("session_id");
        wx.removeStorageSync("email");
        util.showSuccess("退出成功");
        setTimeout(function() {
            wx.redirectTo({
                url: '../index/index'
            });
        }, 500);
    }
});