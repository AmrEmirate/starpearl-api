import { Order } from "../generated/prisma";
import { OrderRepository, FullCart } from "../repositories/order.repository";
import { CartRepository } from "../repositories/cart.repository"; // Kita perlu ini
import { prisma } from "../config/prisma"; // Kita perlu ini untuk cek alamat
import AppError from "../utils/AppError";
import logger from "../utils/logger";
import { Decimal } from "@prisma/client/runtime/library";
import { PaymentService } from "./payment.service";

// Tipe data input dari controller
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

    // 1. Ambil Keranjang Penuh
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

    // 2. Validasi Alamat
    const address = await prisma.address.findFirst({
      where: { id: data.addressId, userId: userId },
    });
    if (!address) {
      throw new AppError("Address not found or does not belong to user", 404);
    }

    // 3. Validasi Ulang Harga (Sangat Penting untuk Keamanan)
    // Hitung ulang subtotal berdasarkan data di database
    const calculatedSubtotal = fullCart.items.reduce((sum, item) => {
      return sum + Number(item.product.price) * item.quantity;
    }, 0);

    // Hitung ulang biaya layanan berdasarkan blueprint [cite: 71-73]
    const calculatedServiceFee =
      calculatedSubtotal < 50000
        ? 0
        : Math.ceil(calculatedSubtotal / 100000) * 1000;

    // (Di aplikasi nyata, ongkir juga dihitung ulang)
    const calculatedShippingCost = data.shippingCost;

    const calculatedTotalPrice =
      calculatedSubtotal + calculatedServiceFee + calculatedShippingCost;

    // Bandingkan total dari frontend dengan total backend
    if (Math.abs(calculatedTotalPrice - data.totalPrice) > 1) {
      // Toleransi 1 rupiah
      logger.warn(
        `Price mismatch for user ${userId}. FE: ${data.totalPrice}, BE: ${calculatedTotalPrice}`
      );
      throw new AppError("Total price mismatch. Please try again.", 400);
    }

    // 4. Kirim data yang sudah divalidasi ke Repository
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

    // 5. Generate Snap Token
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

    // Pastikan order ini memang berisi produk dari toko ini
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

    // Validasi status transition (sederhana)
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

    // Update data
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
}
