import { Order, Product } from "../../../DB/Models/index.js";
import { Review } from "../../../DB/Models/index.js";
import { ErrorClass, OrderStatus, ReviewStatus } from "../../Utils/index.js";

export const addReview = async (req, res, next) => {
  const { productId, rate, body } = req.body;

  const isAlreadyReviewed = await Review.findOne({
    userId: req.authUser._id,
    productId,
  });

  if (isAlreadyReviewed) {
    return next(new ErrorClass("You have already reviewed this product", 400));
  }

  const product = await Product.findById(productId);

  if (!product) {
    return next(new ErrorClass("Product not found", 404));
  }

  const isBought = await Order.findOne({
    userId: req.authUser._id,
    "products.productId": productId,
    orderStatus: OrderStatus.Delivered,
  });

  if (!isBought) {
    return next(new ErrorClass("You must but this product first", 400));
  }

  const review = {
    userId: req.authUser._id,
    productId,
    reviewRating: rate,
    reviewBody: body,
  };

  const newReview = await Review.create(review);

  res.status(201).json({
    message: "Review create successfully",
    data: newReview,
  });
};

export const listReviews = async (req, res, next) => {
  const reviews = await Review.find().populate([
    {
      path: "userId",
      select: "username email -_id",
    },
    {
      path: "productId",
      select: "title rating",
    },
  ]);

  res.status(200).json({
    allReviews: reviews,
  });
};
export const approveOrRejectReview = async (req, res, next) => {
  const { reviewId } = req.params;
  const { accept, reject } = req.body;

  if (accept && reject) {
    return next(new ErrorClass("Please select accept or reject", 400));
  }

  const review = await Review.findByIdAndUpdate(
    reviewId,
    {
      reviewStatus: accept ? ReviewStatus.Accepted : reject ? ReviewStatus.Rejected : ReviewStatus.Pending,
    },
    { new: true }
  );

  const statusMessage = accept
    ? "Review approved successfully."
    : reject
    ? "Review rejected successfully."
    : "Review status updated to pending.";

  res.status(200).json({ message: statusMessage, review });
};
