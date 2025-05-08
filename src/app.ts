import express, { Application } from "express";
const app: Application = express();
const PORT: number = 3000;

import * as dotenv from "dotenv";
dotenv.config();

import "./database/connection";
import adminSeeder from "./adminSeeder";
import userRoute from "./routes/userRoute";
import productRoute from "./routes/productRoute";
import categoryController from "./controllers/categoryController";
app.use(express.json());

//admin Seeder
adminSeeder();
categoryController.seedCategory();

app.use("", userRoute);
app.use("/admin/product", productRoute);
app.listen(PORT, () => {
  console.log("Server has started at port:", PORT);
});
