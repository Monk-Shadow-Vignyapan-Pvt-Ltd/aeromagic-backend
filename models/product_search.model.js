import mongoose from "mongoose";

const productSearchSchema = new mongoose.Schema({
    ranking:{
       type: mongoose.Schema.Types.Mixed,  // Use Mixed for flexible structure (JSON-like object)
               required: true
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId, 
          required:false
      }
    
}, { timestamps: true });

export const ProductSearch = mongoose.model("ProductSearch", productSearchSchema);
