import { Order } from "../generated/prisma";
import { OrderRepository, FullCart } from "../repositories/order.repository";
import { CartRepository } from "../repositories/cart.repository"; // Kita perlu ini
import { prisma } from "../config/prisma"; // Kita perlu ini untuk cek alamat
import AppError from "../utils/AppError";
import logger from "../utils/logger";
import { Decimal } from "@prisma/client/runtime/library";

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

  public async createOrder(userId: string, data: OrderInputData): Promise<Order> {
    logger.info(`Processing createOrder for user: ${userId}`);

    // 1. Ambil Keranjang Penuh
    const userCart = await this.cartRepository.findCartByUserId(userId);
    if (!userCart) {
      throw new AppError("User cart not found", 404);
    }
    
    const fullCart = await this.cartRepository.getFullCart(userCart.id) as FullCart;
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
      return sum + (Number(item.product.price) * item.quantity);
    }, 0);

    // Hitung ulang biaya layanan berdasarkan blueprint [cite: 71-73]
    const calculatedServiceFee = calculatedSubtotal < 50000 
      ? 0 
      : Math.ceil(calculatedSubtotal / 100000) * 1000;
    
    // (Di aplikasi nyata, ongkir juga dihitung ulang)
    const calculatedShippingCost = data.shippingCost; 

    const calculatedTotalPrice = calculatedSubtotal + calculatedServiceFee + calculatedShippingCost;

    // Bandingkan total dari frontend dengan total backend
    if (Math.abs(calculatedTotalPrice - data.totalPrice) > 1) { // Toleransi 1 rupiah
      logger.warn(`Price mismatch for user ${userId}. FE: ${data.totalPrice}, BE: ${calculatedTotalPrice}`);
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

    return this.orderRepository.createOrderFromCart(orderInput);
  }

  // Fungsi service lain (getOrder, updateStatus) akan ditambahkan di sini
}