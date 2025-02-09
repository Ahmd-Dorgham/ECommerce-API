import { Router } from "express";
import { CreateCouponSchema, UpdateCouponSchema } from "./coupon.schema.js";
import { errorHandler, validationMiddleware, authentication } from "../../Middlewares/index.js";
import * as controllers from "./coupon.controllers.js";

const couponRouter = Router();

couponRouter.post("/create", authentication, validationMiddleware(CreateCouponSchema), errorHandler(controllers.createCoupon));

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
