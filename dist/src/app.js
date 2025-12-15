"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
require("./config/passport");
const passport_1 = __importDefault(require("passport"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const hpp_1 = __importDefault(require("hpp"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_1 = __importDefault(require("express"));
const auth_router_1 = __importDefault(require("./routers/auth.router"));
const logger_1 = __importDefault(require("./utils/logger"));
const AppError_1 = __importDefault(require("./utils/AppError"));
const user_router_1 = __importDefault(require("./routers/user.router"));
const product_router_1 = __importDefault(require("./routers/product.router"));
const category_router_1 = __importDefault(require("./routers/category.router"));
const cart_router_1 = __importDefault(require("./routers/cart.router"));
const address_router_1 = __importDefault(require("./routers/address.router"));
const order_router_1 = __importDefault(require("./routers/order.router"));
const admin_router_1 = __importDefault(require("./routers/admin.router"));
const community_router_1 = __importDefault(require("./routers/community.router"));
const store_router_1 = __importDefault(require("./routers/store.router"));
const checkout_router_1 = __importDefault(require("./routers/checkout.router"));
const wishlist_router_1 = __importDefault(require("./routers/wishlist.router"));
const payment_router_1 = __importDefault(require("./routers/payment.router"));
const review_router_1 = __importDefault(require("./routers/review.router"));
const withdrawal_router_1 = __importDefault(require("./routers/withdrawal.router"));
const chat_router_1 = __importDefault(require("./routers/chat.router"));
const attribute_router_1 = __importDefault(require("./routers/attribute.router"));
const voucher_router_1 = __importDefault(require("./routers/voucher.router"));
const stats_router_1 = __importDefault(require("./routers/stats.router"));
const PORT = process.env.PORT;
class App {
    app;
    constructor() {
        this.app = (0, express_1.default)();
        this.configure();
        this.routes();
        this.errorHandler();
    }
    configure() {
        this.app.use((0, cors_1.default)({ origin: process.env.FRONTEND_URL, credentials: true }));
        this.app.use((0, helmet_1.default)());
        this.app.use((0, compression_1.default)());
        this.app.use((0, hpp_1.default)());
        this.app.use((0, express_rate_limit_1.default)({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // Limit each IP to 100 requests per windowMs
        }));
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
        this.app.use(passport_1.default.initialize());
        this.app.use((req, res, next) => {
            logger_1.default.info(`${req.method} ${req.path}`);
            next();
        });
    }
    routes() {
        this.app.get("/", (req, res) => {
            res.status(200).send("<h1>Starpearl API</h1>");
        });
        const authRouter = new auth_router_1.default();
        this.app.use("/api/auth", authRouter.getRouter());
        const adminRouter = new admin_router_1.default();
        this.app.use("/api/admin", adminRouter.getRouter());
        const userRouter = new user_router_1.default();
        this.app.use("/api/users", userRouter.getRouter());
        const productRouter = new product_router_1.default();
        this.app.use("/api/products", productRouter.getRouter());
        const categoryRouter = new category_router_1.default();
        this.app.use("/api/categories", categoryRouter.getRouter());
        const attributeRouter = new attribute_router_1.default();
        this.app.use("/api/attributes", attributeRouter.getRouter());
        const cartRouter = new cart_router_1.default();
        this.app.use("/api/cart", cartRouter.getRouter());
        const orderRouter = new order_router_1.default();
        this.app.use("/api/orders", orderRouter.getRouter());
        const addressRouter = new address_router_1.default();
        this.app.use("/api/addresses", addressRouter.getRouter());
        const communityRouter = new community_router_1.default();
        this.app.use("/api/community", communityRouter.getRouter());
        const storeRouter = new store_router_1.default();
        this.app.use("/api/stores", storeRouter.getRouter());
        const checkoutRouter = new checkout_router_1.default();
        this.app.use("/api/checkout", checkoutRouter.getRouter());
        const wishlistRouter = new wishlist_router_1.default();
        this.app.use("/api/wishlist", wishlistRouter.getRouter());
        const paymentRouter = new payment_router_1.default();
        this.app.use("/api/payment", paymentRouter.getRouter());
        const reviewRouter = new review_router_1.default();
        this.app.use("/api/reviews", reviewRouter.getRouter());
        const withdrawalRouter = new withdrawal_router_1.default();
        this.app.use("/api/withdrawals", withdrawalRouter.getRouter());
        const chatRouter = new chat_router_1.default();
        this.app.use("/api/chats", chatRouter.getRouter());
        const voucherRouter = new voucher_router_1.default();
        this.app.use("/api/vouchers", voucherRouter.getRouter());
        const statsRouter = new stats_router_1.default();
        this.app.use("/api/stats", statsRouter.getRouter());
    }
    errorHandler() {
        this.app.use((error, req, res, next) => {
            logger_1.default.error(`${req.method} ${req.path}: ${error.message} ${JSON.stringify(error)}`);
            if (error instanceof AppError_1.default) {
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
        });
    }
    start() {
        this.app.listen(PORT, () => {
            console.log(`API Running: ${process.env.API_BASE_URL || `http://localhost:${PORT}`}`);
        });
    }
    getApp() {
        return this.app;
    }
}
exports.default = App;
