import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true, // Optional for Google users
        ref: 'Customer'
    },
    orderId:{
        type: String,
        required: true,
        unique:true,
        immutable: true
    },
    orderType:{
        type: String,
        required: true
    },
    shippingAddress:{
        type: mongoose.Schema.Types.Mixed,
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
    subtotal: {
        type: Number,
        required: true
    }, 
    totalDiscount: {
        type: Number,
        required: true
    }, 
    couponDiscount: {
        type: Number,
        required: false
    }, 
    shippingCharge: {
        type: Number,
        required: false
    }, 
    finalTotal: {
        type: Number,
        required: true
    },
}, { timestamps: true });

export const Order = mongoose.model("Order", orderSchema);
