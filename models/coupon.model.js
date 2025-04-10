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
  productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  usageLimit: { type: Number, default: 0 }, // 0 means unlimited
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }],

  // Buy X Get Y Specific Fields
  buy: {
    products: [{
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, default: 1 }
    }]
  },
  get: {
    products: [{
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, default: 1 },
      discountPercent: { type: Number, default: 100 } // 100 = free
    }],
  }
}, { timestamps: true });

export const Coupon = mongoose.model('Coupon', couponSchema);
