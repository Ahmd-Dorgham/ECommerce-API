import multer from "multer";
import fs from "fs";
import path from "path";
import { DateTime } from "luxon";
import { nanoid } from "nanoid";
import { extensions } from "../Utils/file-extensions.utils.js";
import { ErrorClass } from "../Utils/error-class.utils.js";

//upload from my device to the local
export const multerMiddleware = ({ filePath = "general", allowedExtensions = extensions.Images }) => {
  const destinationPath = path.resolve(`src/uploads/${filePath}`);
  // check if the folder exists
  if (!fs.existsSync(destinationPath)) {
    fs.mkdirSync(destinationPath, { recursive: true });
  }
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, destinationPath);
    },
    filename: (req, file, cb) => {
      // 2024-12-12
      const now = DateTime.now().toFormat("yyyy-MM-dd");
      const uniqueString = nanoid(4);
      const uniqueFileName = `${now}_${uniqueString}_${file.originalname}`;
      cb(null, uniqueFileName);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (allowedExtensions.includes(file.mimetype)) {
      return cb(null, true);
    }

    cb(new ErrorClass(`Invalid file type, only ${allowedExtensions} images are allowed`, 400), false);
  };

  return multer({ fileFilter, storage });
};

//upload from my device in order to know the path
export const multerHost = ({ allowedExtensions = extensions.Images }) => {
  const storage = multer.diskStorage({});

  const fileFilter = (req, file, cb) => {
    if (allowedExtensions.includes(file.mimetype)) {
      return cb(null, true);
    }

    cb(new ErrorClass(`Invalid file type, only ${allowedExtensions} images are allowed`, 400), false);
  };

  return multer({ fileFilter, storage });
};
