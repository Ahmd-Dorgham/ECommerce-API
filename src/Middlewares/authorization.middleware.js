import { ErrorClass } from "../Utils/error-class.utils.js";

export const authorization = (allowedRoles) => {
  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
    return next(new ErrorClass("Invalid or missing allowedRoles Array", 400));
  }

  return (req, res, next) => {
    const { role } = req.authUser;

    if (!role) {
      return next(new ErrorClass("User role not found", 403));
    }

    if (!allowedRoles.includes(role)) {
      return next(new ErrorClass("Unauthorized : You do not have access to this resource", 401));
    }
    next();
  };
};
