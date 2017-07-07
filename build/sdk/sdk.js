(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); //工具


var _functions = require('../utils/_functions.js');

var _object = require('../utils/_object.js');

var _object2 = _interopRequireDefault(_object);

var _api = require('../utils/_api.js');

var _captcha = require('../utils/_captcha.js');

var _captcha2 = _interopRequireDefault(_captcha);

var _error = require('../utils/_error.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var status = false;
var DEBUG = false;

function load(_ref) {
    var domains = _ref.domains,
        path = _ref.path,
        protocol = _ref.protocol,
        query = _ref.query,
        callback = _ref.callback;

    var tryRequest = function tryRequest(at) {
        var url = (0, _functions.makeURL)(protocol, domains[at], path, query);
        loadCss(url, function (err) {
            if (err) {
                if (at >= domains.length - 1) {
                    callback(true);
                } else {
                    tryRequest(at + 1);
                }
            } else {
                callback(false);
            }
        });
    };
    tryRequest(0);
}

function loadCss(url, cb) {
    var link = document.createElement("link");
    var head = document.getElementsByTagName("head")[0];
    link.rel = "stylesheet";

    link.onerror = function () {
        cb(true);
    };
    status = false;

    //解决浏览器兼容问题
    link.onload = link.onreadystatechange = function () {
        if (!this.status && (!link.readyState || "loaded" === link.readyState || "complete" === link.readyState)) {
            status = true;
            setTimeout(function () {
                cb(false);
            }, 0);
        }
    };
    link.href = url + "?t=" + (parseInt(Math.random() * 10000) + new Date().valueOf());
    head.appendChild(link);
}

/**
 * sdk
 */

var SMCaptcha = function () {
    function SMCaptcha(config) {
        var _this = this;

        _classCallCheck(this, SMCaptcha);

        this._config = {};
        new _object2.default(config)._each(function (key, value) {
            _this._config[key] = value;
        });
        this.checkConfigParams(this._config);
        var _config = this._config,
            domains = _config.domains,
            css = _config.css,
            protocol = _config.protocol,
            appendTo = _config.appendTo;

        this.defaultKey = 'sshummei';
        this._result = null;
        this.captchaData = null;
        this.retry = 0;
        this._smApi = {
            domain: '123.206.13.134',
            register: '/ca/v1/register',
            check: '/ca/v1/fverify'
        };

        load({
            domains: domains,
            path: css,
            protocol: protocol,
            query: null,
            callback: function callback(err) {
                if (err) {
                    (0, _error.throwError)('NETWORK_ERROR', _this._config);
                } else {
                    _this.cp = new _captcha2.default({
                        rootDom: appendTo,
                        SMCaptcha: _this,
                        protocol: protocol
                    });
                    _this.reset();
                }
            }
        });
    }
    /**
     *  参数校验
     */


    _createClass(SMCaptcha, [{
        key: 'checkConfigParams',
        value: function checkConfigParams() {
            var _config2 = this._config,
                appendTo = _config2.appendTo,
                timeout = _config2.timeout,
                maxRetry = _config2.maxRetry;

            if (appendTo == '' || !(0, _functions.isString)(appendTo)) {
                (0, _error.throwError)('PARAMS_ERROR', this._config);
            }
            if (timeout && (0, _functions.isString)(timeout)) {
                this._config.timeout = 30000;
            }
            if (!maxRetry || !(0, _functions.isNumber)(maxRetry)) {
                this._config.maxRetry = 3;
            }
        }
        /**
         * 成功后回调
         * @param cb
         */

    }, {
        key: 'onSuccess',
        value: function onSuccess(cb) {
            this._config['onSuccess'] = cb;
        }

        /**
         * 准备好后回调
         * @param cb
         */

    }, {
        key: 'onReady',
        value: function onReady(cb) {
            this._config['onReady'] = cb;
        }

        /**
         * 服务端异常
         * @param cb
         */

    }, {
        key: 'onError',
        value: function onError(cb) {
            this._config['onError'] = cb;
        }

        /**
         * 取结果
         * @returns {{organization: *, appId: *}|*}
         */

    }, {
        key: 'getResult',
        value: function getResult() {
            return this._result;
        }

        /**
         * 刷新验证码
         */

    }, {
        key: 'reset',
        value: function reset() {
            _api.register.bind(this)();
        }
    }]);

    return SMCaptcha;
}();

window.SMCaptcha = SMCaptcha;

},{"../utils/_api.js":2,"../utils/_captcha.js":3,"../utils/_error.js":5,"../utils/_functions.js":6,"../utils/_object.js":8}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.register = register;
exports.check = check;

var _load = require('./_load.js');

var _load2 = _interopRequireDefault(_load);

var _error = require('./_error.js');

var _functions = require('./_functions.js');

var _des = require('./_des.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 注册验证码
 * @param conf
 */
function register() {
    var _this = this;

    var _config = this._config,
        protocol = _config.protocol,
        organization = _config.organization,
        appId = _config.appId,
        data = _config.data;
    var _smApi = this._smApi,
        domain = _smApi.domain,
        register = _smApi.register;

    var cp = this.cp;
    var conf = {
        domains: [domain],
        path: register,
        protocol: protocol,
        query: {
            organization: organization,
            appId: appId,
            data: data,
            cs: ''
        }
    };
    cp.loading();
    var jsp = new _load2.default(conf);
    jsp.jsonp(function (status, data) {
        if (!status) {
            (0, _error.throwError)('NETWORK_ERROR', _this._config);
        } else {
            var code = data.code,
                detail = data.detail;

            if (code === 1100) {
                var bg_width = detail.bg_width,
                    bg_height = detail.bg_height,
                    bg = detail.bg,
                    fg = detail.fg,
                    domains = detail.domains,
                    rid = detail.rid,
                    k = detail.k,
                    l = detail.l;

                _this.captchaData = {
                    rid: rid,
                    k: k,
                    l: l
                };
                cp.init({
                    width: bg_width,
                    height: bg_height,
                    bg: bg,
                    fg: fg,
                    domains: domains
                });
            } else {
                cp.loadFail();
                (0, _error.throwError)('SERVER_ERROR', _this._config);
            }
        }
    });
}

/**
 * 验证
 * @param conf
 */
function check(postData) {
    var _this2 = this;

    var act = postData.act;
    var _config2 = this._config,
        protocol = _config2.protocol,
        organization = _config2.organization,
        appId = _config2.appId,
        data = _config2.data;
    var _captchaData = this.captchaData,
        rid = _captchaData.rid,
        k = _captchaData.k,
        l = _captchaData.l;
    var _smApi2 = this._smApi,
        domain = _smApi2.domain,
        check = _smApi2.check;

    var key = (0, _des.DES)(this.defaultKey, (0, _des.base64Decode)(k), 0, 0);
    key = key.substr(0, l);
    var postAct = (0, _des.DES)(key, JSON.stringify(act), 1, 0);
    postAct = (0, _des.base64Encode)(postAct);
    var conf = {
        domains: [domain],
        path: check,
        protocol: protocol,
        query: {
            organization: organization,
            appId: appId,
            act: postAct,
            rid: rid,
            cs: ''
        }
    };
    var jsp = new _load2.default(conf);
    jsp.jsonp(function (status, data) {
        if (!status) {
            (0, _error.throwError)('NETWORK_ERROR', _this2._config);
        } else {
            var code = data.code,
                riskLevel = data.riskLevel;

            _this2.retry++;
            if (!code || code !== 1100) {
                (0, _error.throwError)('SERVER_ERROR', _this2._config);
                return;
            }
            var pass = code === 1100 && riskLevel === 'PASS';
            _this2._result = {
                rid: rid,
                pass: pass
            };
            if (pass) {
                if ((0, _functions.isFunction)(_this2._config['onSuccess'])) {
                    _this2._config['onSuccess']();
                }
                _this2.cp.success();
            } else {
                var maxRetry = _this2._config.maxRetry;

                if (_this2.retry >= maxRetry) {
                    if ((0, _functions.isFunction)(_this2._config['onSuccess'])) {
                        _this2._config['onSuccess']();
                    }
                    _this2.cp.fail(true);
                } else {
                    _this2.cp.fail();
                }
            }
        }
    });
}

},{"./_des.js":4,"./_error.js":5,"./_functions.js":6,"./_load.js":7}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); //工具


