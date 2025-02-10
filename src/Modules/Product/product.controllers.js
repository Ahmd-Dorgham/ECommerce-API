import { nanoid } from "nanoid";
import { Product } from "../../../DB/Models/product.model.js";
import { ApiFeatures, uploadFile, ErrorClass, calculateProductPrice } from "../../Utils/index.js";

export const addProduct = async (req, res, next) => {
  const { title, overview, specs, price, discountAmount, discountType, stock } = req.body;
  const userId = req.authUser._id;
  if (!req.files.length) {
    return next(new ErrorClass("No images uploaded", 400));
  }

  const brandDocument = req.document;

  const brandCustomId = brandDocument.customId;
  const categoryCustomId = brandDocument.categoryId.customId;
  const subCategoryCustomId = brandDocument.subCategoryId.customId;
  const customId = nanoid(4);
  const folder = `${process.env.UPLOADS_FOLDER}/categories/${categoryCustomId}/SubCategories/${subCategoryCustomId}/Brands/${brandCustomId}/Products/${customId}`;

  const URLs = [];

  for (const file of req.files) {
    const { public_id, secure_url } = await uploadFile({ file: file.path, folder });
    URLs.push({ secure_url, public_id });
  }

  const productObject = {
    title,
    overview,
    specs: JSON.parse(specs),
    price,
    appliedDiscount: {
      amount: discountAmount,
      type: discountType,
    },
    stock,
    Images: {
      URLs,
      customId,
    },
    categoryId: brandDocument.categoryId._id,
    subCategoryId: brandDocument.subCategoryId._id,
    brandId: brandDocument._id,
    createdBy: userId,
  };

  const newProduct = await Product.create(productObject);

  res.status(201).json({
    message: "Product created successfully",
    data: newProduct,
  });
};

export const updateProduct = async (req, res, next) => {
  const { productId } = req.params;
  const { title, stock, overview, badge, price, discountAmount, discountType, specs } = req.body;

  const product = await Product.findById(productId);

  if (!product) {
    return next(new ErrorClass("product not found", 404));
  }

  if (title) {
    const slug = slugify(title, { replacement: "_", lower: true });
    product.title = title;
    product.slug = slug;
  }
  if (stock) {
    product.stock = stock;
  }
  if (overview) {
    product.overview = overview;
  }
  if (badge) {
    product.badge = badge;
  }
  if (price || discountAmount || discountType) {
    const newPrice = price || product.price;
    const discount = {};
    discount.amount = discountAmount || product.appliedDiscount.amount;
    discount.type = discountType || product.appliedDiscount.type;

    product.appliedPrice = calculateProductPrice(newPrice, discount);
    product.price = newPrice;
    product.appliedDiscount = discount;
  }

  if (specs) product.specs = specs;

  await product.save();

  res.status(200).json({
    message: "Product updated Successfully",
    data: product,
  });
};

export const listProducts = async (req, res, next) => {
  const populateOptions = [{ path: "Reviews", match: { reviewStatus: "accepted" } }];

  const mongooseQuery = Product.find();
  const apiFeaturesInstance = new ApiFeatures(mongooseQuery, req.query, populateOptions).pagination().filters().populate();

  const products = await apiFeaturesInstance.mongooseQuery;

  res.status(200).json({
    message: "Products List",
    data: products,
  });
};
