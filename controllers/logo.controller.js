import { Logo } from "../models/Doctor.js"; 

// Add a new Logo
export const addLogo = async (req, res) => {
    try {
        const { logoImage, logoEnabled, userId } = req.body;

        // Validate required fields
        if (!logoImage) {
            return res.status(400).json({ message: 'Logo image is required', success: false });
        }

        // Save the logo details in MongoDB
        const logo = new Logo({
            logoImage,
            logoEnabled,
            userId
        });

        await logo.save();
        res.status(201).json({ logo, success: true });
    } catch (error) {
        console.error('Error uploading logo:', error);
        res.status(500).json({ message: 'Failed to upload logo', success: false });
    }
};

// Get all Logos
export const getLogos = async (req, res) => {
    try {
        const logos = await Logo.find();
        if (!logos ) return res.status(404).json({ message: "No logos found", success: false });
        return res.status(200).json({ logos, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to fetch logos', success: false });
    }
};

// Get Logo by ID
export const getLogoById = async (req, res) => {
    try {
        const { id } = req.params;
        const logo = await Logo.findById(id);
        if (!logo) return res.status(404).json({ message: "Logo not found!", success: false });
        return res.status(200).json({ logo, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to fetch logo', success: false });
    }
};

// Update Logo by ID
export const updateLogo = async (req, res) => {
    try {
        const { id } = req.params;
        const { logoImage, logoEnabled, userId } = req.body;

        // Validate required fields
        if (!logoImage) {
            return res.status(400).json({ message: 'Logo image is required', success: false });
        }

        const updatedData = {
            logoImage,
            logoEnabled,
            userId
        };

        const logo = await Logo.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });
        if (!logo) return res.status(404).json({ message: "Logo not found!", success: false });
        return res.status(200).json({ logo, success: true });
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message, success: false });
    }
};

// Delete Logo by ID
export const deleteLogo = async (req, res) => {
    try {
        const { id } = req.params;
        const logo = await Logo.findByIdAndDelete(id);
        if (!logo) return res.status(404).json({ message: "Logo not found!", success: false });
        return res.status(200).json({ message: "Logo deleted successfully", success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to delete logo', success: false });
    }
};
