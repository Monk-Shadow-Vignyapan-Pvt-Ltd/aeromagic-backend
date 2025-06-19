// models/Doctor.js
import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
      },
      promotionEnabled: {
        type: Boolean,
        required: true,
      },
    
}, { timestamps: true });

export const Promotion = mongoose.model("Promotion", promotionSchema);
