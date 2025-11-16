import { CartRepository } from "../repositories/cart.repository";
import { prisma } from "../config/prisma";
import AppError from "../utils/AppError";
import logger from "../utils/logger";
import { Cart, CartItem, Product } from "../generated/prisma";

// Tipe data untuk cart yang dikembalikan ke frontend
// (termasuk item produk yang sudah di-populate)
type FullCart = (Cart & {
  items: (CartItem & {
    product: Pick<Product, "id" | "name" | "imageUrls" | "stock" | "price"> & {
      store: { name: string };
    };
  })[];
}) | null;


export class CartService {
  private cartRepository: CartRepository;

  constructor() {
    this.cartRepository = new CartRepository();
  }

  /**
   * Logika untuk mendapatkan keranjang, atau membuatnya jika tidak ada.
   */
  private async getOrCreateCart(userId: string): Promise<Cart> {
    // Gunakan findCartByUserId (yang memanggil findUnique)
    let cart = await this.cartRepository.findCartByUserId(userId);
    if (!cart) {
      logger.info(`No active cart found for user ${userId}, creating new one.`);
      cart = await this.cartRepository.createCart(userId);
    }
    return cart;
  }

  /**
   * Logika untuk menambahkan produk ke keranjang.
   */
  public async addItemToCart(userId: string, productId: string, quantity: number) {
    logger.info(`Attempting to add ${quantity} of product ${productId} for user ${userId}`);

    // 1. Cek produk dan stoknya
    const product = await prisma.product.findUnique({
      where: { id: productId, isActive: true, store: { status: "APPROVED" } },
    });

    if (!product) {
      throw new AppError("Product not found, inactive, or store not approved", 404);
    }
    if (product.stock < quantity) {
      throw new AppError(`Not enough stock. Available: ${product.stock}`, 400);
    }

    // 2. Dapatkan keranjang user (atau buat baru)
    const cart = await this.getOrCreateCart(userId);

    // 3. Cek apakah item sudah ada di keranjang
    const existingItem = await this.cartRepository.findCartItem(cart.id, productId);

    let updatedItem: CartItem;
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) {
        throw new AppError(`Not enough stock. You have ${existingItem.quantity} in cart. Available: ${product.stock}`, 400);
      }
      logger.info(`Product ${productId} already in cart, updating quantity to ${newQuantity}`);
      updatedItem = await this.cartRepository.updateCartItemQuantity(existingItem.id, newQuantity);
    } else {
      logger.info(`Product ${productId} not in cart, creating new cart item.`);
      // Panggil 'addCartItem' tanpa 'price'
      updatedItem = await this.cartRepository.addCartItem(cart.id, productId, quantity);
    }

    return updatedItem;
  }

  /**
   * Logika untuk mengambil isi keranjang.
   */
  public async getCart(userId: string) {
    logger.info(`Fetching cart for user: ${userId}`);
    const cart = await this.cartRepository.findCartByUserId(userId);

    if (!cart) {
      return {
        id: null,
        userId: userId,
        items: [],
        total: 0,
      };
    }

    // Ambil data keranjang lengkap
    const fullCart = await this.cartRepository.getFullCart(cart.id) as FullCart; // Cast ke tipe baru

    // Hitung total harga dari product.price
    const total = fullCart?.items.reduce((sum, item) => {
      // Pastikan produk masih ada (meskipun seharusnya ada jika di keranjang)
      if (item.product) {
        return sum + (Number(item.product.price) * item.quantity); // Konversi Decimal ke number
      }
      return sum;
    }, 0) || 0;

    return { ...fullCart, total };
  }

  /**
   * Logika untuk memperbarui kuantitas item di keranjang.
   */
  public async updateItemQuantity(userId: string, itemId: string, newQuantity: number) {
    logger.info(`Attempting to update item ${itemId} to quantity ${newQuantity} for user ${userId}`);

    // 1. Validasi kuantitas
    if (newQuantity <= 0) {
      logger.info(`Quantity is ${newQuantity}, deleting item ${itemId}`);
      return this.deleteItem(userId, itemId); // Jika 0 atau kurang, hapus item
    }

    // 2. Verifikasi bahwa item itu ada dan milik user
    const item = await this.cartRepository.findCartItemByIdAndUserId(itemId, userId);
    if (!item) {
      throw new AppError("Cart item not found or does not belong to user", 404);
    }

    // 3. Cek stok produk
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
    });
    if (!product) {
      throw new AppError("Product associated with item not found", 404);
    }
    if (product.stock < newQuantity) {
      throw new AppError(`Not enough stock. Available: ${product.stock}`, 400);
    }

    // 4. Update kuantitas
    const updatedItem = await this.cartRepository.updateCartItemQuantity(itemId, newQuantity);
    return updatedItem;
  }

  /**
   * Logika untuk menghapus item dari keranjang.
   */
  public async deleteItem(userId: string, itemId: string) {
    logger.info(`Attempting to delete item ${itemId} for user ${userId}`);

    // 1. Verifikasi bahwa item itu ada dan milik user
    const item = await this.cartRepository.findCartItemByIdAndUserId(itemId, userId);
    if (!item) {
      throw new AppError("Cart item not found or does not belong to user", 404);
    }

    // 2. Hapus item
    const deletedItem = await this.cartRepository.deleteCartItem(itemId);
    return deletedItem;
  }
}