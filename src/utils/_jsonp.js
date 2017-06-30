import {
    isBoolean,
    isString,
    isNumber
} from './_type.js';
import _Object from './_object.js';
/**
 * jsonp
 */
export default class jsonp {
    //构造函数，config配置参数
    constructor(config) {
        this._config = {
            domains: [],
            protocol: '',
            path: '',
            query: {}
        };
        this.status = false;
        new _Object(config)._each((key, value) => {
            this._config[key] = value
        })
    }
    /**
     * 获取状态
     */
    getStatus() {
        return this.status;
    }
    /**
     * 获取随机数
     */
    random() {
        return parseInt(Math.random() * 10000) + (new Date()).valueOf();
    }
    /**
     * 格式化域名
     * @param {*} domain 
     */
    normalizeDomain(domain) {
        return domain.replace(/^https?:\/\/|\/$/g, '');
    }

    //路径格式化
    normalizePath(path) {
        path = path.replace(/\/+/g, '/');
        if (path.indexOf('/') !== 0) {
            path = '/' + path;
        }
        return path;
    };
    //格式化query
    normalizeQuery(query) {
        if (!query) {
            return '';
        }
        let q = '?';
        new _Object(query)._each(function (key, value) {
            if (isString(value) || isNumber(value) || isBoolean(value)) {
                q = q + encodeURIComponent(key) + '=' + encodeURIComponent(value) + '&';
            }
        });
        if (q === '?') {
            q = '';
        }
        return q.replace(/&$/, '');
    };
    //格式化url
    makeURL(protocol, domain, path, query) {
        domain = this.normalizeDomain(domain);

        let url = this.normalizePath(path) + this.normalizeQuery(query);
        if (domain) {
            url = protocol + domain + url;
        }

        return url;
    };
    //加载script文件
    loadScript(url, cb) {
        let script = document.createElement("script");
        let head = document.getElementsByTagName("head")[0];
        script.charset = "UTF-8";
        script.async = true;
        script.onerror = function () {
            cb(true);
        };
        this.status = false
        //解决浏览器兼容问题
        script.onload = script.onreadystatechange = function () {
            if (!this.status &&
                (!script.readyState ||
                    "loaded" === script.readyState ||
                    "complete" === script.readyState)) {
                this.status = true;
                setTimeout(function () {
                    cb(false);
                }, 0);
            }
        };
        script.src = url;
        head.appendChild(script);
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
            let url = this.makeURL(protocol, domains[at], path, query);
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
    //jsonp
    jsonp(callback) {
        let {
            query
        } = this._config
        let cb = "smcb_" + this.random();
        query.callback = cb
        window[cb] = (data) => {
            callback(data)
            window[cb] = undefined;
            try {
                delete window[cb];
            } catch (e) {}
        };
        this.load((err) => {
            if (err) {
                callback(this._config);
            }
        });
    };
};