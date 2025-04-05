import mongoose from "mongoose";

const occasionSchema = new mongoose.Schema({
    occasionName: { type: String, required: true },
    occasionImage: { type: String, required: true },
    occasionDescription: { type: String, required: true },
    rank:{
        type: String, // Store image as base64 or use a URL reference
        required: true,    
      },
    userId:{
        type: mongoose.Schema.Types.ObjectId, 
          required:false
      }
    
}, { timestamps: true });

export const Occasion = mongoose.model("Occasion", occasionSchema);
