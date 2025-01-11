import { hashSync } from "bcrypt";
import { Address, User } from "../../../DB/Models/index.js";
import { ErrorClass } from "../../Utils/error-class.utils.js";
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
