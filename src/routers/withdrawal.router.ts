import { Router } from "express";
import WithdrawalController from "../controllers/withdrawal.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";

class WithdrawalRouter {
  private route: Router;
  private withdrawalController: WithdrawalController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.route = Router();
    this.withdrawalController = new WithdrawalController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // All routes require seller authentication
    this.route.use(this.authMiddleware.verifyToken);
    this.route.use(this.authMiddleware.isSeller);

    this.route.post("/", this.withdrawalController.requestWithdrawal);
    this.route.get("/", this.withdrawalController.getMyWithdrawals);
    this.route.get("/balance", this.withdrawalController.getBalance);
  }

  public getRouter(): Router {
    return this.route;
  }
}

export default WithdrawalRouter;
