import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: false, // Optional for Google users
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: Number,
        required: function() { return this.authType === 'local'; } // Required only for local users
    },
    password: {
        type: String,
        required: function() { return this.authType === 'local'; } // Required only for local users
    },
    image: {
        type: String, // Google profile image
        required: false
    },
    authType: {
        type: String,
        enum: ["local", "social"], // "local" for manual login, "social" for Google login
        required: true
    },
    otherAddress: {
        type: mongoose.Schema.Types.Mixed,
        required: false
    },
    wishList: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
}, { timestamps: true });

export const Customer = mongoose.model("Customer", customerSchema);
