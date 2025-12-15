"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressService = void 0;
const address_repository_1 = require("../repositories/address.repository");
const AppError_1 = __importDefault(require("../utils/AppError"));
const logger_1 = __importDefault(require("../utils/logger"));
class AddressService {
    addressRepository;
    constructor() {
        this.addressRepository = new address_repository_1.AddressRepository();
    }
    async createAddress(userId, data) {
        logger_1.default.info(`Creating new address for user: ${userId}`);
        const fullData = { ...data, userId };
        return this.addressRepository.createAddress(fullData);
    }
    async getAddresses(userId) {
        logger_1.default.info(`Fetching addresses for user: ${userId}`);
        return this.addressRepository.findAddressesByUserId(userId);
    }
    async updateAddress(userId, addressId, data) {
        logger_1.default.info(`Updating address ${addressId} for user: ${userId}`);
        const existingAddress = await this.addressRepository.findAddressById(addressId, userId);
        if (!existingAddress) {
            throw new AppError_1.default("Address not found or does not belong to user", 404);
        }
        return this.addressRepository.updateAddress(addressId, data, userId);
    }
    async deleteAddress(userId, addressId) {
        logger_1.default.info(`Deleting address ${addressId} for user: ${userId}`);
        const existingAddress = await this.addressRepository.findAddressById(addressId, userId);
        if (!existingAddress) {
            throw new AppError_1.default("Address not found or does not belong to user", 404);
        }
        return this.addressRepository.deleteAddress(addressId);
    }
}
exports.AddressService = AddressService;
