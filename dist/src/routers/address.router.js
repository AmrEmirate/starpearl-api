"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const address_controller_1 = __importDefault(require("../controllers/address.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const address_1 = require("../middleware/validation/address");
class AddressRouter {
    route;
    addressController;
    authMiddleware;
    constructor() {
        this.route = (0, express_1.Router)();
        this.addressController = new address_controller_1.default();
        this.authMiddleware = new auth_middleware_1.AuthMiddleware();
        this.initializeRoute();
    }
    initializeRoute() {
        this.route.use(this.authMiddleware.verifyToken);
        this.route.get("/", this.addressController.getAllAddresses);
        this.route.post("/", address_1.addressValidation, this.addressController.createAddress);
        this.route.patch("/:addressId", address_1.addressValidation, this.addressController.updateAddress);
        this.route.delete("/:addressId", this.addressController.deleteAddress);
    }
    getRouter() {
        return this.route;
    }
}
exports.default = AddressRouter;
