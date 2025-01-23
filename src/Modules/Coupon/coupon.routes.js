import { Router } from "express";
import { authentication } from "../../Middlewares/authentication.middleware.js";
import { validationMiddleware } from "../../Middlewares/validation.middleware.js";
import { CreateCouponSchema, UpdateCouponSchema } from "./coupon.schema.js";
import { errorHandler } from "../../Middlewares/error-handling.middleware.js";
import * as controllers from "./coupon.controllers.js";

const couponRouter = Router();

couponRouter.post(
  "/create",
  authentication,
  validationMiddleware(CreateCouponSchema),
  errorHandler(controllers.createCoupon)
);

couponRouter.get("/", errorHandler(controllers.getCoupons));

couponRouter.get("/details/:couponId", errorHandler(controllers.getCouponById));

couponRouter.put(
  "/update/:couponId",
  authentication,
  validationMiddleware(UpdateCouponSchema),
  errorHandler(controllers.updateCoupon)
);

couponRouter.patch("/enable/:couponId", authentication, errorHandler(controllers.disableEnableCoupon));

export { couponRouter };
