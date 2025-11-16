import { Router } from "express";
import AddressController from "../controllers/address.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { addressValidation } from "../middleware/validation/address"; // Validasi yang kita buat tadi

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
    // Lindungi semua rute alamat, hanya user terotentikasi yang bisa akses
    this.route.use(this.authMiddleware.verifyToken);

    // GET /addresses - Mendapat semua alamat user
    this.route.get(
      "/",
      this.addressController.getAllAddresses
    );

    // POST /addresses - Membuat alamat baru
    this.route.post(
      "/",
      addressValidation, // Terapkan validasi
      this.addressController.createAddress
    );

    // PATCH /addresses/:addressId - Mengupdate alamat
    this.route.patch(
      "/:addressId",
      addressValidation, // Validasi yang sama bisa dipakai (karena 'optional' di update service)
      this.addressController.updateAddress
    );

    // DELETE /addresses/:addressId - Menghapus alamat
    this.route.delete(
      "/:addressId",
      this.addressController.deleteAddress
    );
  }

  public getRouter(): Router {
    return this.route;
  }
}

export default AddressRouter;