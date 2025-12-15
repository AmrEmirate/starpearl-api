"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: process.env.DIRECT_URL || process.env.DATABASE_URL,
        },
    },
});
async function main() {
    console.log("🌱 Starting seed...");
    // 1. Create Categories
    const categories = [
        { name: "Elektronik", slug: "elektronik" },
        { name: "Fashion", slug: "fashion" },
        { name: "Aksesoris", slug: "aksesoris" },
        { name: "Makanan", slug: "makanan" },
    ];
    for (const cat of categories) {
        await prisma.category.upsert({
            where: { name: cat.name },
            update: {},
            create: cat,
        });
    }
    console.log("✅ Categories seeded");
    // 2. Create Attributes
    const colorAttr = await prisma.attribute.upsert({
        where: { name: "Warna" },
        update: {},
        create: { name: "Warna" },
    });
    const sizeAttr = await prisma.attribute.upsert({
        where: { name: "Ukuran" },
        update: {},
        create: { name: "Ukuran" },
    });
    // Add attribute values
    const colors = ["Merah", "Biru", "Hitam", "Putih"];
    for (const color of colors) {
        await prisma.attributeValue.upsert({
            where: {
                attributeId_value: { attributeId: colorAttr.id, value: color },
            },
            update: {},
            create: { attributeId: colorAttr.id, value: color },
        });
    }
    const sizes = ["S", "M", "L", "XL"];
    for (const size of sizes) {
        await prisma.attributeValue.upsert({
            where: {
                attributeId_value: { attributeId: sizeAttr.id, value: size },
            },
            update: {},
            create: { attributeId: sizeAttr.id, value: size },
        });
    }
    console.log("✅ Attributes seeded");
    // 3. Create Admin (if not exists)
    const adminEmail = "admin@starpearl.com";
    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
    });
    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash("admin123", 10);
        await prisma.user.create({
            data: {
                email: adminEmail,
                passwordHash: hashedPassword,
                name: "Super Admin",
                role: "ADMIN",
            },
        });
        console.log("✅ Admin created: admin@starpearl.com / admin123");
    }
    else {
        console.log("ℹ️ Admin already exists");
    }
    // 4. Create Seller User
    const sellerEmail = "seller@test.com";
    let seller = await prisma.user.findUnique({
        where: { email: sellerEmail },
    });
    if (!seller) {
        const hashedPassword = await bcrypt.hash("test123", 10);
        seller = await prisma.user.create({
            data: {
                email: sellerEmail,
                passwordHash: hashedPassword,
                name: "Test Seller",
                role: "SELLER",
            },
        });
        console.log("✅ Seller created: seller@test.com / test123");
    }
    else {
        console.log("ℹ️ Seller already exists");
    }
    // 5. Create Store for Seller
    let store = await prisma.store.findUnique({
        where: { userId: seller.id },
    });
    if (!store) {
        store = await prisma.store.create({
            data: {
                userId: seller.id,
                name: "Toko Test",
                description: "Toko untuk testing",
                status: "APPROVED",
                idCardUrl: "https://example.com/ktp.jpg",
                businessLicenseUrl: "https://example.com/siup.jpg",
            },
        });
        console.log("✅ Store created and approved");
    }
    else {
        console.log("ℹ️ Store already exists");
    }
    // 6. Create Products
    const fashionCat = await prisma.category.findUnique({
        where: { name: "Fashion" },
    });
    if (fashionCat) {
        const products = [
            {
                name: "Kaos Polos Premium",
                description: "Kaos polos berkualitas tinggi dengan bahan cotton combed 30s",
                price: 89000,
                stock: 100,
                imageUrls: [
                    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
                ],
            },
            {
                name: "Celana Jeans Slim Fit",
                description: "Celana jeans dengan model slim fit, nyaman dipakai sehari-hari",
                price: 250000,
                stock: 50,
                imageUrls: [
                    "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500",
                ],
            },
            {
                name: "Hoodie Basic",
                description: "Hoodie dengan bahan fleece tebal, cocok untuk cuaca dingin",
                price: 175000,
                stock: 30,
                imageUrls: [
                    "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500",
                ],
            },
        ];
        for (const p of products) {
            const existingProduct = await prisma.product.findFirst({
                where: { name: p.name, storeId: store.id },
            });
            if (!existingProduct) {
                await prisma.product.create({
                    data: {
                        ...p,
                        storeId: store.id,
                        categoryId: fashionCat.id,
                        isActive: true,
                    },
                });
            }
        }
        console.log("✅ Products seeded");
    }
    // 7. Create Buyer User
    const buyerEmail = "buyer@test.com";
    let buyer = await prisma.user.findUnique({
        where: { email: buyerEmail },
    });
    if (!buyer) {
        const hashedPassword = await bcrypt.hash("test123", 10);
        buyer = await prisma.user.create({
            data: {
                email: buyerEmail,
                passwordHash: hashedPassword,
                name: "Test Buyer",
                role: "BUYER",
            },
        });
        // Create cart for buyer
        await prisma.cart.create({
            data: { userId: buyer.id },
        });
        // Create wishlist for buyer
        await prisma.wishlist.create({
            data: { userId: buyer.id },
        });
        // Create address for buyer
        await prisma.address.create({
            data: {
                userId: buyer.id,
                label: "Rumah",
                addressLine: "Jl. Test No. 123, Kelurahan Test",
                city: "Jakarta",
                state: "DKI Jakarta",
                zipCode: "12345",
                phone: "08123456789",
                isDefault: true,
            },
        });
        console.log("✅ Buyer created: buyer@test.com / test123");
    }
    else {
        console.log("ℹ️ Buyer already exists");
    }
    console.log("\n🎉 Seed completed successfully!");
    console.log("\n📋 Test Accounts:");
    console.log("   Admin: admin@starpearl.com / admin123");
    console.log("   Seller: seller@test.com / test123");
    console.log("   Buyer: buyer@test.com / test123");
}
main()
    .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
