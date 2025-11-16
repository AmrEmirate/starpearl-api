import { prisma } from "../config/prisma";
import { Cart, CartItem } from "../generated/prisma";
import logger from "../utils/logger";

export class CartRepository {
  /**
   * Menemukan keranjang unik milik user.
   */
  async findCartByUserId(userId: string): Promise<Cart | null> {
    try {
      return await prisma.cart.findUnique({ // Diubah ke findUnique
        where: {
          userId: userId,
          // 'isCheckedOut' dihapus karena tidak ada di schema.prisma
        },
      });
    } catch (error) {
      logger.error(`Error finding cart for user: ${userId}`, error);
      throw new Error("Database query failed");
    }
  }

  /**
   * Membuat keranjang baru untuk user.
   */
  async createCart(userId: string): Promise<Cart> {
    try {
      return await prisma.cart.create({
        data: {
          userId: userId,
        },
      });
    } catch (error) {
      logger.error(`Error creating cart for user: ${userId}`, error);
      throw new Error("Database query failed");
    }
  }

  /**
   * Menemukan item spesifik di dalam keranjang.
   */
  async findCartItem(cartId: string, productId: string): Promise<CartItem | null> {
    try {
      return await prisma.cartItem.findFirst({
        where: {
          cartId: cartId,
          productId: productId,
        },
      });
    } catch (error) {
      logger.error(`Error finding cart item (product: ${productId})`, error);
      throw new Error("Database query failed");
    }
  }

  /**
   * Menambahkan item baru ke keranjang.
   */
  async addCartItem(cartId: string, productId: string, quantity: number): Promise<CartItem> {
    try {
      return await prisma.cartItem.create({
        data: {
          cartId: cartId,
          productId: productId,
          quantity: quantity,
          // 'price' dihapus karena tidak ada di schema.prisma
        },
      });
    } catch (error) {
      logger.error(`Error adding cart item (product: ${productId})`, error);
      throw new Error("Database query failed");
    }
  }

  /**
   * Memperbarui kuantitas item di keranjang.
   */
  async updateCartItemQuantity(cartItemId: string, newQuantity: number): Promise<CartItem> {
    try {
      return await prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity: newQuantity },
      });
    } catch (error) {
      logger.error(`Error updating cart item: ${cartItemId}`, error);
      throw new Error("Database query failed");
    }
  }

  /**
   * Mengambil semua data keranjang, termasuk item dan info produknya.
   */
  async getFullCart(cartId: string): Promise<Cart | null> {
    try {
      return await prisma.cart.findUnique({
        where: { id: cartId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  imageUrls: true,
                  stock: true,
                  price: true, // 'price' ditambahkan di sini
                  store: {
                    select: { name: true }
                  }
                }
              }
            }
          }
        }
      });
    } catch (error) {
        logger.error(`Error getting full cart: ${cartId}`, error);
        throw new Error("Database query failed");
    }
  }

  async findCartItemByIdAndUserId(itemId: string, userId: string): Promise<CartItem | null> {
    try {
      return await prisma.cartItem.findFirst({
        where: {
          id: itemId,
          cart: { // Cek relasi ke Cart
            userId: userId, // Pastikan Cart milik user yang benar
          },
        },
      });
    } catch (error) {
      logger.error(`Error finding cart item by id: ${itemId}`, error);
      throw new Error("Database query failed");
    }
  }

  /**
   * Menghapus item dari keranjang.
   */
  async deleteCartItem(itemId: string): Promise<CartItem> {
    try {
      return await prisma.cartItem.delete({
        where: { id: itemId },
      });
    } catch (error) {
      logger.error(`Error deleting cart item: ${itemId}`, error);
      throw new Error("Database query failed");
    }
  }
}