var _api = require('./_api.js');

var _functions = require('./_functions.js');

var _object = require('./_object.js');

var _object2 = _interopRequireDefault(_object);

var _error = require('./_error.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Captcha = function () {
    function Captcha(_ref) {
        var rootDom = _ref.rootDom,
            SMCaptcha = _ref.SMCaptcha,
            protocol = _ref.protocol;

        _classCallCheck(this, Captcha);

        this._config = {
            SMCaptcha: SMCaptcha,
            rootDom: rootDom,
            protocol: protocol
        };
        this.prefix = 'SMCaptcha-';
        this.ImgStack = {
            bg: false,
            fg: false
        };
        this.ratios = {
            'default': [110, 5, 35]
        };
        this.locked = true;
        this.method = !(0, _functions.IsPC)() ? ['touchstart', 'touchmove', 'touchend', 'touchstart'] : ['mousedown', 'mousemove', 'mouseup', 'onclick'];

        this.svgs = {
            fail: '<svg class="SMCaptcha-icon-svg" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4350" xmlns:xlink="http://www.w3.org/1999/xlink" ><path d="M557.312 513.248l265.28-263.904c12.544-12.48 12.608-32.704 0.128-45.248-12.512-12.576-32.704-12.608-45.248-0.128L512.128 467.904l-263.04-263.84c-12.448-12.48-32.704-12.544-45.248-0.064-12.512 12.48-12.544 32.736-0.064 45.28l262.976 263.776L201.6 776.8c-12.544 12.48-12.608 32.704-0.128 45.248a31.937 31.937 0 0 0 22.688 9.44c8.16 0 16.32-3.104 22.56-9.312l265.216-263.808 265.44 266.24c6.24 6.272 14.432 9.408 22.656 9.408a31.94 31.94 0 0 0 22.592-9.344c12.512-12.48 12.544-32.704 0.064-45.248L557.312 513.248z" fill="#ffffff" p-id="4351"></path></svg>',
            loading: '<svg style="width: 100%;height: 100%" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3132" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M512.511489 21.482517C241.348075 21.482517 21.482517 241.343255 21.482517 512.511489 21.482517 783.684341 241.338636 1003.54046 512.511489 1003.54046 539.065295 1003.54046 560.591409 982.014346 560.591409 955.460539 560.591409 928.906733 539.065295 907.380619 512.511489 907.380619 294.446249 907.380619 117.642358 730.576728 117.642358 512.511489 117.642358 294.45134 294.455216 117.642358 512.511489 117.642358 730.576728 117.642358 907.380619 294.446249 907.380619 512.511489 907.380619 539.065295 928.906733 560.591409 955.460539 560.591409 982.014346 560.591409 1003.54046 539.065295 1003.54046 512.511489 1003.54046 241.338636 783.684341 21.482517 512.511489 21.482517Z" p-id="3133"></path></svg>',
            right: '<svg  class="SMCaptcha-icon-svg" viewBox="0 0 1126 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5074" xmlns:xlink="http://www.w3.org/1999/xlink" ><path d="M578.413939 1007.963092c-19.99784-19.980564-19.99784-52.285252 0-72.265816l372.924466-372.756417H52.08265c-28.230675 0-51.138748-22.89708-51.138748-51.104196 0-28.21654 22.908074-51.11362 51.138748-51.11362h899.255755L578.413939 87.974479c-19.99784-19.988417-19.99784-52.289963 0-72.272099 19.989988-19.986847 52.31038-19.986847 72.30665 0l460.156074 459.995878c4.760344 4.700663 8.491975 10.379779 11.103803 16.665129a50.241963 50.241963 0 0 1 3.934233 19.474846 50.60319 50.60319 0 0 1-3.934233 19.520393c-2.611828 6.28692-6.34346 11.911067-11.103803 16.666699L650.72216 1008.018061c-19.99784 19.933448-52.318233 19.933448-72.308221-0.054969" fill="#000000" p-id="5075"></path></svg>',
            movingRight: '<svg class="SMCaptcha-icon-svg" viewBox="0 0 1126 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5074" xmlns:xlink="http://www.w3.org/1999/xlink" ><path d="M578.413939 1007.963092c-19.99784-19.980564-19.99784-52.285252 0-72.265816l372.924466-372.756417H52.08265c-28.230675 0-51.138748-22.89708-51.138748-51.104196 0-28.21654 22.908074-51.11362 51.138748-51.11362h899.255755L578.413939 87.974479c-19.99784-19.988417-19.99784-52.289963 0-72.272099 19.989988-19.986847 52.31038-19.986847 72.30665 0l460.156074 459.995878c4.760344 4.700663 8.491975 10.379779 11.103803 16.665129a50.241963 50.241963 0 0 1 3.934233 19.474846 50.60319 50.60319 0 0 1-3.934233 19.520393c-2.611828 6.28692-6.34346 11.911067-11.103803 16.666699L650.72216 1008.018061c-19.99784 19.933448-52.318233 19.933448-72.308221-0.054969" fill="#ffffff" p-id="5075"></path></svg>',
            success: '<svg class="SMCaptcha-icon-svg" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5891" xmlns:xlink="http://www.w3.org/1999/xlink" ><path d="M332.475765 767.674077c-1.989307-1.989307-1.990331-5.245468 0-7.234775L892.385938 200.540386c1.989307-1.990331 5.245468-1.990331 7.235798 0l55.778374 55.774281c1.989307 1.989307 1.989307 5.245468 0 7.235798L395.502217 823.458591c-1.990331 1.989307-5.245468 1.989307-7.235798 0L332.475765 767.674077z" p-id="5892" fill="#ffffff"></path><path d="M383.675868 819.519886c-1.989307 1.990331-5.245468 1.990331-7.235798 0.001023l-307.841204-307.851437c-1.990331-1.990331-1.989307-5.245468 0-7.235798l55.783491-55.773258c1.989307-1.989307 5.245468-1.989307 7.235798 0l307.836087 307.829947c1.990331 1.989307 1.990331 5.245468 0 7.235798L383.675868 819.519886z" p-id="5893" fill="#ffffff"></path></svg>',
            loadFail: '<svg class="SMCaptcha-icon-svg" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7160" xmlns:xlink="http://www.w3.org/1999/xlink" width="32" height="32"><path d="M317.952 316.928h241.152c12.8-7.68 23.04-19.968 15.36-39.424-8.704-22.016-27.648-37.888-40.96-58.368-22.528-34.304-17.92-85.504 10.752-115.2 31.744-32.768 83.968-30.208 83.968-30.208s51.712-3.072 83.456 30.208c28.672 29.696 32.768 80.896 10.752 115.2-13.312 20.48-32.768 36.352-41.472 58.368-7.68 19.456 3.072 31.744 15.36 39.424h247.296v235.52c-7.168 11.264-18.944 19.968-36.352 13.312-20.992-8.192-35.84-26.624-55.296-38.912-32.256-20.992-80.896-16.896-109.056 10.24-31.232 30.208-28.672 79.36-28.672 79.36s-2.56 49.152 28.672 79.36c28.16 27.136 76.8 31.232 109.056 10.24 19.456-12.8 34.304-30.72 55.296-38.912 17.408-6.656 28.672 2.048 36.352 12.8V931.84H680.96c-9.728-7.168-16.896-17.92-10.752-33.792 8.192-20.48 25.6-34.816 38.4-53.76 20.48-31.744 16.896-79.36-9.728-106.496-29.696-30.72-77.312-27.648-77.312-27.648s-48.128-2.56-77.312 27.648c-26.624 27.648-30.72 74.752-9.728 106.496 12.288 18.944 30.208 33.28 37.888 53.76 6.144 15.872-1.024 26.624-10.752 33.792H317.952v-236.032c-7.68-13.824-20.992-26.112-41.472-17.92-22.528 9.216-38.912 28.672-59.904 42.496-35.328 23.04-88.576 18.432-118.784-10.752-34.304-32.768-31.232-86.528-31.232-86.528s-3.072-53.248 31.232-86.528c30.72-29.696 83.456-34.304 118.784-10.752 20.992 13.824 37.376 33.792 59.904 42.496 20.992 8.192 33.792-4.096 41.472-17.92V316.928z" fill="#000000" p-id="7161"></path></svg>'
        };
        this.appendDom(rootDom);
        this.elements = {
            root: document.getElementById(rootDom),
            CaptchaWrapper: this.getElementById('captcha-root'),
            Bg: this.getElementById('bg-con'),
            Piece: this.getElementById('piece-con'),
            ImgCon: this.getElementById('img-con'),
            SliderBlock: this.getElementById('slider-block'),
            Slider: this.getElementById('slider'),
            SliderIcon: this.getElementById('slider-icon'),
            refreshBtn: this.getElementById('refresh'),
            SliderText: this.getElementById('slider-text'),
            SliderProcess: this.getElementById('slider-process'),
            LoadingText: this.getElementById('loading-text'),
            LoadingIcon: this.getElementById('loading-icon')

        };
        this.setDefaultView();
        this.bindEvent();
    }

    /**
     * 获取dom
     * @param id
     * @returns {Element}
     */


    _createClass(Captcha, [{
        key: 'getElementById',
        value: function getElementById(id) {
            return document.getElementById(this.prefix + id);
        }
        /**
         * 生成dom
         * @param root
         */

    }, {
        key: 'appendDom',
        value: function appendDom(root) {
            var htmlText = "<div class='SMCaptcha-captcha-wrapper ' id='SMCaptcha-captcha-root'>" + "<div class='SMCaptcha-img-wrapper' id='SMCaptcha-img-con'>" + "<div class='SMCaptcha-bg-wrapper' id='SMCaptcha-bg-con'>" + "<img src='' alt='' id='SMCaptcha-bg-img'>" + "</div>" + "<div class='SMCaptcha-piece-wrapper' id='SMCaptcha-piece-con'>" + "<img src='' alt='' id='SMCaptcha-piece-img'>" + "</div>" + "<div class='SMCaptcha-loading-box'>" + "<div class='SMCaptcha-loading-icon' id='SMCaptcha-loading-icon'>" + this.svgs.loading + "</div>" + "<div class='SMCaptcha-loading-text' id='SMCaptcha-loading-text'>加载中...</div>" + "</div>" + "<div class='SMCaptcha-refresh' id='SMCaptcha-refresh'>" + "</div>" + "</div>" + "<div class='SMCaptcha-slider-wrapper' id='SMCaptcha-slider-block'>" + "<div class='SMCaptcha-slider-process' id='SMCaptcha-slider-process'></div>" + "<div class='SMCaptcha-slider' id='SMCaptcha-slider'>" + "<div class='SMCaptcha-slider-icon' id='SMCaptcha-slider-icon'>" + this.svgs.right + "</div>" + "</div>" + "<div class='SMCaptcha-slider-text' id='SMCaptcha-slider-text'>" + "</div>" + "</div>" + "</div>";
            var rootDom = document.getElementById(root);
            rootDom.innerHTML = htmlText;
        }

        /**
         * 加载图片
         * @param domain
         * @param protocol
         * @param path
         * @param id
         * @param container
         */

    }, {
        key: 'loadImage',
        value: function loadImage(url, id, container, callback) {
            var img = document.getElementById(id) ? document.getElementById(id) : document.createElement('img');
            img.id = id;
            img.src = url + '?t=' + (parseInt(Math.random() * 10000) + new Date().valueOf());
            img.onerror = function () {
                callback(true);
            };
            img.onload = function () {
                img.onload = null;
                callback(false);
            };
            container.appendChild(img);
        }

        /**
         * loading效果
         */

    }, {
        key: 'loading',
        value: function loading() {
            var _elements = this.elements,
                CaptchaWrapper = _elements.CaptchaWrapper,
                SliderText = _elements.SliderText;

            SliderText.innerText = '加载中...';
            CaptchaWrapper.classList.add(this.prefix + 'loading');
            this.locked = true;
        }

        /**
         * 加载结束
         */

    }, {
        key: 'loaded',
        value: function loaded() {
            var _this = this;

            var self = this;
            var _elements2 = this.elements,
                CaptchaWrapper = _elements2.CaptchaWrapper,
                SliderText = _elements2.SliderText;
            var SMCaptcha = this._config.SMCaptcha;

            if (this.ImgStack.bg && this.ImgStack.fg) {
                setTimeout(function () {
                    SliderText.innerText = '向右滑动完成拼图';
                    CaptchaWrapper.classList.remove(_this.prefix + 'loading');
                    if ((0, _functions.isFunction)(SMCaptcha._config['onReady'])) {
                        SMCaptcha._config['onReady']();
                    }
                    self.locked = false;
                }, 300);
            }
        }

        /**
         * 加载失败
         */

    }, {
        key: 'loadFail',
        value: function loadFail() {
            var _elements3 = this.elements,
                CaptchaWrapper = _elements3.CaptchaWrapper,
                SliderText = _elements3.SliderText,
                LoadingIcon = _elements3.LoadingIcon,
                LoadingText = _elements3.LoadingText,
                SliderIcon = _elements3.SliderIcon;

            CaptchaWrapper.classList.add(this.prefix + 'load-fail');
            SliderText.innerText = '加载失败';
            LoadingText.innerText = '加载失败';
            LoadingIcon.innerHTML = this.svgs.loadFail;
            SliderIcon.removeEventListener(this.method[0], this.events['moveStartHandler']);
        }
        /**
         *
         */

    }, {
        key: 'moving',
        value: function moving() {
            var _elements4 = this.elements,
                CaptchaWrapper = _elements4.CaptchaWrapper,
                SliderIcon = _elements4.SliderIcon,
                SliderText = _elements4.SliderText;

            CaptchaWrapper.classList.add(this.prefix + 'moving');
            SliderText.innerText = '';
            SliderIcon.innerHTML = this.svgs.movingRight;
        }

        /**
         * 验证成功
         */

    }, {
        key: 'success',
        value: function success() {
            var _elements5 = this.elements,
                CaptchaWrapper = _elements5.CaptchaWrapper,
                refreshBtn = _elements5.refreshBtn,
                SliderIcon = _elements5.SliderIcon;

            refreshBtn.classList.add(this.prefix + 'hide');
            CaptchaWrapper.classList.add(this.prefix + 'success');
            SliderIcon.innerHTML = this.svgs.success;
            refreshBtn.onclick = null;
        }

        /**
         * 验证失败
         */

    }, {
        key: 'fail',
        value: function fail(bool) {
            var self = this;
            var _elements6 = this.elements,
                CaptchaWrapper = _elements6.CaptchaWrapper,
                SliderIcon = _elements6.SliderIcon;

            CaptchaWrapper.classList.add(this.prefix + 'fail');
            SliderIcon.innerHTML = this.svgs.fail;
            if (bool) {
                SliderIcon.removeEventListener(this.method[0], this.events['moveStartHandler']);
                return;
            }
            setTimeout(function () {
                self.events.refresh();
            }, 500);
        }

        /**
         * 重置className
         */

    }, {
        key: 'resetClassName',
        value: function resetClassName() {
            var _elements7 = this.elements,
                CaptchaWrapper = _elements7.CaptchaWrapper,
                SliderIcon = _elements7.SliderIcon;

            CaptchaWrapper.classList.remove(this.prefix + 'moving');
            CaptchaWrapper.classList.remove(this.prefix + 'success');
            CaptchaWrapper.classList.remove(this.prefix + 'fail');
            SliderIcon.innerHTML = this.svgs.right;
        }
        /**
         * 显示验证码区域
         */

    }, {
        key: 'setDefaultView',
        value: function setDefaultView(type) {
            var _elements8 = this.elements,
                Piece = _elements8.Piece,
                ImgCon = _elements8.ImgCon,
                SliderBlock = _elements8.SliderBlock,
                Slider = _elements8.Slider;

            var ratio = this.ratios[type || 'default'];
            var sum = ratio.reduce(function (a, b) {
                return a + b;
            });
            var CaptchaWrapper = this.elements.CaptchaWrapper;

            var Height = CaptchaWrapper.clientHeight;
            var ImgHeight = ratio[0] / sum * Height;
            var MarginHeight = ratio[1] / sum * Height;
            var SliderHeight = ratio[2] / sum * Height;
            ImgCon.style.height = ImgHeight + "px";
            ImgCon.style.marginBottom = MarginHeight - 2 + 'px';
            SliderBlock.style.height = SliderHeight + 'px';
            Piece.style.height = ImgHeight + "px";
            Slider.style.width = Slider.style.height = SliderHeight + 'px';
        }

        /**
         * 加载图片
         */

    }, {
        key: 'loadImages',
        value: function loadImages() {
            var _this2 = this;

            var _elements9 = this.elements,
                Bg = _elements9.Bg,
                Piece = _elements9.Piece;
            var _config = this._config,
                bg = _config.bg,
                fg = _config.fg,
                domains = _config.domains,
                protocol = _config.protocol,
                SMCaptcha = _config.SMCaptcha;

            this.loadImage(protocol + domains[0] + bg, this.prefix + 'bg-img', Bg, function (status) {
                if (!status) {
                    _this2.ImgStack.bg = true;
                } else {
                    (0, _error.throwError)('NETWORK_ERROR', SMCaptcha._config);
                }
                _this2.loaded();
            });

            this.loadImage(protocol + domains[0] + fg, this.prefix + 'piece-img', Piece, function (status) {
                if (!status) {
                    _this2.ImgStack.fg = true;
                } else {
                    (0, _error.throwError)('NETWORK_ERROR', SMCaptcha._config);
                }
                _this2.loaded();
            });
        }
        /**
         * 绑定事件
         */

    }, {
        key: 'bindEvent',
        value: function bindEvent() {
            document.querySelector('body').addEventListener('touchstart', function (e) {
                e.preventDefault();
            });
            var self = this;
            var _elements10 = this.elements,
                CaptchaWrapper = _elements10.CaptchaWrapper,
                Piece = _elements10.Piece,
                Slider = _elements10.Slider,
                SliderIcon = _elements10.SliderIcon,
                SliderProcess = _elements10.SliderProcess;
            var SMCaptcha = this._config.SMCaptcha;

            var RealWidth = CaptchaWrapper.clientWidth;
            var arr = [];
            var timestamp = null;
            var currentPageX = 0;
            var currentPageY = 0;
            var DValueX = 0;
            var DValueY = 0;
            var interval = null;
            var startFlag = false;
            var method = this.method;
            var PieceWidth = 0;
            var maxX = 0;
            var target = null;
            this.events = {
                moveStartHandler: moveStartHandler,
                moveHandler: moveHandler,
                moveEndHandler: moveEndHandler,
                refresh: refresh
            };
            SliderIcon.addEventListener(method[0], moveStartHandler);

            /**
             * moveEnd
             * @param e
             */
            function moveEndHandler(e) {
                target.removeEventListener(method[1], moveHandler);
                if (startFlag) {
                    add();
                    startFlag = false;
                    var data = calculate();
                    _api.check.bind(SMCaptcha, {
                        act: data
                    })();
                } else {
                    arr = [];
                }
                clearInterval(interval);
            }

            /**
             * moveStart
             * @param e
             */
            function moveStartHandler(e) {
                if (self.locked) {
                    return;
                }
                target = e.target;
                if (!(0, _functions.IsPC)()) {
                    currentPageX = e.touches[0].pageX;
                    currentPageY = e.touches[0].pageY;
                } else {
                    currentPageX = e.pageX;
                    currentPageY = e.pageY;
                }
                PieceWidth = Piece.clientWidth;
                maxX = RealWidth - PieceWidth;
                timestamp = new Date().getTime();
                startFlag = true;
                self.moving.bind(self)();
                target.addEventListener(method[1], moveHandler);
                target.addEventListener(method[2], moveEndHandler);
                interval = setInterval(add, 100);
            }

            /**
             * move
             * @param e
             */
            function moveHandler(e) {
                if (!(0, _functions.IsPC)()) {
                    DValueX = e.touches[0].pageX - currentPageX;
                    DValueY = e.touches[0].pageY - currentPageY;
                } else {
                    DValueX = e.pageX - currentPageX;
                    DValueY = e.pageY - currentPageY;
                }
                if (DValueX > 0 && DValueX < maxX) {
                    SliderProcess.style.width = DValueX + Slider.clientWidth + 'px';
                    Slider.style.marginLeft = DValueX + 'px';
                    Piece.style.left = DValueX + 'px';
                } else if (DValueX <= 0) {
                    Slider.style.marginLeft = '0px';
                } else {
                    Slider.style.marginLeft = maxX + 'px';
                }
            }

            function calculateTimer() {
                return new Date().getTime() - timestamp;
            }

            function addPoint(x, y, timer) {
                arr.push([x, y, timer]);
            }

            function add(bool) {
                if (bool) {
                    var timer = calculateTimer();
                    addPoint(DValueX, DValueY, timer);
                } else {
                    if (arr.length > 100) {
                        return;
                    } else {
                        var _timer = calculateTimer();
                        addPoint(DValueX, DValueY, _timer);
                    }
                }
            }

            function refresh() {
                Slider.style.marginLeft = '0px';
                Piece.style.left = '0px';
                SliderProcess.style.width = '0px';
                arr = [];
                timestamp = null;
                currentPageX = 0;
                currentPageY = 0;
                DValueX = 0;
                DValueY = 0;
                interval = null;
                startFlag = false;
                self.resetClassName();
                SMCaptcha.reset();
            }
            /**
             * 拼装数据
             */
            function calculate() {
                var l = arr.length;
                var X = arr[l - 1][0];
                var passTime = arr[l - 1][3];
                return {
                    d: X / RealWidth,
                    m: arr,
                    c: passTime
                };
            }
        }

        /**
         * 初始化
         * @param conf
         */

    }, {
        key: 'init',
        value: function init(conf) {
            var _this3 = this;

            new _object2.default(conf)._each(function (key, value) {
                _this3._config[key] = value;
            });
            this.loadImages();
        }
    }]);

    return Captcha;
}();

