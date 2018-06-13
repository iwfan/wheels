const toString: () => string = Object.toString

export function isFunction(func :any) :boolean {
    return typeof func === 'function'
}

export function isObject(arg :any) :boolean {
    return !!arg && typeof arg === 'object'
}
export default {
    isFunction,
    isObject
}