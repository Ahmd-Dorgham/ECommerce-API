import { Cart } from "../../../DB/Models/index.js";
import { ErrorClass } from "../../Utils/index.js";
import { checkProductStock } from "./Utils/cart.utils.js";

export const addToCart = async (req, res, next) => {
  const userId = req.authUser._id;
  const { quantity } = req.body;
  const { productId } = req.params;

  const product = await checkProductStock(productId, quantity);

  if (!product) {
    return next(new ErrorClass("Product not available", 400));
  }

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    const newCart = new Cart({
      userId,
      products: [{ productId: product._id, quantity, price: product.appliedPrice }],
      // subTotal,
    });
    await newCart.save();
    return res.status(201).json({ message: "Product added Successfully", cart: newCart });
  }

  const isProductExist = cart?.products.find((p) => p.productId == productId);

  if (isProductExist) {
    return next(new ErrorClass("Product already in Cart", 400));
  }

  cart.products.push({ productId: product._id, quantity, price: product.appliedPrice });

  await cart.save();
  res.status(200).json({ message: "Product added to cart successfully", cart });
};

export const removeFromCart = async (req, res, next) => {
  const userId = req.authUser._id;
  const { productId } = req.params;

  const cart = await Cart.findOne({ userId, "products.productId": productId });

  if (!cart) {
    return next(new ErrorClass("Product not in cart", 404));
  }

  cart.products = cart.products.filter((p) => p.productId != productId);

  await cart.save();
  res.status(200).json({ message: "Product removed from the cart" });
};

export const updateCart = async (req, res, next) => {
  const userId = req.authUser._id;
  const { productId } = req.params;
  const { quantity } = req.body;

  const cart = await Cart.findOne({ userId, "products.productId": productId });
  if (!cart) {
    return next(new ErrorClass("Product not in cart", 404));
  }

  const product = await checkProductStock(productId, quantity);
  if (!product) {
    return next(new ErrorClass("Product not available", 404));
  }

  const productIndex = cart.products.findIndex((p) => p.productId.toString() == product._id.toString());
  cart.products[productIndex].quantity = quantity;

  await cart.save();
  res.status(200).json({ message: "Cart updated", cart });
};

export const getCart = async (req, res, next) => {
  const userId = req.authUser._id;
  const cart = await Cart.findOne({ userId });

  res.status(200).json({ status: "success", data: cart });
};
