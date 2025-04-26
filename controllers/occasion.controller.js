import { Occasion } from '../models/occasion.model.js';

// Add a new occasion
export const addOccasion = async (req, res) => {
    try {
        let { occasionName, occasionImage, occasionDescription, rank, userId } = req.body;

        if (!occasionImage || !occasionImage.startsWith('data:image')) {
            return res.status(400).json({ message: 'Invalid image data', success: false });
        }

        const occasion = new Occasion({
            occasionName,
            occasionImage,
            occasionDescription,
            rank,
            userId
        });

        await occasion.save();
        res.status(201).json({ occasion, success: true });
    } catch (error) {
        console.error('Error uploading occasion:', error);
        res.status(500).json({ message: 'Failed to upload occasion', success: false });
    }
};

// Get all occasions
export const getOccasions = async (req, res) => {
    try {
        const occasions = await Occasion.find();
        if (!occasions) return res.status(404).json({ message: "Occasions not found", success: false });
        return res.status(200).json({ occasions });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to fetch occasions', success: false });
    }
};

// Get occasion by ID
export const getOccasionById = async (req, res) => {
    try {
        const occasionId = req.params.id;
        const occasion = await Occasion.findById(occasionId);
        if (!occasion) return res.status(404).json({ message: "Occasion not found!", success: false });
        return res.status(200).json({ occasion, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to fetch occasion', success: false });
    }
};

// Update occasion by ID
export const updateOccasion = async (req, res) => {
    try {
        const { id } = req.params;
        let { occasionName, occasionImage, occasionDescription, rank, userId } = req.body;

        if (!occasionImage || !occasionImage.startsWith('data:image')) {
            return res.status(400).json({ message: 'Invalid image data', success: false });
        }

        const updatedData = {
            occasionName,
            occasionDescription,
            rank,
            userId,
            ...(occasionImage && { occasionImage })
        };

        const occasion = await Occasion.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });
        if (!occasion) return res.status(404).json({ message: "Occasion not found!", success: false });
        return res.status(200).json({ occasion, success: true });
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message, success: false });
    }
};

// Delete occasion by ID
export const deleteOccasion = async (req, res) => {
    try {
        const { id } = req.params;
        const occasion = await Occasion.findByIdAndDelete(id);
        if (!occasion) return res.status(404).json({ message: "Occasion not found!", success: false });
        return res.status(200).json({ occasion, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to delete occasion', success: false });
    }
};

// Update occasion rank (move up or down)
export const updateOccasionRank = async (req, res) => {
    try {
        const { id, direction,newRank } = req.body;

        const occasion = await Occasion.findById(id);
        if (!occasion) {
            return res.status(404).json({ message: 'Occasion not found', success: false });
        }

        if (direction === 'set') {
            occasion.rank = newRank;
            await occasion.save();
            return res.status(200).json({ message: 'Rank set successfully', success: true });
        }

        let targetRank = direction === 'up' ? Number(occasion.rank) - 1 : Number(occasion.rank) + 1;
        const targetOccasion = await Occasion.findOne({ rank: targetRank });

        if (!targetOccasion) {
            return res.status(400).json({ message: 'Cannot move further in the specified direction', success: false });
        }

        [occasion.rank, targetOccasion.rank] = [targetOccasion.rank, occasion.rank];

        await occasion.save();
        await targetOccasion.save();

        res.status(200).json({ message: 'Rank updated successfully', success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating rank', success: false, error: error.message });
    }
};

// Get all occasion names
export const getOccasionNames = async (req, res) => {
    try {
        const occasions = await Occasion.find().select("occasionName");
        if (!occasions) return res.status(404).json({ message: "Occasions not found", success: false });
        return res.status(200).json({ occasions });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to fetch occasion names', success: false });
    }
};
