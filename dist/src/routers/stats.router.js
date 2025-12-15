"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stats_controller_1 = __importDefault(require("../controllers/stats.controller"));
class StatsRouter {
    route;
    controller;
    constructor() {
        this.route = (0, express_1.Router)();
        this.controller = new stats_controller_1.default();
        this.initializeRoute();
    }
    initializeRoute() {
        this.route.get("/", this.controller.getStats);
    }
    getRouter() {
        return this.route;
    }
}
exports.default = StatsRouter;
