var Load = require('../pkg/_load.js');
var throwError = require('../pkg/_error.js');
var _Object = require('../pkg/_object.js');
var utils = require('../pkg/_functions.js');
var SM_API = require('../pkg/_config.js')



/**
 *  参数校验
 */
function checkConfigParams(params){
    var organization=params.organization,appId=params.appId,appendTo=params.appendTo;
    var error = {status:false,message:''};
    if(organization===''||!utils['isString'](organization)){
        error.status = true;
        error.message = 'organization is mistake'
    }
    if(appId===''||!utils['isString'](appId)){
        error.status = true;
        error.message = 'appId is mistake'
    }
    if(!appendTo||!utils['isString'](appendTo)||!document.getElementById(appendTo)){
        error.status = true;
        error.message = 'appendTo is mistake'
    }
    return error;
}


/**
 * 服务器获取资源路径
 */

function Config(conf) {
    this.smConfApi =SM_API.domain;
    this.protocol = window.location.protocol.match(/http/)?window.location.protocol + '//':'https://';
    this.sourcePath=SM_API.conf;
    this._extend(conf)
}
Config.prototype = {
    _extend:function (obj) {
        var self = this;
        new _Object(obj)._each((key, value) => {
            self[key] = value;
        })
    }
};

//初始化验证码
var  initSMCaptcha = function (customConfig, callback) {
    var config = new Config(customConfig);
    var query = {
        organization:config.organization,
        appId:config.appId,
        rversion:config.version
    }
    var error = checkConfigParams(config);
    if(error.status){
        throwError('PARAMS_ERROR',config,{message:error.message});
        return;
    }
    if (config.https) {
        config.protocol = 'https://'
    }
    var jp = new Load();
    jp.jsonp(config.smConfApi,config.sourcePath,config.protocol,query,(err,newConfig) => {
        if(err.status){
            throwError(err.type,config,{message:'conf api error'});
            return ;
        } else {
            var code = newConfig.code,detail = newConfig.detail||{};
            if(!code||code!==1100){
                throwError('SERVER_ERROR',config,{message:'conf api error'})
            }else{
                var js = detail.js,
                    domains = detail.domains,
                    css = detail.css;
                if(!utils['isString'](js)||!utils['isString'](css)||!utils['isObject'](domains)||!domains.length||domains.length<1){
                    throwError('SERVER_ERROR',config,{message:'conf api params error'});
                    return;
                }
                var init = function () {
                    config._extend({
                        css:css,
                        domains:domains
                    });
                    callback(new window.SMCaptcha(config));
                };
                var jpSdk = new Load();
                jpSdk.load('Script',domains,js,config.protocol,{},(err) => {
                    if (err.status) {
                        throwError(err.type,config,{message:'js-sdk load fail'})
                    } else {
                        init()
                    }
                })
            }
        }
    })
};
window.initSMCaptcha = initSMCaptcha;