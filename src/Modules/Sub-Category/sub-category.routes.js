import { Router } from "express";
import * as controllers from "./sub-category.controllers.js";
import { extensions } from "../../Utils/index.js";
import { getDocumentByName, multerHost, errorHandler, authentication } from "../../Middlewares/index.js";
import { SubCategory } from "../../../DB/Models/sub-category.model.js";

const subCategoryRouter = Router();

subCategoryRouter.post(
  "/create",
  authentication,
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  getDocumentByName(SubCategory),
  errorHandler(controllers.createSubCategory)
);

subCategoryRouter.get("/", errorHandler(controllers.getSubCategory));
subCategoryRouter.put(
  "/update/:_id",
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  getDocumentByName(SubCategory),
  errorHandler(controllers.updateSubCategory)
);

subCategoryRouter.delete("/delete/:_id", errorHandler(controllers.deleteSubCategory));

export { subCategoryRouter };
