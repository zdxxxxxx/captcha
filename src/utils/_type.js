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