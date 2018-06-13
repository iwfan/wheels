"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 基于订阅发布模式的EventEmitter
 *
 */
var tools_1 = require("../tools");
var assert_1 = require("../assert/assert");
var EventEmitter = /** @class */ (function () {
    function EventEmitter() {
        /**
         * 创建一个plainObject用来存放所有的监听
         * @type {any}
         */
        this.events = Object.create(null);
    }
    /**
     * 获取全部的事件监听
     * @returns {Events}
     */
    EventEmitter.prototype.getEvents = function () {
        return this.events;
    };
    /**
     * 校验用户传入的监听函数
     * @param {Listener | Function} listener
     * @returns {void}
     */
    EventEmitter.prototype.validateListener = function (listener) {
        if (tools_1.default.isObject(listener)) {
            this.validateListener(listener.func);
            return;
        }
        assert_1.default(tools_1.default.isFunction(listener), 'listener must be a function!');
    };
    /**
     * 获取制定事件类型的监听
      * @param {string} type
     * @returns {Array<Listener>}
     */
    EventEmitter.prototype.getListeners = function (type) {
        var events = this.getEvents();
        // 如果不存在监听，则将当前类型的监听初始化为空数组
        return events[type] || (events[type] = []);
    };
    return EventEmitter;
}());
