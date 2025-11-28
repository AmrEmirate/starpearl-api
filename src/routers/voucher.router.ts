import { Router } from "express";
import VoucherController from "../controllers/voucher.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";

class VoucherRouter {
  private route: Router;
  private voucherController: VoucherController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.route = Router();
    this.voucherController = new VoucherController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.route.use(this.authMiddleware.verifyToken);
    this.route.use(this.authMiddleware.isSeller);

    this.route.post("/", this.voucherController.createVoucher);
    this.route.get("/", this.voucherController.getMyVouchers);
    this.route.delete("/:id", this.voucherController.deleteVoucher);
  }

  public getRouter(): Router {
    return this.route;
  }
}

export default VoucherRouter;
