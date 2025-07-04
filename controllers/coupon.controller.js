import {Coupon} from '../models/coupon.model.js'; // Adjust path if needed

// Add a new coupon
export const addCoupon = async (req, res) => {
    try {
        const {
            code, type, value, minOrder,
            productIds,categoryIds, usageLimit, isActive,showOnOfferBar,usePerCustomer,
            expiresAt, buy, get
        } = req.body;

        // Check for required fields
        if (!code || !type ) {
            return res.status(400).json({ message: 'Code and type are required', success: false });
        }

        const existing = await Coupon.findOne({ code });
        if (existing) {
            return res.status(409).json({ message: 'Coupon code already exists', success: false });
        }

        const coupon = new Coupon({
            code,
            type,
            value: value || 0,
            minOrder: minOrder || 0,
            productIds,
            categoryIds,
            usageLimit,
            usePerCustomer,
            isActive,
            showOnOfferBar,
            expiresAt,
             buy, get,
             showOnSignUp:false
        });

        await coupon.save();
        res.status(201).json({ coupon, success: true });
    } catch (error) {
        console.error('Error adding coupon:', error);
        res.status(500).json({ message: 'Failed to add coupon', success: false });
    }
};

// Get all coupons
export const getCoupons = async (req, res) => {
    try {
        const { search = "" } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = 10;

        const searchFilter = {};

        if (search) {
            searchFilter.$or = [
                { code: { $regex: search, $options: "i" } },
                { type: { $regex: search, $options: "i" } },
            ];
        }

        const totalCoupons = await Coupon.countDocuments(searchFilter);
        const totalPages = Math.ceil(totalCoupons / limit) || 1;
        const currentPage = Math.min(page, totalPages);
        const skip = (currentPage - 1) * limit;

        const coupons = await Coupon.find(searchFilter)
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            coupons,
            success: true,
            pagination: {
                currentPage,
                totalPages,
                totalCoupons,
            },
        });

    } catch (error) {
        console.error('Error fetching coupons:', error);
        res.status(500).json({ message: 'Failed to fetch coupons', success: false });
    }
};


export const getFilteredCoupons = async (req, res) => {
    try {
      const coupons = await Coupon.find({ isActive: true, showOnOfferBar: true })
        .populate('categoryIds', 'categoryName') // direct array of ObjectIds
        .populate('productIds.productId', 'productName') // array of subdocs
        .populate('buy.products.productId', 'productName')
        .populate('get.products.productId', 'productName')
        .lean(); // Optional: improves performance
  
      res.status(200).json({ coupons, success: true });
    } catch (error) {
      console.error('Error fetching coupons:', error.message);
      res.status(500).json({ message: 'Failed to fetch coupons', success: false });
    }
  };
  


// Get single coupon by ID
export const getCouponById = async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await Coupon.findById(id).populate('productIds');
        if (!coupon) return res.status(404).json({ message: 'Coupon not found', success: false });
        res.status(200).json({ coupon, success: true });
    } catch (error) {
        console.error('Error fetching coupon:', error);
        res.status(500).json({ message: 'Failed to fetch coupon', success: false });
    }
};

// Update coupon
export const updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedCoupon = await Coupon.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updatedCoupon) return res.status(404).json({ message: 'Coupon not found', success: false });
        res.status(200).json({ coupon: updatedCoupon, success: true });
    } catch (error) {
        console.error('Error updating coupon:', error);
        res.status(500).json({ message: 'Failed to update coupon', success: false });
    }
};

// Update coupon usage count and track customer usage
export const updateCouponUsage = async (req, res) => {
    try {
        const { couponId, customerId } = req.body;

        if (!couponId || !customerId) {
            return res.status(400).json({ 
                message: 'Coupon ID and customer ID are required', 
                success: false 
            });
        }

        const coupon = await Coupon.findById(couponId);
        if (!coupon) {
            return res.status(404).json({ 
                message: 'Coupon not found', 
                success: false 
            });
        }

        // Check if customer has already used this coupon
        const customerUsageIndex = coupon.usedBy.findIndex(
            entry => entry.customerId.toString() === customerId
        );

        // Update usedCount
        coupon.usedCount += 1;

        // Update usedBy array
        if (customerUsageIndex >= 0) {
            // Increment existing customer's count
            coupon.usedBy[customerUsageIndex].count += 1;
        } else {
            // Add new customer entry
            coupon.usedBy.push({
                customerId,
                count: 1
            });
        }

        await coupon.save();

        res.status(200).json({ 
            message: 'Coupon usage updated successfully', 
            success: true,
            coupon 
        });

    } catch (error) {
        console.error('Error updating coupon usage:', error);
        res.status(500).json({ 
            message: 'Failed to update coupon usage', 
            success: false 
        });
    }
};

