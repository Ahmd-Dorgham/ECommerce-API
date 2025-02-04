import { DateTime } from "luxon";
import { Address, Cart, Order } from "../../../DB/Models/index.js";
import { OrderStatus, PaymentMethods } from "../../Utils/enums-utils.js";
import { ErrorClass } from "../../Utils/error-class.utils.js";
import { calculateCartTotal } from "../Cart/Utils/cart.utils.js";
import { applyCoupon, validateCoupon } from "./Utils/order.utils.js";

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

  let coupon = null;

  if (couponCode) {
    const isCouponValid = await validateCoupon(couponCode, userId);
    if (isCouponValid.error) {
      return next(new ErrorClass(isCouponValid.message, 400, isCouponValid.message));
    }
    coupon = isCouponValid.coupon;

    console.log(`total before ${total}`);
    total = applyCoupon(subTotal, coupon) + shippingFee + VAT;
    console.log(`total after ${total}`);
  }

  if (!address && !addressId) {
    return next(new ErrorClass("Address is required", 400, "Address is required"));
  }

  if (addressId) {
    const addressInfo = await Address.findOne({ _id: addressId, userId });
    if (!addressInfo) {
      return next(new ErrorClass("Invalid address", 400, "Invalid address"));
    }
  }

  let orderStatus = OrderStatus.Pending;
  if (paymentMethod === PaymentMethods.Cash) {
    orderStatus = OrderStatus.Placed;
  }

  const orderObj = new Order({
    userId,
    products: cart.products,
    address,
    addressId,
    contactNumber,
    subTotal,
    shippingFee,
    VAT,
    couponId: coupon?._id,
    total,
    paymentMethod,
    orderStatus,
    estimatedDeliveryDate: DateTime.now().plus({ days: 7 }).toFormat("yyy-MM-dd"),
  });

  await orderObj.save();

  //clear the cart
  //decrement the stock of the product
  //increment the usage count of coupon

  res.status(201).json({
    message: "Order created Successfully",
    order: orderObj,
  });
};
