import { Product } from "../../../../DB/Models/index.js";

export const checkProductStock = async (productId, quantity) => {
  return await Product.findOne({ _id: productId, stock: { $gte: quantity } });
};

export const calculateCartTotal = (products) => {
  let subTotal = 0;
  products.forEach((ele) => {
    subTotal += ele.price * ele.quantity;
  });
  return subTotal;
};
