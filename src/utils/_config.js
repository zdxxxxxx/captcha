import _Object from './_object.js'

/**
 * 配置
 */
export default class Config {
    constructor(conf) {
        this.sm_apiServer = ['127.0.0.1:3000'];
        this.protocol = 'https://';
        this.path = '/getResource';
        this._extend(conf);
    }
    _extend(obj) {
        new _Object(obj)._each((key, value) => {
            this[key] = value;
        })
    }
}