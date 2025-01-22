import { Router } from "express";
import { authentication } from "../../Middlewares/authentication.middleware.js";
import { multerHost } from "../../Middlewares/multer.middleware.js";
import { extensions } from "../../Utils/file-extensions.utils.js";
import { checkIfIdsExist } from "../../Middlewares/finders.middleware.js";
import { errorHandler } from "../../Middlewares/error-handling.middleware.js";
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
