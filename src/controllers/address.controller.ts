import { Request, Response, NextFunction } from "express";
import { AddressService } from "../services/address.service";
import logger from "../utils/logger";
import { RequestWithUser } from "../middleware/auth.middleware";
import AppError from "../utils/AppError";

class AddressController {
  private addressService: AddressService;

  constructor() {
    this.addressService = new AddressService();
  }

  public createAddress = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication failed", 401);
      }
      const result = await this.addressService.createAddress(req.user.id, req.body);
      res.status(201).send({
        success: true,
        message: "Address created successfully",
        data: result,
      });
    } catch (error) {
      logger.error("Error in createAddress controller", error);
      next(error);
    }
  };

  public getAllAddresses = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication failed", 401);
      }
      const result = await this.addressService.getAddresses(req.user.id);
      res.status(200).send({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error("Error in getAllAddresses controller", error);
      next(error);
    }
  };

  public updateAddress = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication failed", 401);
      }
      const { addressId } = req.params;
      const result = await this.addressService.updateAddress(
        req.user.id,
        addressId,
        req.body
      );
      res.status(200).send({
        success: true,
        message: "Address updated successfully",
        data: result,
      });
    } catch (error) {
      logger.error("Error in updateAddress controller", error);
      next(error);
    }
  };

  public deleteAddress = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication failed", 401);
      }
      const { addressId } = req.params;
      const result = await this.addressService.deleteAddress(req.user.id, addressId);
      res.status(200).send({
        success: true,
        message: "Address deleted successfully",
        data: result,
      });
    } catch (error) {
      logger.error("Error in deleteAddress controller", error);
      next(error);
    }
  };
}

export default AddressController;
