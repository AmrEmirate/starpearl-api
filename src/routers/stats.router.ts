import { Router } from "express";
import StatsController from "../controllers/stats.controller";

class StatsRouter {
  private route: Router;
  private controller: StatsController;

  constructor() {
    this.route = Router();
    this.controller = new StatsController();
    this.initializeRoute();
  }

  private initializeRoute(): void {
    this.route.get("/", this.controller.getStats);
  }

  public getRouter(): Router {
    return this.route;
  }
}

export default StatsRouter;
