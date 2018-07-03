/**
 * 根据Promise/A+规范，使用TypeScript 实现一个Promise
 * 规范地址：https://promisesaplus.com/
 * 翻译地址：http://www.ituring.com.cn/article/66566
 * */

/**
 * Promise表示一个异步操作的最终结果。可以理解为一个一次性的有限状态机。
 *
 * Promise有三种状态： pending(等待中)、fulfilled(已执行)、rejected(已拒绝)
 * 之所以说Promise是一个“一次性的”状态机，是因为Promise的状态只能从
 * pending -> fulfilled，
 * 或者从 pending -> rejected
 * 一旦Promise的状态发生改变后， 就不可再变
 *
 * Promise还有一个value, 保存的是Promise的最终结果。
 */

import tools from '../tools'
import assert from '../assert/assert'

// 记录Promise的三种状态
enum PromiseStatus { pending, fulfilled, rejected }

class Promise {
  // promise的状态与终值都是私有的， 只能通过 then 方法去获取
  private status: PromiseStatus = PromiseStatus.pending
  private value: any = undefined

  // 收集通过then或者catch方法添加的回调函数
  private onResolveCallbackQueue: Array<Function> = []
  private onRejectCallbackQueue: Array<Function> = []

  constructor(executor: Function) {
    // 必须用new关键字， 不能直接调用
    assert(this instanceof Promise, `MyPromise is a constructor and should be called width "new" keyword'`)

    // 参数必须为可执行的函数
    assert(tools.isFunction(executor),
      `Promise resolver ${executor} is not a function`)

    // 参数不能为MyPromise
    assert(executor !== Promise, 'executor can not equals MyPromise')

    // value表示promise的最终值
    let resolve: (value: any) => void = (value: any): void => {
      if (this.status === PromiseStatus.pending) {
        this.status = PromiseStatus.fulfilled
        this.value = value
        this.execCallbackQueue(this.onResolveCallbackQueue)
      }
    }


    // reason 表示promise被拒绝的原因
    let reject: (reason: any) => void = (reason: any): void => {
        if (this.status === PromiseStatus.pending) {
        this.status = PromiseStatus.rejected
        this.value = reason
        this.execCallbackQueue(this.onRejectCallbackQueue)
      }
    }

    try {
      // executor 是立即执行的同步任务
      executor.call(undefined, resolve, reject)
    } catch (exception) {
      // 在 executor 里面使用 throw 相当于调用 reject
      reject(exception)
    }
  }

  // 执行回调队列中的函数
  private execCallbackQueue(queue: Array<Function>): void {
    if (queue && queue.length) {
      // 异步执行队列中的函数
      setTimeout(() => {
        for (const callback of queue) {
          callback.call(undefined, this.value)
        }
      }, 4)
    }
  }

  /**
   * 一个Promise必须提供一个then方法用来访问当前的状态、终值和拒因
   * A+规范规定：
   *  1. then方法的两个参数（onResolve， onReject）都是可选的。 如果参数不是函数则忽略
   *  2. 只有当prmise的状态改变后才可以执行对应的方法。并且只能调用一次。
   *  3. onResolve和onReject必须作为函数调用（没有this值）。
   *  4. onResolve和onReject必须是异步执行的。且应该在 then 方法被调用的那一轮事件循环之后的新执行栈中执行。
   *     <del>【不限制使用 宏任务(macro-task)实现还是微任务(micro-task)实现】</del>
   *  5. then 方法必须返回一个Promise
   * @returns {MyPromise}
   */
  public then(onResolve?: Function, onReject?: Function): Promise {
    const then = new Promise((resolve: Function, reject: Function) => {
        if (this.status === PromiseStatus.pending) {
          // 将函数放入队列, 在Promise的状态改变后， 队列中的函数会异步执行
          this.onResolveCallbackQueue.push((onResolve && tools.isFunction(onResolve)) ? () => {
            try {
              //如果 onFulfilled 或者 onRejected 返回一个值 x ，则运行下面的 Promise 解决过程
              let x = onResolve.call(undefined, this.value)
              this.resolvePromise(then, x, resolve, reject)
            } catch (exception) {
              // 如果 onFulfilled 或者 onRejected 抛出一个异常 e ，则 promise2 必须拒绝执行，并返回拒因 e
              reject(exception)
            }
          } : () => {resolve(this.value)})

          this.onRejectCallbackQueue.push((onReject && tools.isFunction(onReject)) ? () => {
            try {
              let x = onReject.call(undefined, this.value)
              this.resolvePromise(then, x, resolve, reject)
            } catch (exception) {
              reject(exception)
            }
          }: () => {reject(this.value)})

        } else if (this.status === PromiseStatus.fulfilled) {
          if (onResolve && tools.isFunction(onResolve)) {
            // onResolve 必须是异步执行的
            setTimeout(() => {
              try {
                //如果 onFulfilled 或者 onRejected 返回一个值 x ，则运行下面的 Promise 解决过程
                let x = onResolve.call(undefined, this.value)
                this.resolvePromise(then, x, resolve, reject)
              } catch (exception) {
                // 如果 onFulfilled 或者 onRejected 抛出一个异常 e ，则 promise2 必须拒绝执行，并返回拒因 e
                reject(exception)
              }
            }, 4)
          } else {
            // 如果 onFulfilled 不是函数且 promise1 成功执行， promise2 必须成功执行并返回相同的值
            resolve(this.value)
          }
        } else if (this.status === PromiseStatus.rejected) {
          if (onReject && tools.isFunction(onReject)) {
            // onReject必须异步执行
            setTimeout(() => {
              try {
                let x = onReject.call(undefined, this.value)
                this.resolvePromise(then, x, resolve, reject)
              } catch (exception) {
                reject(exception)
              }
            }, 4)
          } else {
            // 如果 onRejected 不是函数且 promise1 拒绝执行， promise2 必须拒绝执行并返回相同的据因
            reject(this.value)
          }
        }
    })
    return then
  }

