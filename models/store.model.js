// models/Doctor.js
import mongoose from "mongoose";

const storeSchema = new mongoose.Schema({
    storeTitle: {
        type: String,
        required: true,
      },
      storeManager: {
        type: String,
        required: false,
      },
      mapUrl: {
        type: String,
        required: true,
      },
      embedMapUrl: {
        type: String,
        required: true,
      },
      storeAddress: {
        type: String,
        required: false,
      },
      storeContactNo: {
        type: String,
        required: false,
      },
      storeImage: {
        type: String,
        required: true,
      },
      multiImages: {
        type:mongoose.Schema.Types.Mixed,
        required: false,
      },
      storeUrl: {
        type: String,
        unique: true,
        required: true,
      },
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
             schema: {
            type: String, // Store image as base64 or use a URL reference
            required: false,
          },
    
}, { timestamps: true });

export const Store = mongoose.model("Store", storeSchema);