exports.default = Captcha;

},{"./_api.js":2,"./_error.js":5,"./_functions.js":6,"./_object.js":8}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.base64Decode = base64Decode;
exports.base64Encode = base64Encode;
exports.DES = DES;
/**
 * 获取des-key
 * @param {*} key
 */
function createDesKeys(key) {
    //declaring this locally speeds things up a bit
    var pc2bytes0 = new Array(0, 0x4, 0x20000000, 0x20000004, 0x10000, 0x10004, 0x20010000, 0x20010004, 0x200, 0x204, 0x20000200, 0x20000204, 0x10200, 0x10204, 0x20010200, 0x20010204);
    var pc2bytes1 = new Array(0, 0x1, 0x100000, 0x100001, 0x4000000, 0x4000001, 0x4100000, 0x4100001, 0x100, 0x101, 0x100100, 0x100101, 0x4000100, 0x4000101, 0x4100100, 0x4100101);
    var pc2bytes2 = new Array(0, 0x8, 0x800, 0x808, 0x1000000, 0x1000008, 0x1000800, 0x1000808, 0, 0x8, 0x800, 0x808, 0x1000000, 0x1000008, 0x1000800, 0x1000808);
    var pc2bytes3 = new Array(0, 0x200000, 0x8000000, 0x8200000, 0x2000, 0x202000, 0x8002000, 0x8202000, 0x20000, 0x220000, 0x8020000, 0x8220000, 0x22000, 0x222000, 0x8022000, 0x8222000);
    var pc2bytes4 = new Array(0, 0x40000, 0x10, 0x40010, 0, 0x40000, 0x10, 0x40010, 0x1000, 0x41000, 0x1010, 0x41010, 0x1000, 0x41000, 0x1010, 0x41010);
    var pc2bytes5 = new Array(0, 0x400, 0x20, 0x420, 0, 0x400, 0x20, 0x420, 0x2000000, 0x2000400, 0x2000020, 0x2000420, 0x2000000, 0x2000400, 0x2000020, 0x2000420);
    var pc2bytes6 = new Array(0, 0x10000000, 0x80000, 0x10080000, 0x2, 0x10000002, 0x80002, 0x10080002, 0, 0x10000000, 0x80000, 0x10080000, 0x2, 0x10000002, 0x80002, 0x10080002);
    var pc2bytes7 = new Array(0, 0x10000, 0x800, 0x10800, 0x20000000, 0x20010000, 0x20000800, 0x20010800, 0x20000, 0x30000, 0x20800, 0x30800, 0x20020000, 0x20030000, 0x20020800, 0x20030800);
    var pc2bytes8 = new Array(0, 0x40000, 0, 0x40000, 0x2, 0x40002, 0x2, 0x40002, 0x2000000, 0x2040000, 0x2000000, 0x2040000, 0x2000002, 0x2040002, 0x2000002, 0x2040002);
    var pc2bytes9 = new Array(0, 0x10000000, 0x8, 0x10000008, 0, 0x10000000, 0x8, 0x10000008, 0x400, 0x10000400, 0x408, 0x10000408, 0x400, 0x10000400, 0x408, 0x10000408);
    var pc2bytes10 = new Array(0, 0x20, 0, 0x20, 0x100000, 0x100020, 0x100000, 0x100020, 0x2000, 0x2020, 0x2000, 0x2020, 0x102000, 0x102020, 0x102000, 0x102020);
    var pc2bytes11 = new Array(0, 0x1000000, 0x200, 0x1000200, 0x200000, 0x1200000, 0x200200, 0x1200200, 0x4000000, 0x5000000, 0x4000200, 0x5000200, 0x4200000, 0x5200000, 0x4200200, 0x5200200);
    var pc2bytes12 = new Array(0, 0x1000, 0x8000000, 0x8001000, 0x80000, 0x81000, 0x8080000, 0x8081000, 0x10, 0x1010, 0x8000010, 0x8001010, 0x80010, 0x81010, 0x8080010, 0x8081010);
    var pc2bytes13 = new Array(0, 0x4, 0x100, 0x104, 0, 0x4, 0x100, 0x104, 0x1, 0x5, 0x101, 0x105, 0x1, 0x5, 0x101, 0x105);

    //how many iterations (1 for des, 3 for triple des)
    var iterations = key.length > 8 ? 3 : 1; //changed by Paul 16/6/2007 to use Triple DES for 9+ byte keys
    //stores the return keys
    var keys = new Array(32 * iterations);
    //now define the left shifts which need to be done
    var shifts = new Array(0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0);
    //other variables
    var lefttemp = void 0,
        righttemp = void 0,
        m = 0,
        n = 0,
        temp = void 0;

    for (var j = 0; j < iterations; j++) {
        //either 1 or 3 iterations
        var left = key.charCodeAt(m++) << 24 | key.charCodeAt(m++) << 16 | key.charCodeAt(m++) << 8 | key.charCodeAt(m++);
        var right = key.charCodeAt(m++) << 24 | key.charCodeAt(m++) << 16 | key.charCodeAt(m++) << 8 | key.charCodeAt(m++);

        temp = (left >>> 4 ^ right) & 0x0f0f0f0f;
        right ^= temp;
        left ^= temp << 4;
        temp = (right >>> -16 ^ left) & 0x0000ffff;
        left ^= temp;
        right ^= temp << -16;
        temp = (left >>> 2 ^ right) & 0x33333333;
        right ^= temp;
        left ^= temp << 2;
        temp = (right >>> -16 ^ left) & 0x0000ffff;
        left ^= temp;
        right ^= temp << -16;
        temp = (left >>> 1 ^ right) & 0x55555555;
        right ^= temp;
        left ^= temp << 1;
        temp = (right >>> 8 ^ left) & 0x00ff00ff;
        left ^= temp;
        right ^= temp << 8;
        temp = (left >>> 1 ^ right) & 0x55555555;
        right ^= temp;
        left ^= temp << 1;

        //the right side needs to be shifted and to get the last four bits of the left side
        temp = left << 8 | right >>> 20 & 0x000000f0;
        //left needs to be put upside down
        left = right << 24 | right << 8 & 0xff0000 | right >>> 8 & 0xff00 | right >>> 24 & 0xf0;
        right = temp;

        //now go through and perform these shifts on the left and right keys
        for (var i = 0; i < shifts.length; i++) {
            //shift the keys either one or two bits to the left
            if (shifts[i]) {
                left = left << 2 | left >>> 26;
                right = right << 2 | right >>> 26;
            } else {
                left = left << 1 | left >>> 27;
                right = right << 1 | right >>> 27;
            }
            left &= -0xf;
            right &= -0xf;

            //now apply PC-2, in such a way that E is easier when encrypting or decrypting
            //this conversion will look like PC-2 except only the last 6 bits of each byte are used
            //rather than 48 consecutive bits and the order of lines will be according to
            //how the S selection functions will be applied: S2, S4, S6, S8, S1, S3, S5, S7
            lefttemp = pc2bytes0[left >>> 28] | pc2bytes1[left >>> 24 & 0xf] | pc2bytes2[left >>> 20 & 0xf] | pc2bytes3[left >>> 16 & 0xf] | pc2bytes4[left >>> 12 & 0xf] | pc2bytes5[left >>> 8 & 0xf] | pc2bytes6[left >>> 4 & 0xf];
            righttemp = pc2bytes7[right >>> 28] | pc2bytes8[right >>> 24 & 0xf] | pc2bytes9[right >>> 20 & 0xf] | pc2bytes10[right >>> 16 & 0xf] | pc2bytes11[right >>> 12 & 0xf] | pc2bytes12[right >>> 8 & 0xf] | pc2bytes13[right >>> 4 & 0xf];
            temp = (righttemp >>> 16 ^ lefttemp) & 0x0000ffff;
            keys[n++] = lefttemp ^ temp;
            keys[n++] = righttemp ^ temp << 16;
        }
    } //for each iterations
    //return the keys we've created
    return keys;
}
/**
 * base64Decode
 * @param str
 * @returns {*}
 */
