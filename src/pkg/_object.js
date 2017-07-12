/**
 * _Object
 */
export default class _Object {
    constructor(_obj) {
        this._obj = _obj;
    }
    _each(process) {
        var _obj = this._obj;
        for (var k in _obj) {
            if (_obj.hasOwnProperty(k)) {
                process(k, _obj[k]);
            }
        }
        return this;
    }
}