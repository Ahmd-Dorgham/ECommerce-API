import { Router } from "express";
import { extensions } from "../../Utils/index.js";
import { Brand } from "../../../DB/Models/index.js";
import * as controllers from "./brand.controllers.js";

import { multerHost, authentication, getDocumentByName, errorHandler } from "../../Middlewares/index.js";

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