function base64Decode(str) {
    var base64DecodeChars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);
    var c1, c2, c3, c4;
    var i, len, out;

    len = str.length;
    i = 0;
    out = "";
    while (i < len) {
        /* c1 */
        do {
            c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
        } while (i < len && c1 == -1);
        if (c1 == -1) break;

        /* c2 */
        do {
            c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
        } while (i < len && c2 == -1);
        if (c2 == -1) break;

        out += String.fromCharCode(c1 << 2 | (c2 & 0x30) >> 4);

        /* c3 */
        do {
            c3 = str.charCodeAt(i++) & 0xff;
            if (c3 == 61) return out;
            c3 = base64DecodeChars[c3];
        } while (i < len && c3 == -1);
        if (c3 == -1) break;

        out += String.fromCharCode((c2 & 0XF) << 4 | (c3 & 0x3C) >> 2);

        /* c4 */
        do {
            c4 = str.charCodeAt(i++) & 0xff;
            if (c4 == 61) return out;
            c4 = base64DecodeChars[c4];
        } while (i < len && c4 == -1);
        if (c4 == -1) break;
        out += String.fromCharCode((c3 & 0x03) << 6 | c4);
    }
    return out;
}
/**
 * base64Encode
 * @param str
 * @returns {string}
 */
function base64Encode(str) {
    var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var out, i, len;
    var c1, c2, c3;

    len = str.length;
    i = 0;
    out = "";
    while (i < len) {
        c1 = str.charCodeAt(i++) & 0xff;
        if (i == len) {
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt((c1 & 0x3) << 4);
            out += "==";
            break;
        }
        c2 = str.charCodeAt(i++);
        if (i == len) {
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt((c1 & 0x3) << 4 | (c2 & 0xF0) >> 4);
            out += base64EncodeChars.charAt((c2 & 0xF) << 2);
            out += "=";
            break;
        }
        c3 = str.charCodeAt(i++);
        out += base64EncodeChars.charAt(c1 >> 2);
        out += base64EncodeChars.charAt((c1 & 0x3) << 4 | (c2 & 0xF0) >> 4);
        out += base64EncodeChars.charAt((c2 & 0xF) << 2 | (c3 & 0xC0) >> 6);
        out += base64EncodeChars.charAt(c3 & 0x3F);
    }
    return out;
}
/**
 * DES加密
 * @param {*DES} key
 * @param {*} message
 * @param {*} encrypt
 * @param {*} mode
 * @param {*} iv
 * @param {*} padding
 */
