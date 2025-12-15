"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: process.env.DIRECT_URL || process.env.DATABASE_URL,
        },
    },
});
async function main() {
    console.log("🛒 Creating 30 sample orders...");
    // Get buyer
    const buyer = await prisma.user.findUnique({
        where: { email: "buyer@test.com" },
    });
    if (!buyer)
        throw new Error("Buyer not found. Run seed-full.ts first.");
    // Get buyer's address
    const address = await prisma.address.findFirst({
        where: { userId: buyer.id },
    });
    if (!address)
        throw new Error("Address not found. Run seed-full.ts first.");
    // Get seller's store
    const seller = await prisma.user.findUnique({
        where: { email: "seller@test.com" },
    });
    if (!seller)
        throw new Error("Seller not found. Run seed-full.ts first.");
    const store = await prisma.store.findUnique({
        where: { userId: seller.id },
    });
    if (!store)
        throw new Error("Store not found. Run seed-full.ts first.");
    // Get products from store
    const products = await prisma.product.findMany({
        where: { storeId: store.id },
        take: 30,
    });
    if (products.length === 0)
        throw new Error("No products found. Run seed-accessories.ts first.");
    // Status distribution for 30 orders (matching OrderStatus enum)
    const statuses = [
        { status: "PENDING_PAYMENT", count: 5, paymentStatus: "PENDING" },
        { status: "PROCESSING", count: 8, paymentStatus: "PAID" },
        { status: "SHIPPED", count: 10, paymentStatus: "PAID" },
        { status: "DELIVERED", count: 7, paymentStatus: "PAID" },
    ];
    // Buyer names for variety (simulating different buyers)
    const buyerNames = [
        "Andi Pratama",
        "Budi Santoso",
        "Citra Dewi",
        "Dian Sari",
        "Eka Putri",
        "Fajar Nugroho",
        "Gita Maharani",
        "Hendra Wijaya",
        "Indah Lestari",
        "Joko Susilo",
        "Kartika Sari",
        "Lukman Hakim",
        "Maya Anggraini",
        "Nanda Permata",
        "Oscar Hidayat",
        "Putri Amelia",
        "Qori Rahmawati",
        "Rizky Maulana",
        "Sinta Dewi",
        "Tono Widodo",
        "Ulfa Mariana",
        "Vina Oktavia",
        "Wawan Setiawan",
        "Xena Yulia",
        "Yudi Hermawan",
        "Zahra Kusuma",
        "Ahmad Fauzi",
        "Bella Safira",
        "Chandra Wijaya",
        "Dewi Lestari",
    ];
    // Shipping tracking numbers for shipped orders
    const couriers = ["JNE", "J&T", "SiCepat", "AnterAja", "Ninja"];
    let orderIndex = 0;
    for (const { status, count, paymentStatus } of statuses) {
        for (let i = 0; i < count; i++) {
            // Random products (1-3 items per order)
            const numItems = Math.floor(Math.random() * 3) + 1;
            const orderProducts = [];
            for (let j = 0; j < numItems; j++) {
                const randomProduct = products[Math.floor(Math.random() * products.length)];
                if (!orderProducts.find((p) => p.id === randomProduct.id)) {
                    orderProducts.push(randomProduct);
                }
            }
            // Calculate totals
            let subtotal = 0;
            const orderItems = orderProducts.map((p) => {
                const qty = Math.floor(Math.random() * 3) + 1;
                const price = Number(p.price);
                subtotal += price * qty;
                return { productId: p.id, storeId: store.id, quantity: qty, price };
            });
            const shippingFee = subtotal > 200000 ? 0 : 25000;
            const serviceFee = subtotal < 50000 ? 0 : Math.ceil(subtotal / 100000) * 1000;
            const totalAmount = subtotal + shippingFee + serviceFee;
            // Generate tracking number for shipped orders
            let shippingResi = null;
            if (status === "SHIPPED" || status === "DELIVERED") {
                const courier = couriers[Math.floor(Math.random() * couriers.length)];
                const trackingNum = Math.random()
                    .toString(36)
                    .substring(2, 14)
                    .toUpperCase();
                shippingResi = `${courier}${trackingNum}`;
            }
            // Random date within last 30 days
            const daysAgo = Math.floor(Math.random() * 30);
            const createdAt = new Date();
            createdAt.setDate(createdAt.getDate() - daysAgo);
            // Create order
            await prisma.order.create({
                data: {
                    userId: buyer.id,
                    status: status,
                    subtotal,
                    shippingFee,
                    serviceFee,
                    totalAmount,
                    shippingAddressId: address.id,
                    shippingResi,
                    logisticsOption: "Standard",
                    paymentMethod: "Midtrans",
                    paymentStatus,
                    paidAt: paymentStatus === "PAID" ? createdAt : null,
                    createdAt,
                    items: {
                        create: orderItems,
                    },
                },
            });
            orderIndex++;
            console.log(`✅ Order ${orderIndex}/30 created - Status: ${status}`);
        }
    }
    // Summary
    console.log("\n🎉 Done! Created 30 sample orders:");
    console.log("   - 5 Pending Payment");
    console.log("   - 8 Processing");
    console.log("   - 10 Shipped (with tracking numbers)");
    console.log("   - 7 Delivered (completed)");
}
main()
    .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
