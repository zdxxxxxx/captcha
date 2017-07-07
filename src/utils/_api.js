import JsonP from './_load.js'
import {throwError} from './_error.js'
import {isFunction} from './_functions.js'
import {DES,base64Decode,base64Encode} from './_des.js'
/**
 * 注册验证码
 * @param conf
 */
export function register() {
    let {protocol,organization,appId,data} = this._config;
    let {domain,register} = this._smApi;
    let cp = this.cp;
    let conf = {
        domains:[domain],
        path:register,
        protocol:protocol,
        query:{
            organization:organization,
            appId:appId,
            data:JSON.stringify(data),
            cs:''
        }
    };
    cp.loading();
    let jsp = new JsonP(conf);
    jsp.jsonp((status,data)=>{
        if(!status){
            throwError('NETWORK_ERROR',this._config,{message:'register api error'});
        }else{
            let {code,detail} = data;
            if(code === 1100){
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
    let {domain,check} = this._smApi;
    let key = DES(this.defaultKey,base64Decode(k),0,0);
    key = key.substr(0,l);
    let postAct = DES(key,JSON.stringify(act),1,0);
    postAct = base64Encode(postAct);
    let conf = {
        domains:[domain],
        path:check,
        protocol:protocol,
        query:{
            organization:organization,
            appId:appId,
            act:postAct,
            rid,
            cs:''
        }
    };
    let jsp = new JsonP(conf);
    jsp.jsonp((status,data)=>{
        if(!status){
            throwError('NETWORK_ERROR',this._config,data,'fv api error');
        }else{
            let {code,riskLevel} = data;
            this.retry++;
            if(!code||code!==1100){
                throwError('SERVER_ERROR',this._config,'fv api failed');
                return ;
            }
            let pass = code===1100&&riskLevel==='PASS';
            this._result = {
                rid:rid,
                pass:pass
            };
            if(pass){
                if(isFunction(this._config['onSuccess'])){
                    this._config['onSuccess']();
                }
                this.cp.success()
            }else{
                let {maxRetry} = this._config;
                if(this.retry>=maxRetry){
                    if(isFunction(this._config['onSuccess'])){
                        this._config['onSuccess']();
                    }
                    this.cp.fail(true);
                }else{
                    this.cp.fail();
                }
            }
        }
    })
}