import mongoose from "mongoose";

const comboSchema = new mongoose.Schema({
    comboName: { type: String, required: true },
    productIds:{
        type: mongoose.Schema.Types.Mixed, 
          required:true
      },
      comboPrices: {
        type: mongoose.Schema.Types.Mixed,  // Use Mixed for flexible structure (JSON-like object)
        required: true,
    },
     userId:{
        type: mongoose.Schema.Types.ObjectId, 
          required:false
      }

}, { timestamps: true });

export const Combo = mongoose.model("Combo", comboSchema);
