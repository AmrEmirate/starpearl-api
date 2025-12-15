import { WishlistRepository } from "../repositories/wishlist.repository";
import { ProductRepository } from "../repositories/product.repository";
import { Wishlist, WishlistItem } from "@prisma/client";
import AppError from "../utils/AppError";
import logger from "../utils/logger";

export class WishlistService {
  private wishlistRepository: WishlistRepository;
  private productRepository: ProductRepository;

  constructor() {
    this.wishlistRepository = new WishlistRepository();
    this.productRepository = new ProductRepository();
  }

  private async getOrCreateWishlist(userId: string): Promise<Wishlist> {
    let wishlist = await this.wishlistRepository.getWishlistByUserId(userId);
    if (!wishlist) {
      wishlist = await this.wishlistRepository.createWishlist(userId);
    }
    return wishlist;
  }

  public async getMyWishlist(userId: string) {
    const wishlist = await this.getOrCreateWishlist(userId);
    return this.wishlistRepository.getWishlistByUserId(userId);
  }

  public async addToWishlist(
    userId: string,
    productId: string
  ): Promise<WishlistItem> {
    const product = await this.productRepository.findProductById(productId);
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const wishlist = await this.getOrCreateWishlist(userId);

    const existingItem = await this.wishlistRepository.findItem(
      wishlist.id,
      productId
    );
    if (existingItem) {
      throw new AppError("Product already in wishlist", 400);
    }

    return this.wishlistRepository.addItem(wishlist.id, productId);
  }

  public async removeFromWishlist(
    userId: string,
    productId: string
  ): Promise<void> {
    const wishlist = await this.getOrCreateWishlist(userId);
    await this.wishlistRepository.removeItem(wishlist.id, productId);
  }
}
