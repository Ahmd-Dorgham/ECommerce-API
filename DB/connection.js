import mongoose from "mongoose";

const db_connection = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/ECommerce-API");
    console.log("Database connected Successfully");
  } catch (error) {
    console.log("Error in DB connection", error.message);
  }
};

export default db_connection;
