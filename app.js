var express = require('express');
var app = express();


app.get('/', function (req, res) {
    res.sendfile('mobile.html');
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
            js: '/qa/captcha-sdk.min.js',
            css:'/qa/style.min.css',
            domains: domains
        }
    };
        res.send(callback + "(" + JSON.stringify(data) + ")")
});

app.get('/getResourceDev', function (req, res) {
    var callback = req.query.callback;
    var data = {
        code: 1100,
        detail: {
            js: '/dev/captcha-sdk.min.js',
            css:'/dev/style.min.css',
            domains: domains
        }
    }
    res.send(callback + "(" + JSON.stringify(data) + ")")
});


var server = app.listen(3000, function () {
    var host = '127.0.0.1';
    var port = 3000;
    console.log('Example app listening at http://%s:%s', host, port);
});