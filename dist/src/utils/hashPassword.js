"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = void 0;
const bcrypt_1 = require("bcrypt");
const hashPassword = async (password) => {
    const salt = await (0, bcrypt_1.genSalt)(10);
    return await (0, bcrypt_1.hash)(password, salt);
};
exports.hashPassword = hashPassword;
