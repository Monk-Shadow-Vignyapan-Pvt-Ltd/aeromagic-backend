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
    prepaidDiscount: {
        type: Number,       
        required: false
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
    codCharge:{
         type: Number,
        required: false
    },
    finalTotal: {
        type: Number,
        required: true
    },
    giftPacking:{
        type: Boolean,
        required: false
    },
    removePriceFromInvoice:{
        type: Boolean,
        required: false
    },
    addGiftMessage:{
        type: Boolean,
        required: false
    },
    giftMessage:{
        type: String,
        required: false
    },
    selloShipOrderId:{
        type: String,
        required: false
    },
    selloShipAWB:{
        type: String,
        required: false
    },
    shippingLabel:{
        type: mongoose.Schema.Types.Mixed,
        required: false 
    },
    shipRocketOrderId:{
        type: mongoose.Schema.Types.Mixed,
        required: false 
    },
    courierName:{
        type: String,
        required: false
    },
    returnItems:{
        type: mongoose.Schema.Types.Mixed,
        required: false 
    },
}, { timestamps: true });

export const Order = mongoose.model("Order", orderSchema);
