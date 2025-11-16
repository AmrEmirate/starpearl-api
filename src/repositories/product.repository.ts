import { prisma } from "../config/prisma";
import { Product } from "../generated/prisma";
import logger from "../utils/logger";

// Tipe data untuk input produk, tanpa id, createdAt, updatedAt
type CreateProductInput = Omit<Product, "id" | "createdAt" | "updatedAt">;

export class ProductRepository {
  async createProduct(data: CreateProductInput): Promise<Product> {
    try {
      return await prisma.product.create({
        data,
      });
    } catch (error) {
      logger.error(`Error creating product for store: ${data.storeId}`, error);
      throw new Error("Database query failed while creating product");
    }
  }

  async findProducts(): Promise<Product[]> {
    try {
      return await prisma.product.findMany({
        where: {
          isActive: true, // Hanya tampilkan produk yang aktif
          store: {
            status: "APPROVED", // Hanya dari toko yang sudah diapprove
          },
        },
        include: {
          store: { // Sertakan info toko
            select: {
              name: true,
            },
          },
        },
      });
    } catch (error) {
      logger.error("Error finding products", error);
      throw new Error("Database query failed while finding products");
    }
  }

  async findProductById(productId: string): Promise<Product | null> {
    try {
      return await prisma.product.findFirst({
        where: {
          id: productId,
          isActive: true,
          store: {
            status: "APPROVED",
          },
        },
        include: {
          store: { // Sertakan info toko
            select: {
              id: true,
              name: true,
            },
          },
          // Nanti kita bisa tambahkan 'reviews' di sini
        },
      });
    } catch (error) {
      logger.error(`Error finding product by id: ${productId}`, error);
      throw new Error("Database query failed while finding product by id");
    }
  }
}

  // Fungsi lain terkait produk (get, update, delete) akan ditambahkan di sini nanti


