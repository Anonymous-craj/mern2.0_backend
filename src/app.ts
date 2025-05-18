import express, { Application } from "express";
const app: Application = express();
const PORT: number = 3000;

import * as dotenv from "dotenv";
dotenv.config();

import "./database/connection";
import adminSeeder from "./adminSeeder";
import userRoute from "./routes/userRoute";
import productRoute from "./routes/productRoute";
import categoryRoute from "./routes/categoryRoute";
import cartRoute from "./routes/cartRoute";
import orderRoute from "./routes/orderRoute";
import categoryController from "./controllers/categoryController";
app.use(express.json());

//admin Seeder
adminSeeder();
categoryController.seedCategory();

//localhost:3000/
app.use("", userRoute);
app.use("/admin/product", productRoute);
app.use("/admin/category", categoryRoute);
app.use("/customer/cart", cartRoute);
app.use("/order", orderRoute);
app.listen(PORT, () => {
  console.log("Server has started at port:", PORT);
});
