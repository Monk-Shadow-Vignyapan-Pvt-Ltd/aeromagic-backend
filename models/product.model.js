import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    productImage: {
        type: String, // Store image as base64 or use a URL reference
        required: true,
    },
    imageAlt:{
        type: String, // Store image as base64 or use a URL reference
        required: false,
    },
    gender: { type: String, required: true },
    weight: { type: Number, required: false },
    shortDescription: { type: String, required: true },
    longDescription: { type: String, required: false },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,  // Use Mixed for flexible structure (JSON-like object)
        required: true
    },
    multiImages: {
        type: mongoose.Schema.Types.Mixed,  // Use Mixed for flexible structure (JSON-like object)
        required: false
    },
    hasVariations : {
        type: Boolean,  
        required: true,
    },
    inStock:{
      type: Boolean,  
      required: false,
    },
    showOnHome:{
      type: Boolean,  
      required: false,
    },
    price: {
        type: Number,
        required: function () {
          return !this.hasVariations;
        },
      },
      discount: {
        type: Number,
        required: function () {
          return !this.hasVariations;
        },
      },
      discountType:{
        type: String,
        required: true,
      },
      finalSellingPrice: {
        type: Number,
        required: function () {
          return !this.hasVariations;
        },
      },
      variationId: {
        type: mongoose.Schema.Types.ObjectId,
        required: function () {
            return this.hasVariations;
          },
    },
    variationPrices: {
        type: mongoose.Schema.Types.Mixed,  // Use Mixed for flexible structure (JSON-like object)
        required: function () {
            return this.hasVariations;
          },
    },
    uspIds:{
      type: mongoose.Schema.Types.Mixed, 
        required:false
    },
    occasions:{
      type: mongoose.Schema.Types.Mixed, 
        required:false
    },
    caution:{
      type: String,
      required: false,
    },
     userId:{
        type: mongoose.Schema.Types.ObjectId, 
          required:false
      },
      productUrl: { type: String, required: true ,unique: true },
     oldUrls: {
        type: mongoose.Schema.Types.Mixed,  // Use Mixed for flexible structure (JSON-like object)
        required: false
    },
     seoTitle:{
        type: String,
        required: false,
      },
     seoDescription: {
        type: String,
        required: false,
      },

}, { timestamps: true });

export const Product = mongoose.model("Product", productSchema);
