import { Router } from "express";
import { extensions } from "../../Utils/file-extensions.utils.js";
import { multerHost } from "../../Middlewares/multer.middleware.js";
import { getDocumentByName } from "../../Middlewares/finders.middleware.js";
import { Brand } from "../../../DB/Models/brand.model.js";
import { errorHandler } from "../../Middlewares/error-handling.middleware.js";
import * as controllers from "./brand.controllers.js";
import { authentication } from "../../Middlewares/authentication.middleware.js";

const brandRouter = Router();

brandRouter.post(
  "/create",
  authentication,
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  getDocumentByName(Brand),
  errorHandler(controllers.createBrand)
);

brandRouter.get("/", errorHandler(controllers.getBrand));

brandRouter.put(
  "/update/:_id",
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  getDocumentByName(Brand),
  errorHandler(controllers.updateBrand)
);

brandRouter.delete("/delete/:_id", errorHandler(controllers.deleteBrand));

export { brandRouter };
