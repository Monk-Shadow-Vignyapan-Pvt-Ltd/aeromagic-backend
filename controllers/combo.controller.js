import { Combo } from "../models/combo.model.js";

// Add a new Combo
export const addCombo = async (req, res) => {
    try {
        const { comboName, productIds, comboPrices, userId } = req.body;

        // Validate required fields
        if (!comboName || !productIds || !comboPrices) {
            return res.status(400).json({ message: 'Missing required fields', success: false });
        }

        // Save the Combo details in MongoDB
        const combo = new Combo({
            comboName,
            productIds,
            comboPrices,
            userId,
        });

        await combo.save();
        res.status(201).json({ combo, success: true });
    } catch (error) {
        console.error('Error adding Combo:', error);
        res.status(500).json({ message: 'Failed to add Combo', success: false });
    }
};

// Get all Combos
export const getCombos = async (req, res) => {
    try {
        const combos = await Combo.find();
        if (!combos ) {
            return res.status(404).json({ message: "No Combos found", success: false });
        }
        res.status(200).json({ combos, success: true });
    } catch (error) {
        console.error('Error fetching Combos:', error);
        res.status(500).json({ message: 'Failed to fetch Combos', success: false });
    }
};

// Get Combo by ID
export const getComboById = async (req, res) => {
    try {
        const { id } = req.params;
        const combo = await Combo.findById(id);
        if (!combo) {
            return res.status(404).json({ message: "Combo not found", success: false });
        }
        res.status(200).json({ combo, success: true });
    } catch (error) {
        console.error('Error fetching Combo by ID:', error);
        res.status(500).json({ message: 'Failed to fetch Combo', success: false });
    }
};

// Update Combo by ID
export const updateCombo = async (req, res) => {
    try {
        const { id } = req.params;
        const { comboName, productIds, comboPrices, userId } = req.body;

        // Validate required fields
        if (!comboName || !productIds || !comboPrices) {
            return res.status(400).json({ message: 'Missing required fields', success: false });
        }

        const updatedData = {
            comboName,
            productIds,
            comboPrices,
            userId,
        };

        const combo = await Combo.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });
        if (!combo) {
            return res.status(404).json({ message: "Combo not found", success: false });
        }
        res.status(200).json({ combo, success: true });
    } catch (error) {
        console.error('Error updating Combo:', error);
        res.status(400).json({ message: error.message, success: false });
    }
};

// Delete Combo by ID
export const deleteCombo = async (req, res) => {
    try {
        const { id } = req.params;
        const combo = await Combo.findByIdAndDelete(id);
        if (!combo) {
            return res.status(404).json({ message: "Combo not found", success: false });
        }
        res.status(200).json({ combo, success: true });
    } catch (error) {
        console.error('Error deleting Combo:', error);
        res.status(500).json({ message: 'Failed to delete Combo', success: false });
    }
};
