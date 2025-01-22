import express from "express";
import { config } from "dotenv";
import db_connection from "./DB/connection.js";
import { userRouter } from "./src/Modules/User/user.routes.js";
import { globalError } from "./src/Middlewares/error-handling.middleware.js";
import { addressRouter } from "./src/Modules/Address/address.routes.js";
import { categoryRouter } from "./src/Modules/Category/category.routes.js";
import { subCategoryRouter } from "./src/Modules/Sub-Category/sub-category.routes.js";
import { brandRouter } from "./src/Modules/Brand/brand.routes.js";

config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/users", userRouter);
app.use("/addresses", addressRouter);
app.use("/categories", categoryRouter);
app.use("/sub-categories", subCategoryRouter);
app.use("/brands", brandRouter);

db_connection();

app.use(globalError);

app.get("/", (req, res) => res.send("Hello World!"));
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
