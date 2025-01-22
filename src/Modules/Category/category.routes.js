import { Router } from "express";
import { authentication } from "../../Middlewares/authentication.middleware.js";
import { multerHost } from "../../Middlewares/multer.middleware.js";
import { extensions } from "../../Utils/file-extensions.utils.js";
import * as controllers from "./category.controllers.js";
import { errorHandler } from "../../Middlewares/error-handling.middleware.js";
import { getDocumentByName } from "../../Middlewares/finders.middleware.js";
import { Category } from "../../../DB/Models/category.model.js";

const categoryRouter = Router();

categoryRouter.post(
  "/create",
  authentication,
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  getDocumentByName(Category),
  errorHandler(controllers.createCategory)
);

categoryRouter.get("/", errorHandler(controllers.getCategory));

categoryRouter.put(
  "/update/:_id",
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  getDocumentByName(Category),
  errorHandler(controllers.updateCategory)
);

categoryRouter.delete("/delete/:_id", errorHandler(controllers.deleteCategory));

categoryRouter.get("/list", errorHandler(controllers.listCategories));

export { categoryRouter };
