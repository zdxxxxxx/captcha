(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _load = require('../utils/_load.js');

var _load2 = _interopRequireDefault(_load);

var _config = require('../utils/_config.js');

var _config2 = _interopRequireDefault(_config);

var _error = require('../utils/_error.js');

var _functions = require('../utils/_functions.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *  参数校验
 */
function checkConfigParams(params) {
    var organization = params.organization,
        appId = params.appId;

    var status = false;
    if (organization == '' || !(0, _functions.isString)(organization)) {
        status = true;
    }
    if (appId == '' || !(0, _functions.isString)(appId)) {
        status = true;
    }
    return status;
}

//初始化验证码
var initSMCaptcha = function initSMCaptcha(customConfig, callback) {
    var config = new _config2.default(customConfig);
    if (checkConfigParams(customConfig)) {
        (0, _error.throwError)('PARAMS_ERROR', customConfig);
    }
    if (!customConfig.https) {
        config.protocol = window.location.protocol + '//';
    } else {
        config.protocol = 'https://';
    }
    var sm_apiServer = config.sm_apiServer,
        path = config.path,
        protocol = config.protocol,
        organization = config.organization,
        appId = config.appId,
        version = config.version,
        timeout = config.timeout;


    var jp = new _load2.default({
        domains: sm_apiServer,
        path: path,
        protocol: protocol,
        timeout: timeout,
        query: {
            organization: organization,
            appId: appId,
            rversion: version
        }
    });
    jp.jsonp(function (status, newConfig) {
        if (!status) {
            (0, _error.throwError)('NETWORK_ERROR', customConfig);
        } else {
            var detail = newConfig.detail;
            var js = detail.js,
                domains = detail.domains,
                css = detail.css;

            var init = function init() {
                config._extend({
                    css: css,
                    domains: domains
                });
                callback(new window.SMCaptcha(config));
            };
            var jpSdk = new _load2.default({
                domains: domains,
                path: js,
                protocol: protocol,
                query: {
                    t: parseInt(Math.random() * 10000) + new Date().valueOf()
                },
                timeout: timeout
            });

            jpSdk.load(function (err) {
                if (err) {
                    (0, _error.throwError)('NETWORK_ERROR', customConfig);
                } else {
                    init();
                }
            });
        }
    });
};
window.initSMCaptcha = initSMCaptcha;

},{"../utils/_config.js":2,"../utils/_error.js":3,"../utils/_functions.js":4,"../utils/_load.js":5}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _object = require('./_object.js');

var _object2 = _interopRequireDefault(_object);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * 配置
 */
var Config = function () {
    function Config(conf) {
        _classCallCheck(this, Config);

        this.sm_apiServer = ['118.89.223.233'];
        this.protocol = 'https://';
        this.path = '/getResource';
        this._extend(conf);
    }

    _createClass(Config, [{
        key: '_extend',
        value: function _extend(obj) {
            var _this = this;

            new _object2.default(obj)._each(function (key, value) {
                _this[key] = value;
            });
        }
    }]);

    return Config;
}();

exports.default = Config;

},{"./_object.js":6}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.throwError = throwError;
/**
 * 报错
 * @type {{NETWORK_ERROR: {code: number, message: string}}}
 */

var errors = exports.errors = {
    NETWORK_ERROR: {
        code: 2001,
        message: "网络异常"
    },
    SERVER_ERROR: {
        code: 2002,
        message: "服务器异常"
    },
    PARAMS_ERROR: {
        code: 2003,
        message: "参数异常"
    }
};

function throwError(errorType, config) {
    if (config && typeof config.onError === 'function') {
        config.onError(errors[errorType]);
    } else {
        throw new Error(errors[errorType]);
    }
}

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.isNumber = isNumber;
exports.isString = isString;
exports.isBoolean = isBoolean;
exports.isObject = isObject;
exports.isFunction = isFunction;
exports.normalizeDomain = normalizeDomain;
exports.normalizePath = normalizePath;
exports.normalizeQuery = normalizeQuery;
exports.makeURL = makeURL;
exports.IsPC = IsPC;

var _object = require('./_object.js');

var _object2 = _interopRequireDefault(_object);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 判断类型
 */
function isNumber(v) {
    return typeof v === 'number';
}

function isString(v) {
    return typeof v === 'string';
}

function isBoolean(v) {
    return typeof v === 'boolean';
}

function isObject(v) {
    return (typeof v === 'undefined' ? 'undefined' : _typeof(v)) === 'object' && v !== null;
}

function isFunction(v) {
    return typeof v === 'function';
}

/**
 * 格式化域名
 * @param {*} domain
 */
function normalizeDomain(domain) {
    return domain.replace(/^https?:\/\/|\/$/g, '');
}

