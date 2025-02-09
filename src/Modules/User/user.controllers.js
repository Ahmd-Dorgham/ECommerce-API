import { compareSync, hashSync } from "bcrypt";
import { Address, User } from "../../../DB/Models/index.js";
import { ErrorClass } from "../../Utils/index.js";
import jwt from "jsonwebtoken";
import { transporter } from "../../Services/send-email.service.js";

export const signUp = async (req, res, next) => {
  const {
    username,
    email,
    password,
    userType,
    age,
    gender,
    phone,
    country,
    city,
    postalCode,
    buildingNumber,
    floorNumber,
    addressLabel,
  } = req.body;

  const isEmailExist = await User.findOne({ email });
  if (isEmailExist) {
    return next(new ErrorClass("Email already Exist", 400));
  }

  //hash Password
  const hashedPass = hashSync(password, 10);

  const userInstance = new User({
    username,
    email,
    password: hashedPass,
    userType,
    age,
    gender,
    phone,
  });

  //create Address instance
  const addressInstance = new Address({
    userId: userInstance._id,
    country,
    city,
    postalCode,
    buildingNumber,
    floorNumber,
    addressLabel,
    isDefault: true,
  });
  //create token
  const token = jwt.sign({ _id: userInstance._id, email: userInstance.email }, process.env.VERIFICATION_SECRET);
  await transporter.sendMail({
    to: email,
    subject: "Verify your Email ✔",
    html: `<a href='http://localhost:3000/users/verify/${token}'>Click here to confirm your email</a>`,
  });

  const newUser = await userInstance.save();
  const newAddress = await addressInstance.save();

  res.status(201).json({ message: "User singed up Successfully", user: newUser, address: newAddress });
};

export const verifyEmail = async (req, res, next) => {
  const { token } = req.params;

  const decoded = jwt.verify(token, process.env.VERIFICATION_SECRET);

  const updatedUser = await User.findByIdAndUpdate(decoded._id, { isEmailVerified: true }, { new: true });

  if (!updatedUser) {
    return next(new ErrorClass("User not found or already verified", 404));
  }
  res.status(200).json({
    message: "Email confirmed successfully",
    user: updatedUser,
  });
};

export const logIn = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorClass("user not found", 404));
  }
  if (!user.isEmailVerified) {
    return next(new ErrorClass("Please verify your account before logging in", 400));
  }
  const isMatched = compareSync(password, user.password);
  if (!isMatched) {
    return next(new ErrorClass("Invalid credentials", 400));
  }
  const defaultAddress = await Address.findOne({ userId: user._id, isDefault: true });

  const token = jwt.sign({ userId: user._id, role: user.userType }, process.env.LOGIN_SECRET_KEY);

  res.status(200).json({ message: "Signed in Successfully", token, address: defaultAddress || null });
};
