import { Request, Response, NextFunction } from "express";
import { PaymentService } from "../services/payment.service";
import { OrderRepository } from "../repositories/order.repository";
import { OrderStatus } from "../generated/prisma";
import logger from "../utils/logger";

export class PaymentController {
  private paymentService: PaymentService;
  private orderRepository: OrderRepository;

  constructor() {
    this.paymentService = new PaymentService();
    this.orderRepository = new OrderRepository();
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

      let newStatus: OrderStatus = OrderStatus.PENDING_PAYMENT;
      let paymentStatus = "PENDING";

      if (transaction_status === "capture") {
        if (fraud_status === "challenge") {
          newStatus = OrderStatus.PENDING_PAYMENT;
          paymentStatus = "PENDING";
        } else if (fraud_status === "accept") {
          newStatus = OrderStatus.PROCESSING;
          paymentStatus = "PAID";
        }
      } else if (transaction_status === "settlement") {
        newStatus = OrderStatus.PROCESSING;
        paymentStatus = "PAID";
      } else if (
        transaction_status === "cancel" ||
        transaction_status === "deny" ||
        transaction_status === "expire"
      ) {
        newStatus = OrderStatus.CANCELLED;
        paymentStatus = "FAILED";
      }

      await this.orderRepository.updateOrderStatus(order_id, newStatus, {
        paymentStatus,
        paidAt: paymentStatus === "PAID" ? new Date() : null,
      });

      logger.info(`Order ${order_id} updated to ${newStatus}`);
      res.status(200).json({ status: "OK" });
    } catch (error) {
      logger.error("Webhook Error:", error);
      next(error);
    }
  };
}

export default PaymentController;
