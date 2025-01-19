import { Router } from "express";
import * as controllers from "./address.controllers.js";
import { errorHandler } from "../../Middlewares/error-handling.middleware.js";
import { authentication } from "../../Middlewares/authentication.middleware.js";

const addressRouter = Router();

addressRouter.post("/add", authentication, errorHandler(controllers.addAddress));
addressRouter.put("/edit/:addressId", authentication, errorHandler(controllers.editAddress));
addressRouter.patch("/soft-delete/:addressId", authentication, errorHandler(controllers.deleteAddress));
addressRouter.get("/", authentication, errorHandler(controllers.getAddressesForUser));

export { addressRouter };
