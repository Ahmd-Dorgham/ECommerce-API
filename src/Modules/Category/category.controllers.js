import slugify from "slugify";
import { ErrorClass } from "../../Utils/error-class.utils.js";
import { cloudinaryConfig, uploadFile } from "../../Utils/cloudinary.utils.js";
import { nanoid } from "nanoid";
import { Category } from "../../../DB/Models/category.model.js";

export const createCategory = async (req, res, next) => {
  const { name } = req.body;
  const userId = req.authUser._id;
  const slug = slugify(name, {
    replacement: "_",
    lower: true,
  });

  if (!req.file) {
    return next(new ErrorClass("Please upload an Image", 400));
  }
  const customId = nanoid(4);
  const folder = `${process.env.UPLOADS_FOLDER}/Categories/${customId}`;

  const { secure_url, public_id } = await uploadFile({ file: req.file.path, folder });
  const category = {
    name,
    slug,
    createdBy: userId,
    Images: {
      secure_url,
      public_id,
    },
    customId,
  };
  const newCategory = await Category.create(category);

  res.status(201).json({
    message: "Category created Successfully",
    data: newCategory,
  });
};

export const getCategory = async (req, res, next) => {
  const { name, id, slug } = req.query;

  const queryFilter = {};

  if (name) queryFilter.name = name;
  if (id) queryFilter._id = id;
  if (slug) queryFilter.slug = slug;

  const category = await Category.findOne(queryFilter);

  if (!category) {
    return next(new ErrorClass("Category not found", 404));
  }

  res.status(200).json({ message: "Category found successfully", data: category });
};

export const updateCategory = async (req, res, next) => {
  const { _id } = req.params;
  const category = await Category.findById(_id);

  if (!category) {
    return next(new ErrorClass("Category not found", 404));
  }

  const { name } = req.body;
  if (name) {
    const slug = slugify(name, {
      replacement: "_",
      lower: true,
    });
    category.name = name;
    category.slug = slug;
  }

  if (req.file) {
    const splittedPublicId = category.Images.public_id.split(`/${category.customId}/`)[1];
    const { secure_url } = await uploadFile({
      file: req.file.path,
      folder: `${process.env.UPLOADS_FOLDER}/Categories/${category.customId}`,
      publicId: splittedPublicId,
    });
    category.secure_url = secure_url;
  }
  await category.save();

  res.status(200).json({
    message: "Category updated Successfully",
    data: category,
  });
};

export const deleteCategory = async (req, res, next) => {
  const { _id } = req.params;
  const category = await Category.findByIdAndDelete(_id);
  if (!category) {
    return next(new ErrorClass("category not found", 404));
  }
  const categoryPath = `${process.env.UPLOADS_FOLDER}/Categories/${category?.customId}`;

  //
  await cloudinaryConfig().api.delete_resources_by_prefix(categoryPath);
  await cloudinaryConfig().api.delete_folder(categoryPath);
  //
  res.status(200).json({
    status: "success",
    message: "category deleted successfully",
  });
};
