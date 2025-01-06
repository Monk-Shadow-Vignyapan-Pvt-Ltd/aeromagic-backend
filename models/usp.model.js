import mongoose from "mongoose";

const uspSchema = new mongoose.Schema({
    uspName: { type: String, required: true },
    uspIcon: { type: String, required: true },
    uspUrl:{ type: String, required: true },
    userId:{
        type: mongoose.Schema.Types.ObjectId, 
          required:false
      }
    
}, { timestamps: true });

export const Usp = mongoose.model("Usp", uspSchema);
