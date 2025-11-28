import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import AuthRouter from "./routers/auth.router";
import logger from "./utils/logger";
import AppError from "./utils/AppError";
import UserRouter from "./routers/user.router";
import ProductRouter from "./routers/product.router";
import CartRouter from "./routers/cart.router";
import AddressRouter from "./routers/address.router";
import OrderRouter from "./routers/order.router";
import AdminRouter from "./routers/admin.router";
import CommunityRouter from "./routers/community.router";
import StoreRouter from "./routers/store.router";
import CheckoutRouter from "./routers/checkout.router";
import WishlistRouter from "./routers/wishlist.router";
import PaymentRouter from "./routers/payment.router";
import ReviewRouter from "./routers/review.router";
import WithdrawalRouter from "./routers/withdrawal.router";
import ChatRouter from "./routers/chat.router";

import VoucherRouter from "./routers/voucher.router";
import StatsRouter from "./routers/stats.router";

const PORT: string = process.env.PORT || "2020";

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.configure();
    this.route();
    this.errorHandler();
  }

  private configure(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      logger.info(`${req.method} ${req.path}`);
      next();
    });
  }

  private route(): void {
    this.app.get("/", (req: Request, res: Response) => {
      res.status(200).send("<h1>Starpearl API</h1>");
    });

    const authRouter: AuthRouter = new AuthRouter();
    this.app.use("/auth", authRouter.getRouter());

    const adminRouter: AdminRouter = new AdminRouter();
    this.app.use("/admin", adminRouter.getRouter());

    const userRouter: UserRouter = new UserRouter();
    this.app.use("/users", userRouter.getRouter());

    const productRouter: ProductRouter = new ProductRouter();
    this.app.use("/products", productRouter.getRouter());

    const cartRouter: CartRouter = new CartRouter();
    this.app.use("/cart", cartRouter.getRouter());

    const orderRouter: OrderRouter = new OrderRouter();
    this.app.use("/orders", orderRouter.getRouter());

    const addressRouter: AddressRouter = new AddressRouter();
    this.app.use("/addresses", addressRouter.getRouter());

    const communityRouter: CommunityRouter = new CommunityRouter();
    this.app.use("/community", communityRouter.getRouter());

    const storeRouter: StoreRouter = new StoreRouter();
    this.app.use("/stores", storeRouter.getRouter());

    const checkoutRouter: CheckoutRouter = new CheckoutRouter();
    this.app.use("/checkout", checkoutRouter.getRouter());

    const wishlistRouter: WishlistRouter = new WishlistRouter();
    this.app.use("/wishlist", wishlistRouter.getRouter());

    const paymentRouter: PaymentRouter = new PaymentRouter();
    this.app.use("/payment", paymentRouter.getRouter());

    const reviewRouter: ReviewRouter = new ReviewRouter();
    this.app.use("/reviews", reviewRouter.getRouter());

    const withdrawalRouter: WithdrawalRouter = new WithdrawalRouter();
    this.app.use("/withdrawals", withdrawalRouter.getRouter());

    const chatRouter: ChatRouter = new ChatRouter();
    this.app.use("/chats", chatRouter.getRouter());

    const voucherRouter: VoucherRouter = new VoucherRouter();
    this.app.use("/vouchers", voucherRouter.getRouter());

    const statsRouter: StatsRouter = new StatsRouter();
    this.app.use("/stats", statsRouter.getRouter());
  }

  private errorHandler(): void {
    this.app.use(
      (error: any, req: Request, res: Response, next: NextFunction) => {
        logger.error(
          `${req.method} ${req.path}: ${error.message} ${JSON.stringify(error)}`
        );

        if (error instanceof AppError) {
          res.status(error.code).send(error);
          return;
        }

        if (Array.isArray(error)) {
          res.status(400).send({
            isSuccess: false,
            message: "Validation Error",
            errors: error,
          });
          return;
        }

        res.status(error.code || 500).send({
          isSuccess: false,
          message: error.message || "Internal Server Error",
        });
      }
    );
  }

  public start(): void {
    this.app.listen(PORT, () => {
      console.log(`API Running: http://localhost:${PORT}`);
    });
  }
}

export default App;
