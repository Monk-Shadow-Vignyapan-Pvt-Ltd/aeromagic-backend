// models/Review.js
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  customer: {
    type: String,
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  reviewImages:{
     type: mongoose.Schema.Types.Mixed,
     required:false
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: false
  }
}, { timestamps: true });

export const Review = mongoose.model("Review", reviewSchema);
