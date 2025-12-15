"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("../src/app"));
const supertest_1 = __importDefault(require("supertest"));
const prisma_1 = require("../src/config/prisma");
const appTest = new app_1.default().app;
describe("Connection testing", () => {
    beforeEach(() => {
        // Menyiapkan program/function yang ingin dijalankan
        // sebelum tiap skenario testing dieksekusi
    });
    beforeAll(async () => {
        // Menyiapkan program yang ingin dijalankan sebelum semua skenario dijalankan
        await prisma_1.prisma.$connect();
    });
    afterEach(() => {
        // Menyiapkan program/function yang ingin dijalankan
        // setelah tiap skenario testing dieksekusi
    });
    afterAll(async () => {
        // Menyiapkan program yang ingin dijalankan setelah semua skenario dijalankan
        await prisma_1.prisma.$disconnect();
    });
    // Testing scenario
    //   GOOD CASE
    it("Should return message from main route", async () => {
        const response = await (0, supertest_1.default)(appTest).get("/");
        expect(response.status).toBe(200);
        expect(response.text).toEqual("<h1>Starpearl API</h1>");
    });
    //   BAD CASE
    it("Should return NOT FOUND PAGE", async () => {
        const response = await (0, supertest_1.default)(appTest).get("/transaction");
        expect(response.status).toBe(404);
    });
});
