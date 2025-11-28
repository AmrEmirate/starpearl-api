import { prisma } from "../config/prisma";
import { CartRepository } from "../repositories/cart.repository";
import { OrderRepository } from "../repositories/order.repository";
import AppError from "../utils/AppError";
import logger from "../utils/logger";
import { Order } from "../generated/prisma";

export class CheckoutService {
  private cartRepository: CartRepository;
  private orderRepository: OrderRepository;

  constructor() {
    this.cartRepository = new CartRepository();
    this.orderRepository = new OrderRepository();
  }

  public async processCheckout(
    userId: string,
    addressId: string
  ): Promise<Order> {
    logger.info(
      `Processing checkout for user: ${userId} with address: ${addressId}`
    );

    // 1. Validasi Alamat
    const address = await prisma.address.findUnique({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new AppError("Address not found or does not belong to user", 404);
    }

    // 2. Ambil Keranjang
    const cart = await this.cartRepository.findCartByUserId(userId);
    if (!cart) {
      throw new AppError("Cart not found", 404);
    }

    const fullCart = await this.cartRepository.getFullCart(cart.id);
    if (!fullCart || fullCart.items.length === 0) {
      throw new AppError("Cart is empty", 400);
    }

    // 3. Hitung Total dan Validasi Stok
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of fullCart.items) {
      // Validasi stok lagi untuk memastikan
      if (item.product.stock < item.quantity) {
        throw new AppError(
          `Not enough stock for product: ${item.product.name}`,
          400
        );
      }

      const itemTotal = Number(item.product.price) * item.quantity;
      totalAmount += itemTotal;

      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price, // Harga saat checkout
      });
    }

    // Tambahan biaya (opsional, sesuaikan dengan frontend)
    const serviceFee =
      totalAmount < 50000 ? 0 : Math.ceil(totalAmount / 100000) * 1000;
    const shippingCost = totalAmount > 200000 ? 0 : 25000;
    const finalTotal = totalAmount + serviceFee + shippingCost;

    // 4. Buat Order dalam Transaksi
    const order = await prisma.$transaction(async (tx) => {
      // a. Buat Order
      const newOrder = await tx.order.create({
        data: {
          userId,
          addressId,
          totalAmount: finalTotal,
          status: "PENDING",
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      // b. Kurangi Stok Produk
      for (const item of fullCart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // c. Kosongkan Keranjang (Hapus semua item)
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    logger.info(`Checkout successful. Order ID: ${order.id}`);
    return order;
  }
}
