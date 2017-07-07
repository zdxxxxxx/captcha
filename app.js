var express = require('express');
var app = express();
app.use('/build', express.static('build'));


app.get('/', function (req, res) {
    res.sendfile('index.html');
});
app.get('/test', function (req, res) {
    res.sendfile('test.html');
});
app.get('/dev', function (req, res) {
    res.sendfile('dev.html');
});
var domains = ['118.89.223.233'];
app.get('/getResource', function (req, res) {
    var callback = req.query.callback;
    var data = {
        code: 1100,
        detail: {
            js: '/dist/sdk.min.js',
            css:'/dist/style.min.css',
            domains: domains
        }
    }
    res.send(callback + "(" + JSON.stringify(data) + ")")
});

app.get('/getResourceDev', function (req, res) {
    var callback = req.query.callback;
    var data = {
        code: 1100,
        detail: {
            js: '/build/sdk/sdk.js',
            css:'/build/style/style.css',
            domains: domains
        }
    }
    res.send(callback + "(" + JSON.stringify(data) + ")")
});
app.get('/register', function (req, res) {
    var callback = req.query.callback;
    var data = {
        code: 1100,
        detail: {
            rid:'rid_'+ (parseInt(Math.random() * 10000) + (new Date()).valueOf()),
            bg:'/build/img/WechatIMG1.jpeg',
            fg:'/build/img/WechatIMG2.jpeg',
            domains: domains,
            bg_width:320,
            bg_height:120,
            k:'1234567',
            l:12
        }
    }
    res.send(callback + "(" + JSON.stringify(data) + ")")
});

app.get('/check', function (req, res) {
    var callback = req.query.callback;
    var data = {
        code: 1100,
        detail: {
            success:true,
            message:''
        }
    };
    res.send(callback + "(" + JSON.stringify(data) + ")")
});

var server = app.listen(3000, function () {
    var host = '127.0.0.1';
    var port = 3000;
    console.log('Example app listening at http://%s:%s', host, port);
});