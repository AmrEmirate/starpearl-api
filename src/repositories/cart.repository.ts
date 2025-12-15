import { prisma } from "../config/prisma";
import { Cart, CartItem, Product } from "@prisma/client";
import logger from "../utils/logger";

type CartItemWithProduct = CartItem & {
  product: Product & {
    store: {
      name: string;
    };
    storeId: string;
  };
};

export type FullCart = Cart & {
  items: CartItemWithProduct[];
};

export class CartRepository {
  async findCartByUserId(userId: string): Promise<Cart | null> {
    try {
      return await prisma.cart.findUnique({
        where: {
          userId: userId,
        },
      });
    } catch (error) {
      logger.error(`Error finding cart for user: ${userId}`, error);
      throw new Error("Database query failed");
    }
  }

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

  async findCartItem(
    cartId: string,
    productId: string
  ): Promise<CartItem | null> {
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

  async addCartItem(
    cartId: string,
    productId: string,
    quantity: number
  ): Promise<CartItem> {
    try {
      return await prisma.cartItem.create({
        data: {
          cartId: cartId,
          productId: productId,
          quantity: quantity,
        },
      });
    } catch (error) {
      logger.error(`Error adding cart item (product: ${productId})`, error);
      throw new Error("Database query failed");
    }
  }

  async updateCartItemQuantity(
    cartItemId: string,
    newQuantity: number
  ): Promise<CartItem> {
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

  async getFullCart(cartId: string): Promise<FullCart | null> {
    try {
      return (await prisma.cart.findUnique({
        where: { id: cartId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  store: {
                    select: { name: true },
                  },
                },
              },
            },
          },
        },
      })) as FullCart | null;
    } catch (error) {
      logger.error(`Error getting full cart: ${cartId}`, error);
      throw new Error("Database query failed");
    }
  }

  async findCartItemByIdAndUserId(
    itemId: string,
    userId: string
  ): Promise<CartItem | null> {
    try {
      return await prisma.cartItem.findFirst({
        where: {
          id: itemId,
          cart: {
            userId: userId,
          },
        },
      });
    } catch (error) {
      logger.error(`Error finding cart item by id: ${itemId}`, error);
      throw new Error("Database query failed");
    }
  }

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
