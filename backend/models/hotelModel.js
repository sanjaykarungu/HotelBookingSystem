import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    image_url: {
      type: String,
      required: true
    },
    image_url_1: {
      type: String,
      default: ""
    },
    image_url_2: {
      type: String,
      default: ""
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5
    },
    currency: {
      type: String,
      required:true,
      trim:true
    },
    description: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Basic indexes
hotelSchema.index({ country: 1 });
hotelSchema.index({ rating: -1 });

export const hotelModel = mongoose.model("Hotel", hotelSchema);