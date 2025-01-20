import slugify from "slugify";
import { ErrorClass } from "../../Utils/error-class.utils.js";
import { uploadFile } from "../../Utils/cloudinary.utils.js";
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
