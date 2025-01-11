import express from "express";
import { config } from "dotenv";
import db_connection from "./DB/connection.js";
import { userRouter } from "./src/Modules/User/user.routes.js";
import { globalError } from "./src/Middlewares/error-handling.middleware.js";
import { addressRouter } from "./src/Modules/Address/address.routes.js";

config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/users", userRouter);
app.use("/addresses", addressRouter);

db_connection();

app.use(globalError);

app.get("/", (req, res) => res.send("Hello World!"));
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
