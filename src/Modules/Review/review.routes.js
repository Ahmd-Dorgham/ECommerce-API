import { Router } from "express";
import { authentication, errorHandler } from "../../Middlewares/index.js";
import * as controllers from "./review.controllers.js";

const reviewRouter = Router();

reviewRouter.post("/create", authentication, errorHandler(controllers.addReview));
reviewRouter.get("/list", authentication, errorHandler(controllers.listReviews));
reviewRouter.patch("/approve-reject/:reviewId", authentication, errorHandler(controllers.approveOrRejectReview));

export { reviewRouter };
