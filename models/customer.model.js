import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    wishList:{
        type: mongoose.Schema.Types.Mixed, 
        required: true 
    }
}, { timestamps: true });

export const Customer = mongoose.model("Customer", customerSchema);