function DES(key, message, encrypt, mode, iv, padding) {
    //declaring this locally speeds things up a bit
    var spfunction1 = new Array(0x1010400, 0, 0x10000, 0x1010404, 0x1010004, 0x10404, 0x4, 0x10000, 0x400, 0x1010400, 0x1010404, 0x400, 0x1000404, 0x1010004, 0x1000000, 0x4, 0x404, 0x1000400, 0x1000400, 0x10400, 0x10400, 0x1010000, 0x1010000, 0x1000404, 0x10004, 0x1000004, 0x1000004, 0x10004, 0, 0x404, 0x10404, 0x1000000, 0x10000, 0x1010404, 0x4, 0x1010000, 0x1010400, 0x1000000, 0x1000000, 0x400, 0x1010004, 0x10000, 0x10400, 0x1000004, 0x400, 0x4, 0x1000404, 0x10404, 0x1010404, 0x10004, 0x1010000, 0x1000404, 0x1000004, 0x404, 0x10404, 0x1010400, 0x404, 0x1000400, 0x1000400, 0, 0x10004, 0x10400, 0, 0x1010004);
    var spfunction2 = new Array(-0x7fef7fe0, -0x7fff8000, 0x8000, 0x108020, 0x100000, 0x20, -0x7fefffe0, -0x7fff7fe0, -0x7fffffe0, -0x7fef7fe0, -0x7fef8000, -0x80000000, -0x7fff8000, 0x100000, 0x20, -0x7fefffe0, 0x108000, 0x100020, -0x7fff7fe0, 0, -0x80000000, 0x8000, 0x108020, -0x7ff00000, 0x100020, -0x7fffffe0, 0, 0x108000, 0x8020, -0x7fef8000, -0x7ff00000, 0x8020, 0, 0x108020, -0x7fefffe0, 0x100000, -0x7fff7fe0, -0x7ff00000, -0x7fef8000, 0x8000, -0x7ff00000, -0x7fff8000, 0x20, -0x7fef7fe0, 0x108020, 0x20, 0x8000, -0x80000000, 0x8020, -0x7fef8000, 0x100000, -0x7fffffe0, 0x100020, -0x7fff7fe0, -0x7fffffe0, 0x100020, 0x108000, 0, -0x7fff8000, 0x8020, -0x80000000, -0x7fefffe0, -0x7fef7fe0, 0x108000);
    var spfunction3 = new Array(0x208, 0x8020200, 0, 0x8020008, 0x8000200, 0, 0x20208, 0x8000200, 0x20008, 0x8000008, 0x8000008, 0x20000, 0x8020208, 0x20008, 0x8020000, 0x208, 0x8000000, 0x8, 0x8020200, 0x200, 0x20200, 0x8020000, 0x8020008, 0x20208, 0x8000208, 0x20200, 0x20000, 0x8000208, 0x8, 0x8020208, 0x200, 0x8000000, 0x8020200, 0x8000000, 0x20008, 0x208, 0x20000, 0x8020200, 0x8000200, 0, 0x200, 0x20008, 0x8020208, 0x8000200, 0x8000008, 0x200, 0, 0x8020008, 0x8000208, 0x20000, 0x8000000, 0x8020208, 0x8, 0x20208, 0x20200, 0x8000008, 0x8020000, 0x8000208, 0x208, 0x8020000, 0x20208, 0x8, 0x8020008, 0x20200);
    var spfunction4 = new Array(0x802001, 0x2081, 0x2081, 0x80, 0x802080, 0x800081, 0x800001, 0x2001, 0, 0x802000, 0x802000, 0x802081, 0x81, 0, 0x800080, 0x800001, 0x1, 0x2000, 0x800000, 0x802001, 0x80, 0x800000, 0x2001, 0x2080, 0x800081, 0x1, 0x2080, 0x800080, 0x2000, 0x802080, 0x802081, 0x81, 0x800080, 0x800001, 0x802000, 0x802081, 0x81, 0, 0, 0x802000, 0x2080, 0x800080, 0x800081, 0x1, 0x802001, 0x2081, 0x2081, 0x80, 0x802081, 0x81, 0x1, 0x2000, 0x800001, 0x2001, 0x802080, 0x800081, 0x2001, 0x2080, 0x800000, 0x802001, 0x80, 0x800000, 0x2000, 0x802080);
    var spfunction5 = new Array(0x100, 0x2080100, 0x2080000, 0x42000100, 0x80000, 0x100, 0x40000000, 0x2080000, 0x40080100, 0x80000, 0x2000100, 0x40080100, 0x42000100, 0x42080000, 0x80100, 0x40000000, 0x2000000, 0x40080000, 0x40080000, 0, 0x40000100, 0x42080100, 0x42080100, 0x2000100, 0x42080000, 0x40000100, 0, 0x42000000, 0x2080100, 0x2000000, 0x42000000, 0x80100, 0x80000, 0x42000100, 0x100, 0x2000000, 0x40000000, 0x2080000, 0x42000100, 0x40080100, 0x2000100, 0x40000000, 0x42080000, 0x2080100, 0x40080100, 0x100, 0x2000000, 0x42080000, 0x42080100, 0x80100, 0x42000000, 0x42080100, 0x2080000, 0, 0x40080000, 0x42000000, 0x80100, 0x2000100, 0x40000100, 0x80000, 0, 0x40080000, 0x2080100, 0x40000100);
    var spfunction6 = new Array(0x20000010, 0x20400000, 0x4000, 0x20404010, 0x20400000, 0x10, 0x20404010, 0x400000, 0x20004000, 0x404010, 0x400000, 0x20000010, 0x400010, 0x20004000, 0x20000000, 0x4010, 0, 0x400010, 0x20004010, 0x4000, 0x404000, 0x20004010, 0x10, 0x20400010, 0x20400010, 0, 0x404010, 0x20404000, 0x4010, 0x404000, 0x20404000, 0x20000000, 0x20004000, 0x10, 0x20400010, 0x404000, 0x20404010, 0x400000, 0x4010, 0x20000010, 0x400000, 0x20004000, 0x20000000, 0x4010, 0x20000010, 0x20404010, 0x404000, 0x20400000, 0x404010, 0x20404000, 0, 0x20400010, 0x10, 0x4000, 0x20400000, 0x404010, 0x4000, 0x400010, 0x20004010, 0, 0x20404000, 0x20000000, 0x400010, 0x20004010);
    var spfunction7 = new Array(0x200000, 0x4200002, 0x4000802, 0, 0x800, 0x4000802, 0x200802, 0x4200800, 0x4200802, 0x200000, 0, 0x4000002, 0x2, 0x4000000, 0x4200002, 0x802, 0x4000800, 0x200802, 0x200002, 0x4000800, 0x4000002, 0x4200000, 0x4200800, 0x200002, 0x4200000, 0x800, 0x802, 0x4200802, 0x200800, 0x2, 0x4000000, 0x200800, 0x4000000, 0x200800, 0x200000, 0x4000802, 0x4000802, 0x4200002, 0x4200002, 0x2, 0x200002, 0x4000000, 0x4000800, 0x200000, 0x4200800, 0x802, 0x200802, 0x4200800, 0x802, 0x4000002, 0x4200802, 0x4200000, 0x200800, 0, 0x2, 0x4200802, 0, 0x200802, 0x4200000, 0x800, 0x4000002, 0x4000800, 0x800, 0x200002);
    var spfunction8 = new Array(0x10001040, 0x1000, 0x40000, 0x10041040, 0x10000000, 0x10001040, 0x40, 0x10000000, 0x40040, 0x10040000, 0x10041040, 0x41000, 0x10041000, 0x41040, 0x1000, 0x40, 0x10040000, 0x10000040, 0x10001000, 0x1040, 0x41000, 0x40040, 0x10040040, 0x10041000, 0x1040, 0, 0, 0x10040040, 0x10000040, 0x10001000, 0x41040, 0x40000, 0x41040, 0x40000, 0x10041000, 0x1000, 0x40, 0x10040040, 0x1000, 0x41040, 0x10001000, 0x40, 0x10000040, 0x10040000, 0x10040040, 0x10000000, 0x40000, 0x10001040, 0, 0x10041040, 0x40040, 0x10000040, 0x10040000, 0x10001000, 0x10001040, 0, 0x10041040, 0x41000, 0x41000, 0x1040, 0x1040, 0x40040, 0x10000000, 0x10041000);

    //create the 16 or 48 subkeys we will need
    var keys = createDesKeys(key);
    var m = 0,
        i = void 0,
        j = void 0,
        temp = void 0,
        temp2 = void 0,
        right1 = void 0,
        right2 = void 0,
        left = void 0,
        right = void 0,
        looping = void 0;
    var cbcleft = void 0,
        cbcleft2 = void 0,
        cbcright = void 0,
        cbcright2 = void 0;
    var endloop = void 0,
        loopinc = void 0;
    var len = message.length;
    var chunk = 0;
    //set up the loops for single and triple des
    var iterations = keys.length == 32 ? 3 : 9; //single or triple des
    if (iterations == 3) {
        looping = encrypt ? new Array(0, 32, 2) : new Array(30, -2, -2);
    } else {
        looping = encrypt ? new Array(0, 32, 2, 62, 30, -2, 64, 96, 2) : new Array(94, 62, -2, 32, 64, 2, 30, -2, -2);
    }

    //pad the message depending on the padding parameter
    if (padding == 2) message += "        "; //pad the message with spaces
    else if (padding == 1) {
            temp = 8 - len % 8;
            message += String.fromCharCode(temp, temp, temp, temp, temp, temp, temp, temp);
            if (temp == 8) len += 8;
        } //PKCS7 padding
        else if (!padding) message += "\0\0\0\0\0\0\0\0"; //pad the message out with null bytes

    //store the result here
    var result = "";
    var tempresult = "";

    if (mode == 1) {
        //CBC mode
        cbcleft = iv.charCodeAt(m++) << 24 | iv.charCodeAt(m++) << 16 | iv.charCodeAt(m++) << 8 | iv.charCodeAt(m++);
        cbcright = iv.charCodeAt(m++) << 24 | iv.charCodeAt(m++) << 16 | iv.charCodeAt(m++) << 8 | iv.charCodeAt(m++);
        m = 0;
    }

    //loop through each 64 bit chunk of the message
    while (m < len) {
        left = message.charCodeAt(m++) << 24 | message.charCodeAt(m++) << 16 | message.charCodeAt(m++) << 8 | message.charCodeAt(m++);
        right = message.charCodeAt(m++) << 24 | message.charCodeAt(m++) << 16 | message.charCodeAt(m++) << 8 | message.charCodeAt(m++);

        //for Cipher Block Chaining mode, xor the message with the previous result
        if (mode == 1) {
            if (encrypt) {
                left ^= cbcleft;
                right ^= cbcright;
            } else {
                cbcleft2 = cbcleft;
                cbcright2 = cbcright;
                cbcleft = left;
                cbcright = right;
            }
        }

        //first each 64 but chunk of the message must be permuted according to IP
        temp = (left >>> 4 ^ right) & 0x0f0f0f0f;
        right ^= temp;
        left ^= temp << 4;
        temp = (left >>> 16 ^ right) & 0x0000ffff;
        right ^= temp;
        left ^= temp << 16;
        temp = (right >>> 2 ^ left) & 0x33333333;
        left ^= temp;
        right ^= temp << 2;
        temp = (right >>> 8 ^ left) & 0x00ff00ff;
        left ^= temp;
        right ^= temp << 8;
        temp = (left >>> 1 ^ right) & 0x55555555;
        right ^= temp;
        left ^= temp << 1;

        left = left << 1 | left >>> 31;
        right = right << 1 | right >>> 31;

        //do this either 1 or 3 times for each chunk of the message
        for (j = 0; j < iterations; j += 3) {
            endloop = looping[j + 1];
            loopinc = looping[j + 2];
            //now go through and perform the encryption or decryption
            for (i = looping[j]; i != endloop; i += loopinc) {
                //for efficiency
                right1 = right ^ keys[i];
                right2 = (right >>> 4 | right << 28) ^ keys[i + 1];
                //the result is attained by passing these bytes through the S selection functions
                temp = left;
                left = right;
                right = temp ^ (spfunction2[right1 >>> 24 & 0x3f] | spfunction4[right1 >>> 16 & 0x3f] | spfunction6[right1 >>> 8 & 0x3f] | spfunction8[right1 & 0x3f] | spfunction1[right2 >>> 24 & 0x3f] | spfunction3[right2 >>> 16 & 0x3f] | spfunction5[right2 >>> 8 & 0x3f] | spfunction7[right2 & 0x3f]);
            }
            temp = left;
            left = right;
            right = temp; //unreverse left and right
        } //for either 1 or 3 iterations

        //move then each one bit to the right
        left = left >>> 1 | left << 31;
        right = right >>> 1 | right << 31;

        //now perform IP-1, which is IP in the opposite direction
        temp = (left >>> 1 ^ right) & 0x55555555;
        right ^= temp;
        left ^= temp << 1;
        temp = (right >>> 8 ^ left) & 0x00ff00ff;
        left ^= temp;
        right ^= temp << 8;
        temp = (right >>> 2 ^ left) & 0x33333333;
        left ^= temp;
        right ^= temp << 2;
        temp = (left >>> 16 ^ right) & 0x0000ffff;
        right ^= temp;
        left ^= temp << 16;
        temp = (left >>> 4 ^ right) & 0x0f0f0f0f;
        right ^= temp;
        left ^= temp << 4;

        //for Cipher Block Chaining mode, xor the message with the previous result
        if (mode == 1) {
            if (encrypt) {
                cbcleft = left;
                cbcright = right;
            } else {
                left ^= cbcleft2;
                right ^= cbcright2;
            }
        }
        tempresult += String.fromCharCode(left >>> 24, left >>> 16 & 0xff, left >>> 8 & 0xff, left & 0xff, right >>> 24, right >>> 16 & 0xff, right >>> 8 & 0xff, right & 0xff);

        chunk += 8;
        if (chunk == 512) {
            result += tempresult;
            tempresult = "";
            chunk = 0;
        }
    } //for every 8 characters, or 64 bits in the message

    //return the result as an array
    return result + tempresult;
} //end of des

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{"./_object.js":8}],7:[function(require,module,exports){
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

},{"./_functions.js":6,"./_object.js":8}],8:[function(require,module,exports){
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
