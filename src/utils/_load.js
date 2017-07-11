import {
    makeURL
} from './_functions.js';
/**
 * jsonp
 */
export default class Load {
    //构造函数，config配置参数timeout
    constructor(timeout) {
        this._config = {
            timeout:timeout||5000,
            timer:null
        };
    }
    /**
     * 获取随机数
     */
    random() {
        return parseInt(Math.random() * 10000) + (new Date()).valueOf();
    }

    /**
     * 加载css
     * @param url
     * @param cb
     */
    loadCss(url,cb){
        let error = {
            status:false,
            type:''
        };
        let self = this;
        let {timeout} = self._config;

        //fix 移动端不执行link 监听事件的bug
        let timer = setTimeout(function () {
            let i = document.styleSheets.length;
            for(let k=0;k<i;k++){
                if(document.styleSheets[k].href.indexOf(url)>-1){
                    cb(false)
                }
            }
        },1000);

        let link = document.createElement("link");
        link.rel = "stylesheet";
        this.timeOutFun(timeout,function (err) {
            if(err){
                link.onerror = null;
                link.onload = script.onreadystatechange = null;
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
                "complete" === link.readyState)) {
                window.clearTimeout(self._config.timer);
                window.clearTimeout(timer);
                setTimeout(function () {
                    cb(error);
                }, 0);
            }
        };


        link.href = url;

        (function() {
            let head = document.getElementsByTagName('head')[0] || document.documentElement;
            if(!head) {
                setTimeout(arguments.callee, 10);
                return;
            }
            //自定义协议跳转 无法解释的bug
            setTimeout(() => {
                head.insertBefore(link, head.firstChild);
            }, 0);
        })();
    }
    //加载script文件
    loadScript(url, cb, sign) {
        let error = {
            status:false,
            type:''
        };
        let self = this;
        let {timeout} = self._config;
        let script = document.createElement("script");
        script.charset = "UTF-8";
        script.async = true;
        this.timeOutFun(timeout,function (err) {
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
                    "complete" === script.readyState)) {
                window.clearTimeout(self._config.timer);
                setTimeout(function () {
                    cb(error);
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
    load(type,domains,path,protocol,query,cb) {
        let loadType = 'load' + type ;
        let tryRequest = (at) => {
            let url = makeURL(protocol, domains[at], path, query);
            this[loadType](url, (err) => {
                let {status} = err;
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
    };
    timeOutFun(timeout,cb){
        this._config.timer&&window.clearTimeout(this._config.timer);
        this._config.timer = setTimeout(()=>{
            cb(true)
        },timeout)
    };
    //jsonp
    jsonp(domains,path,protocol,query,callback) {
        let cb = "smcb_" + this.random();
        query.callback = cb;
        //服务端返回默认的callback,之后去掉
        window['smCB'] = window[cb] = (data) => {
            callback({status:false,type:''},data);
            window[cb] = undefined;
            try {
                delete window[cb];
            } catch (e) {}
        };
        this.load('Script',domains,path,protocol,query,(err) => {
            let {status} = err;
            if (status) {
                //服务端返回默认的callback,之后去掉
                window['smCB'] = window[cb] = function () {
                    return false
                };
                callback(err,{});
            }
        });
    };
    linkp(domains,path,protocol,query,callback){
        this.load('Css',domains,path,protocol,query,callback)
    };
    imagep(domains,path,protocol,query,callback){
        this.load('Image',domains,path,protocol,query,callback)
    };
};