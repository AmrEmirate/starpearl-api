import { sign, SignOptions } from "jsonwebtoken";
import { User } from "../generated/prisma"; // Menggunakan Tipe User, bukan 'any'

export const createToken = (
  account: Partial<User>, // Tipe yang jelas
  expiresIn: string       // Tipe yang jelas (contoh: "24h")
) => {
  
  // 1. Baca 'secret' dari file .env
  const secret = process.env.JWT_SECRET;

  // 2. Pastikan 'secret' ada
  if (!secret) {
    throw new Error(
      "JWT_SECRET is not defined in .env file. Please add it."
    );
  }

  return sign(
    {
      id: account.id,
      role: account.role,
    },
    secret,
    {
      expiresIn,
    } as SignOptions
  );
};