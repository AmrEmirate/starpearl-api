"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AppError {
    code;
    message;
    isSuccess;
    constructor(_message, _code) {
        this.message = _message;
        this.code = _code;
        this.isSuccess = false;
    }
}
exports.default = AppError;
