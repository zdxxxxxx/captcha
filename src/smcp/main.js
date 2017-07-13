import Load from '../pkg/_load.js';
import {throwError} from '../pkg/_error.js';
import {isString,isNumber,isBoolean,isObject,isFunction} from '../pkg/_functions.js';
import _Object from '../pkg/_object.js';
import {SM_API} from '../pkg/_config.js';

/**
 *  参数校验
 */
function checkConfigParams(params){
    let {organization,appId,appendTo} = params;
    let error = {status:false,message:''};

    if(organization===''||!isString(organization)){
        error.status = true;
        error.message = 'organization is mistake'
    }
    if(appId===''||!isString(appId)){
        error.status = true;
        error.message = 'appId is mistake'
    }
    if(!appendTo||!isString(appendTo)||!document.getElementById(appendTo)){
        error.status = true;
        error.message = 'appendTo is mistake'
    }
    return error;
}

/**
 * 非必填参数校正
 */
function fixParams(conf) {
    let {timeout,https,customData,onError,version} = conf;
    let obj = {};
    new _Object(conf)._each((key, value) => {
        obj[key] = value;
    });
    if(!timeout||!isNumber(timeout)){
        obj.timeout = 30000;
    }
    if(!https||!isBoolean(https)){
        obj.https = false
    }
    if(!isObject(customData)){
        obj.customData = undefined;
    }
    if(!isFunction(onError)){
        obj.onError = undefined
    }
    if(!isString(version)){
        obj.version = undefined
    }
    return obj;
}
/**
 * 服务器获取资源路径
 */
class Config {
    constructor(conf) {
        this.smConfApi = ['118.89.223.233'];//.concat(SM_API.domain);//118.89.223.233,SM_API.domain
        this.protocol = window.location.protocol + '//';
        this.sourcePath = '/getResourceDev'||SM_API.conf;// /getResource
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
    customConfig = fixParams(customConfig);
    let config = new Config(customConfig);
    let error = checkConfigParams(config);
    if(error.status){
        throwError('PARAMS_ERROR',config,{message:error.message});
        return;
    }
    if (config.https) {
        config.protocol = 'https://'
    }
    let {
        smConfApi,
        sourcePath,
        protocol,
        organization,
        appId,
        version,
        timeout
    } = config;

    let jp = new Load();
    jp.jsonp(smConfApi,sourcePath,protocol,{organization, appId, rversion:version},(err,newConfig) => {
        let {status,type} = err;
        if(status){
            throwError(type,config,{message:'conf api error'});
            return ;
        } else {
            let {code,detail} = newConfig;
            if(!code||code!==1100){
                throwError('SERVER_ERROR',config,{message:'conf api error'})
            }else{
                let {
                    js,
                    domains,
                    css
                } = detail;
                if(!isString(js)||!isString(css)||!isObject(domains)||!domains.length||domains.length<1){
                    throwError('SERVER_ERROR',config,{message:'conf api params error'});
                    return;
                }
                let init = function () {
                    config._extend({
                        css,
                        domains
                    });
                    callback(new window.SMCaptcha(config));
                };
                let jpSdk = new Load(timeout);
                jpSdk.load('Script',domains,js,protocol,{t:parseInt(Math.random() * 10000) + (new Date()).valueOf()},(err) => {
                    let {status,type} = err;
                    if (status) {
                        throwError(type,config,{message:'js-sdk load fail'})
                    } else {
                        init()
                    }
                })
            }
        }
    })
};
window.initSMCaptcha = initSMCaptcha;