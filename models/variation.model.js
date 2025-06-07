import mongoose from "mongoose";

const variationSchema = new mongoose.Schema({
    variationName: { type: String, required: true },
    variationUrl: {
        type: String, // Store image as base64 or use a URL reference
        required: true,
    },
    categories: {
        type: mongoose.Schema.Types.Mixed,  // Use Mixed for flexible structure (JSON-like object)
        required: true
    },
    variationValues: {
        type: mongoose.Schema.Types.Mixed,  // Use Mixed for flexible structure (JSON-like object)
        required: false
    },
     userId:{
        type: mongoose.Schema.Types.ObjectId, 
          required:false
      }

}, { timestamps: true });

export const Variation = mongoose.model("Variation", variationSchema);
