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
  [propName: string]: Array<Listener>
}

export default class EventEmitter {
  /**
   * 创建一个plainObject用来存放所有的监听
   * @type {any}
   */
  private events: Events = Object.create(null)

  public constructor() {
  }

  /**
   * 获取全部的事件监听
   * @returns {Events}
   */
  private getEvents(): Events {
    return this.events
  }

  /**
   * 校验用户传入的监听函数
   * @param {Listener | Function} listener
   * @returns {void}
   */
  private validateListener(listener: Listener | (() => void)): never | void {
    if (tools.isObject(listener)) {
      this.validateListener((listener as Listener).func)
      return
    }
    assert(tools.isFunction(listener), 'listener must be a function!')
  }

  /**
   * 获取监听函数的索引值
   * @param {Listener | (() => void)} listener
   * @returns {number}
   */
  private indexOfListener(listeners: Array<Listener>, listener: Listener | (() => void)): number {
    let isListener: boolean = tools.isObject(listener)
    for (let index = 0; index < listeners.length; index++) {
      let temp = listeners[index]
      if (temp.func === (isListener ? temp.func : listener)) {
        return index
      }
    }
    return -1
  }

  /**
   * 获取制定事件类型的监听
   * @param {string} type
   * @returns {Array<Listener>}
   */
  public getListeners(type: string): Array<Listener> {
    const events = this.getEvents()
    // 如果不存在监听，则将当前类型的监听初始化为空数组
    return events[type] || (events[type] = [])
  }

  /**
   * 添加监听
   * @param {string} type
   * @param {Listener | (() => void)} listener
   * @returns {EventEmitter}
   */
  public addEventListener(type: string, listener: Listener | (() => void)): EventEmitter {
    this.validateListener(listener)
    let listeners: Array<Listener> = this.getListeners(type)
    if (this.indexOfListener(listeners, listener) === -1) {
      this.getListeners(type).push(
        tools.isObject(listener) ?
          <Listener>listener :
          {once: false, func: listener as (() => void)}
      )
    }
    return this
  }

  /**
   * alias
   * @param {string} type
   * @param {() => void} listener
   * @returns {EventEmitter}
   */
  public on(type: string, listener: () => void): EventEmitter {
    return this.addEventListener(type, listener)
  }

  /**
   * 该事件只触发一次
   * @param {string} type
   * @param {() => void} listener
   * @returns {EventEmitter}
   */
  public once(type: string, listener: () => void): EventEmitter {
    return this.addEventListener(type, {once: true, func: listener})
  }

  /**
   * 派发事件
   * @param {string} type
   * @param args
   * @returns {EventEmitter}
   */
  public dispatchEvent(type: string, ...args: any[]): EventEmitter {
    let listeners: Array<Listener> = this.getListeners(type)
    for (const listener of listeners) {
      listener.func.apply(this, args)
      if (listener.once) {
        this.removeEventListener(type, listener)
      }
    }
    return this
  }

  public emit(type: string, ...args: any[]): EventEmitter {
    return this.dispatchEvent(type, ...args)
  }

  /**
   * 删除事件监听
   * @param {string} type
   * @param {Listener | (() => void)} listener
   * @returns {EventEmitter}
   */
  public removeEventListener(type: string, listener: Listener | undefined | (() => void)): EventEmitter {
    const events: Events = this.getEvents()
    if (!listener) {
      delete events[type]
      return this
    }
    let listeners: Array<Listener> = this.getListeners(type)
    let index = this.indexOfListener(listeners, listener)
    if (index !== -1) {
      listeners.splice(index, 1)
    }
    return this
  }

  public off(type: string, listener: undefined | (() => void)): EventEmitter {
    return this.removeEventListener(type, listener)
  }

}

