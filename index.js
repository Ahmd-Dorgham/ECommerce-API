import express from "express";
import { config } from "dotenv";
import db_connection from "./DB/connection.js";
import {
  productRouter,
  userRouter,
  addressRouter,
  categoryRouter,
  orderRouter,
  subCategoryRouter,
  brandRouter,
  cartRouter,
  couponRouter,
} from "./src/Modules/index.js";
import { globalError } from "./src/Middlewares/error-handling.middleware.js";
import { disableCouponsCron } from "./src/Utils/crons.utils.js";

config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/users", userRouter);
app.use("/addresses", addressRouter);
app.use("/categories", categoryRouter);
app.use("/sub-categories", subCategoryRouter);
app.use("/brands", brandRouter);
app.use("/products", productRouter);
app.use("/carts", cartRouter);
app.use("/coupons", couponRouter);
app.use("/orders", orderRouter);

db_connection();

app.use(globalError);

// disableCouponsCron();
// gracefulShutdown();

app.get("/", (req, res) => res.send("Hello World!"));
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
