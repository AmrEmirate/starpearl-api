"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const createToken = (account, // Tipe yang jelas
expiresIn // Tipe yang jelas (contoh: "24h")
) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not defined in .env file. Please add it.");
    }
    return (0, jsonwebtoken_1.sign)({
        id: account.id,
        role: account.role,
    }, secret, {
        expiresIn,
    });
};
exports.createToken = createToken;
