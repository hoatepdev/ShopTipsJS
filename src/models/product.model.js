"use strict";

const { Schema, model } = require("mongoose"); // Erase if already required
const { default: slugify } = require("slugify");

const DOCUMENT_NAME = "Product";
const COLLECTION_NAME = "Products";

// Declare the Schema of the Mongo model
const productSchema = new Schema(
  {
    product_name: {
      type: String,
      require: true,
    },
    product_thumb: {
      type: String,
      require: true,
    },
    product_description: {
      type: String,
    },
    product_slug: {
      type: String,
    },
    product_price: {
      type: Number,
      required: true,
    },
    product_quantity: {
      type: Number,
      required: true,
    },
    product_type: {
      type: String,
      required: true,
      enum: ["Eletronic", "Clothing", "Furniture"],
    },
    product_shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
    },
    product_attributes: {
      type: Schema.Types.Mixed,
      require: true,
    },
    product_ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must above 1.0"],
      max: [5, "Rating must under 5.0"],
      set: (val) => Math.round(val * 10) / 10,
    },
    product_variations: {
      type: Array,
      default: [],
    },
    isDraft: {
      type: Boolean,
      default: true,
      index: true,
      select: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
      select: false,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

// Create index for search
productSchema.index({ product_name: "text", product_description: "text" });

// Document middleware: run before .save() and .create()
productSchema.pre("save", function (next) {
  this.product_slug = slugify(this.product_name, { lower: true });
  next();
});

// Defind the product type = electronic

const electronicSchema = new Schema(
  {
    manufacter: {
      type: String,
      require: true,
    },
    model: String,
    color: String,
    product_shop: { type: Schema.Types.ObjectId, ref: "Shop" },
  },
  {
    timestamps: true,
    collection: "Electronics",
  }
);

const clothingSchema = new Schema(
  {
    brand: {
      type: String,
      require: true,
    },
    size: String,
    material: String,
    product_shop: { type: Schema.Types.ObjectId, ref: "Shop" },
  },
  {
    timestamps: true,
    collection: "Clothings",
  }
);

const furnitureSchema = new Schema(
  {
    brand: {
      type: String,
      require: true,
    },
    size: String,
    material: String,
    product_shop: { type: Schema.Types.ObjectId, ref: "Shop" },
  },
  {
    timestamps: true,
    collection: "Furnitures",
  }
);

//Export the model
module.exports = {
  product: model(DOCUMENT_NAME, productSchema),
  electronic: model("Electronic", electronicSchema),
  clothing: model("Clothing", clothingSchema),
  furniture: model("Furniture", furnitureSchema),
};
