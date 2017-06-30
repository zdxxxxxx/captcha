import Jsonp from '../utils/_jsonp.js'
import Config from '../utils/_config.js'
let status = {}
let callbacks = {}
//报错
let throwError = function (errorType, config) {
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
let initSMCaptcha = function (customConfig, callback) {
    let config = new Config(customConfig);
    if (!customConfig.protocol) {
        config.protocol = window.location.protocol + '//';
    }
    let {
        sm_apiServer,
        path,
        protocol,
        org,
        appId,
    } = config
    let jp = new Jsonp({
        domains: sm_apiServer,
        path,
        protocol,
        query: {
            org,
            appId
        }
    })
    jp.jsonp((newConfig) => {
        if (newConfig.code != 1100) {
            throwError('networkError', config)
        } else {

            let detail = newConfig.detail;
            let {
                js,
                domains,
                css
            } = detail;
            let init = function () {
                config._extend({
                    css,
                    domains
                })
                callback(new window.SMCaptcha(config));
            };
            let jpSdk = new Jsonp({
                domains: domains,
                path: js,
                protocol: protocol,
                query: null
            })
            jpSdk.load((err) => {
                if (err) {
                    throwError('networkError', config);
                } else {
                    init()
                }
            })
        }
    })
}
window.initSMCaptcha = initSMCaptcha;