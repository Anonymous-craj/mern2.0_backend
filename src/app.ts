import express, { Application, Request, Response } from "express";
const app: Application = express();
const PORT: number = 3000;

import * as dotenv from "dotenv";
dotenv.config();

import "./database/connection";
import adminSeeder from "./adminSeeder";
import userRoute from "./routes/userRoute";
import productRoute from "./routes/productRoute";
app.use(express.json());

//admin Seeder
adminSeeder();

app.use("", userRoute);
app.use("/admin/product", productRoute);
app.listen(PORT, () => {
  console.log("Server has started at port:", PORT);
});