//路径格式化
function normalizePath(path) {
    path = path.replace(/\/+/g, '/');
    if (path.indexOf('/') !== 0) {
        path = '/' + path;
    }
    return path;
}
//格式化query
function normalizeQuery(query) {
    if (!query) {
        return '';
    }
    var q = '?';
    new _object2.default(query)._each(function (key, value) {
        if (isString(value) || isNumber(value) || isBoolean(value)) {
            q = q + encodeURIComponent(key) + '=' + encodeURIComponent(value) + '&';
        }
    });
    if (q === '?') {
        q = '';
    }
    return q.replace(/&$/, '');
}
//格式化url
function makeURL(protocol, domain, path, query) {
    domain = normalizeDomain(domain);

    var url = normalizePath(path) + normalizeQuery(query);
    if (domain) {
        url = protocol + domain + url;
    }
    return url;
}

/**
 * 是否是移动端
 * @returns {boolean}
 * @constructor
 */
function IsPC() {
    var userAgentInfo = navigator.userAgent;
    var Agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
            flag = false;
            break;
        }
    }
    return flag;
}

},{"./_object.js":6}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _functions = require('./_functions.js');

var _object = require('./_object.js');

var _object2 = _interopRequireDefault(_object);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * jsonp
 */
var Load = function () {
    //构造函数，config配置参数
    function Load(config) {
        var _this = this;

        _classCallCheck(this, Load);

        this._config = {
            domains: [],
            protocol: '',
            path: '',
            query: {},
            onError: config.onError || null,
            status: 'loading',
            timeout: config.timeout || 30000,
            timer: null
        };
        new _object2.default(config)._each(function (key, value) {
            _this._config[key] = value;
        });
    }
    /**
     * 获取随机数
     */


    _createClass(Load, [{
        key: 'random',
        value: function random() {
            return parseInt(Math.random() * 10000) + new Date().valueOf();
        }
        //加载script文件

    }, {
        key: 'loadScript',
        value: function loadScript(url, cb) {
            var self = this;
            var _self$_config = self._config,
                timeout = _self$_config.timeout,
                timer = _self$_config.timer;

            var script = document.createElement("script");
            var head = document.getElementsByTagName("head")[0];
            script.charset = "UTF-8";
            script.async = true;
            script.onerror = function () {
                self._config.status = 'error';
                window.clearTimeout(timer);
                cb(true);
            };
            this.timeOutFun(timeout, function (err) {
                if (err && self._config.status !== 'loaded') {
                    self._config.status = 'error';
                    script.onerror = null;
                    cb(true);
                }
            });
            self._config.status = 'load';

            //解决浏览器兼容问题
            script.onload = script.onreadystatechange = function () {
                if (!this.status && (!script.readyState || "loaded" === script.readyState || "complete" === script.readyState)) {
                    self._config.status = 'loaded';
                    setTimeout(function () {
                        cb(false);
                    }, 0);
                }
            };
            script.src = url;
            head.appendChild(script);
        }
    }, {
        key: 'load',

        //支持多域名获取js资源
        value: function load(cb) {
            var _this2 = this;

            var _config = this._config,
                domains = _config.domains,
                path = _config.path,
                protocol = _config.protocol,
                query = _config.query;

            var tryRequest = function tryRequest(at) {
                var url = (0, _functions.makeURL)(protocol, domains[at], path, query);
                _this2.loadScript(url, function (err) {
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
        }
    }, {
        key: 'timeOutFun',
        value: function timeOutFun(timeout, cb) {
            this._config.timer && window.clearTimeout(this._config.timer);
            this._config.timer = setTimeout(function () {
                cb(true);
            }, timeout);
        }
    }, {
        key: 'jsonp',

        //jsonp
        value: function jsonp(callback) {
            var query = this._config.query;

            var cb = "smcb_" + this.random();
            query.callback = cb;
            window[cb] = function (data) {
                callback(true, data);
                window[cb] = undefined;
                try {
                    delete window[cb];
                } catch (e) {}
            };
            this.load(function (err) {
                if (err) {
                    window[cb] = function () {
                        return false;
                    };
                    callback(false, {});
                }
            });
        }
    }]);

    return Load;
}();

exports.default = Load;
;

},{"./_functions.js":4,"./_object.js":6}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * _Object
 */
var _Object = function () {
    function _Object(_obj) {
        _classCallCheck(this, _Object);

        this._obj = _obj;
    }

    _createClass(_Object, [{
        key: "_each",
        value: function _each(process) {
            var _obj = this._obj;
            for (var k in _obj) {
                if (_obj.hasOwnProperty(k)) {
                    process(k, _obj[k]);
                }
            }
            return this;
        }
    }]);

    return _Object;
}();

exports.default = _Object;

},{}]},{},[1]);
