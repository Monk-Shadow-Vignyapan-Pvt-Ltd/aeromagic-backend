import mongoose from "mongoose";

const ctaSchema = new mongoose.Schema({
    _id: { type: String, default: 'singleton' }, 
    ctaTitle:{
        type:String,
        required:true,
     },
    ctaImage:{
        type:String,
        required:true,
     },
    ctaDescription:{
        type: String,
        required: true
    },
    ctaUrl:{
        type:String,
        required:true,
     },
    ctaEnabled:{
        type: Boolean,
        required: true
    },
    
}, { timestamps: true });

export const Cta = mongoose.model("Cta", ctaSchema);