import mongoose from "../global-setup.js";

const { Schema, model } = mongoose;

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    Images: {
      secure_url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
        unique: true,
      },
    },
    customId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.post("findOneAndDelete", async function (doc, next) {
  const _id = this.getQuery()._id;
  console.log({ _id });

  const deletedSubCategories = await mongoose.models.SubCategory.deleteMany({
    categoryId: _id,
  });

  if (deletedSubCategories.deletedCount) {
    const deletedBrands = await mongoose.models.Brand.deleteMany({
      categoryId: _id,
    });

    if (deletedBrands.deletedCount) {
      await mongoose.models.Product.deleteMany({ categoryId: _id });
    }
  }

  next();
});

export const Category = mongoose.models.Category || model("Category", categorySchema);
