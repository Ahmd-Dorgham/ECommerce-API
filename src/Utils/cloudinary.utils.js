import { v2 as cloudinary } from "cloudinary";
import { ErrorClass } from "./error-class.utils.js";

export const cloudinaryConfig = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
  });

  return cloudinary;
};

/**
 * @param {File} file
 * @param {String} folder
 * @returns {Object}
 * @description Uploads a file to cloudinary
 */

export const uploadFile = async ({ file, folder = "General", publicId }) => {
  if (!file) {
    return new ErrorClass("Please upload an image", 400);
  }

  let options = { folder };
  if (publicId) {
    options.public_id = publicId;
  }

  const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(file, options);

  return { secure_url, public_id };
};
