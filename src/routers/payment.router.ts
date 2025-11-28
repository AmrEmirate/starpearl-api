import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";

class PaymentRouter {
  private route: Router;
  private controller: PaymentController;

  constructor() {
    this.route = Router();
    this.controller = new PaymentController();
    this.initializeRoute();
  }

  private initializeRoute(): void {
    // Webhook endpoint for Midtrans
    this.route.post("/webhook", this.controller.handleWebhook);
  }

  public getRouter(): Router {
    return this.route;
  }
}

export default PaymentRouter;
