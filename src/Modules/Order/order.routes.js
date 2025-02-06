import { Router } from "express";
import { authentication } from "../../Middlewares/authentication.middleware.js";
import { errorHandler } from "../../Middlewares/error-handling.middleware.js";
import * as controllers from "./order.controllers.js";

const orderRouter = Router();

orderRouter.post("/create", authentication, errorHandler(controllers.createOrder));
orderRouter.put("/cancel/:orderId", authentication, errorHandler(controllers.cancelOrder));
orderRouter.patch("/deliver/:orderId", authentication, errorHandler(controllers.deliverOrder));

export { orderRouter };
