import { Unit } from "../models/unit.model.js";

// Add a new Unit
export const addUnit = async (req, res) => {
    try {
        const { unitName, unitDescription, userId } = req.body;

        // Validate required fields
        if (!unitName) {
            return res.status(400).json({ message: 'Missing required field: unitName', success: false });
        }

        // Save the Unit details in MongoDB
        const unit = new Unit({
            unitName,
            unitDescription,
            userId
        });

        await unit.save();
        res.status(201).json({ unit, success: true });
    } catch (error) {
        console.error('Error adding Unit:', error);
        res.status(500).json({ message: 'Failed to add Unit', success: false });
    }
};

// Get all Units
export const getUnits = async (req, res) => {
    try {
        const units = await Unit.find();
        if (!units ) {
            return res.status(404).json({ message: "Units not found", success: false });
        }
        res.status(200).json({ units, success: true });
    } catch (error) {
        console.error('Error fetching Units:', error);
        res.status(500).json({ message: 'Failed to fetch Units', success: false });
    }
};

// Get Unit by ID
export const getUnitById = async (req, res) => {
    try {
        const { id } = req.params;
        const unit = await Unit.findById(id);
        if (!unit) {
            return res.status(404).json({ message: "Unit not found", success: false });
        }
        res.status(200).json({ unit, success: true });
    } catch (error) {
        console.error('Error fetching Unit by ID:', error);
        res.status(500).json({ message: 'Failed to fetch Unit', success: false });
    }
};

// Update Unit by ID
export const updateUnit = async (req, res) => {
    try {
        const { id } = req.params;
        const { unitName, unitDescription, userId } = req.body;

        // Validate required fields
        if (!unitName) {
            return res.status(400).json({ message: 'Missing required field: unitName', success: false });
        }

        const updatedData = {
            unitName,
            unitDescription,
            userId
        };

        const unit = await Unit.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });
        if (!unit) {
            return res.status(404).json({ message: "Unit not found", success: false });
        }
        res.status(200).json({ unit, success: true });
    } catch (error) {
        console.error('Error updating Unit:', error);
        res.status(400).json({ message: error.message, success: false });
    }
};

// Delete Unit by ID
export const deleteUnit = async (req, res) => {
    try {
        const { id } = req.params;
        const unit = await Unit.findByIdAndDelete(id);
        if (!unit) {
            return res.status(404).json({ message: "Unit not found", success: false });
        }
        res.status(200).json({ unit, success: true });
    } catch (error) {
        console.error('Error deleting Unit:', error);
        res.status(500).json({ message: 'Failed to delete Unit', success: false });
    }
};
