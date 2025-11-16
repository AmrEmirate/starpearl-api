import { Address } from "../generated/prisma";
import { AddressRepository } from "../repositories/address.repository";
import AppError from "../utils/AppError";
import logger from "../utils/logger";

// Tipe data input dari controller
type AddressInputData = Omit<Address, "id" | "createdAt" | "updatedAt" | "userId">;
type UpdateAddressInputData = Partial<AddressInputData>;

export class AddressService {
  private addressRepository: AddressRepository;

  constructor() {
    this.addressRepository = new AddressRepository();
  }

  public async createAddress(userId: string, data: AddressInputData): Promise<Address> {
    logger.info(`Creating new address for user: ${userId}`);
    const fullData = { ...data, userId };
    return this.addressRepository.createAddress(fullData);
  }

  public async getAddresses(userId: string): Promise<Address[]> {
    logger.info(`Fetching addresses for user: ${userId}`);
    return this.addressRepository.findAddressesByUserId(userId);
  }

  public async updateAddress(
    userId: string,
    addressId: string,
    data: UpdateAddressInputData
  ): Promise<Address> {
    logger.info(`Updating address ${addressId} for user: ${userId}`);
    
    // 1. Verifikasi kepemilikan
    const existingAddress = await this.addressRepository.findAddressById(addressId, userId);
    if (!existingAddress) {
      throw new AppError("Address not found or does not belong to user", 404);
    }

    // 2. Lakukan update
    return this.addressRepository.updateAddress(addressId, data, userId);
  }

  public async deleteAddress(userId: string, addressId: string): Promise<Address> {
    logger.info(`Deleting address ${addressId} for user: ${userId}`);

    // 1. Verifikasi kepemilikan
    const existingAddress = await this.addressRepository.findAddressById(addressId, userId);
    if (!existingAddress) {
      throw new AppError("Address not found or does not belong to user", 404);
    }

    // 2. Lakukan penghapusan
    return this.addressRepository.deleteAddress(addressId);
  }
}