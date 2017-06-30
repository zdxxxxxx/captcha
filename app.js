var express = require('express');
var app = express();
app.use('/build', express.static('build'));


app.get('/', function (req, res) {
    res.sendfile('index.html');
});

app.get('/getResource', function (req, res) {
    var callback = req.query.callback;
    var data = {
        code: 1100,
        detail: {
            js: '/build/sdk/sdk.js',
            domains: ['127.0.0.1:3000']
        }
    }
    res.send(callback + "(" + JSON.stringify(data) + ")")
})

var server = app.listen(3000, function () {
    var host = '127.0.0.1';
    var port = 3000;
    console.log('Example app listening at http://%s:%s', host, port);
});