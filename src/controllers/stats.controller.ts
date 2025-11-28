import { Request, Response, NextFunction } from "express";
import { StatsService } from "../services/stats.service";
import logger from "../utils/logger";

class StatsController {
  private statsService: StatsService;

  constructor() {
    this.statsService = new StatsService();
  }

  public getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.statsService.getStats();

      res.status(200).send({
        success: true,
        message: "Stats retrieved successfully",
        data: result,
      });
    } catch (error) {
      logger.error("Error in getStats controller", error);
      next(error);
    }
  };
}

export default StatsController;
