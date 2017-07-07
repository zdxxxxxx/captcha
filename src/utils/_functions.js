import _Object from './_object.js'

/**
 * 判断类型
 */
export function isNumber(v) {
    return (typeof v === 'number');
}

export function isString(v) {
    return (typeof v === 'string');
}

export function isBoolean(v) {
    return (typeof v === 'boolean');
}

export function isObject(v) {
    return (typeof v === 'object' && v !== null);
}

export function isFunction(v) {
    return (typeof v === 'function');
}

/**
 * 格式化域名
 * @param {*} domain
 */
export function normalizeDomain(domain) {
    return domain.replace(/^https?:\/\/|\/$/g, '');
}

//路径格式化
export function normalizePath(path) {
    path = path.replace(/\/+/g, '/');
    if (path.indexOf('/') !== 0) {
        path = '/' + path;
    }
    return path;
}
//格式化query
export function normalizeQuery(query) {
    if (!query) {
        return '';
    }
    let q = '?';
    new _Object(query)._each(function (key, value) {
        if (isString(value) || isNumber(value) || isBoolean(value)) {
            q = q + encodeURIComponent(key) + '=' + encodeURIComponent(value) + '&';
        }
    });
    if (q === '?') {
        q = '';
    }
    return q.replace(/&$/, '');
}
//格式化url
export function makeURL(protocol, domain, path, query) {
    domain = normalizeDomain(domain);

    let url = normalizePath(path) + normalizeQuery(query);
    if (domain) {
        url = protocol + domain + url;
    }
    return url;
}

/**
 * 是否是移动端
 * @returns {boolean}
 * @constructor
 */
export function IsPC() {
    let userAgentInfo = navigator.userAgent;
    let Agents = ["Android", "iPhone",
        "SymbianOS", "Windows Phone",
        "iPad", "iPod"];
    let flag = true;
    for (let v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
            flag = false;
            break;
        }
    }
    return flag;
}
