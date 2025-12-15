import { Order } from "@prisma/client";
import { OrderRepository, FullCart } from "../repositories/order.repository";
import { CartRepository } from "../repositories/cart.repository"; // Kita perlu ini
import { prisma } from "../config/prisma"; // Kita perlu ini untuk cek alamat
import AppError from "../utils/AppError";
import logger from "../utils/logger";
import { Decimal } from "@prisma/client/runtime/library";
import { PaymentService } from "./payment.service";

interface OrderInputData {
  addressId: string;
  logisticsOption: string;
  paymentMethod: string;
  shippingCost: number;
  serviceFee: number;
  totalPrice: number;
}

export class OrderService {
  private orderRepository: OrderRepository;
  private cartRepository: CartRepository;

  constructor() {
    this.orderRepository = new OrderRepository();
    this.cartRepository = new CartRepository(); // Inisialisasi repo keranjang
  }

  public async createOrder(userId: string, data: OrderInputData): Promise<any> {
    logger.info(`Processing createOrder for user: ${userId}`);

    const userCart = await this.cartRepository.findCartByUserId(userId);
    if (!userCart) {
      throw new AppError("User cart not found", 404);
    }

    const fullCart = (await this.cartRepository.getFullCart(
      userCart.id
    )) as FullCart;
    if (!fullCart || fullCart.items.length === 0) {
      throw new AppError("Cannot create order from an empty cart", 400);
    }

    const address = await prisma.address.findFirst({
      where: { id: data.addressId, userId: userId },
    });
    if (!address) {
      throw new AppError("Address not found or does not belong to user", 404);
    }

    const calculatedSubtotal = fullCart.items.reduce((sum, item) => {
      return sum + Number(item.product.price) * item.quantity;
    }, 0);

    const calculatedServiceFee =
      calculatedSubtotal < 50000
        ? 0
        : Math.ceil(calculatedSubtotal / 100000) * 1000;

    const calculatedShippingCost = data.shippingCost;

    const calculatedTotalPrice =
      calculatedSubtotal + calculatedServiceFee + calculatedShippingCost;

    if (Math.abs(calculatedTotalPrice - data.totalPrice) > 1) {
      logger.warn(
        `Price mismatch for user ${userId}. FE: ${data.totalPrice}, BE: ${calculatedTotalPrice}`
      );
      throw new AppError("Total price mismatch. Please try again.", 400);
    }

    const orderInput = {
      userId,
      cart: fullCart,
      addressId: data.addressId,
      shippingCost: calculatedShippingCost,
      serviceFee: calculatedServiceFee,
      totalPrice: calculatedTotalPrice,
      subtotal: calculatedSubtotal, // Kirim subtotal hasil hitungan
      logisticsOption: data.logisticsOption,
      paymentMethod: data.paymentMethod,
    };

    const order = await this.orderRepository.createOrderFromCart(orderInput);

    const paymentService = new PaymentService();
    const snapToken = await paymentService.generateSnapToken(order);

    return { ...order, snapToken };
  }

  public async getMyOrders(userId: string): Promise<Order[]> {
    return this.orderRepository.findOrdersByUserId(userId);
  }
  public async getStoreOrders(userId: string): Promise<Order[]> {
    logger.info(`Fetching store orders for user: ${userId}`);

    const store = await prisma.store.findUnique({
      where: { userId: userId },
      select: { id: true },
    });

    if (!store) {
      throw new AppError("Store not found for this user", 404);
    }

    return this.orderRepository.findOrdersByStoreId(store.id);
  }

  public async updateOrderStatus(
    userId: string,
    orderId: string,
    status: string,
    shippingResi?: string
  ): Promise<Order> {
    logger.info(
      `Updating order status ${orderId} to ${status} by user ${userId}`
    );

    const store = await prisma.store.findUnique({
      where: { userId: userId },
      select: { id: true },
    });

    if (!store) {
      throw new AppError("Store not found for this user", 404);
    }

    const orderItem = await prisma.orderItem.findFirst({
      where: {
        orderId: orderId,
        storeId: store.id,
      },
    });

    if (!orderItem) {
      throw new AppError(
        "Order not found or does not belong to your store",
        404
      );
    }

    const validStatuses = [
      "PENDING",
      "PROCESSED",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];
    if (!validStatuses.includes(status)) {
      throw new AppError("Invalid order status", 400);
    }

    const updateData: any = { status };
    if (status === "SHIPPED" && shippingResi) {
      updateData.shippingResi = shippingResi;
    }

    return this.orderRepository.updateOrderStatus(orderId, status, updateData);
  }

  public async updateOrderStatusSystem(
    orderId: string,
    status: string
  ): Promise<Order> {
    logger.info(`System updating order status ${orderId} to ${status}`);
    return this.orderRepository.updateOrderStatus(orderId, status);
  }

  public async confirmOrderReceived(
    userId: string,
    orderId: string
  ): Promise<Order> {
    logger.info(`Buyer ${userId} confirming order ${orderId} as received`);

    // Verify the order belongs to this buyer
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: userId },
      include: {
        items: {
          include: {
            product: {
              select: { storeId: true },
            },
          },
        },
      },
    });

    if (!order) {
      throw new AppError("Order not found or does not belong to you", 404);
    }

    // Check if order is in SHIPPED status
    if (order.status !== "SHIPPED") {
      throw new AppError(
        "Order can only be confirmed when status is SHIPPED",
        400
      );
    }

    // Get unique store IDs from order items
    const storeIds = [...new Set(order.items.map((item) => item.storeId))];

    // Calculate amount per store (subtotal only, excluding fees)
    const storeAmounts = new Map<string, number>();
    for (const item of order.items) {
      const current = storeAmounts.get(item.storeId) || 0;
      storeAmounts.set(
        item.storeId,
        current + Number(item.price) * item.quantity
      );
    }

    // Update order status and transfer funds to sellers in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update order status to DELIVERED
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: "DELIVERED" },
      });

      // Transfer funds to each store's balance
      for (const [storeId, amount] of storeAmounts) {
        await tx.store.update({
          where: { id: storeId },
          data: {
            balance: {
              increment: amount,
            },
          },
        });
        logger.info(`Transferred ${amount} to store ${storeId}`);
      }

      return updatedOrder;
    });

    logger.info(`Order ${orderId} confirmed as received, funds transferred`);
    return result;
  }
}
