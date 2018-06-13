"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var toString = Object.toString;
function isFunction(func) {
    return typeof func === 'function';
}
exports.isFunction = isFunction;
function isObject(arg) {
    return !!arg && typeof arg === 'object';
}
exports.isObject = isObject;
exports.default = {
    isFunction: isFunction,
    isObject: isObject
};
