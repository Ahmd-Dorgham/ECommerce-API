import { config } from "dotenv";
import nodemailer from "nodemailer";

config();

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SENDING_EMAIL_ADDRESS,
    pass: process.env.SENDING_EMAIL_PASSWORD,
  },
});
