import { Router } from "express";
import { errorHandler } from "../../Middlewares/index.js";
import * as controllers from "./user.controllers.js";

const userRouter = Router();

userRouter.post("/signup", errorHandler(controllers.signUp));

userRouter.get("/verify/:token", errorHandler(controllers.verifyEmail));

userRouter.post("/signin", errorHandler(controllers.logIn));
export { userRouter };
