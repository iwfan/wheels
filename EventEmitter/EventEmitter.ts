/**
 * 基于订阅发布模式的EventEmitter
 *
 */
import tools from '../tools'
import assert from '../assert/assert'

interface Listener {
    once: boolean
    func: () => void
}
interface Events {
    [propName: string] : Array<Listener>
}

export default class EventEmitter {
    /**
     * 创建一个plainObject用来存放所有的监听
     * @type {any}
     */
    private events: Events = Object.create(null)
    public constructor () {
    }

    /**
     * 获取全部的事件监听
     * @returns {Events}
     */
    private getEvents (): Events {
        return this.events
    }

    /**
     * 校验用户传入的监听函数
     * @param {Listener | Function} listener
     * @returns {void}
     */
    private validateListener (listener: Listener | Function) : never | void {
        if (tools.isObject(listener)) {
            this.validateListener((listener as Listener).func)
            return
        }
        assert(tools.isFunction(listener), 'listener must be a function!')
    }

    /**
     * 获取制定事件类型的监听
      * @param {string} type
     * @returns {Array<Listener>}
     */
    public getListeners (type: string): Array<Listener> {
        const events = this.getEvents()
        // 如果不存在监听，则将当前类型的监听初始化为空数组
        return events[type] || (events[type] = [])
    }


}

