import { DateTime } from "luxon";
import { Address, Cart, Order, Product } from "../../../DB/Models/index.js";
import { calculateCartTotal } from "../Cart/Utils/cart.utils.js";
import { applyCoupon, validateCoupon } from "./Utils/order.utils.js";
import { ApiFeatures, ErrorClass, OrderStatus, PaymentMethods } from "../../Utils/index.js";
import { createCheckoutSession, createStripeCoupon } from "../../payment-handlers/stripe.js";

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

    total = applyCoupon(subTotal, coupon) + shippingFee + VAT;
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
  cart.products = [];
  await cart.save();

  res.status(201).json({
    message: "Order created Successfully",
    order: orderObj,
  });
};

export const cancelOrder = async (req, res, next) => {
  const { orderId } = req.params;
  const userId = req.authUser._id;

  const order = await Order.findOne({
    _id: orderId,
    userId,
    orderStatus: { $in: [OrderStatus.Confirmed, OrderStatus.Placed, OrderStatus.Pending] },
  });

  if (!order) {
    return next(new ErrorClass("Order not found", 404));
  }

  const orderDate = DateTime.fromJSDate(order.createdAt);
  const currentDate = DateTime.now();
  const diff = Math.ceil(Number(currentDate.diff(orderDate, "days").toObject().days).toFixed(2));

  if (diff > 3) {
    return next(new ErrorClass("Cannot cancel order after 3 days", 400));
  }

  order.orderStatus = OrderStatus.Cancelled;
  order.cancelledAt = DateTime.now();
  order.cancelledBy = userId;
  await order.save();

  for (const product of order.products) {
    await Product.updateOne({ _id: product.productId }, { $inc: { stock: product.quantity } });
  }

  res.status(200).json({
    message: "Order cancelled successfully",
    cancelledOrder: order,
  });
};

export const deliverOrder = async (req, res, next) => {
  const userId = req.authUser._id;
  const { orderId } = req.params;

  const order = await Order.findOne({
    _id: orderId,
    userId,
    orderStatus: { $in: [OrderStatus.Confirmed, OrderStatus.Placed] },
  });
  if (!order) {
    return next(new ErrorClass("Order not found", 404));
  }

  order.orderStatus = OrderStatus.Delivered;
  order.deliveredAt = DateTime.now();

  await order.save();

  res.status(200).json({
    message: "Order delivered",
    order,
  });
};

export const listOrders = async (req, res, next) => {
  const mongooseQuery = Order.find();
  const userId = req.authUser._id;

  const query = { userId, ...req.query };

  const ApiFeaturesInstance = new ApiFeatures(mongooseQuery, query).pagination().sort().filters();

  const orders = await ApiFeaturesInstance.mongooseQuery;

  res.status(200).json({
    status: "Success",
    message: "orders Fetched Successfully",
    orders,
  });
};

export const payWithStripe = async (req, res, next) => {
  const { orderId } = req.params;
  const userId = req.authUser._id;

  const order = await Order.findOne({
    _id: orderId,
    userId,
    orderStatus: OrderStatus.Pending,
  }).populate([
    {
      path: "userId",
      select: "email _id",
    },
    {
      path: "products.productId",
      select: "title -_id",
    },
  ]);

  if (!order) {
    return next(new ErrorClass("Order not found or can't be paid", 404));
  }

  const paymentObj = {
    customer_email: order.userId.email,
    metadata: { orderId: order._id.toString() },
    discounts: [],
    line_items: order.products.map((product) => {
      return {
        price_data: {
          currency: "EGP",
          product_data: {
            name: product.productId.title,
          },
          unit_amount: product.price * 100,
        },
        quantity: product.quantity,
      };
    }),
    success_url: process.env.SUCCESS_URL,
    cancel_url: process.env.CANCEL_URL,
  };

  if (order.couponId) {
    const stripeCoupon = await createStripeCoupon({ couponId: order.couponId });
    if (stripeCoupon.status) return next(new ErrorClass(stripeCoupon.message, 400));

    paymentObj.discounts.push({ coupon: stripeCoupon.id });
  }

  const checkoutSession = await createCheckoutSession(paymentObj);

  res.status(200).json({ checkoutSession });
};
