import midtransClient from "midtrans-client";
import { Order } from "@prisma/client";
import AppError from "../utils/AppError";
import logger from "../utils/logger";
import crypto from "crypto";

export class PaymentService {
  private snap: any;
  private core: any;

  constructor() {
    const isProduction = process.env.NODE_ENV === "production";

    this.snap = new midtransClient.Snap({
      isProduction: false, // Always Sandbox for now as requested
      serverKey: process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-placeholder",
      clientKey: process.env.MIDTRANS_CLIENT_KEY || "SB-Mid-client-placeholder",
    });

    this.core = new midtransClient.CoreApi({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-placeholder",
      clientKey: process.env.MIDTRANS_CLIENT_KEY || "SB-Mid-client-placeholder",
    });
  }

  public async generateSnapToken(order: Order): Promise<string> {
    try {
      const parameter = {
        transaction_details: {
          order_id: order.id,
          gross_amount: Number(order.totalAmount),
        },
        customer_details: {
          first_name: "Customer", // In real app, fetch from User
          email: "customer@example.com", // In real app, fetch from User
        },
      };

      const transaction = await this.snap.createTransaction(parameter);
      logger.info(
        `Generated Snap Token for order ${order.id}: ${transaction.token}`
      );
      return transaction.token;
    } catch (error) {
      logger.error("Midtrans Snap Error:", error);
      throw new AppError("Failed to generate payment token", 500);
    }
  }

  public verifySignature(
    orderId: string,
    statusCode: string,
    grossAmount: string,
    signatureKey: string
  ): boolean {
    const serverKey =
      process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-placeholder";
    const input = orderId + statusCode + grossAmount + serverKey;
    const signature = crypto.createHash("sha512").update(input).digest("hex");

    return signature === signatureKey;
  }
}
