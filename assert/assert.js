"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tools_1 = require("../tools");
function assert(arg, message) {
    var result = tools_1.isFunction(arg) ? arg.call(undefined) : arg;
    if (!result) {
        throw new Error(message);
    }
}
exports.default = assert;
