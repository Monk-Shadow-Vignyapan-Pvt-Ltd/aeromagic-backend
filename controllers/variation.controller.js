import { Variation } from '../models/variation.model.js'; // Adjust the import to match your file structure
import sharp from 'sharp';

// Add a new variation
export const addVariation = async (req, res) => {
    try {
        const { variationName, variationIcon, variationUrl, categories, variationValues, userId } = req.body;

        // Validate base64 image data
        if ((!variationIcon || !variationIcon.startsWith('data:image')) ) {
            return res.status(400).json({ message: 'Invalid image data', success: false });
        }

        // Resize and compress the icon and URL images using sharp
        const processImage = async (imageBase64) => {
            const base64Data = imageBase64.split(';base64,').pop();
            const buffer = Buffer.from(base64Data, 'base64');
            const compressedBuffer = await sharp(buffer)
                .resize(800, 600, { fit: 'inside' }) // Resize to 800x600 max, maintaining aspect ratio
                .jpeg({ quality: 80 }) // Convert to JPEG with 80% quality
                .toBuffer();
            return `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
        };

        const processedIcon = variationIcon ? await processImage(variationIcon) : variationIcon;

        // Create and save the variation details in MongoDB
        const variation = new Variation({
            variationName,
            variationIcon: processedIcon,
            variationUrl,
            categories,
            variationValues,
            userId
        });

        await variation.save();
        res.status(201).json({ variation, success: true });
    } catch (error) {
        console.error('Error adding variation:', error);
        res.status(500).json({ message: 'Failed to add variation', success: false });
    }
};

// Get all variations
export const getVariations = async (req, res) => {
    try {
        const variations = await Variation.find();
        if (!variations) return res.status(404).json({ message: "Variations not found", success: false });
        return res.status(200).json({ variations });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to fetch variations', success: false });
    }
};

// Get variation by ID
export const getVariationById = async (req, res) => {
    try {
        const variationId = req.params.id;
        const variation = await Variation.findById(variationId);
        if (!variation) return res.status(404).json({ message: "Variation not found!", success: false });
        return res.status(200).json({ variation, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to fetch variation', success: false });
    }
};

// Update variation by ID
export const updateVariation = async (req, res) => {
    try {
        const { id } = req.params;
        const { variationName, variationIcon, variationUrl, categories, variationValues, userId } = req.body;

        // Validate base64 image data if provided
        if ((!variationIcon || !variationIcon.startsWith('data:image')) ) {
            return res.status(400).json({ message: 'Invalid image data', success: false });
        }

        // Resize and compress the icon and URL images using sharp
        const processImage = async (imageBase64) => {
            const base64Data = imageBase64.split(';base64,').pop();
            const buffer = Buffer.from(base64Data, 'base64');
            const compressedBuffer = await sharp(buffer)
                .resize(800, 600, { fit: 'inside' }) // Resize to 800x600 max, maintaining aspect ratio
                .jpeg({ quality: 80 }) // Convert to JPEG with 80% quality
                .toBuffer();
            return `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
        };

        const processedIcon = variationIcon ? await processImage(variationIcon) : variationIcon;

        const updatedData = {
            variationName,
            variationIcon: processedIcon,
            variationUrl,
            categories,
            variationValues,
            userId
        };

        const variation = await Variation.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });
        if (!variation) return res.status(404).json({ message: "Variation not found!", success: false });
        return res.status(200).json({ variation, success: true });
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message, success: false });
    }
};

// Delete variation by ID
export const deleteVariation = async (req, res) => {
    try {
        const { id } = req.params;
        const variation = await Variation.findByIdAndDelete(id);
        if (!variation) return res.status(404).json({ message: "Variation not found!", success: false });
        return res.status(200).json({ variation, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to delete variation', success: false });
    }
};
