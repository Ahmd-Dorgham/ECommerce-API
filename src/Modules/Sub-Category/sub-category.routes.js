import { Router } from "express";
import { authentication } from "../../Middlewares/authentication.middleware.js";
import { errorHandler } from "../../Middlewares/error-handling.middleware.js";
import * as controllers from "./sub-category.controllers.js";
import { extensions } from "../../Utils/file-extensions.utils.js";
import { multerHost } from "../../Middlewares/multer.middleware.js";
import { getDocumentByName } from "../../Middlewares/finders.middleware.js";
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
