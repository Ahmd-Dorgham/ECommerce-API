import { Router } from "express";
import { errorHandler, authentication } from "../../Middlewares/index.js";
import * as controllers from "./order.controllers.js";

const orderRouter = Router();

orderRouter.post("/create", authentication, errorHandler(controllers.createOrder));
orderRouter.put("/cancel/:orderId", authentication, errorHandler(controllers.cancelOrder));
orderRouter.patch("/deliver/:orderId", authentication, errorHandler(controllers.deliverOrder));
orderRouter.get("/list", authentication, errorHandler(controllers.listOrders));

export { orderRouter };
