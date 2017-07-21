/**
 * 工具包
 * @type {_Object}
 * @private
 */

var _Object =require('./_object.js') ;

var utils = {
    isNumber:function (v) {
        return (typeof v === 'number');
    },
    isString:function (v) {
        return (typeof v === 'string');
    },
    isBoolean:function (v) {
        return (typeof v === 'boolean');
    },
    isObject:function (v) {
        return (typeof v === 'object' && v !== null);
    },
    isFunction:function (v) {
        return (typeof v === 'function');
    },
    IsPC:function () {
        let userAgentInfo = navigator.userAgent;
        let Agents = ["Android", "iPhone",
            "SymbianOS", "Windows Phone",
            "iPad", "iPod"];
        let flag = true;
        for (var v = 0; v < Agents.length; v++) {
            if (userAgentInfo.indexOf(Agents[v]) > 0) {
                flag = false;
                break;
            }
        }
        return flag;
    },
    normalizeDomain:function (domain) {
        return domain.replace(/^https?:\/\/|\/$/g, '');
    },
    normalizePath:function (path) {
        path = path.replace(/\/+/g, '/');
        if (path.indexOf('/') !== 0) {
            path = '/' + path;
        }
        return path;
    },
    normalizeQuery:function (query) {
        let self = this;
        if (!query) {
            return '';
        }
        let q = '?';
        new _Object(query)._each(function (key, value) {
            if (self['isString'](value) || self['isNumber'](value) || self['isBoolean'](value)) {
                q = q + encodeURIComponent(key) + '=' + encodeURIComponent(value) + '&';
            }
        });
        if (q === '?') {
            q = '';
        }
        return q.replace(/&$/, '');
    },
    makeURL:function (protocol, domain, path, query) {
        let self = this;
        domain = self['normalizeDomain'](domain);
        var url = self['normalizePath'](path) + self['normalizeQuery'](query);
        if (domain) {
            url = protocol + domain + url;
        }
        return url;
    },
    hasSvg:function(){
        var SVG_NS = 'http://www.w3.org/2000/svg';
        return !!document.createElementNS &&
            !!document.createElementNS(SVG_NS, 'svg').createSVGRect;
    }
};
module.exports = utils;