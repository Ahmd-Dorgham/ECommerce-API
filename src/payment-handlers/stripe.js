import Stripe from "stripe";

export const createCheckoutSession = async ({ customer_email, metadata, discounts, lineItems }) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const paymentData = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email,
    metadata, //optional
    success_url: process.env.SUCCESS_URL,
    cancel_url: process.env.CANCEL_URL,
    discounts,
    lineItems,
  });

  return paymentData;
};

export const createStripeCoupon = async ({ couponId }) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const coupon = await Coupon.findById(couponId);
  if (!coupon) return next(new ErrorClass("coupon not found", 404));

  let couponObject = {};

  if (coupon.couponType === CouponType.FIXED) {
    couponObject = {
      name: coupon.couponCode,
      amount_off: coupon.couponAmount * 100,
      currency: "EGP",
    };
  } else if (coupon.couponType === CouponType.PERCENTAGE) {
    couponObject = {
      name: coupon.couponCode,
      percent_off: coupon.couponAmount,
    };
  }

  const stripeCoupon = await stripe.coupons.create(couponObject);

  return stripeCoupon;
};
