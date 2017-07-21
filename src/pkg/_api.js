var Load =require('./_load.js');
var throwError  = require('./_error.js');
var utils =  require('./_functions.js');
var encrypt =require('./_des.js');
var SM_API= require('./_config.js');
var stringify = require('./_stringify.js');
function checkServerParams(data) {
    var bg_width =data.bg_width,bg_height = data.bg_height,bg = data.bg,fg = data.fg,domains=data.domains,rid=data.rid,k=data.k,l=data.l;
    var err = {
        status:false,
        type:''
    };
    if(!utils['isNumber'](bg_height)||!utils['isNumber'](bg_width)||!utils['isString'](bg)||!utils['isString'](fg)||!utils['isString'](rid)||!utils['isString'](k)||!utils['isNumber'](l)){
        setError()
    }
    if(!utils['isObject'](domains)||!domains.length||domains.length<1){
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
function register() {
    var self = this;
    var protocol=this._config.protocol,organization=this._config.organization,appId=this._config.appId,customData=this._config.customData;
    var domain=SM_API.domain,register=SM_API.register;
    var cp = this.cp;
    var query = {
        organization:organization,
        appId:appId,
        data:stringify(customData)
    };
    cp.loading();
    var jsp = new Load();
    jsp.jsonp(domain,register,protocol,query,(error,data)=>{
        if(error.status){
            cp.loadFail();
            throwError(error.type,self._config,{message:'register api error'});
        }else{
            var code = data.code,detail = data.detail;
            if(code === 1100){
                var err = checkServerParams(detail);
                if(err.status){
                    cp.loadFail();
                    throwError(err.type,self._config,{message:"register api params err"});
                }else{
                    var {bg_width,bg_height,bg,fg,domains,rid,k,l} = detail;
                    self.captchaData = {
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
                throwError('SERVER_ERROR',self._config,{message:"register api fail"});
            }
        }
    })
}



/**
 * 验证
 * @param conf
 */
function check(postData) {
    var self = this;
    var act = postData.act;
    var protocol=self._config.protocol,organization=self._config.organization,appId=self._config.appId;
    var rid = self.captchaData.rid,k =self.captchaData.k,l=self.captchaData.l;
    var domain = SM_API.domain,check = SM_API.check;
    var key = encrypt['DES'](self.defaultKey,encrypt['base64Decode'](k),0,0).substr(0,l);
    var postAct = encrypt['base64Encode'](encrypt['DES'](key,stringify(act),1,0));
    var query = {
        organization:organization,
        appId:appId,
        act:postAct,
        rid:rid
    };
    var jsp = new Load();
    jsp.jsonp(domain,check,protocol,query,function(error,data){
        if(error.status){
            self.cp['loadFail']();
            throwError(error.type,self._config,data,'fv api error');
        }else{
            var code = data.code,riskLevel=data.riskLevel;
            if(!code||code!==1100){
                throwError('SERVER_ERROR',self._config,'fv api failed');
                return ;
            }
            var pass = code===1100&&riskLevel==='PASS';
            self._result = {
                rid:rid,
                pass:pass
            };
            if(utils['isFunction'](self._config['onSuccess'])){
                self._config['onSuccess'](self._result);
            }
            if(pass){
                self.cp['success'](self._result)
            }else{
                self.cp['fail']();
            }
        }
    })
}
module.exports = {
    register:register,
    check:check
};