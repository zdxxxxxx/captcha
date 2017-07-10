import {
    makeURL
} from './_functions.js';
import _Object from './_object.js';
/**
 * jsonp
 */
export default class Load {
    //构造函数，config配置参数
    constructor(config) {
        this._config = {
            domains: [],
            protocol: '',
            path: '',
            query: {},
            onError:config.onError||null,
            status:'loading',
            timeout:config.timeout||30000,
            timer:null
        };
        new _Object(config)._each((key, value) => {
            this._config[key] = value
        });
    }
    /**
     * 获取随机数
     */
    random() {
        return parseInt(Math.random() * 10000) + (new Date()).valueOf();
    }
    //加载script文件
    loadScript(url, cb) {
        let self = this;
        let {timeout} = self._config;
        let script = document.createElement("script");
        script.charset = "UTF-8";
        script.async = true;
        this.timeOutFun(timeout,function (err) {
            if(err&&self._config.status!=='loaded'){
                self._config.status = 'error';
                script.onerror = null;
                cb(true);
            }
        });
        script.onerror = function () {
            self._config.status = 'error';
            window.clearTimeout(self._config.timer);
            cb(true);
        };

        self._config.status = 'load';

        // 解决浏览器兼容问题
        script.onload = script.onreadystatechange = function () {
            if (!this.status &&
                (!script.readyState ||
                    "loaded" === script.readyState ||
                    "complete" === script.readyState)) {
                self._config.status = 'loaded';
                setTimeout(function () {
                    cb(false);
                }, 0);
            }
        };
        script.src = url;
        (function() {
            let head = document.getElementsByTagName('head')[0] || document.documentElement;
            if(!head) {
                setTimeout(arguments.callee, 10);
                return;
            }
            //自定义协议跳转 无法解释的bug
            setTimeout(() => {
                head.insertBefore(script, head.firstChild);
            }, 0);
        })();
    };
    //支持多域名获取js资源
    load(cb) {
        let {
            domains,
            path,
            protocol,
            query,
        } = this._config;
        let tryRequest = (at) => {
            let url = makeURL(protocol, domains[at], path, query);
            this.loadScript(url, (err) => {
                if (err) {
                    if (at >= domains.length - 1) {
                        cb(true);
                    } else {
                        tryRequest(at + 1);
                    }
                } else {
                    cb(false);
                }
            });
        };
        tryRequest(0);
    };
    timeOutFun(timeout,cb){
        this._config.timer&&window.clearTimeout(this._config.timer);
        this._config.timer = setTimeout(()=>{
            cb(true)
        },timeout)
    };
    //jsonp
    jsonp(callback) {
        let {
            query,
        } = this._config;
        let cb = "smcb_" + this.random();
        query.callback = cb;
        window[cb] = (data) => {
            callback(true,data);
            window[cb] = undefined;
            try {
                delete window[cb];
            } catch (e) {}
        };
        this.load((err) => {
            if (err) {
                window[cb] = function () {
                    return false
                };
                callback(false,{});
            }
        });
    };
};