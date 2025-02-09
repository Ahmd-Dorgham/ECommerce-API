import { Router } from "express";
import { extensions } from "../../Utils/index.js";
import * as controllers from "./category.controllers.js";
import { getDocumentByName, errorHandler, multerHost, authentication } from "../../Middlewares/index.js";
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
