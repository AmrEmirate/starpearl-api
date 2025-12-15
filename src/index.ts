import "dotenv/config";
import App from "./app";

const app = new App();
const expressApp = app.getApp();

app.start();

export default expressApp;
