"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const address_service_1 = require("../services/address.service");
const logger_1 = __importDefault(require("../utils/logger"));
const AppError_1 = __importDefault(require("../utils/AppError"));
class AddressController {
    addressService;
    constructor() {
        this.addressService = new address_service_1.AddressService();
    }
    createAddress = async (req, res, next) => {
        try {
            if (!req.user) {
                throw new AppError_1.default("Authentication failed", 401);
            }
            const result = await this.addressService.createAddress(req.user.id, req.body);
            res.status(201).send({
                success: true,
                message: "Address created successfully",
                data: result,
            });
        }
        catch (error) {
            logger_1.default.error("Error in createAddress controller", error);
            next(error);
        }
    };
    getAllAddresses = async (req, res, next) => {
        try {
            if (!req.user) {
                throw new AppError_1.default("Authentication failed", 401);
            }
            const result = await this.addressService.getAddresses(req.user.id);
            res.status(200).send({
                success: true,
                data: result,
            });
        }
        catch (error) {
            logger_1.default.error("Error in getAllAddresses controller", error);
            next(error);
        }
    };
    updateAddress = async (req, res, next) => {
        try {
            if (!req.user) {
                throw new AppError_1.default("Authentication failed", 401);
            }
            const { addressId } = req.params;
            const result = await this.addressService.updateAddress(req.user.id, addressId, req.body);
            res.status(200).send({
                success: true,
                message: "Address updated successfully",
                data: result,
            });
        }
        catch (error) {
            logger_1.default.error("Error in updateAddress controller", error);
            next(error);
        }
    };
    deleteAddress = async (req, res, next) => {
        try {
            if (!req.user) {
                throw new AppError_1.default("Authentication failed", 401);
            }
            const { addressId } = req.params;
            const result = await this.addressService.deleteAddress(req.user.id, addressId);
            res.status(200).send({
                success: true,
                message: "Address deleted successfully",
                data: result,
            });
        }
        catch (error) {
            logger_1.default.error("Error in deleteAddress controller", error);
            next(error);
        }
    };
}
exports.default = AddressController;
