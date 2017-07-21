var utils = require('./_functions.js')
var Load = function (timeout) {
    this._config = {
        timeout:timeout||6000,
        timer:null
    };
};

Load.prototype={
    random:function () {
        return parseInt(Math.random() * 10000) + (new Date()).valueOf();
    },
    loadCss:function (url,cb) {
        var error = {
            status:false,
            type:''
        };
        var self = this;
        var timeout = this._config.timeout;
        //fix 移动端不执行link 监听事件的bug
        var timer = setTimeout(function () {
            var i = document.styleSheets.length;
            for(var k=0;k<i;k++){
                if(document.styleSheets[k].href.indexOf(url)>-1){
                    error.status = false;
                    cb(error)
                }
            }
        },1000);
        var link = document.createElement("link");
        link.rel = "stylesheet";
        self.timeOutFun(timeout,function (err) {
            if(err){
                link.onerror = null;
                link.onload = link.onreadystatechange = null;
                error.status = true;
                error.type = 'NET_TIMEOUT';
                cb(error);
            }
        });

        link.onerror = function () {
            window.clearTimeout(timer);
            window.clearTimeout(self._config.timer);
            error.status = true;
            error.type = 'NETWORK_ERROR';
            cb(error);
        };
        //解决浏览器兼容问题
        link.onload = link.onreadystatechange = function () {
            if (!this.status &&
                (!link.readyState ||
                "loaded" === link.readyState ||
                "compvare" === link.readyState)) {
                window.clearTimeout(self._config.timer);
                window.clearTimeout(timer);
                setTimeout(function () {
                    cb(error);
                }, 0);
            }
        };


        link.href = url;

        (function() {
            var head = document.getElementsByTagName('head')[0] || document.documentElement;
            if(!head) {
                setTimeout(arguments.callee, 10);
                return;
            }
            //自定义协议跳转 无法解释的bug
            setTimeout(function() {
                head.insertBefore(link, head.firstChild);
            }, 0);
        })();
    },
    //加载script文件
    loadScript:function(url, cb, sign) {
        var error = {
            status:false,
            type:''
        };
        var self = this;
        var timeout = self._config.timeout;
        var script = document.createElement("script");
        script.charset = "UTF-8";
        script.async = true;
        self.timeOutFun(timeout,function (err) {
            if(err&&self._config.status!=='loaded'){
                script.onerror = null;
                script.onload = script.onreadystatechange = null;
                error.status = true;
                error.type = 'NET_TIMEOUT';
                window[sign] = function () {
                    return false
                };
                cb(error);
            }
        });
        script.onerror = function () {
            window.clearTimeout(self._config.timer);
            error.status = true;
            error.type = 'NETWORK_ERROR';
            cb(error);
        };

        self._config.status = 'load';

        // 解决浏览器兼容问题
        script.onload = script.onreadystatechange = function () {
            if (!this.status &&
                (!script.readyState ||
                "loaded" === script.readyState ||
                "compvare" === script.readyState)) {
                window.clearTimeout(self._config.timer);
                setTimeout(function () {
                    cb(error);
                }, 0);
            }
        };
        script.src = url;
        (function() {
            var head = document.getElementsByTagName('head')[0] || document.documentElement;
            if(!head) {
                setTimeout(arguments.callee, 10);
                return;
            }
            //自定义协议跳转 无法解释的bug
            setTimeout(function() {
                head.insertBefore(script, head.firstChild);
            }, 0);
        })();
    },
    //支持多域名获取js资源
    load:function(type,domains,path,protocol,query,cb) {
        var self = this;
        var loadType = 'load'+type;
        function tryRequest(at){
            var url =utils.makeURL(protocol, domains[at], path, query);
            self[loadType](url, function(err){
                var status = err.status;
                if (status) {
                    if (at >= domains.length - 1) {
                        cb(err);
                    } else {
                        tryRequest(at + 1);
                    }
                } else {
                    cb(err);
                }
            },query.callback);
        };
        tryRequest(0);
    },
    timeOutFun:function(timeout,cb){
        var self =this;
        self._config.timer&&window.clearTimeout(self._config.timer);
        self._config.timer = setTimeout(function(){
            cb(true)
        },timeout)
    },
    //jsonp
    jsonp:function(domains,path,protocol,query,callback) {
        var self =this;
        var cb = "smcb_" + self.random();
        query.callback = cb;
        //服务端返回默认的callback,之后去掉
        window['smCB'] = window[cb] = function(data)  {
            callback({status:false,type:''},data||{});
            window[cb] = undefined;
            try {
                delete window[cb];
            } catch (e) {}
        };
        self.load('Script',domains,path,protocol,query,function(err){
            var status = err.status;
            if (status) {
                //服务端返回默认的callback,之后去掉
                window['smCB'] = window[cb] = function () {
                    return false
                };
                callback(err,{});
            }
        });
    }
};
module.exports = Load;

