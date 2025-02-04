import { Cart } from "../../../DB/Models/index.js";
import { ErrorClass } from "../../Utils/error-class.utils.js";
import { calculateCartTotal } from "../Cart/Utils/cart.utils.js";
import { validateCoupon } from "./Utils/order.utils.js";

export const createOrder = async (req, res, next) => {
  const userId = req.authUser._id;

  const { address, addressId, contactNumber, couponCode, shippingFee, VAT, paymentMethod } = req.body;

  const cart = await Cart.findOne({ userId }).populate("products.productId");

  if (!cart || !cart.products.length) {
    return next(new ErrorClass("Cart is empty", 400));
  }

  const isSoldOut = cart.products.find((p) => p.productId.stock < p.quantity);

  if (isSoldOut) {
    return next(new ErrorClass(`Product ${isSoldOut.productId.title} is sold out`, 400));
  }

  const subTotal = calculateCartTotal(cart.products);

  let total = subTotal + shippingFee + VAT;

  if (couponCode) {
    const isCouponValid = await validateCoupon(couponCode, userId);
    if (isCouponValid.error) {
      return next(new ErrorClass(isCouponValid.message, 400, isCouponValid.message));
    }
  }
};
