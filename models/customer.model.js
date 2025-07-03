import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: false,
        unique: true, // still enforces uniqueness of non-null values
        sparse: true  // allows multiple documents without email
    },
    phoneNumber: {
        type: Number,
        required: function() { return this.authType === 'local'; }
    },
    password: {
        type: String,
        required: function() { return this.authType === 'local'; }
    },
    image: {
        type: String,
        required: false
    },
    authType: {
        type: String,
        enum: ["local", "social"],
        required: true
    },
    otherAddress: {
        type: mongoose.Schema.Types.Mixed,
        required: false
    },
    wishList: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
}, { timestamps: true });

export const Customer = mongoose.model("Customer", customerSchema);
