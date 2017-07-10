import Load from '../utils/_load.js'
import {throwError} from '../utils/_error.js';
import {isString} from '../utils/_functions.js';
import _Object from '../utils/_object.js'
import {SM_API} from '../utils/_config.js'
/**
 *  参数校验
 */
function checkConfigParams(params){
    let {organization,appId} = params;
    let status = false;
    if(organization==''||!isString(organization)){
        status = true
    }
    if(appId==''||!isString(appId)){
        status = true
    }
    return status;
}
/**
 * 服务器获取资源路径
 */
class Config {
    constructor(conf) {
        this.sm_apiServer = [SM_API.domain];
        this.protocol = 'https://';
        this.path = SM_API.conf;
        this._extend(conf);
    }
    _extend(obj) {
        new _Object(obj)._each((key, value) => {
            this[key] = value;
        })
    }
}

//初始化验证码
let initSMCaptcha = function (customConfig, callback) {
    let config = new Config(customConfig);
    if(checkConfigParams(customConfig)){
        throwError('PARAMS_ERROR',customConfig,{message:'org or appid error'})
    }
    if (!customConfig.https) {
        config.protocol = window.location.protocol + '//';
    }else{
        config.protocol = 'https://'
    }
    let {
        sm_apiServer,
        path,
        protocol,
        organization,
        appId,
        version,
        timeout
    } = config;

    let jp = new Load({
        domains: sm_apiServer,
        path,
        protocol,
        timeout,
        query: {
            organization,
            appId,
            rversion:version
        }
    });
    jp.jsonp((status,newConfig) => {
        if(!status){
            throwError('NETWORK_ERROR',customConfig,{message:'conf api error'})
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
                });
                callback(new window.SMCaptcha(config));
            };
            let jpSdk = new Load({
                domains: domains,
                path: js,
                protocol: protocol,
                query: {
                    t:parseInt(Math.random() * 10000) + (new Date()).valueOf()
                },
                timeout
            });

            jpSdk.load((err) => {
                if (err) {
                    throwError('NETWORK_ERROR',customConfig,{message:'js-sdk load fail'})
                } else {
                    init()
                }
            })
        }
    })
};
window.initSMCaptcha = initSMCaptcha;