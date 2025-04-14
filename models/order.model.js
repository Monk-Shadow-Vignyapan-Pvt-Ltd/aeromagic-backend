import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true, // Optional for Google users
        ref: 'Customer'
    },
    orderType:{
        type: String,
        required: true
    },
    cartItems: {
        type: mongoose.Schema.Types.Mixed,
        required: false
    },
    status: {
        type: String,
        required: true
    },
}, { timestamps: true });

export const Order = mongoose.model("Order", orderSchema);
