import { Cta } from "../models/cta.model.js";

export const upsertCta = async (req, res) => {
    try {
        const { ctaTitle, ctaImage, ctaDescription, ctaUrl, ctaEnabled } = req.body;

        if (!ctaTitle || !ctaImage || !ctaDescription || !ctaUrl || ctaEnabled === undefined) {
            return res.status(400).json({ message: 'All CTA fields are required', success: false });
        }

        const updatedCta = await Cta.findByIdAndUpdate(
            'singleton',
            { ctaTitle, ctaImage, ctaDescription, ctaUrl, ctaEnabled },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({ cta: updatedCta, success: true });
    } catch (error) {
        console.error('Error upserting CTA:', error);
        res.status(500).json({ message: 'Failed to upsert CTA', success: false });
    }
};

export const getCta = async (req, res) => {
    try {
        const cta = await Cta.findOne();

        if (!cta) {
            return res.status(404).json({ message: 'CTA not found', success: false });
        }

        res.status(200).json({ cta, success: true });
    } catch (error) {
        console.error('Error fetching CTA:', error);
        res.status(500).json({ message: 'Failed to fetch CTA', success: false });
    }
};
