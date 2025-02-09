import { Router } from "express";
import { extensions } from "../../Utils/index.js";
import { errorHandler, checkIfIdsExist, multerHost, authentication } from "../../Middlewares/index.js";
import { Brand } from "../../../DB/Models/index.js";
import * as controllers from "./product.controllers.js";

const productRouter = Router();

productRouter.post(
  "/add",
  authentication,
  multerHost({ allowedExtensions: extensions.Images }).array("images", 5),
  checkIfIdsExist(Brand),
  errorHandler(controllers.addProduct)
);

productRouter.put("/update/:productId", errorHandler(controllers.updateProduct));

productRouter.get("/list", errorHandler(controllers.listProducts));

export { productRouter };
