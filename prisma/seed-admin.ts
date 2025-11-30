import { PrismaClient } from "../src/generated/prisma";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

async function main() {
  const email = "admin@starpearl.com";
  const password = "admin123";
  const name = "Super Admin";

  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log("Admin account already exists.");
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
      name,
      role: "ADMIN",
    },
  });

  console.log(`Admin account created: ${email} / ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
