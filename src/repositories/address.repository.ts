import { prisma } from "../config/prisma";
import { Address } from "../generated/prisma";
import logger from "../utils/logger";

// Tipe data input untuk membuat alamat baru
type CreateAddressInput = Omit<Address, "id" | "createdAt" | "updatedAt">;

// Tipe data input untuk update alamat
type UpdateAddressInput = Partial<Omit<CreateAddressInput, "userId">>;

export class AddressRepository {
  /**
   * Menambahkan alamat baru untuk user.
   */
  async createAddress(data: CreateAddressInput): Promise<Address> {
    try {
      // Jika alamat ini diset sebagai default,
      // kita harus set 'isDefault = false' untuk semua alamat lain milik user ini.
      if (data.isDefault) {
        await prisma.address.updateMany({
          where: { userId: data.userId, isDefault: true },
          data: { isDefault: false },
        });
      }
      
      return await prisma.address.create({
        data,
      });
    } catch (error) {
      logger.error(`Error creating address for user: ${data.userId}`, error);
      throw new Error("Database query failed while creating address");
    }
  }

  /**
   * Mengambil semua alamat milik seorang user.
   */
  async findAddressesByUserId(userId: string): Promise<Address[]> {
    try {
      return await prisma.address.findMany({
        where: { userId: userId },
        orderBy: {
          isDefault: "desc", // Tampilkan yang default di paling atas
        },
      });
    } catch (error) {
      logger.error(`Error finding addresses for user: ${userId}`, error);
      throw new Error("Database query failed");
    }
  }

  /**
   * Menemukan alamat spesifik milik user.
   */
  async findAddressById(addressId: string, userId: string): Promise<Address | null> {
    try {
      return await prisma.address.findFirst({
        where: { id: addressId, userId: userId },
      });
    } catch (error) {
      logger.error(`Error finding address: ${addressId}`, error);
      throw new Error("Database query failed");
    }
  }

  /**
   * Memperbarui data alamat.
   */
  async updateAddress(addressId: string, data: UpdateAddressInput, userId: string): Promise<Address> {
    try {
      // Sama seperti create, tangani logika 'isDefault'
      if (data.isDefault) {
        await prisma.address.updateMany({
          where: { userId: userId, isDefault: true },
          data: { isDefault: false },
        });
      }
      
      return await prisma.address.update({
        where: { id: addressId },
        data,
      });
    } catch (error) {
      logger.error(`Error updating address: ${addressId}`, error);
      throw new Error("Database query failed");
    }
  }

  /**
   * Menghapus alamat.
   */
  async deleteAddress(addressId: string): Promise<Address> {
    try {
      return await prisma.address.delete({
        where: { id: addressId },
      });
    } catch (error) {
      logger.error(`Error deleting address: ${addressId}`, error);
      throw new Error("Database query failed");
    }
  }
}