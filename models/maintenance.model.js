import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema({
    maintenanceEnabled:{
        type:Boolean,
        required:true,
        default: false,
     },
    
}, { timestamps: true });

export const Maintenance = mongoose.model("Maintenance", maintenanceSchema);