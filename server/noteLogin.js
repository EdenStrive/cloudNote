var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var rediz = require('redis');
var Q = require('bluebird');

var mysql = require('mysql').createConnection({
    host: '112.74.43.247',
    port: '3306',
    user: 'hjk',
    password: '456456',
    database: 'node',
    useConnectionPooling: true
});

Q.promisifyAll(rediz.RedisClient.prototype);
Q.promisifyAll(rediz.Multi.prototype);
Q.promisify(mysql.query);

var redis = rediz.createClient({
    "host": "127.0.0.1",
    "port": "6379"
});
var app = express();
var port = 3301;

const app_id = "wx58cb9a0e27c46700";
const app_secret = "1fffbb71ee6b0a7bb9d5a82d2f50d0e8";

redis.on('error', err => { console.log('error event - ' + redis.host + ':' + redis.port + ' - ' + err); });

// function redis_setget_string_async() {
//     var promise = redis.setAsync('key', ['string'])
//                        .then(res => redis.getAsync('key'))
//                        .then(res => { console.log(res); });
//     return promise;
// }

app.use(bodyParser.urlencoded({ limit:'50mb', extended: true }));

app.get('/', function(req, res, next) {
    console.log("entering");
    let code = req.query.code;
    request.get({
        url: 'https://api.weixin.qq.com/sns/jscode2session',
        json: true,
        qs: {
            grant_type: 'authorization_code',
            appid: app_id,
            secret: app_secret,
            js_code: code
        }
    }, (err, response, data) => {
        if (response.statusCode === 200) {
            console.log(data);
            console.log('[openid]: ', data.openid);
            console.log('[session_key]: ', data.session_key);
            var openid = data.openid;
            var session_key = data.session_key;

            redis.set("session_id", openid + session_key, 'EX', 7200);
            res.json({
                session_id: openid + session_key,
                openid: openid
            });
        } else {
            console.log('[error]: ' + err);
            res.json(err);
        }
    })
});

app.get('/upload', function(req, res, next) {
    let txts = JSON.parse(req.query.txt);
    let u_openid = req.query.u_openid;
    var uploadFlag = true;
    var resOb = res;
    for(let txt of txts) {
        var addSql = "INSERT INTO n_note_info(u_openid, id, title, content, time)VALUES(?,?,?,?,?)";
        txt.title = txt.content.split('：')[0] || txt.content.split(':')[0];
        console.log(txt.title);
        var addSqlParams = [u_openid, txt.id, txt.title, txt.content, txt.time];
        mysql.query(addSql, addSqlParams, function(err, res) {
            if(err) {
                console.log('[SELECT ERROR] - ', err.message);
                uploadFlag = false;
                return;
            }
            console.log('--------------------------INSERT----------------------------');
            //console.log('INSERT ID:',result.insertId);
            console.log('INSERT ID:',res);
            console.log('-----------------------------------------------------------------\n\n');
        });
    }
    // console.log(uploadFlag);
    if (uploadFlag === false) {
        res.json({
            statusCode: 400,
            msg: 'error'
        });
    } else {
        res.json({
            statusCode: 200,
            msg: 'success'
        });
    }
});

app.get('/getInfo', function(req, res, next) {
    var u_openid = req.query.openid;
    var getSql = "SELECT * FROM n_note_info WHERE u_openid=?";
    var getSqlParams = [u_openid];
    var resOb = res;
    mysql.query(getSql, getSqlParams, function(err, res) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            return;
        }
        resOb.json({
            data: res
        });
    });
});

app.listen(port, () => {
    console.log("The server is running on port : " + port);
});