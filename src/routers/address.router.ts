import { Router } from "express";
import AddressController from "../controllers/address.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { addressValidation } from "../middleware/validation/address";

class AddressRouter {
  private route: Router;
  private addressController: AddressController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.route = Router();
    this.addressController = new AddressController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoute();
  }

  private initializeRoute(): void {
    this.route.use(this.authMiddleware.verifyToken);

    this.route.get("/", this.addressController.getAllAddresses);

    this.route.post(
      "/",
      addressValidation,
      this.addressController.createAddress
    );

    this.route.patch(
      "/:addressId",
      addressValidation,
      this.addressController.updateAddress
    );

    this.route.delete("/:addressId", this.addressController.deleteAddress);
  }

  public getRouter(): Router {
    return this.route;
  }
}

export default AddressRouter;
