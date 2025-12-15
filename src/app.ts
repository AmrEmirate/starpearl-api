import dotenv from "dotenv";
dotenv.config();
import "./config/passport";
import passport from "passport";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import compression from "compression";
import rateLimit from "express-rate-limit";
import express, { Application, NextFunction, Request, Response } from "express";
import AuthRouter from "./routers/auth.router";
import logger from "./utils/logger";
import AppError from "./utils/AppError";
import UserRouter from "./routers/user.router";
import ProductRouter from "./routers/product.router";
import CategoryRouter from "./routers/category.router";
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
import AttributeRouter from "./routers/attribute.router";
import VoucherRouter from "./routers/voucher.router";
import StatsRouter from "./routers/stats.router";

const PORT: string = process.env.PORT as string;

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.configure();
    this.routes();
    this.errorHandler();
  }

  private configure(): void {
    this.app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(hpp());
    this.app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per windowMs
      })
    );
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(passport.initialize());
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      logger.info(`${req.method} ${req.path}`);
      next();
    });
  }

  private routes(): void {
    this.app.get("/", (req: Request, res: Response) => {
      res.status(200).send("<h1>Starpearl API</h1>");
    });

    const authRouter: AuthRouter = new AuthRouter();
    this.app.use("/api/auth", authRouter.getRouter());

    const adminRouter: AdminRouter = new AdminRouter();
    this.app.use("/api/admin", adminRouter.getRouter());

    const userRouter: UserRouter = new UserRouter();
    this.app.use("/api/users", userRouter.getRouter());

    const productRouter: ProductRouter = new ProductRouter();
    this.app.use("/api/products", productRouter.getRouter());

    const categoryRouter: CategoryRouter = new CategoryRouter();
    this.app.use("/api/categories", categoryRouter.getRouter());

    const attributeRouter: AttributeRouter = new AttributeRouter();
    this.app.use("/api/attributes", attributeRouter.getRouter());

    const cartRouter: CartRouter = new CartRouter();
    this.app.use("/api/cart", cartRouter.getRouter());

    const orderRouter: OrderRouter = new OrderRouter();
    this.app.use("/api/orders", orderRouter.getRouter());

    const addressRouter: AddressRouter = new AddressRouter();
    this.app.use("/api/addresses", addressRouter.getRouter());

    const communityRouter: CommunityRouter = new CommunityRouter();
    this.app.use("/api/community", communityRouter.getRouter());

    const storeRouter: StoreRouter = new StoreRouter();
    this.app.use("/api/stores", storeRouter.getRouter());

    const checkoutRouter: CheckoutRouter = new CheckoutRouter();
    this.app.use("/api/checkout", checkoutRouter.getRouter());

    const wishlistRouter: WishlistRouter = new WishlistRouter();
    this.app.use("/api/wishlist", wishlistRouter.getRouter());

    const paymentRouter: PaymentRouter = new PaymentRouter();
    this.app.use("/api/payment", paymentRouter.getRouter());

    const reviewRouter: ReviewRouter = new ReviewRouter();
    this.app.use("/api/reviews", reviewRouter.getRouter());

    const withdrawalRouter: WithdrawalRouter = new WithdrawalRouter();
    this.app.use("/api/withdrawals", withdrawalRouter.getRouter());

    const chatRouter: ChatRouter = new ChatRouter();
    this.app.use("/api/chats", chatRouter.getRouter());

    const voucherRouter: VoucherRouter = new VoucherRouter();
    this.app.use("/api/vouchers", voucherRouter.getRouter());

    const statsRouter: StatsRouter = new StatsRouter();
    this.app.use("/api/stats", statsRouter.getRouter());
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
      console.log(
        `API Running: ${process.env.API_BASE_URL || `http://localhost:${PORT}`}`
      );
    });
  }

  public getApp(): Application {
    return this.app;
  }
}

export default App;
