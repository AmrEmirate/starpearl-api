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
    console.log("⭐ Creating product reviews...");
    // Get buyer (we'll use buyer as the reviewer)
    const buyer = await prisma.user.findUnique({
        where: { email: "buyer@test.com" },
    });
    if (!buyer)
        throw new Error("Buyer not found. Run seed-full.ts first.");
    // Get all products
    const products = await prisma.product.findMany();
    if (products.length === 0)
        throw new Error("No products found. Run seed-accessories.ts first.");
    // Review templates
    const positiveReviews = [
        {
            rating: 5,
            content: "Produknya bagus banget! Sesuai ekspektasi, pengiriman juga cepat 👍",
        },
        {
            rating: 5,
            content: "Kualitasnya premium, worth the price! Pasti repeat order lagi",
        },
        {
            rating: 5,
            content: "Warnanya cantik, bahannya berkualitas. Recommended seller!",
        },
        {
            rating: 4,
            content: "Bagus sih, cuma packagingnya bisa lebih rapi. Tapi overall puas!",
        },
        {
            rating: 5,
            content: "Udah beli berkali-kali di sini, gak pernah mengecewakan ⭐⭐⭐⭐⭐",
        },
        {
            rating: 4,
            content: "Desainnya elegan, cocok buat hadiah. Penerima pasti suka!",
        },
        {
            rating: 5,
            content: "Fast response seller, produk sesuai foto. Thank you!",
        },
        { rating: 5, content: "Keren banget! Banyak yang nanya beli dimana 😄" },
        {
            rating: 4,
            content: "Good quality, harga sesuai kualitas. Happy with my purchase!",
        },
        {
            rating: 5,
            content: "Ini ke-3 kalinya beli, selalu puas sama kualitasnya 💯",
        },
        {
            rating: 5,
            content: "Cantik banget! Lebih bagus dari di foto. Super love!",
        },
        {
            rating: 4,
            content: "Pengiriman agak lama tapi produknya oke. Worth the wait!",
        },
        {
            rating: 5,
            content: "Seller ramah, produk berkualitas. Pasti balik lagi!",
        },
        {
            rating: 5,
            content: "Pas banget sama yang aku cari! Thank you seller 🙏",
        },
        {
            rating: 4,
            content: "Bagus kok, cuma warnanya sedikit beda sama di foto. But still good!",
        },
        {
            rating: 5,
            content: "Packaging rapi, produk aman sampai tujuan. Top deh!",
        },
        {
            rating: 5,
            content: "Best purchase ever! Kualitasnya gak kalah sama brand mahal",
        },
        {
            rating: 4,
            content: "Nice product! Bisa jadi pilihan hadiah untuk orang tersayang",
        },
        {
            rating: 5,
            content: "Sudah beli beberapa item, semuanya memuaskan! Trusted seller",
        },
        {
            rating: 5,
            content: "Harga terjangkau tapi kualitas gak murahan. Recommended!",
        },
    ];
    const neutralReviews = [
        { rating: 3, content: "Lumayan lah untuk harganya. Sesuai ekspektasi" },
        {
            rating: 3,
            content: "Oke sih, tapi ada minor defect di bagian finishing",
        },
    ];
    let totalReviews = 0;
    for (const product of products) {
        // Generate 5-7 random reviews per product
        const numReviews = Math.floor(Math.random() * 3) + 5; // 5-7 reviews
        for (let i = 0; i < numReviews; i++) {
            // Mostly positive reviews (90%), some neutral (10%)
            const isPositive = Math.random() > 0.1;
            const reviewPool = isPositive ? positiveReviews : neutralReviews;
            const review = reviewPool[Math.floor(Math.random() * reviewPool.length)];
            // Random date within last 60 days
            const daysAgo = Math.floor(Math.random() * 60);
            const createdAt = new Date();
            createdAt.setDate(createdAt.getDate() - daysAgo);
            try {
                await prisma.review.create({
                    data: {
                        productId: product.id,
                        userId: buyer.id,
                        rating: review.rating,
                        content: review.content,
                        createdAt,
                    },
                });
                totalReviews++;
            }
            catch (e) {
                // Skip if duplicate (same user already reviewed this product)
            }
        }
        console.log(`✅ Reviews added for: ${product.name}`);
    }
    console.log(`\n🎉 Done! Created ${totalReviews} reviews for ${products.length} products`);
    console.log("   Each product has 5-7 reviews with ratings 3-5 ⭐");
}
main()
    .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
