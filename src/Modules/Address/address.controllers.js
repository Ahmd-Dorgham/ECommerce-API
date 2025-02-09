import axios from "axios";
import { ErrorClass } from "../../Utils/index.js";
import { Address, User } from "../../../DB/Models/index.js";

export const addAddress = async (req, res, next) => {
  const { country, city, postalCode, buildingNumber, floorNumber, addressLabel, setAsDefault } = req.body;
  const userId = req.authUser._id;
  //cities validation through cities apis
  const cities = await axios.get("https://api.api-ninjas.com/v1/city?country=EG&limit=30", {
    headers: {
      " X-Api-Key": process.env.CITY_API_KEY,
    },
  });
  const isCityExist = cities.data.find((c) => c.name == city);
  if (!isCityExist) {
    return next(new ErrorClass("City not found", 404));
  }
  const addressObject = new Address({
    userId,
    country,
    city,
    postalCode,
    buildingNumber,
    floorNumber,
    addressLabel,
    isDefault: [true, false].includes(setAsDefault) ? setAsDefault : false,
  });
  if (addressObject.isDefault) {
    await Address.updateOne({ userId, isDefault: true }, { isDefault: false });
  }
  const newAddress = await addressObject.save();
  res.status(201).json({
    status: "success",
    message: "Address added successfully",
    address: newAddress,
  });
};

export const editAddress = async (req, res, next) => {
  const { country, city, postalCode, buildingNumber, floorNumber, addressLabel, setAsDefault } = req.body;
  const userId = req.authUser._id;
  const { addressId } = req.params;

  const address = await Address.findById(addressId);
  if (!address) {
    return next(new ErrorClass("Address not found"));
  }
  if (country) {
    address.country = country;
  }
  if (city) address.city = city;
  if (postalCode) address.postalCode = postalCode;
  if (buildingNumber) address.buildingNumber = buildingNumber;
  if (floorNumber) address.floorNumber = floorNumber;
  if (addressLabel) address.addressLabel = addressLabel;

  if (typeof setAsDefault === "boolean" && setAsDefault !== address.isDefault) {
    if (setAsDefault == true) {
      await Address.updateMany({ userId, isDefault: true }, { isDefault: false });
    }
    address.isDefault = setAsDefault;
  }
  await address.save();
  res.status(200).json({ status: "success", message: "Address updated Successfully", data: address });
};

export const deleteAddress = async (req, res, next) => {
  const { addressId } = req.params;
  const userId = req.authUser._id;

  const address = await Address.findByIdAndUpdate(
    { userId, _id: addressId, isMarkedAsDeleted: false },
    {
      isMarkedAsDeleted: true,
      isDefault: false,
    }
  );
  if (!address) {
    return next(new ErrorClass("Address not found", 404));
  }
  res.status(200).json({
    message: "Address Deleted Successfully",
    data: address,
  });
};

export const getAddressesForUser = async (req, res, next) => {
  const userId = req.authUser._id;
  const addresses = await Address.find({ userId, isMarkedAsDeleted: false });
  res.status(200).json({ status: "success", message: "Addresses found Successfully", data: addresses });
};
