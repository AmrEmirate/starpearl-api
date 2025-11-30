import "dotenv/config";
import App from "./app";

const app = new App();
const expressApp = app.getApp();

if (process.env.NODE_ENV !== "production") {
  app.start();
}

export default expressApp;
