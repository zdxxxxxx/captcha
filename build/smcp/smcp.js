(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _jsonp = require('../utils/_jsonp.js');

var _jsonp2 = _interopRequireDefault(_jsonp);

var _config = require('../utils/_config.js');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var status = {};
var callbacks = {};
//报错
var throwError = function throwError(errorType, config) {
    var errors = {
        networkError: '网络错误'
    };
    if (typeof config.onError === 'function') {
        config.onError(errors[errorType]);
    } else {
        throw new Error(errors[errorType]);
    }
};
//初始化验证码
var initSMCaptcha = function initSMCaptcha(customConfig, callback) {
    var config = new _config2.default(customConfig);
    if (!customConfig.protocol) {
        config.protocol = window.location.protocol + '//';
    }
    var sm_apiServer = config.sm_apiServer,
        path = config.path,
        protocol = config.protocol,
        org = config.org,
        appId = config.appId;

    var jp = new _jsonp2.default({
        domains: sm_apiServer,
        path: path,
        protocol: protocol,
        query: {
            org: org,
            appId: appId
        }
    });
    jp.jsonp(function (newConfig) {
        if (newConfig.code != 1100) {
            throwError('networkError', config);
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
            var jpSdk = new _jsonp2.default({
                domains: domains,
                path: js,
                protocol: protocol,
                query: null
            });
            jpSdk.load(function (err) {
                if (err) {
                    throwError('networkError', config);
                } else {
                    init();
                }
            });
        }
    });
};
window.initSMCaptcha = initSMCaptcha;

},{"../utils/_config.js":2,"../utils/_jsonp.js":3}],2:[function(require,module,exports){
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

        this.sm_apiServer = ['127.0.0.1:3000'];
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

},{"./_object.js":4}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _type = require('./_type.js');

var _object = require('./_object.js');

var _object2 = _interopRequireDefault(_object);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * jsonp
 */
var jsonp = function () {
    //构造函数，config配置参数
    function jsonp(config) {
        var _this = this;

        _classCallCheck(this, jsonp);

        this._config = {
            domains: [],
            protocol: '',
            path: '',
            query: {}
        };
        this.status = false;
        new _object2.default(config)._each(function (key, value) {
            _this._config[key] = value;
        });
    }
    /**
     * 获取状态
     */


    _createClass(jsonp, [{
        key: 'getStatus',
        value: function getStatus() {
            return this.status;
        }
        /**
         * 获取随机数
         */

    }, {
        key: 'random',
        value: function random() {
            return parseInt(Math.random() * 10000) + new Date().valueOf();
        }
        /**
         * 格式化域名
         * @param {*} domain 
         */

    }, {
        key: 'normalizeDomain',
        value: function normalizeDomain(domain) {
            return domain.replace(/^https?:\/\/|\/$/g, '');
        }

        //路径格式化

    }, {
        key: 'normalizePath',
        value: function normalizePath(path) {
            path = path.replace(/\/+/g, '/');
            if (path.indexOf('/') !== 0) {
                path = '/' + path;
            }
            return path;
        }
    }, {
        key: 'normalizeQuery',

        //格式化query
        value: function normalizeQuery(query) {
            if (!query) {
                return '';
            }
            var q = '?';
            new _object2.default(query)._each(function (key, value) {
                if ((0, _type.isString)(value) || (0, _type.isNumber)(value) || (0, _type.isBoolean)(value)) {
                    q = q + encodeURIComponent(key) + '=' + encodeURIComponent(value) + '&';
                }
            });
            if (q === '?') {
                q = '';
            }
            return q.replace(/&$/, '');
        }
    }, {
        key: 'makeURL',

        //格式化url
        value: function makeURL(protocol, domain, path, query) {
            domain = this.normalizeDomain(domain);

            var url = this.normalizePath(path) + this.normalizeQuery(query);
            if (domain) {
                url = protocol + domain + url;
            }

            return url;
        }
    }, {
        key: 'loadScript',

        //加载script文件
        value: function loadScript(url, cb) {
            var script = document.createElement("script");
            var head = document.getElementsByTagName("head")[0];
            script.charset = "UTF-8";
            script.async = true;
            script.onerror = function () {
                cb(true);
            };
            this.status = false;
            //解决浏览器兼容问题
            script.onload = script.onreadystatechange = function () {
                if (!this.status && (!script.readyState || "loaded" === script.readyState || "complete" === script.readyState)) {
                    this.status = true;
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
                var url = _this2.makeURL(protocol, domains[at], path, query);
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
        key: 'jsonp',

        //jsonp
        value: function jsonp(callback) {
            var _this3 = this;

            var query = this._config.query;

            var cb = "smcb_" + this.random();
            query.callback = cb;
            window[cb] = function (data) {
                callback(data);
                window[cb] = undefined;
                try {
                    delete window[cb];
                } catch (e) {}
            };
            this.load(function (err) {
                if (err) {
                    callback(_this3._config);
                }
            });
        }
    }]);

    return jsonp;
}();

exports.default = jsonp;
;

},{"./_object.js":4,"./_type.js":5}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{}]},{},[1]);
