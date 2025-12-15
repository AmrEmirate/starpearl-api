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
    console.log("💬 Adding comments to community posts...");
    // Get users
    const buyer = await prisma.user.findUnique({
        where: { email: "buyer@test.com" },
    });
    const seller = await prisma.user.findUnique({
        where: { email: "seller@test.com" },
    });
    if (!buyer || !seller)
        throw new Error("Users not found. Run seed-full.ts first.");
    const users = [buyer, seller];
    // Get all community posts
    const posts = await prisma.communityPost.findMany({
        where: { status: "APPROVED" },
    });
    if (posts.length === 0)
        throw new Error("No posts found. Run seed-community.ts first.");
    // Comment templates
    const comments = [
        "Keren banget! 😍",
        "Aku juga punya yang mirip nih!",
        "Where to buy? 🤔",
        "Love it! ❤️",
        "Bagus banget pilihan warnanya!",
        "Suka banget sama desainnya ✨",
        "Harganya berapa sis?",
        "Sudah lama cari yang kayak gini!",
        "Cocok buat daily wear 👍",
        "Pengen beli juga dong!",
        "Stylenya kece abis! 🔥",
        "Bisa cod gak?",
        "Good quality kah?",
        "Thanks for sharing! 🙏",
        "Inspirasiiii banget!",
        "Wah cantik bgt! Mau dong info tokonya",
        "Cocok dipake ke kondangan gak ya?",
        "Udah berapa lama punya? Awet gak?",
        "Matching sama outfit apa aja nih?",
        "Goals banget sih ini! 💫",
    ];
    let totalComments = 0;
    for (const post of posts) {
        // Add 2-4 random comments per post
        const numComments = Math.floor(Math.random() * 3) + 2; // 2-4 comments
        for (let i = 0; i < numComments; i++) {
            const user = users[i % 2]; // Alternate between buyer and seller
            const comment = comments[Math.floor(Math.random() * comments.length)];
            // Random date after post creation
            const daysAfter = Math.floor(Math.random() * 3) + 1;
            const createdAt = new Date(post.createdAt);
            createdAt.setDate(createdAt.getDate() + daysAfter);
            await prisma.communityComment.create({
                data: {
                    postId: post.id,
                    userId: user.id,
                    content: comment,
                    createdAt,
                },
            });
            totalComments++;
        }
    }
    console.log(`✅ Added ${totalComments} comments to ${posts.length} posts!`);
    console.log("   Each post now has 2-4 comments");
}
main()
    .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
