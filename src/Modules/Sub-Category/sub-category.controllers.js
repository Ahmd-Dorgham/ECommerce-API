import { nanoid } from "nanoid";
import { ErrorClass } from "../../Utils/error-class.utils.js";
import { cloudinaryConfig, uploadFile } from "../../Utils/cloudinary.utils.js";
import { Category, SubCategory } from "../../../DB/Models/index.js";
import slugify from "slugify";

export const createSubCategory = async (req, res, next) => {
  const { categoryId } = req.query;
  const userId = req.authUser._id;

  const category = await Category.findById(categoryId);
  if (!category) {
    return next(new ErrorClass("category not found", 404));
  }

  const { name } = req.body;
  const slug = slugify(name, {
    replacement: "_",
    lower: true,
  });

  if (!req.file) {
    return next(new ErrorClass("'please upload an image", 400));
  }

  const customId = nanoid(4);
  const { public_id, secure_url } = await uploadFile({
    file: req.file.path,
    folder: `${process.env.UPLOADS_FOLDER}/Categories/${category.customId}/Subcategories/${customId}`,
  });

  const subCategoryObj = {
    name,
    slug,
    createdBy: userId,
    Images: {
      secure_url,
      public_id,
    },
    customId,
    categoryId: category._id,
  };

  const newSubCategory = await SubCategory.create(subCategoryObj);

  res.status(201).json({
    status: "success",
    message: "subCategory created Successfully",
    data: newSubCategory,
  });
};

export const getSubCategory = async (req, res, next) => {
  const { id, name, slug } = req.query;

  const queryFilter = {};

  if (id) queryFilter._id = id;
  if (name) queryFilter.name = name;
  if (slug) queryFilter.slug = slug;

  const subCategory = await SubCategory.findOne(queryFilter);
  if (!subCategory) {
    return next(new ErrorClass("subCategory not found", 404));
  }

  res.status(200).json({
    message: "subCategory found Successfully",
    data: subCategory,
  });
};

export const updateSubCategory = async (req, res, next) => {
  const { _id } = req.params;

  const subCategory = await SubCategory.findById(_id).populate("categoryId");
  if (!subCategory) {
    return next(new ErrorClass("subCategory not found", 404));
  }

  const { name } = req.body;
  if (name) {
    const slug = slugify(name, {
      replacement: "_",
      lower: true,
    });
    subCategory.name = name;
    subCategory.slug = slug;
  }

  if (req.file) {
    const splittedPublicId = subCategory.Images.public_id.split(`${subCategory.customId}/`)[1];

    const { secure_url } = await uploadFile({
      file: req.file.path,
      folder: `${process.env.UPLOADS_FOLDER}/categories/${subCategory.categoryId.customId}/SubCategories/${subCategory.customId}`,
      publicId: splittedPublicId,
    });
    subCategory.Images.secure_url = secure_url;
  }
  await subCategory.save();

  res.status(200).json({
    message: "subCategory updated successfully",
    data: subCategory,
  });
};

export const deleteSubCategory = async (req, res, next) => {
  const { _id } = req.params;

  const subCategory = await SubCategory.findByIdAndDelete(_id).populate("categoryId");

  if (!subCategory) {
    return next(new ErrorClass("SubCategory not found", 404, "SubCategory not found"));
  }

  const subCategoryPath = `${process.env.UPLOADS_FOLDER}/Categories/${subCategory.categoryId.customId}/SubCategories/${subCategory.customId}`;

  await cloudinaryConfig().api.delete_resources_by_prefix(subCategoryPath);
  await cloudinaryConfig().api.delete_folder(subCategoryPath);

  //TODO: Delete related brands (if necessary)
  //   await Brand.deleteMany({ subCategoryId: subCategory._id });

  res.status(200).json({
    status: "success",
    message: "SubCategory deleted successfully",
  });
};
