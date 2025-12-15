import { prisma } from "../config/prisma";
import { Product, Prisma } from "@prisma/client";
import logger from "../utils/logger";

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

  async findProducts(filters?: Prisma.ProductWhereInput): Promise<Product[]> {
    try {
      const where: Prisma.ProductWhereInput = {
        isActive: true,
        store: {
          status: "APPROVED",
        },
        ...filters, // Gabungkan dengan filter tambahan
      };

      return await prisma.product.findMany({
        where,
        include: {
          store: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
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
          store: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    } catch (error) {
      logger.error(`Error finding product by id: ${productId}`, error);
      throw new Error("Database query failed while finding product by id");
    }
  }
  async findProductsByStoreId(storeId: string): Promise<Product[]> {
    try {
      return await prisma.product.findMany({
        where: {
          storeId: storeId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } catch (error) {
      logger.error(`Error finding products for store: ${storeId}`, error);
      throw new Error("Database query failed while finding store products");
    }
  }
  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    try {
      return await prisma.product.update({
        where: { id },
        data,
      });
    } catch (error) {
      logger.error(`Error updating product: ${id}`, error);
      throw new Error("Database query failed while updating product");
    }
  }

  async deleteProduct(id: string): Promise<Product> {
    try {
      return await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });
    } catch (error) {
      logger.error(`Error deleting product: ${id}`, error);
      throw new Error("Database query failed while deleting product");
    }
  }
}
