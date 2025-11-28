import { Response, NextFunction } from "express";
import { VoucherService } from "../services/voucher.service";
import { RequestWithUser } from "../middleware/auth.middleware";
import AppError from "../utils/AppError";
import { prisma } from "../config/prisma";

class VoucherController {
  private voucherService: VoucherService;

  constructor() {
    this.voucherService = new VoucherService();
  }

  public createVoucher = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);

      const store = await prisma.store.findUnique({
        where: { userId: req.user.id },
      });
      if (!store) throw new AppError("Store not found", 404);

      const {
        code,
        description,
        discountType,
        discountValue,
        minPurchase,
        maxUses,
        expiresAt,
      } = req.body;

      const voucher = await this.voucherService.createVoucher(store.id, {
        code,
        description,
        discountType,
        discountValue: Number(discountValue),
        minPurchase: Number(minPurchase || 0),
        maxUses: maxUses ? Number(maxUses) : undefined,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      });

      res.status(201).json({ success: true, data: voucher });
    } catch (error) {
      next(error);
    }
  };

  public getMyVouchers = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);

      const vouchers = await this.voucherService.getStoreVouchers(req.user.id);
      res.status(200).json({ success: true, data: vouchers });
    } catch (error) {
      next(error);
    }
  };

  public deleteVoucher = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      const { id } = req.params;

      await this.voucherService.deleteVoucher(req.user.id, id);
      res.status(200).json({ success: true, message: "Voucher deleted" });
    } catch (error) {
      next(error);
    }
  };
}

export default VoucherController;
