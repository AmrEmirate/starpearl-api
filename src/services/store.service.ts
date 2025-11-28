import { Store } from "../generated/prisma";
import { StoreRepository } from "../repositories/store.repository";
import AppError from "../utils/AppError";
import logger from "../utils/logger";

export class StoreService {
  private storeRepository: StoreRepository;

  constructor() {
    this.storeRepository = new StoreRepository();
  }

  public async getMyStore(userId: string): Promise<Store> {
    logger.info(`Fetching store for user: ${userId}`);
    const store = await this.storeRepository.findStoreByUserId(userId);

    if (!store) {
      throw new AppError("Store not found for this user", 404);
    }

    return store;
  }

  public async updateMyStore(
    userId: string,
    data: Partial<Store>
  ): Promise<Store> {
    logger.info(`Updating store for user: ${userId}`);
    const store = await this.storeRepository.findStoreByUserId(userId);

    if (!store) {
      throw new AppError("Store not found for this user", 404);
    }

    const updateData = { ...data };
    delete (updateData as any).id;
    delete (updateData as any).userId;
    delete (updateData as any).status; // Status should be updated by admin only

    return this.storeRepository.updateStore(store.id, updateData);
  }

  public async submitVerification(
    userId: string,
    data: { idCardUrl: string; businessLicenseUrl: string }
  ): Promise<Store> {
    logger.info(`Submitting verification for user: ${userId}`);
    const store = await this.storeRepository.findStoreByUserId(userId);

    if (!store) {
      throw new AppError("Store not found for this user", 404);
    }

    return this.storeRepository.updateStore(store.id, {
      idCardUrl: data.idCardUrl,
      businessLicenseUrl: data.businessLicenseUrl,
      status: "PENDING", // Reset status to PENDING for review
    });
  }
}
