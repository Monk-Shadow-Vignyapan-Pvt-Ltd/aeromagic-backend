import mongoose from "mongoose";

const delhiverySettingSchema = new mongoose.Schema({
    _id: { type: String, default: 'singleton' }, 
    priceAboveFree:{
        type:Number,
        required:true,
     },
    priceRangeFlat:{
        type: mongoose.Schema.Types.Mixed,
        required: false
    },
    maximumOrderQty:{
        type:Number,
        required:true,
     },
    boxSizes:{
        type: mongoose.Schema.Types.Mixed,
        required: false
    },
    
}, { timestamps: true });

export const DelhiverySetting = mongoose.model("DelhiverySetting", delhiverySettingSchema);