// Delete coupon
export const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCoupon = await Coupon.findByIdAndDelete(id);
        if (!deletedCoupon) return res.status(404).json({ message: 'Coupon not found', success: false });
        res.status(200).json({ coupon: deletedCoupon, success: true });
    } catch (error) {
        console.error('Error deleting coupon:', error);
        res.status(500).json({ message: 'Failed to delete coupon', success: false });
    }
};

// Validate a coupon code (use in frontend checkout)
export const validateCoupon = async (req, res) => {
    try {
        const { code, customerId, cartTotal, productIds,cartItems } = req.body;

        const coupon = await Coupon.findOne({ code, isActive: true }).populate('get.products.productId')
        .lean();
        if (!coupon) return res.status(404).json({ message: 'Invalid or expired coupon', success: false });

        let validItems = cartItems;
        let validMessage = 'Coupon applied successfully';

        // Check expiration
        if (coupon.expiresAt && new Date() > coupon.expiresAt) {
            return res.status(400).json({ message: 'Coupon has expired', success: false });
        }

        // Check usage limit
        if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ message: 'Coupon usage limit exceeded', success: false });
        }

        // Check per-customer usage limit
        if (coupon.usePerCustomer && coupon.usedBy?.length) {
            const customerUsage = coupon.usedBy.find(entry => entry.customerId.toString() === customerId);

            if (customerUsage && customerUsage.count >= coupon.usePerCustomer) {
                return res.status(400).json({
                    message: `You have already used this coupon ${coupon.usePerCustomer} time(s)`,
                    success: false
                });
            }
        }

        
        // Check cart value
        if (cartTotal < coupon.minOrder) {
            return res.status(400).json({ message: `Minimum order value is ₹${coupon.minOrder}`, success: false });
        }
        
        if (coupon.categoryIds?.length) {
            const allowedCategoryIds = coupon.categoryIds.map(id => id.toString());

            // Get valid & invalid category items
            const validCategoryItems = cartItems.filter(item =>
                allowedCategoryIds.includes(item.categoryId?.toString())
            );
            const invalidItems = cartItems.filter(item =>
                !allowedCategoryIds.includes(item.categoryId?.toString())
            );

            // Check subtotal of valid items only
            const validSubtotal = validCategoryItems.reduce((acc, item) => {
                const price = item.finalSellingPrice ?? item.price; // fallback in case finalSellingPrice not available
                return acc + price * item.quantity;
            }, 0);

            if (validCategoryItems.length === 0) {
                const invalidNames = invalidItems.map(p => p.name).join(', ');
                return res.status(400).json({
                    message: `Coupon not valid for these products: ${invalidNames}. Please remove them to apply the coupon.`,
                    success: false
                });
            }

            if (validSubtotal < coupon.minOrder) {
                return res.status(400).json({
                    message: `Eligible products total ₹${validSubtotal.toFixed(2)} does not meet the minimum order value of ₹${coupon.minOrder}`,
                    success: false
                });
            }

            validItems = validCategoryItems;

            // Notify if some products were excluded
            if (invalidItems.length) {
                const includedNames = validCategoryItems.map(p => p.name).join(', ');
                validMessage = `Coupon ${code} Applied Successfully`;
            }
        }

        // Optional productIds check
        if (coupon.productIds?.length) {
            
            const allowedProducts = coupon.productIds.map(p => ({
                productId: p.productId?.toString(),
                variationId: p.variationPrice?.id ?? null
              }));
              
              const filteredItems = validItems.filter(item => {
                const itemProductId = item.id?.toString();
                const itemHasVariation = item.hasVariations;
              
                return allowedProducts.some(p => {
                  if (itemHasVariation && p.variationId !== null) {
                    const [productId, variationIndex] = itemProductId.split('_');
                    return p.productId === productId && (p.variationId === (parseFloat(variationIndex) + 1));
                  }
                  return p.productId === itemProductId;
                });
              });
            
            if (!filteredItems.length) {
                return res.status(400).json({
                    message: 'Coupon not valid for selected products',
                    success: false
                });
            }

            const validSubtotal = filteredItems.reduce((acc, item) => {
                const price = item.finalSellingPrice ?? item.price; // fallback in case finalSellingPrice not available
                return acc + price * item.quantity;
            }, 0);

            if (validSubtotal < coupon.minOrder) {
                return res.status(400).json({
                    message: `Eligible products total ₹${validSubtotal.toFixed(2)} does not meet the minimum order value of ₹${coupon.minOrder}`,
                    success: false
                });
            }

            validItems = filteredItems;
            validMessage = `Coupon ${code} Applied Successfully`;
        }

        if (coupon.type === 'buy_x_get_y') {
            const buy = coupon.buy?.products || [];
            const cartMap = new Map(cartItems.map(item => [item.id, item.quantity]));

            const allBuyConditionsMet = buy.every(buyItem => {
                const key = buyItem.variationPrice
                    ? `${buyItem.productId}_${buyItem.variationPrice.id - 1}`
                    : buyItem.productId.toString();
                const qtyInCart = cartMap.get(key) || 0;
                return qtyInCart >= buyItem.quantity;
            });

            if (!allBuyConditionsMet) {
                return res.status(400).json({
                    message: 'Buy conditions not met for this coupon',
                    success: false
                });
            }

            // Prepare the "get" response
            const getItems = (coupon.get?.products || []).map(g => {
                const product = g.productId; // Already populated
            
                if (!product) return null;
            
                let variation = null;
            
                if (g.variationPrice?.id != null && Array.isArray(product.variationPrices)) {
                    variation = product.variationPrices.find(v => v.id === g.variationPrice.id);
                }

                const variationIndex = product.hasVariations
                    ? product.variationPrices.findIndex(
                        (v) => v.id === variation.id // or compare by size/color etc.
                        )
                    : null;
            
                return {
                    id: product.hasVariations ? `${product._id}_${variationIndex}`:product._id,
                    img: product.hasVariations && variation.images.length > 0 ? variation.images[0]:product.productImage,
                    name: product.hasVariations ? `${product.productName} - ${variation.value}` :product.productName,
                    weight: product.hasVariations ? variation.weight : product.weight,
                    hasVariations: product.hasVariations,
                    categoryId:product.categoryId,
                    variationIndex ,
                    price: product.hasVariations ? variation.price : product.price,
                    discount: g.discountPercent,
                    finalSellingPrice: product.hasVariations ? (variation.price -(variation.price * (g.discountPercent / 100))) : (product.price -(product.price * (g.discountPercent / 100))),
                    discountType: "Percentage",
                    reviews: product.reviews,
                    rating: product.rating,
                    productUrl: product.productUrl,
                    quantity:g.quantity,
                    isFreeItem: true
                };
            });

            return res.status(200).json({ 
                coupon, 
                type: 'buy_x_get_y',
                getItems,
                message:`Coupon ${code} Applied Successfully`,
                success: true 
            });
        }

        res.status(200).json({ coupon,message:validMessage, success: true });
    } catch (error) {
        console.error('Error validating coupon:', error);
        res.status(500).json({ message: 'Coupon validation failed', success: false });
    }
};

