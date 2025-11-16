import { Decimal } from "@prisma/client/runtime/library";
import { Product } from "../generated/prisma";
import { ProductRepository } from "../repositories/product.repository";
import AppError from "../utils/AppError";
import logger from "../utils/logger";
import { prisma } from "../config/prisma"; // Import prisma untuk cek store

// Tipe data input dari controller
type ProductInputData = {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  imageUrls?: string[];
};

export class ProductService {
  private productRepository: ProductRepository;

  constructor() {
    this.productRepository = new ProductRepository();
  }

  public async addProduct(userId: string, data: ProductInputData): Promise<Product> {
    logger.info(`Adding product '${data.name}' for user: ${userId}`);

    // 1. Dapatkan storeId berdasarkan userId
    const store = await prisma.store.findUnique({
      where: { userId: userId },
      select: { id: true, status: true }, // Hanya ambil id dan status
    });

    if (!store) {
      throw new AppError("Seller store not found for this user", 404);
    }
    
    // Pastikan toko sudah diapprove
    if (store.status !== "APPROVED") {
        throw new AppError("Your store is not approved to add products", 403);
    }

    // 2. Siapkan data produk untuk repository
    const productData = {
      ...data,
      storeId: store.id,
      price: new Decimal(data.price), // Konversi ke Decimal
      stock: data.stock,
      imageUrls: data.imageUrls || [], // Default ke array kosong jika tidak ada
      isActive: true, // Produk baru otomatis aktif
    };

    // 3. Panggil repository untuk membuat produk
    const newProduct = await this.productRepository.createProduct(productData);

    logger.info(`Product '${newProduct.name}' (ID: ${newProduct.id}) created successfully for store: ${store.id}`);
    return newProduct;
  }

  public async getProducts() {
    logger.info("Fetching all active products");
    const products = await this.productRepository.findProducts();
    return products;
  }

  public async getProductById(productId: string) {
    logger.info(`Fetching product details for: ${productId}`);
    const product = await this.productRepository.findProductById(productId);

    if (!product) {
      throw new AppError("Product not found or is inactive", 404);
    }
    
    return product;
  }
}

  // Fungsi service lain (getProduct, updateProduct, deleteProduct) akan ditambahkan di sini