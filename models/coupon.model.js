import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  type: { 
    type: String, 
    enum: ['fixed', 'percent', 'free_shipping', 'buy_x_get_y'], 
    required: true 
  },
  value: { type: Number }, // for fixed/percent types
  minOrder: { type: Number, default: 0 },
  categoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  productIds: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    variationPrice: { type: mongoose.Schema.Types.Mixed, default: null } // optional
  }],
  usageLimit: { type: Number, default: 0 }, // 0 means unlimited
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  showOnOfferBar: { type: Boolean, default: true },
  expiresAt: { type: Date },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }],

  // Buy X Get Y Specific Fields
  buy: {
    products: [{
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, default: 1 },
      variationPrice: { type: mongoose.Schema.Types.Mixed, default: null }
    }]
  },
  get: {
    products: [{
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, default: 1 },
      discountPercent: { type: Number, default: 100 }, // 100 = free
      variationPrice: { type: mongoose.Schema.Types.Mixed, default: null }
    }],
  }
}, { timestamps: true });

export const Coupon = mongoose.model('Coupon', couponSchema);
