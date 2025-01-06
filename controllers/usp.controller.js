import { Usp } from '../models/usp.model.js'; // Adjust the import to match your file structure
import sharp from 'sharp';

// Add a new USP
export const addUsp = async (req, res) => {
    try {
        const { uspName, uspIcon, uspUrl, userId } = req.body;

        // Validate base64 image data
        if (!uspIcon || !uspIcon.startsWith('data:image')) {
            return res.status(400).json({ message: 'Invalid image data', success: false });
        }

        // Resize and compress the icon image using sharp
        const processImage = async (imageBase64) => {
            const base64Data = imageBase64.split(';base64,').pop();
            const buffer = Buffer.from(base64Data, 'base64');
            const compressedBuffer = await sharp(buffer)
                .resize(800, 600, { fit: 'inside' }) // Resize to 800x600 max, maintaining aspect ratio
                .jpeg({ quality: 80 }) // Convert to JPEG with 80% quality
                .toBuffer();
            return `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
        };

        const processedIcon = await processImage(uspIcon);

        // Create and save the USP details in MongoDB
        const usp = new Usp({
            uspName,
            uspIcon: processedIcon,
            uspUrl,
            userId
        });

        await usp.save();
        res.status(201).json({ usp, success: true });
    } catch (error) {
        console.error('Error adding USP:', error);
        res.status(500).json({ message: 'Failed to add USP', success: false });
    }
};

// Get all USPs
export const getUsps = async (req, res) => {
    try {
        const usps = await Usp.find();
        if (!usps) return res.status(404).json({ message: "USPs not found", success: false });
        return res.status(200).json({ usps, success: true });
    } catch (error) {
        console.log('Error fetching USPs:', error);
        res.status(500).json({ message: 'Failed to fetch USPs', success: false });
    }
};

// Get USP by ID
export const getUspById = async (req, res) => {
    try {
        const uspId = req.params.id;
        const usp = await Usp.findById(uspId);
        if (!usp) return res.status(404).json({ message: "USP not found", success: false });
        return res.status(200).json({ usp, success: true });
    } catch (error) {
        console.log('Error fetching USP by ID:', error);
        res.status(500).json({ message: 'Failed to fetch USP', success: false });
    }
};

// Update USP by ID
export const updateUsp = async (req, res) => {
    try {
        const { id } = req.params;
        const { uspName, uspIcon, uspUrl, userId } = req.body;

        // Validate base64 image data if provided
        if (uspIcon && !uspIcon.startsWith('data:image')) {
            return res.status(400).json({ message: 'Invalid image data', success: false });
        }

        // Resize and compress the icon image using sharp if provided
        const processImage = async (imageBase64) => {
            const base64Data = imageBase64.split(';base64,').pop();
            const buffer = Buffer.from(base64Data, 'base64');
            const compressedBuffer = await sharp(buffer)
                .resize(800, 600, { fit: 'inside' }) // Resize to 800x600 max, maintaining aspect ratio
                .jpeg({ quality: 80 }) // Convert to JPEG with 80% quality
                .toBuffer();
            return `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
        };

        const processedIcon = uspIcon ? await processImage(uspIcon) : uspIcon;

        const updatedData = {
            uspName,
            uspIcon: processedIcon,
            uspUrl,
            userId
        };

        const usp = await Usp.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });
        if (!usp) return res.status(404).json({ message: "USP not found", success: false });
        return res.status(200).json({ usp, success: true });
    } catch (error) {
        console.log('Error updating USP:', error);
        res.status(400).json({ message: error.message, success: false });
    }
};

// Delete USP by ID
export const deleteUsp = async (req, res) => {
    try {
        const { id } = req.params;
        const usp = await Usp.findByIdAndDelete(id);
        if (!usp) return res.status(404).json({ message: "USP not found", success: false });
        return res.status(200).json({ usp, success: true });
    } catch (error) {
        console.log('Error deleting USP:', error);
        res.status(500).json({ message: 'Failed to delete USP', success: false });
    }
};
