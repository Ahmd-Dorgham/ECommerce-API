import slugify from "slugify";
import { SubCategory } from "../../../DB/Models/sub-category.model.js";
import { cloudinaryConfig, uploadFile } from "../../Utils/cloudinary.utils.js";
import { ErrorClass } from "../../Utils/error-class.utils.js";
import { nanoid } from "nanoid";
import { Brand } from "../../../DB/Models/brand.model.js";

export const createBrand = async (req, res, next) => {
  const { category, subCategory } = req.query;
  const userId = req.authUser._id;

  const isSubCategoryExists = await SubCategory.findOne({
    _id: subCategory,
    categoryId: category,
  }).populate("categoryId");

  if (!isSubCategoryExists) {
    return next(new ErrorClass("subCategory not found", 404));
  }

  const { name } = req.body;
  const slug = slugify(name, { replacement: "_", lower: true });

  if (!req.file) {
    return next(new ErrorClass("please upload an image", 400));
  }
  const customId = nanoid(4);
  const { secure_url, public_id } = await uploadFile({
    file: req.file.path,
    folder: `${process.env.UPLOADS_FOLDER}/categories/${isSubCategoryExists.categoryId.customId}/SubCategories/${isSubCategoryExists.customId}/Brands/${customId}`,
  });

  const brandObj = {
    name,
    slug,
    logo: {
      public_id,
      secure_url,
    },
    customId,
    createdBy: userId,
    categoryId: isSubCategoryExists.categoryId._id,
    subCategoryId: isSubCategoryExists._id,
  };
  const newBrand = await Brand.create(brandObj);
  res.status(201).json({
    message: "Brand created Successfully",
    data: newBrand,
  });
};

export const getBrand = async (req, res, next) => {
  const { id, name, slug } = req.query;
  const queryFilter = {};

  if (name) queryFilter.name = name;
  if (slug) queryFilter.slug = slug;
  if (id) queryFilter._id = id;

  const brand = await Brand.findOne(queryFilter);

  if (!brand) {
    return next(new ErrorClass("Brand not found", 404));
  }
  res.status(200).json({
    status: "success",
    message: "Brand found successfully",
    data: brand,
  });
};

export const updateBrand = async (req, res, next) => {
  const { _id } = req.params;
  const { name } = req.body;

  const brand = await Brand.findById(_id).populate("categoryId").populate("subCategoryId");
  if (!brand) {
    return next(new ErrorClass("brand not found", 404));
  }
  if (name) {
    const slug = slugify(name, {
      replacement: "_",
      lower: true,
    });
    brand.name = name;
    brand.slug = slug;
  }
  if (req.file) {
    const splittedPublicId = brand.logo.public_id.split(`${brand.customId}/`)[1];

    const { secure_url } = await uploadFile({
      file: req.file.path,
      folder: `${process.env.UPLOADS_FOLDER}/categories/${brand.categoryId.customId}/SubCategories/${brand.subCategoryId.customId}/Brands/${brand.customId}`,
      publicId: splittedPublicId,
    });
    brand.logo.secure_url = secure_url;
  }

  await brand.save();

  res.status(200).json({
    status: "success",
    message: "Brand updated successfully",
    data: brand,
  });
};

export const deleteBrand = async (req, res, next) => {
  const { _id } = req.params;

  const brand = await Brand.findByIdAndDelete(_id).populate("categoryId").populate("subCategoryId");

  if (!brand) {
    return next(new ErrorClass("Brand not found", 404));
  }

  const brandPath = `${process.env.UPLOADS_FOLDER}/categories/${brand.categoryId.customId}/SubCategories/${brand.subCategoryId.customId}/Brands/${brand.customId}`;

  await cloudinaryConfig().api.delete_resources_by_prefix(brandPath);
  await cloudinaryConfig().api.delete_folder(brandPath);

  //TODO: Delete related products (if necessary)

  res.status(200).json({
    status: "success",
    message: "brand deleted successfully",
  });
};
