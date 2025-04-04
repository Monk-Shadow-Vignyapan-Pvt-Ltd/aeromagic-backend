import mongoose from "mongoose";

const toneSchema = new mongoose.Schema({
    toneName: { type: String, required: true },
    toneImage: { type: String, required: true },
    toneDescription: { type: String, required: true },
    rank:{
        type: String, // Store image as base64 or use a URL reference
        required: true,    
      },
    userId:{
        type: mongoose.Schema.Types.ObjectId, 
          required:false
      }
    
}, { timestamps: true });

export const Tone = mongoose.model("Tone", toneSchema);
