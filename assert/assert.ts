import { isFunction } from '../tools'
export default function assert(arg: any, message: string) : never | void {

    const result = isFunction(arg) ? arg.call(undefined) : arg

    if (!result) {
        throw new Error(message)
    }
}