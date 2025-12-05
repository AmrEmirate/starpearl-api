import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log("📱 Creating 30 community posts...");

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

  // 30 community posts about accessories
  const posts = [
    {
      content:
        "Baru beli kalung mutiara ini! Cantik banget 😍✨ Cocok buat ke kantor atau acara formal",
      img: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500",
    },
    {
      content:
        "Koleksi gelang terbaru aku 💫 Semuanya dari Starpearl, kualitasnya bagus banget!",
      img: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=500",
    },
    {
      content:
        "Tips: Simpan perhiasan di tempat kering ya guys, biar gak cepat kusam 💎",
      img: null,
    },
    {
      content:
        "Anting-anting lucu buat daily look! Simpel tapi tetap elegan ✨",
      img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500",
    },
    {
      content: "Cincin couple matching sama pasangan 💕 So sweet banget kan?",
      img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500",
    },
    {
      content: "Bros kupu-kupu ini bikin blazer polos jadi lebih hidup! 🦋",
      img: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=500",
    },
    {
      content:
        "Jam tangan classic never goes wrong! Bisa dipake formal atau casual 🕐",
      img: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500",
    },
    {
      content:
        "Beach day vibes dengan anklet bohemian 🏖️ Siapa yang suka gaya ini?",
      img: "https://images.unsplash.com/photo-1609587312208-cea54be969e7?w=500",
    },
    {
      content: "Kacamata baru! UV protection 400 jadi aman buat mata 😎",
      img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500",
    },
    {
      content: "Bucket hat essential buat musim hujan sekarang ☔",
      img: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500",
    },
    {
      content: "Dompet kulit asli ini awet banget! Udah 2 tahun masih bagus 👛",
      img: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=500",
    },
    {
      content: "Mini bag favorit untuk bawa essentials keluar rumah 👜",
      img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500",
    },
    {
      content:
        "Ikat pinggang kulit bisa upgrade tampilan casual jadi lebih polished!",
      img: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=500",
    },
    {
      content:
        "Syal pashmina wajib punya buat yang sering di ruangan ber-AC 🧣",
      img: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=500",
    },
    {
      content: "Choker necklace bikin outfit simpel jadi lebih edgy ⚡",
      img: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500",
    },
    {
      content: "Friendship bracelet buat bestie tercinta! Yang mau samaan? 👯‍♀️",
      img: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=500",
    },
    {
      content:
        "Tassel earrings untuk look yang lebih dramatis di acara special ✨",
      img: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=500",
    },
    {
      content:
        "Statement ring yang jadi conversation starter setiap ketemu orang 💍",
      img: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=500",
    },
    {
      content:
        "Hairpin mutiara cantik buat acara wisuda nanti! Yang lagi nyari inspirasi? 🎓",
      img: "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=500",
    },
    {
      content: "Headband satin lagi trend banget! Nyaman dan elegant 👸",
      img: "https://images.unsplash.com/photo-1598560917505-59a3ad559071?w=500",
    },
    {
      content: "Smartwatch baru! Fitur fitness tracking-nya lengkap banget 💪",
      img: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500",
    },
    {
      content:
        "Review jujur: Kacamata baca retro ini nyaman banget dipake lama! 📖",
      img: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=500",
    },
    {
      content:
        "Travel pouch essential! Makeup jadi rapi gak berantakan di tas 💄",
      img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500",
    },
    {
      content: "Card holder minimalis buat yang gak suka bawa dompet tebal 💳",
      img: "https://images.unsplash.com/photo-1606503825008-909a67e63c3d?w=500",
    },
    {
      content: "Keychain kulit custom initial! Personal gift idea nih 🔑",
      img: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=500",
    },
    {
      content:
        "Payung auto open-close compact, muat di tas kecil! Essential banget ☂️",
      img: "https://images.unsplash.com/photo-1534309466160-70b22cc6252c?w=500",
    },
    {
      content: "Scrunchie silk set! Rambutnya jadi gak gampang patah 💇‍♀️",
      img: "https://images.unsplash.com/photo-1599557152556-fdee3d3a6d3f?w=500",
    },
    {
      content:
        "Bangle set gold finish ini aku layering 4 sekaligus! Makin kece 🌟",
      img: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=500",
    },
    {
      content: "Vintage brooch collection from my grandma! Timeless pieces 🕰️",
      img: "https://images.unsplash.com/photo-1600721391689-2564bb8055de?w=500",
    },
    {
      content:
        "Phone strap beads DIY style! Siapa yang juga lagi suka bikin gini? 📱",
      img: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500",
    },
  ];

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const user = users[i % 2]; // Alternate between buyer and seller

    // Random date within last 30 days
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);

    // Most posts are APPROVED (25), some PENDING (5)
    const status = i < 25 ? "APPROVED" : "PENDING";

    const createdPost = await prisma.communityPost.create({
      data: {
        userId: user.id,
        content: post.content,
        imageUrl: post.img,
        status: status as any,
        createdAt,
      },
    });

    // Add random likes (0-10) for approved posts
    if (status === "APPROVED") {
      const numLikes = Math.floor(Math.random() * 11);
      for (let j = 0; j < numLikes; j++) {
        const likeUser = users[j % 2];
        try {
          await prisma.communityPostLike.create({
            data: {
              postId: createdPost.id,
              userId: likeUser.id,
            },
          });
        } catch (e) {
          // Skip duplicate likes
        }
      }
    }

    console.log(`✅ Post ${i + 1}/30 created - Status: ${status}`);
  }

  console.log("\n🎉 Done! Created 30 community posts:");
  console.log("   - 25 Approved (visible)");
  console.log("   - 5 Pending (waiting moderation)");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
