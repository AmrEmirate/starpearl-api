"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const hashPassword_1 = require("../src/utils/hashPassword");
jest.mock("bcrypt");
describe("Test hashing", () => {
    it("Should return fake hash", async () => {
        bcrypt_1.default.hash.mockReturnValue("fake-hash");
        const newPassword = await (0, hashPassword_1.hashPassword)("1234");
        expect(newPassword).toBe("fake-hash");
    });
});
