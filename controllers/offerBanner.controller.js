import { OfferBanner } from '../models/offerBanner.model.js';

// Add a new offer banner
export const addOfferBanner = async (req, res) => {
    try {
        let { offerBannerImage, mobileImage, rank, offerEnabled, bannerUrl,userId } = req.body;

        // Validate base64 image data
        if (!offerBannerImage || !offerBannerImage.startsWith('data:image')) {
            return res.status(400).json({ message: 'Invalid offer banner image data', success: false });
        }
        if (mobileImage && !mobileImage.startsWith('data:image')) {
            return res.status(400).json({ message: 'Invalid mobile image data', success: false });
        }

        const banner = new OfferBanner({
            offerBannerImage,
            mobileImage,
            rank,
            offerEnabled,
            bannerUrl,
            userId
        });

        await banner.save();
        res.status(201).json({ banner, success: true });
    } catch (error) {
        console.error('Error uploading offer banner:', error);
        res.status(500).json({ message: 'Failed to upload offer banner', success: false });
    }
};

// Get all offer banners
export const getOfferBanners = async (req, res) => {
    try {
        const banners = await OfferBanner.find();
        if (!banners) return res.status(404).json({ message: "Offer banners not found", success: false });
        return res.status(200).json({ banners });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to fetch offer banners', success: false });
    }
};

// Get offer banner by ID
export const getOfferBannerById = async (req, res) => {
    try {
        const bannerId = req.params.id;
        const banner = await OfferBanner.findById(bannerId);
        if (!banner) return res.status(404).json({ message: "Offer banner not found!", success: false });
        return res.status(200).json({ banner, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to fetch offer banner', success: false });
    }
};

// Update offer banner by ID
export const updateOfferBanner = async (req, res) => {
    try {
        const { id } = req.params;
        let { offerBannerImage, mobileImage, rank, offerEnabled,bannerUrl, userId } = req.body;

        // Validate base64 image data if provided
        if (offerBannerImage && !offerBannerImage.startsWith('data:image')) {
            return res.status(400).json({ message: 'Invalid offer banner image data', success: false });
        }
        if (mobileImage && !mobileImage.startsWith('data:image')) {
            return res.status(400).json({ message: 'Invalid mobile image data', success: false });
        }

        const updatedData = {
            ...(offerBannerImage && { offerBannerImage }),
            ...(mobileImage && { mobileImage }),
            rank,
            offerEnabled,
            bannerUrl,
            userId
        };

        const banner = await OfferBanner.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });
        if (!banner) return res.status(404).json({ message: "Offer banner not found!", success: false });
        return res.status(200).json({ banner, success: true });
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message, success: false });
    }
};

// Delete offer banner by ID
export const deleteOfferBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const banner = await OfferBanner.findByIdAndDelete(id);
        if (!banner) return res.status(404).json({ message: "Offer banner not found!", success: false });
        return res.status(200).json({ banner, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to delete offer banner', success: false });
    }
};

// Update offer banner rank
export const updateOfferBannerRank = async (req, res) => {
    try {
        const { id, direction, newRank } = req.body;

        const banner = await OfferBanner.findById(id);
        if (!banner) {
            return res.status(404).json({ message: 'Offer banner not found', success: false });
        }

        if (direction === 'set') {
            banner.rank = newRank;
            await banner.save();
            return res.status(200).json({ message: 'Rank set successfully', success: true });
        }

        // Determine the target rank for the move
        let targetRank;
        if (direction === 'up') {
            targetRank = Number(banner.rank) - 1;
        } else if (direction === 'down') {
            targetRank = Number(banner.rank) + 1;
        }

        // Find the banner to swap ranks with
        const targetBanner = await OfferBanner.findOne({ rank: targetRank });
        if (!targetBanner) {
            return res.status(400).json({ message: 'Cannot move further in the specified direction', success: false });
        }

        // Swap ranks
        [banner.rank, targetBanner.rank] = [targetBanner.rank, banner.rank];

        await banner.save();
        await targetBanner.save();

        res.status(200).json({ message: 'Rank updated successfully', success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating rank', success: false, error: error.message });
    }
};

// Get offer banners (only _id and offerBannerImage)
export const getOfferBannerIds = async (req, res) => {
    try {
        const banners = await OfferBanner.find().select("offerBannerImage");
        if (!banners) return res.status(404).json({ message: "Offer banners not found", success: false });
        return res.status(200).json({ banners });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to fetch offer banners', success: false });
    }
};
