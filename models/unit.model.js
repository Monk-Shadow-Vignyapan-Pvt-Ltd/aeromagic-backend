import mongoose from "mongoose";

const unitSchema = new mongoose.Schema({
    unitName: { type: String, required: true },
    unitDescription: { type: String, required: false },
    userId:{
        type: mongoose.Schema.Types.ObjectId, 
          required:false
      }
    
}, { timestamps: true });

export const Unit = mongoose.model("Unit", unitSchema);
