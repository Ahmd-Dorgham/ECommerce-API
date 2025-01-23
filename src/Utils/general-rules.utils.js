import Joi from "joi";
import mongoose from "mongoose";

const objectIdValidation = (value, helper) => {
  const isValid = mongoose.isValidObjectId(value);
  if (!isValid) {
    return helper.message("Invalid Object Id");
  }
  return value;
};

export const generalRules = {
  _id: Joi.alternatives()
    .try(
      Joi.string().custom(objectIdValidation), // Allow strings that pass the custom validation
      Joi.object().instance(mongoose.Types.ObjectId) // Allow native ObjectId instances
    )
    .messages({
      "alternatives.match": "_id must be a valid ObjectId",
    }),
};
