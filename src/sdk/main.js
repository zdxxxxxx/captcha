//工具
import {makeURL,isString,isNumber} from '../utils/_functions.js'
import _Object from '../utils/_object.js'
import {register} from '../utils/_api.js'
import Captcha from '../utils/_captcha.js'
import {throwError} from '../utils/_error.js'
let status = false;
let DEBUG = false;

function load({domains,path,protocol,query,callback}){
    let tryRequest = (at) => {
        let url = makeURL(protocol, domains[at], path, query);
        loadCss(url, (err) => {
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

function loadCss(url,cb){
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
    link.onerror = function () {
        cb(true);
        window.clearTimeout(timer)
    };
    status = false;
    //解决浏览器兼容问题
    link.onload = link.onreadystatechange = function () {
        if (!this.status &&
            (!link.readyState ||
            "loaded" === link.readyState ||
            "complete" === link.readyState)) {
            status = true;
            window.clearTimeout(timer);
            setTimeout(function () {
                cb(false);
            }, 0);
        }
    };


    link.href = url+"?t="+(parseInt(Math.random() * 10000) + (new Date()).valueOf());

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



/**
 * sdk
 */
class SMCaptcha {
    constructor(config) {
        this._config = {};
        new _Object(config)._each((key,value)=>{
            this._config[key] = value;
        });
        this.checkConfigParams(this._config)
        let {domains,css,protocol,appendTo} = this._config;
        this.defaultKey = 'sshummei';
        this._result = null;
        this.captchaData = null;
        this.retry = 0;
        this._smApi = {
            domain:'123.206.13.134',
            register:'/ca/v1/register',
            check:'/ca/v1/fverify'
        };
        load({
            domains,
            path:css,
            protocol,
            query:null,
            callback:(err)=>{
                if(err){
                    throwError('NETWORK_ERROR',this._config,{message:'load css error'})
                }else{
                    this.cp = new Captcha({
                        rootDom:appendTo,
                        SMCaptcha:this,
                        protocol
                    });
                    this.reset();
                }
            }
        });
    }
    /**
     *  参数校验
     */
    checkConfigParams(){
        let {appendTo,timeout,maxRetry} = this._config;
        if(appendTo==''||!isString(appendTo)){
            throwError('PARAMS_ERROR',this._config,{message:'appendTo error'})
        }
        if(timeout&&isString(timeout)){
            this._config.timeout = 30000;
        }
        if(!maxRetry||!isNumber(maxRetry)){
            this._config.maxRetry = 3;
        }
    }
    /**
     * 成功后回调
     * @param cb
     */
    onSuccess(cb){
        this._config['onSuccess'] = cb
    }

    /**
     * 准备好后回调
     * @param cb
     */
    onReady(cb){
        this._config['onReady'] = cb
    }

    /**
     * 服务端异常
     * @param cb
     */
    onError(cb){
        this._config['onError'] = cb
    }

    /**
     * 取结果
     * @returns {{organization: *, appId: *}|*}
     */
    getResult() {
        return this._result
    }

    /**
     * 刷新验证码
     */
    reset() {
        register.bind(this)()
    }

}

window.SMCaptcha = SMCaptcha;