import { Response, NextFunction } from "express";
import { WithdrawalService } from "../services/withdrawal.service";
import { RequestWithUser } from "../middleware/auth.middleware";
import AppError from "../utils/AppError";
import logger from "../utils/logger";

class WithdrawalController {
  private withdrawalService: WithdrawalService;

  constructor() {
    this.withdrawalService = new WithdrawalService();
  }

  public requestWithdrawal = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);

      const { amount, bankName, bankAccount, bankUser } = req.body;

      if (!amount || !bankName || !bankAccount || !bankUser) {
        throw new AppError("Missing required fields", 400);
      }

      const result = await this.withdrawalService.requestWithdrawal(
        req.user.id,
        Number(amount),
        bankName,
        bankAccount,
        bankUser
      );

      res.status(201).json({
        success: true,
        message: "Withdrawal requested successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public getMyWithdrawals = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);

      const result = await this.withdrawalService.getStoreWithdrawals(
        req.user.id
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public getBalance = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);

      const balance = await this.withdrawalService.getStoreBalance(req.user.id);

      res.status(200).json({
        success: true,
        data: { balance },
      });
    } catch (error) {
      next(error);
    }
  };
}

export default WithdrawalController;
