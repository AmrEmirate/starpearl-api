import { Store, StoreStatus } from "../generated/prisma";
import { AdminRepository } from "../repositories/admin.repository";
import AppError from "../utils/AppError";
import logger from "../utils/logger";
import { prisma } from "../config/prisma"; // <-- PERBAIKAN: Tambahkan import ini

export class AdminService {
  private adminRepository: AdminRepository;

  constructor() {
    this.adminRepository = new AdminRepository();
  }

  public async getAllSellers() {
    logger.info("Admin fetching all sellers");
    const stores = await this.adminRepository.findAllStores();
    
    // Hapus passwordHash dari data user sebelum dikirim
    const sellers = stores.map(store => {
      // Pastikan store.user ada sebelum destructuring
      if (!store.user) {
        logger.warn(`Store ${store.id} is missing user data.`);
        return store;
      }
      const { passwordHash, ...userWithoutPassword } = store.user;
      return { ...store, user: userWithoutPassword };
    });

    return sellers;
  }

  public async updateSellerStatus(storeId: string, status: StoreStatus): Promise<Store> {
    logger.info(`Admin updating store ${storeId} to status ${status}`);
    
    // Sekarang 'prisma' sudah dikenali
    const store = await prisma.store.findUnique({ 
      where: { id: storeId },
      include: { user: true } // Sertakan user untuk kirim email (opsional)
    }); 
    
    if (!store) {
      throw new AppError("Store not found", 404);
    }

    const updatedStore = await this.adminRepository.updateStoreStatus(storeId, status);
    
    // Di sini kamu bisa menambahkan logika untuk mengirim email
    // notifikasi ke Seller bahwa tokonya sudah diapprove/direject.
    // (misal: await sendEmail(store.user.email, ...))

    return updatedStore;
  }
}