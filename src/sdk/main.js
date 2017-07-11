//工具
import {makeURL,isString,isNumber} from '../utils/_functions.js'
import _Object from '../utils/_object.js'
import {register} from '../utils/_api.js'
import Captcha from '../utils/_captcha.js'
import {throwError} from '../utils/_error.js'
import Load from '../utils/_load.js'

/**
 * sdk
 */
class SMCaptcha {
    constructor(config) {
        this._config = {};
        new _Object(config)._each((key,value)=>{
            this._config[key] = value;
        });
        let {domains,css,protocol,appendTo} = this._config;
        this.defaultKey = 'sshummei';
        this._result = null;
        this.captchaData = null;
        let ls = new Load();
        ls.load('Css',domains,css,protocol,{t:parseInt(Math.random() * 10000) + (new Date()).valueOf()},(err)=>{
            let {status,type} = err;
            if(status){
                throwError(type,this._config,{message:'load css error'})
            }else{
                this.cp = new Captcha({
                    rootDom:appendTo,
                    SMCaptcha:this,
                    protocol
                });
                this.reset();
            }
        });
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