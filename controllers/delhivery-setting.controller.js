import { DelhiverySetting } from "../models/delhivery-setting.model.js";

export const upsertDelhiverySetting = async (req, res) => {
    try {
        const { priceAboveFree, priceRangeFlat,maximumOrderQty, boxSizes } = req.body;

        if (priceAboveFree === undefined) {
            return res.status(400).json({ message: 'priceAboveFree is required', success: false });
        }

        const updatedDelhiverySetting = await DelhiverySetting.findByIdAndUpdate(
            'singleton',
            { priceAboveFree, priceRangeFlat,maximumOrderQty, boxSizes },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({ delhiverySetting: updatedDelhiverySetting, success: true });
    } catch (error) {
        console.error('Error upserting delhivery setting:', error);
        res.status(500).json({ message: 'Failed to upsert delhivery setting', success: false });
    }
};


export const getDelhiverySetting = async (req, res) => {
    try {
        const delhiverySetting = await DelhiverySetting.findOne();

        if (!delhiverySetting) {
            return res.status(404).json({ message: 'Delhivery Setting not found', success: false });
        }

        res.status(200).json({ delhiverySetting, success: true });
    } catch (error) {
        console.error('Error fetching delhiverySetting :', error);
        res.status(500).json({ message: 'Failed to fetch delhiverySetting', success: false });
    }
};