import { ErrorClass } from "../Utils/error-class.utils.js";

const reqKeys = ["body", "query", "params", "headers", "authUser"];

export const validationMiddleware = (schema) => {
  return (req, res, next) => {
    const validationErrors = [];

    for (const key of reqKeys) {
      const validationResult = schema[key]?.validate(req[key], {
        abortEarly: false,
      });

      if (validationResult?.error) {
        validationErrors.push(...validationResult?.error?.details);
      }
    }
    validationErrors.length ? next(new ErrorClass("Validation Error", 400, validationErrors)) : next();
  };
};
