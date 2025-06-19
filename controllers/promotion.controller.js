import { Promotion } from '../models/promotion.model.js';

// Add a new promotion
export const addPromotion = async (req, res) => {
    try {
        const { title, promotionEnabled } = req.body;

        // Validate input
        if (!title || typeof promotionEnabled !== 'boolean') {
            return res.status(400).json({ 
                message: 'Title and promotionEnabled (boolean) are required', 
                success: false 
            });
        }

        const existingPromo = await Promotion.findOne({ title });
        if (existingPromo) {
            return res.status(400).json({ 
                message: "Promotion with this title already exists",
                success: false 
            });
        }

        const promotion = new Promotion({ 
            title, 
            promotionEnabled 
        });
        await promotion.save();

        res.status(201).json({ promotion, success: true });
    } catch (error) {
        console.error('Error adding promotion:', error);
        res.status(500).json({ 
            message: 'Failed to add promotion', 
            success: false 
        });
    }
};

// Get all promotions
export const getPromotions = async (req, res) => {
    try {
        const promotions = await Promotion.find().sort({ createdAt: -1 });
        if (!promotions ) {
            return res.status(404).json({ 
                message: 'No promotions found', 
                success: false 
            });
        }
        res.status(200).json({ 
            promotions, 
            success: true 
        });
    } catch (error) {
        console.error('Error fetching promotions:', error);
        res.status(500).json({ 
            message: 'Failed to fetch promotions', 
            success: false 
        });
    }
};

// Get active promotions only
export const getActivePromotions = async (req, res) => {
    try {
        const promotions = await Promotion.find({ 
            promotionEnabled: true 
        }).sort({ createdAt: -1 });
        
        res.status(200).json({ 
            promotions, 
            success: true 
        });
    } catch (error) {
        console.error('Error fetching active promotions:', error);
        res.status(500).json({ 
            message: 'Failed to fetch active promotions', 
            success: false 
        });
    }
};

// Get promotion by ID
export const getPromotionById = async (req, res) => {
    try {
        const { id } = req.params;
        const promotion = await Promotion.findById(id);

        if (!promotion) {
            return res.status(404).json({ 
                message: 'Promotion not found', 
                success: false 
            });
        }

        res.status(200).json({ 
            promotion, 
            success: true 
        });
    } catch (error) {
        console.error('Error fetching promotion by ID:', error);
        res.status(500).json({ 
            message: 'Failed to fetch promotion', 
            success: false 
        });
    }
};

// Update promotion by ID
export const updatePromotion = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, promotionEnabled } = req.body;

        if (!title || typeof promotionEnabled !== 'boolean') {
            return res.status(400).json({ 
                message: 'Title and promotionEnabled (boolean) are required', 
                success: false 
            });
        }

        const existingPromo = await Promotion.findOne({ 
            title, 
            _id: { $ne: id } 
        });
        
        if (existingPromo) {
            return res.status(400).json({ 
                message: "Another promotion with this title already exists",
                success: false 
            });
        }

        const updatedPromotion = await Promotion.findByIdAndUpdate(
            id,
            { title, promotionEnabled },
            { new: true, runValidators: true }
        );

        if (!updatedPromotion) {
            return res.status(404).json({ 
                message: 'Promotion not found', 
                success: false 
            });
        }

        res.status(200).json({ 
            promotion: updatedPromotion, 
            success: true 
        });
    } catch (error) {
        console.error('Error updating promotion:', error);
        res.status(500).json({ 
            message: 'Failed to update promotion', 
            success: false 
        });
    }
};

// Toggle promotion status
export const togglePromotionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const promotion = await Promotion.findById(id);

        if (!promotion) {
            return res.status(404).json({ 
                message: 'Promotion not found', 
                success: false 
            });
        }

        promotion.promotionEnabled = !promotion.promotionEnabled;
        await promotion.save();

        res.status(200).json({ 
            promotion, 
            success: true 
        });
    } catch (error) {
        console.error('Error toggling promotion status:', error);
        res.status(500).json({ 
            message: 'Failed to toggle promotion status', 
            success: false 
        });
    }
};

// Delete promotion by ID
export const deletePromotion = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedPromotion = await Promotion.findByIdAndDelete(id);

        if (!deletedPromotion) {
            return res.status(404).json({ 
                message: 'Promotion not found', 
                success: false 
            });
        }

        res.status(200).json({ 
            message: 'Promotion deleted successfully',
            success: true 
        });
    } catch (error) {
        console.error('Error deleting promotion:', error);
        res.status(500).json({ 
            message: 'Failed to delete promotion', 
            success: false 
        });
    }
};