import { User } from "../../DB/Models/index.js";
import { ErrorClass } from "../Utils/error-class.utils.js";
import jwt from "jsonwebtoken";

export const authentication = async (req, res, next) => {
  try {
    const { token } = req.headers;

    if (!token || !token.startsWith(`${process.env.BEARER} `)) {
      return next(new ErrorClass("Invalid token format", 400));
    }

    const actualToken = token.split(" ")[1];
    let data;
    try {
      data = jwt.verify(actualToken, process.env.LOGIN_SECRET_KEY);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return next(new ErrorClass("Token expired", 401));
      }
      return next(new ErrorClass("Invalid token", 401));
    }

    if (!data?.userId) {
      return next(new ErrorClass("Invalid token payload", 400));
    }

    const user = await User.findById(data.userId).select("id name email");
    if (!user) {
      return next(new ErrorClass("User not found", 404));
    }

    req.authUser = user;
    next();
  } catch (error) {
    return next(new ErrorClass("Authentication failed", 500));
  }
};
