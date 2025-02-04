import { DateTime } from "luxon";
import { Coupon } from "../../../../DB/Models/index.js";
import { DiscountType } from "../../../Utils/enums-utils.js";

/**
 * @param {*} couponCode
 * @param {*} userId
 * @returns { message: string, error: Boolean, coupon: Object }
 */
export const validateCoupon = async (couponCode, userId) => {
  const coupon = await Coupon.findOne({ couponCode });
  if (!coupon) {
    return { message: "Invalid coupon code", error: true };
  }

  if (!coupon.isEnabled || DateTime.now() > DateTime.fromJSDate(coupon.till)) {
    return { message: "Coupon is not enabled", error: true };
  }

  if (DateTime.now() < DateTime.fromJSDate(coupon.from)) {
    return { message: `Coupon is not started yet, will start on ${coupon.from}`, error: true };
  }

  const isUserNotEligible = coupon.Users.some(
    (u) =>
      u.userId.toString() !== userId.toString() || (u.userId.toString() === userId.toString() && u.maxCount <= u.usageCount)
  );
  if (isUserNotEligible) {
    return {
      message: "User is not eligible to use this coupon or you redeem all your tries",
      error: true,
    };
  }

  return { error: false, coupon };
};

export const applyCoupon = (subTotal, coupon) => {
  let total = subTotal;
  const { couponAmount: discountAmount, couponType: discountType } = coupon;

  if (discountAmount && discountType) {
    if (discountType === DiscountType.PERCENTAGE) {
      total = subTotal - (subTotal * discountAmount) / 100;
    } else if (discountType === DiscountType.FIXED) {
      if (discountAmount > subTotal) {
        return total; // Ensures total doesn't go negative
      }
      total = subTotal - discountAmount;
    }
  }
  return total;
};
