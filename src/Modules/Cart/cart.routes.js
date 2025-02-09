import { Router } from "express";
import { errorHandler, authentication } from "../../Middlewares/index.js";
import * as controllers from "./cart.controllers.js";

const cartRouter = Router();

cartRouter.post("/add/:productId", authentication, errorHandler(controllers.addToCart));

cartRouter.put("/remove/:productId", authentication, errorHandler(controllers.removeFromCart));

cartRouter.put("/update/:productId", authentication, errorHandler(controllers.updateCart));

cartRouter.get("/", authentication, errorHandler(controllers.getCart));

export { cartRouter };
