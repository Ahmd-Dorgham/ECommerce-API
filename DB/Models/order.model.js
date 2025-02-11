import mongoose from "mongoose";
import { OrderStatus, PaymentMethods } from "../../src/Utils/enums-utils.js";
import { Product } from "./product.model.js";
import { Coupon } from "./coupon.model.js";

const { model, Schema } = mongoose;

const orderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    fromCart: {
      type: Boolean,
      default: true,
    },
    address: String,
    addressId: {
      type: Schema.Types.ObjectId,
      ref: "Address",
    },
    contactNumber: {
      type: String,
      required: true,
    },
    subTotal: {
      type: Number,
      required: true,
    },
    shippingFee: {
      type: Number,
      required: true,
    },
    VAT: {
      type: Number,
      required: true,
    },
    couponId: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
    },
    total: {
      type: Number,
      required: true,
    },
    estimatedDeliveryDate: {
      type: Date,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: Object.values(PaymentMethods),
      //orderStatus:Pending --> PayMob or stripe
      // placed:cash
    },
    orderStatus: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
    },
    deliveredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    deliveredDate: Date,
    cancelledAt: Date,
  },
  { timestamps: true }
);

orderSchema.pre("save", async function (next) {
  if (this.isNew) {
    for (const product of this.products) {
      await Product.updateOne({ _id: product.productId }, { $inc: { stock: -product.quantity } });
    }
  }
  next();
});

orderSchema.post("save", async function () {
  if (this.couponId) {
    const coupon = await Coupon.findById(this.couponId);
    const userCoupon = coupon.Users.find((u) => u.userId.toString() === this.userId.toString());

    if (userCoupon) {
      userCoupon.usageCount++;
      await coupon.save();
    }
  }
});

export const Order = mongoose.models.Order || model("Order", orderSchema);
