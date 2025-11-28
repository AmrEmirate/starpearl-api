import { sign, SignOptions } from "jsonwebtoken";
import { User } from "../generated/prisma"; // Menggunakan Tipe User, bukan 'any'

export const createToken = (
  account: Partial<User>, // Tipe yang jelas
  expiresIn: string       // Tipe yang jelas (contoh: "24h")
) => {
  
  const secret = process.env.JWT_SECRET;

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
