"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("../controllers/payment.controller");
class PaymentRouter {
    route;
    controller;
    constructor() {
        this.route = (0, express_1.Router)();
        this.controller = new payment_controller_1.PaymentController();
        this.initializeRoute();
    }
    initializeRoute() {
        this.route.post("/webhook", this.controller.handleWebhook);
    }
    getRouter() {
        return this.route;
    }
}
exports.default = PaymentRouter;
