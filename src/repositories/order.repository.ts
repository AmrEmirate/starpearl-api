import { prisma } from "../config/prisma";
import {
  Cart,
  CartItem,
  Order,
  Product,
  OrderStatus,
} from "../generated/prisma";
import logger from "../utils/logger";
import AppError from "../utils/AppError";

type CartItemWithProduct = CartItem & {
  product: Product;
};

export type FullCart = Cart & {
  items: CartItemWithProduct[];
};

export interface CreateOrderInput {
  userId: string;
  cart: FullCart;
  addressId: string;
  shippingCost: number;
  serviceFee: number;
  totalPrice: number;
  subtotal: number;
  logisticsOption: string;
  paymentMethod: string;
}

export class OrderRepository {
  async createOrderFromCart(input: CreateOrderInput): Promise<Order> {
    const {
      userId,
      cart,
      addressId,
      shippingCost,
      serviceFee,
      totalPrice,
      subtotal,
      logisticsOption,
      paymentMethod,
    } = input;

    try {
      const order = await prisma.$transaction(async (tx) => {
        logger.info(`Starting order transaction for user: ${userId}`);

        const productIds = cart.items.map((item) => item.productId);

        const productsInCart = await tx.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, stock: true, name: true },
        });

        const stockMap = new Map(productsInCart.map((p) => [p.id, p.stock]));
        const nameMap = new Map(productsInCart.map((p) => [p.id, p.name]));

        for (const item of cart.items) {
          const availableStock = stockMap.get(item.productId);
          if (availableStock === undefined || availableStock < item.quantity) {
            throw new AppError(
              `Not enough stock for product: ${nameMap.get(
                item.productId
              )}. Available: ${availableStock || 0}`,
              400
            );
          }
        }

        const newOrder = await tx.order.create({
          data: {
            userId: userId,
            shippingAddressId: addressId,
            totalAmount: totalPrice,
            subtotal: subtotal,
            shippingFee: shippingCost,
            serviceFee: serviceFee,
            logisticsOption: logisticsOption,
            paymentMethod: paymentMethod,
            paymentStatus: "PENDING",
            status: "PENDING_PAYMENT",
          },
        });

        const orderItemsData = cart.items.map((item) => ({
          orderId: newOrder.id,
          productId: item.productId,
          storeId: item.product.storeId,
          quantity: item.quantity,
          price: item.product.price,
        }));

        await tx.orderItem.createMany({
          data: orderItemsData,
        });

        for (const item of cart.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }

        await tx.cartItem.deleteMany({
          where: { cartId: cart.id },
        });

        logger.info(`Transaction successful. Order created: ${newOrder.id}`);
        return newOrder;
      });

      return order;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Order transaction failed for user: ${userId}`, error);
      throw new Error("Order creation failed due to an internal error");
    }
  }

  async findOrdersByUserId(userId: string): Promise<Order[]> {
    return prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findOrdersByStoreId(storeId: string): Promise<Order[]> {
    return prisma.order.findMany({
      where: {
        items: {
          some: {
            storeId: storeId,
          },
        },
      },
      include: {
        items: {
          where: {
            storeId: storeId,
          },
          include: {
            product: true,
          },
        },
        shippingAddress: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async updateOrderStatus(
    orderId: string,
    status: string,
    data?: any
  ): Promise<Order> {
    try {
      return await prisma.order.update({
        where: { id: orderId },
        data: {
          status: status as OrderStatus,
          ...data,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          user: {
            select: { name: true, email: true },
          },
          shippingAddress: true,
        },
      });
    } catch (error) {
      logger.error(`Error updating order status: ${orderId}`, error);
      throw new Error("Database query failed");
    }
  }
}
