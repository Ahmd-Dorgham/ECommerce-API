import { Router } from "express";
import { authentication } from "../../Middlewares/authentication.middleware.js";
import { errorHandler } from "../../Middlewares/error-handling.middleware.js";
import * as controllers from "./cart.controllers.js";

const cartRouter = Router();

cartRouter.post("/add/:productId", authentication, errorHandler(controllers.addToCart));

cartRouter.put("/remove/:productId", authentication, errorHandler(controllers.removeFromCart));

cartRouter.put("/update/:productId", authentication, errorHandler(controllers.updateCart));

cartRouter.get("/", authentication, errorHandler(controllers.getCart));

export { cartRouter };
