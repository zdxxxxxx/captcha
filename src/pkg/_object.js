/**
 * object _each
 * @param obj
 * @private
 */

var _Object = function (obj) {
    this._obj = obj;
};

_Object.prototype = {
    _each:function (process) {
        var _obj = this._obj;
        for (var k in _obj) {
            if (_obj.hasOwnProperty(k)) {
                process(k, _obj[k]);
            }
        }
        return this;
    }
};
module.exports = _Object;