  // Promise 解决过程
  private resolvePromise(promise: Promise, x: any, resolve: Function, reject: Function): void {
    // x 与 promise 相等, 防止循环引用
    if (promise === x) {
      reject(new TypeError('Chaining cycle detected for promise'))
    }

    // 如果x为MyPromise, 那么就以x的状态来决定promise的状态
    if (x instanceof Promise) {
      x.then((value: any) => {
        resolve(value)
      },(reason: any) => {
        reject(reason)
      })
    }

    // 如果x是一个对象或者函数
    if (x != null && (tools.isObject(x) || tools.isFunction(x))) {
      try {
        // 把 x.then 赋值给 then
        let then = x.then
        // 调用标志
        let calledFlag = false;
        // 如果 then 是函数，将 x 作为函数的作用域 this 调用之
        if (tools.isFunction(then)) {
          try {
            // 传递两个回调函数作为参数，第一个参数叫做 resolvePromise ，第二个参数叫做 rejectPromise:
            then.call(x, /* resolvePromise*/ (y: any) => {
                // 成功和失败只能调用一个
                if (calledFlag) return
                calledFlag = true
                // 如果 resolvePromise 以值 y 为参数被调用，则运行 [[Resolve]](promise, y)
                this.resolvePromise(promise, y, resolve, reject)
              },
              function rejectPromise(r: any) {
                // 成功和失败只能调用一个
                if (calledFlag) return
                calledFlag = true
                // 如果 rejectPromise 以据因 r 为参数被调用，则以据因 r 拒绝 promise
                reject(r)
              })
          } catch (exception) {
              // 如果调用 then 方法抛出了异常 e：
              // 如果 resolvePromise 或 rejectPromise 已经被调用，则忽略之
              // 否则以 e 为据因拒绝 promise
              if (calledFlag) return
              calledFlag = true
              reject(exception)
          }
        } else {
          // 如果 then 不是函数，以 x 为参数执行 promise
          resolve(x)
        }
      } catch (exception) {
        // 如果取 x.then 的值时抛出错误 e ，则以 e 为据因拒绝 promise
        reject(exception)
      }
    } else {
      // 否则就用x充当promise的终值
      resolve(x)
    }
  }

  // then的一个语法糖
  public catch (onReject?: Function): Promise {
    return this.then(undefined, onReject)
  }
  // then的另一个语法糖， 总是返回原来的值
  // 且finally与状态无关
  public finally (callback?: Function): Promise {
    return this.then((value: any) => {
      callback && callback.call(undefined)
      return value
    }, (reason: any) => {
      callback && callback.call(undefined)
      throw reason
    })
  }

  // 返回一个resolve状态的promise
  static resolve (value: any): Promise {
    return new Promise((resolve: Function, reject: Function) => {
      resolve(value)
    })
  }
  // 返回一个reject状态的promise
  static reject (reason: any): Promise {
    return new Promise((resolve: Function, reject: Function) => {
      reject(reason)
    })
  }
  // 由率先改变状态的promise来决定此promise的状态
  static race (promises: Array<Promise>): Promise {
    return new Promise((resolve: Function, reject: Function) => {
      for (const promise of promises) {
        promise.then(resolve, reject)
      }
    })
  }
  // 所有promise成功， 此promise成功
  // 一个失败便失败
  static all (promises: Array<Promise>) {
    let resolvedPromiseCount = 0
    let resolvedPromiseValue: Array<any> = []
    return new Promise((resolve: Function, reject: Function) => {
      for (let index = 0; index < promises.length; index++) {
        let promise: Promise = promises[index]
        promise.then((value: any) => {
          resolvedPromiseCount += 1
          resolvedPromiseValue[index] = value
          if (resolvedPromiseCount === promises.length) {
            resolve(resolvedPromiseValue)
          }
        }, reject)
      }
    })
  }
}

export default Promise