export const setCouponForSignUp = async (req, res) => {
    try {
        const { id } = req.params;

        // First, set showOnSignUp to false for all coupons
        await Coupon.updateMany({}, { $set: { showOnSignUp: false } });

        // Then, set showOnSignUp to true for the specified coupon
        const updatedCoupon = await Coupon.findByIdAndUpdate(
            id,
            { showOnSignUp: true },
            { new: true }
        );

        if (!updatedCoupon) {
            return res.status(404).json({ message: 'Coupon not found', success: false });
        }

        res.status(200).json({ message: 'Coupon set for sign up successfully', coupon: updatedCoupon, success: true });
    } catch (error) {
        console.error('Error setting sign-up coupon:', error);
        res.status(500).json({ message: 'Failed to set sign-up coupon', success: false });
    }
};

export const setCouponForSignUpFalse = async (req, res) => {
    try {
        const { id } = req.params;

        // Then, set showOnSignUp to true for the specified coupon
        const updatedCoupon = await Coupon.findByIdAndUpdate(
            id,
            { showOnSignUp: false },
            { new: true }
        );

        if (!updatedCoupon) {
            return res.status(404).json({ message: 'Coupon not found', success: false });
        }

        res.status(200).json({ message: 'Coupon set for sign up successfully', coupon: updatedCoupon, success: true });
    } catch (error) {
        console.error('Error setting sign-up coupon:', error);
        res.status(500).json({ message: 'Failed to set sign-up coupon', success: false });
    }
};
