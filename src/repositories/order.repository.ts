import { prisma } from "../config/prisma";
import { Cart, CartItem, Order, Product } from "../generated/prisma";
import logger from "../utils/logger";
import AppError from "../utils/AppError";

// Tipe data untuk item di keranjang yang sudah di-populate
type CartItemWithProduct = CartItem & {
  product: Product;
};

// Tipe data untuk keranjang penuh (hanya dari sisi repository)
export type FullCart = Cart & {
  items: CartItemWithProduct[];
};

// Tipe data input untuk service
export interface CreateOrderInput {
  userId: string;
  cart: FullCart;
  addressId: string;
  shippingCost: number;
  serviceFee: number;
  totalPrice: number;
  subtotal: number; // <-- PERBAIKAN: Menambahkan subtotal
  logisticsOption: string;
  paymentMethod: string;
}

export class OrderRepository {
  /**
   * Fungsi utama untuk membuat pesanan.
   * Ini menjalankan transaksi database yang kompleks.
   */
  async createOrderFromCart(input: CreateOrderInput): Promise<Order> {
    const {
      userId,
      cart,
      addressId,
      shippingCost,
      serviceFee,
      totalPrice,
      subtotal, // Ambil subtotal dari input
      logisticsOption,
      paymentMethod,
    } = input;

    try {
      const order = await prisma.$transaction(async (tx) => {
        logger.info(`Starting order transaction for user: ${userId}`);

        // 1. Kunci produk & Validasi Stok
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

        // 2. Buat record 'Order'
        const newOrder = await tx.order.create({
          data: {
            userId: userId,
            shippingAddressId: addressId, // <-- PERBAIKAN: Menggunakan 'shippingAddressId'
            totalAmount: totalPrice,
            subtotal: subtotal, // <-- PERBAIKAN: Menggunakan 'subtotal' dari input
            shippingFee: shippingCost,
            serviceFee: serviceFee,
            logisticsOption: logisticsOption,
            paymentMethod: paymentMethod,
            paymentStatus: "PENDING", // Sesuai schema
            status: "PENDING_PAYMENT", // Sesuai schema
          },
        });

        // 3. Pindahkan item dari 'CartItem' ke 'OrderItem'
        const orderItemsData = cart.items.map((item) => ({
          orderId: newOrder.id,
          productId: item.productId,
          storeId: item.product.storeId,
          quantity: item.quantity,
          price: item.product.price, // Simpan harga saat checkout
        }));

        await tx.orderItem.createMany({
          data: orderItemsData,
        });

        // 4. Update Stok Produk (Kurangi stok)
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

        // 5. PERBAIKAN: Hapus 'tx.payment.create(...)'
        //    (Karena 'payment' tidak ada sebagai model terpisah)

        // 6. Hapus 'CartItem' (Kosongkan keranjang)
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
    // Cari order yang memiliki item dari storeId ini
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
            storeId: storeId, // Hanya ambil item yang relevan dengan toko ini
          },
          include: {
            product: true,
          },
        },
        shippingAddress: true, // Sertakan alamat pengiriman
        user: {
          // Sertakan info pembeli
          select: {
            name: true,
            email: true,
          },
        },
      },
import { prisma } from "../config/prisma";
import { Cart, CartItem, Order, Product, OrderStatus } from "../generated/prisma";
import logger from "../utils/logger";
import AppError from "../utils/AppError";

// Tipe data untuk item di keranjang yang sudah di-populate
type CartItemWithProduct = CartItem & {
  product: Product;
};

// Tipe data untuk keranjang penuh (hanya dari sisi repository)
export type FullCart = Cart & {
  items: CartItemWithProduct[];
};

// Tipe data input untuk service
export interface CreateOrderInput {
  userId: string;
  cart: FullCart;
  addressId: string;
  shippingCost: number;
  serviceFee: number;
  totalPrice: number;
  subtotal: number; // <-- PERBAIKAN: Menambahkan subtotal
  logisticsOption: string;
  paymentMethod: string;
}

export class OrderRepository {
  /**
   * Fungsi utama untuk membuat pesanan.
   * Ini menjalankan transaksi database yang kompleks.
   */
  async createOrderFromCart(input: CreateOrderInput): Promise<Order> {
    const {
      userId,
      cart,
      addressId,
      shippingCost,
      serviceFee,
      totalPrice,
      subtotal, // Ambil subtotal dari input
      logisticsOption,
      paymentMethod,
    } = input;

    try {
      const order = await prisma.$transaction(async (tx) => {
        logger.info(`Starting order transaction for user: ${userId}`);

        // 1. Kunci produk & Validasi Stok
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

        // 2. Buat record 'Order'
        const newOrder = await tx.order.create({
          data: {
            userId: userId,
            shippingAddressId: addressId, // <-- PERBAIKAN: Menggunakan 'shippingAddressId'
            totalAmount: totalPrice,
            subtotal: subtotal, // <-- PERBAIKAN: Menggunakan 'subtotal' dari input
            shippingFee: shippingCost,
            serviceFee: serviceFee,
            logisticsOption: logisticsOption,
            paymentMethod: paymentMethod,
            paymentStatus: "PENDING", // Sesuai schema
            status: "PENDING_PAYMENT", // Sesuai schema
          },
        });

        // 3. Pindahkan item dari 'CartItem' ke 'OrderItem'
        const orderItemsData = cart.items.map((item) => ({
          orderId: newOrder.id,
          productId: item.productId,
          storeId: item.product.storeId,
          quantity: item.quantity,
          price: item.product.price, // Simpan harga saat checkout
        }));

        await tx.orderItem.createMany({
          data: orderItemsData,
        });

        // 4. Update Stok Produk (Kurangi stok)
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

        // 5. PERBAIKAN: Hapus 'tx.payment.create(...)'
        //    (Karena 'payment' tidak ada sebagai model terpisah)

        // 6. Hapus 'CartItem' (Kosongkan keranjang)
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
    // Cari order yang memiliki item dari storeId ini
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
            storeId: storeId, // Hanya ambil item yang relevan dengan toko ini
          },
          include: {
            product: true,
          },
        },
        shippingAddress: true, // Sertakan alamat pengiriman
        user: {
          // Sertakan info pembeli
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
