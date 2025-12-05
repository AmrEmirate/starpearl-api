import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log("🗑️ Cleaning up related data...");

  // Delete related data first (foreign key constraints)
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.productAttributeAssignment.deleteMany({});

  console.log("🗑️ Deleting existing products...");
  await prisma.product.deleteMany({});
  console.log("✅ All products deleted");

  // Get or create Aksesoris category
  let aksesorisCategory = await prisma.category.findUnique({
    where: { name: "Aksesoris" },
  });
  if (!aksesorisCategory) {
    aksesorisCategory = await prisma.category.create({
      data: { name: "Aksesoris", slug: "aksesoris" },
    });
  }
  console.log("✅ Aksesoris category ready");

  // Get seller's store
  const seller = await prisma.user.findUnique({
    where: { email: "seller@test.com" },
  });
  if (!seller) {
    throw new Error("Seller not found. Run seed-full.ts first.");
  }

  const store = await prisma.store.findUnique({
    where: { userId: seller.id },
  });
  if (!store) {
    throw new Error("Store not found. Run seed-full.ts first.");
  }

  // 30 Accessory products
  const accessories = [
    {
      name: "Kalung Mutiara Elegant",
      price: 150000,
      desc: "Kalung mutiara asli dengan desain elegant, cocok untuk acara formal",
      img: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500",
    },
    {
      name: "Gelang Emas 18K",
      price: 450000,
      desc: "Gelang emas 18 karat dengan ukiran halus tradisional",
      img: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=500",
    },
    {
      name: "Anting Berlian Mini",
      price: 350000,
      desc: "Anting berlian kecil yang elegan untuk sehari-hari",
      img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500",
    },
    {
      name: "Cincin Perak Sterling",
      price: 125000,
      desc: "Cincin perak sterling 925 dengan desain minimalis modern",
      img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500",
    },
    {
      name: "Bros Kupu-kupu",
      price: 85000,
      desc: "Bros berbentuk kupu-kupu dengan kristal berkilau",
      img: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=500",
    },
    {
      name: "Jam Tangan Analog Classic",
      price: 550000,
      desc: "Jam tangan analog dengan strap kulit asli, gaya klasik",
      img: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500",
    },
    {
      name: "Kacamata Fashion UV400",
      price: 175000,
      desc: "Kacamata hitam fashionable dengan perlindungan UV400",
      img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500",
    },
    {
      name: "Topi Bucket Hat",
      price: 89000,
      desc: "Topi bucket hat trendy untuk gaya kasual",
      img: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500",
    },
    {
      name: "Dompet Kulit Premium",
      price: 285000,
      desc: "Dompet kulit sapi asli dengan banyak slot kartu",
      img: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=500",
    },
    {
      name: "Tas Selempang Mini",
      price: 195000,
      desc: "Tas selempang mini untuk menyimpan HP dan essentials",
      img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500",
    },
    {
      name: "Ikat Pinggang Kulit",
      price: 165000,
      desc: "Ikat pinggang kulit asli dengan buckle metal",
      img: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=500",
    },
    {
      name: "Syal Pashmina Premium",
      price: 135000,
      desc: "Syal pashmina lembut dengan berbagai pilihan warna",
      img: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=500",
    },
    {
      name: "Kalung Choker Velvet",
      price: 65000,
      desc: "Kalung choker velvet hitam dengan pendant bintang",
      img: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500",
    },
    {
      name: "Gelang Friendship Set",
      price: 55000,
      desc: "Set 2 gelang persahabatan dengan desain matching",
      img: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=500",
    },
    {
      name: "Anting Tassel Panjang",
      price: 78000,
      desc: "Anting tassel panjang untuk tampilan dramatis",
      img: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=500",
    },
    {
      name: "Cincin Statement Bold",
      price: 145000,
      desc: "Cincin statement besar dengan batu akik",
      img: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=500",
    },
    {
      name: "Hairpin Mutiara Set",
      price: 48000,
      desc: "Set 3 hairpin dengan hiasan mutiara",
      img: "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=500",
    },
    {
      name: "Headband Satin Elegant",
      price: 59000,
      desc: "Headband satin dengan simpul samping",
      img: "https://images.unsplash.com/photo-1598560917505-59a3ad559071?w=500",
    },
    {
      name: "Smartwatch Fitness",
      price: 650000,
      desc: "Smartwatch dengan fitur fitness tracking lengkap",
      img: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500",
    },
    {
      name: "Kacamata Baca Retro",
      price: 125000,
      desc: "Kacamata baca dengan frame retro bulat",
      img: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=500",
    },
    {
      name: "Pouch Makeup Travel",
      price: 95000,
      desc: "Pouch makeup dengan banyak kompartemen untuk travel",
      img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500",
    },
    {
      name: "Card Holder Minimalis",
      price: 85000,
      desc: "Card holder slim untuk kartu penting dan uang",
      img: "https://images.unsplash.com/photo-1606503825008-909a67e63c3d?w=500",
    },
    {
      name: "Keychain Leather Premium",
      price: 45000,
      desc: "Gantungan kunci kulit dengan initial custom",
      img: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=500",
    },
    {
      name: "Umbrella Auto Compact",
      price: 115000,
      desc: "Payung otomatis compact untuk hujan atau panas",
      img: "https://images.unsplash.com/photo-1534309466160-70b22cc6252c?w=500",
    },
    {
      name: "Scrunchy Silk Set",
      price: 65000,
      desc: "Set 5 scrunchy silk berbagai warna pastel",
      img: "https://images.unsplash.com/photo-1599557152556-fdee3d3a6d3f?w=500",
    },
    {
      name: "Gelang Bangle Set",
      price: 98000,
      desc: "Set 4 gelang bangle dengan finishing gold",
      img: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=500",
    },
    {
      name: "Anklet Bohemian",
      price: 55000,
      desc: "Gelang kaki bohemian dengan beads warna-warni",
      img: "https://images.unsplash.com/photo-1609587312208-cea54be969e7?w=500",
    },
    {
      name: "Brooch Vintage",
      price: 125000,
      desc: "Bros vintage dengan desain bunga antik",
      img: "https://images.unsplash.com/photo-1600721391689-2564bb8055de?w=500",
    },
    {
      name: "Phone Strap Beads",
      price: 35000,
      desc: "Tali HP dengan manik-manik warna-warni ceria",
      img: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500",
    },
    {
      name: "Hair Claw Tortoise",
      price: 49000,
      desc: "Jepit rambut claw dengan motif tortoise shell",
      img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500",
    },
  ];

  console.log("🌱 Creating 30 accessory products...");

  for (const acc of accessories) {
    await prisma.product.create({
      data: {
        name: acc.name,
        description: acc.desc,
        price: acc.price,
        stock: Math.floor(Math.random() * 50) + 10, // Random stock 10-60
        imageUrls: [acc.img],
        storeId: store.id,
        categoryId: aksesorisCategory.id,
        isActive: true,
      },
    });
  }

  console.log("✅ 30 accessory products created!");
  console.log("\n🎉 Done! All products are now accessories.");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
