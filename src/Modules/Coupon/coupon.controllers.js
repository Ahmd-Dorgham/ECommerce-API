import { Coupon, CouponChangeLog, User } from "../../../DB/Models/index.js";
import { ErrorClass } from "../../Utils/error-class.utils.js";

/**
 * @api {POST} /coupons/create Create coupon
 * @apiDescription This endpoint allows the creation of a coupon.
 * Each coupon is associated with specific users, and every user can use it a defined number of times (maxCount , usageCount).
 * Users field defines which users can use the coupon and how many times each user can use it.
 */

export const createCoupon = async (req, res, next) => {
  const { couponCode, from, till, couponAmount, couponType, Users } = req.body;

  const isCouponCodeExist = await Coupon.findOne({ couponCode });
  if (isCouponCodeExist) {
    return next(new ErrorClass("Coupon code already exist", 400, "Coupon code already exist"));
  }

  const userIds = Users.map((u) => u.userId); // Extract user IDs from Users array
  const validUsers = await User.find({ _id: { $in: userIds } });
  if (validUsers.length !== userIds.length) {
    return next(new ErrorClass("Invalid users", 400, "Invalid users"));
  }

  const newCoupon = new Coupon({
    couponCode,
    from,
    till,
    couponAmount,
    couponType,
    Users,
    createdBy: req.authUser._id,
  });

  await newCoupon.save();
  res.status(201).json({ message: "Coupon created", coupon: newCoupon });
};

export const getCoupons = async (req, res, next) => {
  const { isEnabled } = req.query;
  const filters = {};
  if (isEnabled) {
    filters.isEnabled = isEnabled === "true" ? true : false;
  }
  const coupons = await Coupon.find(filters);
  res.status(200).json({ status: "success", data: coupons });
};

export const getCouponById = async (req, res, next) => {
  const { couponId } = req.params;
  const coupon = await Coupon.findById(couponId);
  if (!coupon) {
    return next(new ErrorClass("Coupon not found", 404));
  }
  res.status(200).json({ status: "success", data: coupon });
};

export const updateCoupon = async (req, res, next) => {
  const { couponId } = req.params;
  const userId = req.authUser._id;
  const { couponCode, from, till, couponAmount, couponType, Users } = req.body;

  const coupon = await Coupon.findById(couponId);
  if (!coupon) {
    return next(new ErrorClass("Coupon not found", 404));
  }

  const logUpdatedObject = { couponId, updatedBy: userId, changes: {} };

  if (couponCode) {
    const isCouponCodeExist = await Coupon.findOne({ couponCode });
    if (isCouponCodeExist) {
      return next(new ErrorClass("Coupon code already exist", 400));
    }
    coupon.couponCode = couponCode;
    logUpdatedObject.changes.couponCode = couponCode;
  }
  if (from) {
    coupon.from = from;
    logUpdatedObject.changes.from = from;
  }
  if (till) {
    coupon.till = till;
    logUpdatedObject.changes.till = till;
  }
  if (couponAmount) {
    coupon.couponAmount = couponAmount;
    logUpdatedObject.changes.couponAmount = couponAmount;
  }
  if (couponType) {
    coupon.couponType = couponType;
    logUpdatedObject.changes.couponType = couponType;
  }
  if (Users) {
    const userIds = Users.map((u) => u.userId);
    const validUsers = await User.find({ _id: { $in: userIds } });
    if (validUsers.length !== userIds.length) {
      return next(new ErrorClass("Invalid users", 400, "Invalid users"));
    }
    coupon.Users = Users;
    logUpdatedObject.changes.Users = Users;
  }
  await coupon.save();

  const log = await new CouponChangeLog(logUpdatedObject).save();

  res.status(200).json({ status: "success", message: "Coupon Updated successfully", coupon, log });
};

export const disableEnableCoupon = async (req, res, next) => {
  const { couponId } = req.params;
  const userId = req.authUser._id;
  const { enable } = req.body;

  const coupon = await Coupon.findById(couponId);
  if (!coupon) {
    return next(new ErrorClass("coupon not found", 404));
  }
  const logUpdatedObject = { updatedBy: userId, couponId, changes: {} };

  if (enable === true) {
    coupon.isEnabled = true;
    logUpdatedObject.changes.isEnabled = true;
  }
  if (enable === false) {
    coupon.isEnabled = false;
    logUpdatedObject.changes.isEnabled = false;
  }
  await coupon.save();
  const log = await new CouponChangeLog(logUpdatedObject).save();

  res.status(200).json({ message: "Coupon updated successfully", coupon, log });
};
