import { Tone } from '../models/tone.model.js';

// Add a new tone
export const addTone = async (req, res) => {
    try {
        let { toneName, toneImage, toneDescription, rank,notes, userId } = req.body;
        
        // Validate base64 image data
        if (!toneImage || !toneImage.startsWith('data:image')) {
            return res.status(400).json({ message: 'Invalid image data', success: false });
        }

        // Save the tone details in MongoDB
        const tone = new Tone({
            toneName,
            toneImage,
            toneDescription,
            rank,
            notes,
            userId
        });

        await tone.save();
        res.status(201).json({ tone, success: true });
    } catch (error) {
        console.error('Error uploading tone:', error);
        res.status(500).json({ message: 'Failed to upload tone', success: false });
    }
};

// Get all tones
export const getTones = async (req, res) => {
    try {
        const tones = await Tone.find();
        if (!tones) return res.status(404).json({ message: "Tones not found", success: false });
        return res.status(200).json({ tones });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to fetch tones', success: false });
    }
};

// Get tone by ID
export const getToneById = async (req, res) => {
    try {
        const toneId = req.params.id;
        const tone = await Tone.findById(toneId).select("toneName notes");
        if (!tone) return res.status(404).json({ message: "Tone not found!", success: false });
        return res.status(200).json({ tone, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to fetch tone', success: false });
    }
};

// Update tone by ID
export const updateTone = async (req, res) => {
    try {
        const { id } = req.params;
        let { toneName, toneImage, toneDescription, rank,notes, userId } = req.body;

        // Validate base64 image data
        if (!toneImage || !toneImage.startsWith('data:image')) {
            return res.status(400).json({ message: 'Invalid image data', success: false });
        }

        const updatedData = {
            toneName,
            toneDescription,
            rank,
            notes,
            userId,
            ...(toneImage && { toneImage }) // Only update image if new image is provided
        };

        const tone = await Tone.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });
        if (!tone) return res.status(404).json({ message: "Tone not found!", success: false });
        return res.status(200).json({ tone, success: true });
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message, success: false });
    }
};

// Delete tone by ID
export const deleteTone = async (req, res) => {
    try {
        const { id } = req.params;
        const tone = await Tone.findByIdAndDelete(id);
        if (!tone) return res.status(404).json({ message: "Tone not found!", success: false });
        return res.status(200).json({ tone, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to delete tone', success: false });
    }
};

// Update tone rank
export const updateToneRank = async (req, res) => {
    try {
        const { id, direction,newRank } = req.body; // direction: 'up' or 'down'

        const tone = await Tone.findById(id);
        if (!tone) {
            return res.status(404).json({ message: 'Tone not found', success: false });
        }

        if (direction === 'set') {
            tone.rank = newRank;
            await tone.save();
            return res.status(200).json({ message: 'Rank set successfully', success: true });
        }

        let targetRank = direction === 'up' ? Number(tone.rank) - 1 : Number(tone.rank) + 1;
        const targetTone = await Tone.findOne({ rank: targetRank });

        if (!targetTone) {
            return res.status(400).json({ message: 'Cannot move further in the specified direction', success: false });
        }

        [tone.rank, targetTone.rank] = [targetTone.rank, tone.rank];

        await tone.save();
        await targetTone.save();

        res.status(200).json({ message: 'Rank updated successfully', success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating rank', success: false, error: error.message });
    }
};

// Get all tone names
export const getToneNames = async (req, res) => {
    try {
        const tones = await Tone.find().select("toneName");
        if (!tones) return res.status(404).json({ message: "Tones not found", success: false });
        return res.status(200).json({ tones });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to fetch tone names', success: false });
    }
};
