// models/Doctor.js
import mongoose from "mongoose";

const logoSchema = new mongoose.Schema({
    logoImage: {
        type: String, // Store image as base64 or use a URL reference
        required: true,
      },
    logoEnabled : {
        type: Boolean, // Store image as base64 or use a URL reference
        required: true,
        default: false
    },
    userId:{
      type: mongoose.Schema.Types.ObjectId, 
        required:false
    }
    
}, { timestamps: true });

export const Logo = mongoose.model("Logo", logoSchema);
