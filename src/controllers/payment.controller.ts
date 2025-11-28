import { Request, Response, NextFunction } from "express";
import { PaymentService } from "../services/payment.service";
import { OrderService } from "../services/order.service";
import logger from "../utils/logger";

export class PaymentController {
  private paymentService: PaymentService;
  private orderService: OrderService;

  constructor() {
    this.paymentService = new PaymentService();
    this.orderService = new OrderService();
  }

  public handleWebhook = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {
        order_id,
        transaction_status,
        gross_amount,
        signature_key,
        fraud_status,
      } = req.body;

      logger.info(
        `Received webhook for order ${order_id}: ${transaction_status}`
      );

      // 1. Verify Signature
      const isValid = this.paymentService.verifySignature(
        order_id,
        req.body.status_code,
        gross_amount,
        signature_key
      );

      if (!isValid) {
        logger.warn(`Invalid signature for order ${order_id}`);
        res.status(400).json({ message: "Invalid signature" });
        return;
      }

      // 2. Map Midtrans Status to Order Status
      let newStatus = "PENDING";
      if (transaction_status === "capture") {
        if (fraud_status === "challenge") {
          newStatus = "PENDING"; // Challenge means manual review needed
        } else if (fraud_status === "accept") {
          newStatus = "PROCESSING"; // Paid and verified
        }
      } else if (transaction_status === "settlement") {
        newStatus = "PROCESSING"; // Paid
      } else if (
        transaction_status === "cancel" ||
        transaction_status === "deny" ||
        transaction_status === "expire"
      ) {
      res.status(200).json({ status: "OK" });
    } catch (error) {
      logger.error("Webhook Error:", error);
      next(error);
    }
  };
}
