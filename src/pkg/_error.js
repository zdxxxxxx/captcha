/**
 * 报错
 * @type {{NETWORK_ERROR: {code: number, message: string}}}
 */

var errors = {
    NETWORK_ERROR:{
        code:2001,
        message:"资源异常"
    },
    SERVER_ERROR:{
        code:2002,
        message:"服务器异常"
    },
    PARAMS_ERROR:{
        code:2003,
        message:"参数异常"
    },
    NET_TIMEOUT:{
        code:2005,
        message:'网络超时'
    }
};

module.exports = function (errorType,config,msg) {
    if(config&&typeof config.onError === 'function'){
        config.onError(errors[errorType],msg)
    }else{
        throw new Error(errors[errorType]);
    }
};