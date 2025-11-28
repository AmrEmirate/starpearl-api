import { prisma } from "../config/prisma";
import { Product } from "../generated/prisma";
import { ProductRepository } from "../repositories/product.repository";
import { StoreRepository } from "../repositories/store.repository";
import logger from "../utils/logger";
import AppError from "../utils/AppError";
import { Decimal } from "@prisma/client/runtime/library";
import { Prisma } from "../generated/prisma";

export class ProductService {
  private productRepository: ProductRepository;
  private storeRepository: StoreRepository;

  constructor() {
    this.productRepository = new ProductRepository();
    this.storeRepository = new StoreRepository();
  }

  public async createProduct(
    userId: string,
    data: {
      name: string;
      description: string;
      price: number;
      stock: number;
      category: string;
      imageUrls: string[];
    }
  ): Promise<Product> {
    logger.info(`Creating product for user: ${userId}`);

    // 1. Cek apakah user punya toko
    const store = await this.storeRepository.findStoreByUserId(userId);
    if (!store) {
      throw new AppError("User does not have a store", 400);
    }

    if (store.status !== "APPROVED") {
      throw new AppError("Store is not approved yet", 403);
    }

    // 2. Find or create category
    let categoryRecord = await prisma.category.findUnique({
      where: { name: data.category },
    });

    if (!categoryRecord) {
      // Create slug from name (simple version)
      const slug = data.category.toLowerCase().replace(/ /g, "-");
      categoryRecord = await prisma.category.create({
        data: {
          name: data.category,
          slug: slug,
        },
      });
    }

    // 3. Buat produk
    return this.productRepository.createProduct({
      name: data.name,
      description: data.description,
      stock: data.stock,
      imageUrls: data.imageUrls,
      storeId: store.id,
      isActive: true,
      price: new Decimal(data.price),
      categoryId: categoryRecord.id,
    });
  }

  public async getAllProducts(queryParams?: {
    q?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<Product[]> {
    const filters: Prisma.ProductWhereInput = {};

    if (queryParams) {
      // Filter by Name (Search)
      if (queryParams.q) {
        filters.name = {
          contains: queryParams.q,
          mode: "insensitive", // Case insensitive
        };
      }

      // Filter by Category
      if (queryParams.category) {
        filters.category = {
          name: {
            equals: queryParams.category,
            mode: "insensitive",
          },
        };
      }

      // Filter by Price Range
      if (
        queryParams.minPrice !== undefined ||
        queryParams.maxPrice !== undefined
      ) {
        filters.price = {};
        if (queryParams.minPrice !== undefined) {
          filters.price.gte = new Decimal(queryParams.minPrice);
        }
        if (queryParams.maxPrice !== undefined) {
          filters.price.lte = new Decimal(queryParams.maxPrice);
        }
      }
    }

    return this.productRepository.findProducts(filters);
  }

  public async getStoreProducts(userId: string): Promise<Product[]> {
    const store = await this.storeRepository.findStoreByUserId(userId);
    if (!store) {
      throw new AppError("Store not found", 404);
    }
    return this.productRepository.findProductsByStoreId(store.id);
  }

  public async getProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findProductById(id);
    if (!product) {
      throw new AppError("Product not found", 404);
    }
    return product;
  }

  public async updateProduct(
    userId: string,
    productId: string,
    data: Partial<Product>
  ): Promise<Product> {
    // 1. Cek kepemilikan
    const product = await this.productRepository.findProductById(productId);
    if (!product) throw new AppError("Product not found", 404);

    const store = await this.storeRepository.findStoreByUserId(userId);
    if (!store || store.id !== product.storeId) {
      throw new AppError("You do not own this product", 403);
    }

    // 2. Konversi harga jika ada
    const updateData: any = { ...data };
    if (data.price) {
      updateData.price = new Decimal(data.price);
    }

    return this.productRepository.updateProduct(productId, updateData);
  }

  public async deleteProduct(
    userId: string,
    productId: string
  ): Promise<Product> {
    // 1. Cek kepemilikan
    const product = await this.productRepository.findProductById(productId);
    if (!product) throw new AppError("Product not found", 404);

    const store = await this.storeRepository.findStoreByUserId(userId);
    if (!store || store.id !== product.storeId) {
      throw new AppError("You do not own this product", 403);
    }

    return this.productRepository.deleteProduct(productId);
  }
}
