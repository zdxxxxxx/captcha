import Load from './_load.js'
import {throwError} from './_error.js'
import {isFunction,isNumber,isObject,isString} from './_functions.js'
import {DES,base64Decode,base64Encode} from './_des.js'
import {SM_API} from './_config.js'


function checkServerParams(data) {
    let {bg_width,bg_height,bg,fg,domains,rid,k,l} = data;
    let err = {
        status:false,
        type:''
    };
    if(!isNumber(bg_height)||!isNumber(bg_width)||!isString(bg)||!isString(fg)||!isString(rid)||!isString(k)||!isNumber(l)){
        setError()
    }
    if(!isObject(domains)||!domains.length||domains.length<1){
        setError()
    }
    function setError() {
        err = {
            status:true,
            type:'SERVER_ERROR'
        }
    }
    return err
}
/**
 * 注册验证码
 * @param conf
 */
export function register() {
    let {protocol,organization,appId,customData} = this._config;
    let {domain,register} = SM_API;
    let cp = this.cp;
    let query = {
        organization:organization,
        appId:appId,
        data:JSON.stringify(customData)
    };
    cp.loading();
    let jsp = new Load();
    jsp.jsonp(domain,register,protocol,query,(error,data)=>{
        let {status,type} =error;
        if(status){
            cp.loadFail();
            throwError(type,this._config,{message:'register api error'});
        }else{
            let {code,detail} = data;
            if(code === 1100){
                let err = checkServerParams(detail);
                let {status,type} =err;
                if(status){
                    cp.loadFail();
                    throwError(type,this._config,{message:"register api params err"});
                }else{
                    let {bg_width,bg_height,bg,fg,domains,rid,k,l} = detail;
                    this.captchaData = {
                        rid:rid,
                        k:k,
                        l:l
                    };
                    cp.init({
                        width:bg_width,
                        height:bg_height,
                        bg,
                        fg,
                        domains
                    });
                }
            }else{
                cp.loadFail();
                throwError('SERVER_ERROR',this._config,{message:"register api fail"});
            }
        }
    })
}



/**
 * 验证
 * @param conf
 */
export function check(postData) {
    let {act} = postData;
    let {protocol,organization,appId} = this._config;
    let {rid,k,l} = this.captchaData;
    let {domain,check} = SM_API;
    let key = DES(this.defaultKey,base64Decode(k),0,0);
    key = key.substr(0,l);
    let postAct = DES(key,JSON.stringify(act),1,0);
    postAct = base64Encode(postAct);
    let query = {
        organization:organization,
        appId:appId,
        act:postAct,
        rid,
    };
    let jsp = new Load();
    jsp.jsonp(domain,check,protocol,query,(error,data)=>{
        let {status,type} =error;
        if(status){
            this.cp.loadFail();
            throwError(type,this._config,data,'fv api error');
        }else{
            let {code,riskLevel} = data;
            if(!code||code!==1100){
                throwError('SERVER_ERROR',this._config,'fv api failed');
                return ;
            }
            let pass = code===1100&&riskLevel==='PASS';
            this._result = {
                rid:rid,
                pass:pass
            };
            if(isFunction(this._config['onSuccess'])){
                this._config['onSuccess']();
            }
            if(pass){
                this.cp.success()
            }else{
                this.cp.fail();
            }
        }
    })
}