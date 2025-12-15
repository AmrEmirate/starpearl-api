"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("../src/app"));
const supertest_1 = __importDefault(require("supertest"));
const prisma_1 = require("../src/config/prisma");
const hashPassword_1 = require("../src/utils/hashPassword");
const appTest = new app_1.default().app;
describe("Authentication", () => {
    let testSeller;
    let testBuyer;
    beforeAll(async () => {
        await prisma_1.prisma.$connect();
        const hashedPassword = await (0, hashPassword_1.hashPassword)("TestPassword123");
        testBuyer = await prisma_1.prisma.user.create({
            data: {
                email: "testbuyer@example.com",
                name: "Test Buyer",
                passwordHash: hashedPassword,
                role: "BUYER",
            },
        });
        testSeller = await prisma_1.prisma.user.create({
            data: {
                email: "testseller@example.com",
                name: "Test Seller",
                passwordHash: hashedPassword,
                role: "SELLER",
                sellerProfile: {
                    create: {
                        name: "Test Store",
                        status: "APPROVED",
                    },
                },
            },
        });
    });
    afterAll(async () => {
        await prisma_1.prisma.user.deleteMany({
            where: {
                email: {
                    in: [
                        "testbuyer@example.com",
                        "testseller@example.com",
                        "newbuyer@example.com",
                        "newseller@example.com",
                    ],
                },
            },
        });
        await prisma_1.prisma.$disconnect();
    });
    it("Should register a new buyer successfully", async () => {
        const response = await (0, supertest_1.default)(appTest)
            .post("/api/auth/register/buyer")
            .send({
            email: "newbuyer@example.com",
            name: "New Buyer",
            password: "NewPassword123",
        });
        expect(response.status).toBe(201);
        expect(response.body.success).toBeTruthy();
        expect(response.body.data.email).toBe("newbuyer@example.com");
        expect(response.body.data.role).toBe("BUYER");
    });
    it("Should register a new seller successfully", async () => {
        const response = await (0, supertest_1.default)(appTest)
            .post("/api/auth/register/seller")
            .send({
            email: "newseller@example.com",
            name: "New Seller",
            password: "NewPassword123",
            storeName: "New Store",
        });
        expect(response.status).toBe(201);
        expect(response.body.success).toBeTruthy();
        expect(response.body.data.email).toBe("newseller@example.com");
        expect(response.body.data.role).toBe("SELLER");
        const store = await prisma_1.prisma.store.findUnique({
            where: { name: "New Store" },
        });
        expect(store).not.toBeNull();
        expect(store?.status).toBe("PENDING");
    });
    it("Should fail to register with an existing email", async () => {
        const response = await (0, supertest_1.default)(appTest)
            .post("/api/auth/register/buyer")
            .send({
            email: "testbuyer@example.com",
            name: "Another Buyer",
            password: "AnotherPassword123",
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Email already exists");
    });
    it("Should login buyer successfully with correct data", async () => {
        const response = await (0, supertest_1.default)(appTest).post("/api/auth/login").send({
            email: "testbuyer@example.com",
            password: "TestPassword123",
        });
        expect(response.status).toBe(200);
        expect(response.body.success).toBeTruthy();
        expect(response.body.data.user.email).toBe("testbuyer@example.com");
        expect(response.body.data).toHaveProperty("token");
    });
    it("Should login seller successfully with correct data", async () => {
        const response = await (0, supertest_1.default)(appTest).post("/api/auth/login").send({
            email: "testseller@example.com",
            password: "TestPassword123",
        });
        expect(response.status).toBe(200);
        expect(response.body.success).toBeTruthy();
        expect(response.body.data.user.email).toBe("testseller@example.com");
        expect(response.body.data).toHaveProperty("token");
    });
    it("Should fail login with incorrect password", async () => {
        const response = await (0, supertest_1.default)(appTest).post("/api/auth/login").send({
            email: "testbuyer@example.com",
            password: "WrongPassword",
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Password is wrong");
    });
    it("Should fail login with non-existent email", async () => {
        const response = await (0, supertest_1.default)(appTest).post("/api/auth/login").send({
            email: "no-user@example.com",
            password: "TestPassword123",
        });
        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Account is not exist");
    });
});
