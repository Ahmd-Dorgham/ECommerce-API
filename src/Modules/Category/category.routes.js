import { Router } from "express";
import { authentication } from "../../Middlewares/authentication.middleware.js";
import { multerHost } from "../../Middlewares/multer.middleware.js";
import { extensions } from "../../Utils/file-extensions.utils.js";
import * as controllers from "./category.controllers.js";
import { errorHandler } from "../../Middlewares/error-handling.middleware.js";

const categoryRouter = Router();

categoryRouter.post(
  "/create",
  authentication,
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  errorHandler(controllers.createCategory)
);

categoryRouter.get("/", errorHandler(controllers.getCategory));

categoryRouter.put(
  "/update/:_id",
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  errorHandler(controllers.updateCategory)
);

categoryRouter.delete("/delete/:_id", errorHandler(controllers.deleteCategory));

export { categoryRouter };
