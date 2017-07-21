//工具
var api = require('../pkg/_api.js');
var Captcha =require('../pkg/_captcha.js');
var throwError = require('../pkg/_error.js');
var Load= require('../pkg/_load.js') ;
var utils = require('../pkg/_functions.js');
//
//
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
 * 非必填参数校正
 */
function fixParams(conf) {
    var timeout = conf.timeout,
        https=conf.https,
        customData= conf.customData,
        onError=conf.onError,
        version=conf.version;

    if(!timeout||!utils["isNumber"](timeout)){
        conf.timeout = 30000;
    }
    if(!https||!utils["isBoolean"](https)){
        conf.https = false
    }
    if(!utils["isObject"](customData)){
        conf.customData = undefined;
    }
    if(!utils["isFunction"](onError)){
        conf.onError = undefined
    }
    if(!utils["isString"](version)){
        conf.version = undefined
    }
    return conf;
}
/**
 * sdk
 */
var SMCaptcha = function (config) {
    var self = this;
    var error = checkConfigParams(config);
    if(error.status){
        throwError('PARAMS_ERROR',config,{message:error.message});
        return;
    }
    self._config = fixParams(config);
    self.init()
};
SMCaptcha.prototype = {
    _config:{},
    _result:null,
    captchaData:null,
    defaultKey:'sshummei',
    /**
     * 成功后回调
     * @param cb
     */
    onSuccess:function(cb){
        this._config['onSuccess'] = cb
    },

    /**
     * 准备好后回调
     * @param cb
     */
    onReady:function(cb){
        this._config['onReady'] = cb
    },

    /**
     * 服务端异常
     * @param cb
     */
    onError:function(cb){
        this._config['onError'] = cb
    },

    /**
     * 取结果
     * @returns {{organization: *, appId: *}|*}
     */
    getResult:function() {
        return this._result
    },
    /**
     * 刷新验证码
     */
    reset:function() {
        api['register'].call(this)
    },
    init:function(){
        var self = this;
        var domains = self._config.domains,
            css = self._config.css,
            protocol= self._config.protocol,
            appendTo=self._config.appendTo,
            width=self._config.width;
        var ls = new Load();
        ls.load('Css',domains,css,protocol,{},function(err){
            if(err.status){
                throwError(err.type,self._config,{message:'load css error'})
            }else{
                self.cp = new Captcha(appendTo,self,protocol,utils['isNumber'](width)?width:undefined);
                self.reset();
            }
        });
    }
};

window.SMCaptcha = SMCaptcha;