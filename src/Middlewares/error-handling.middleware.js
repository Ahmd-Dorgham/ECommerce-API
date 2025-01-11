import { ErrorClass } from "../Utils/error-class.utils.js";

export const errorHandler = (API) => {
  return (req, res, next) => {
    API(req, res, next)?.catch((err) => {
      console.log("Error in async handler scope", err);
      return next(new ErrorClass(err.message || "Internal server Error", err.status || 500, null, null));
    });
  };
};

export const globalError = (err, req, res, next) => {
  if (err) {
    res.status(err.status || 500).json({
      message: err.message || "something went wrong",
      errorData: err.data || null,
      errorLocation: err.location || null,
    });
  }
};
