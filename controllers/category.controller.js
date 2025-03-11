import { Category } from '../models/category.model.js';
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/datauri.js";
import sharp from 'sharp';

// Add a new category
export const addCategory = async (req, res) => {
    try {
        let { categoryName,categoryDescription,rank,isParent, imageBase64,others,userId } = req.body;
        // Validate base64 image data
        if (!imageBase64 || !imageBase64.startsWith('data:image')) {
            return res.status(400).json({ message: 'Invalid image data', success: false });
        }

        // Save the category details in MongoDB
        const category = new Category({
            categoryName:req.body.name,
            categoryImage: imageBase64, // Store the base64 string in MongoDB
            categoryDescription:req.body.description,
            userId:req.body.userId,
            rank,
            others,
            isParent
        });

        await category.save();
        res.status(201).json({ category, success: true });
    } catch (error) {
        console.error('Error uploading category:', error);
        res.status(500).json({ message: 'Failed to upload category', success: false });
    }
};

// Get all categories
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        if (!categories) return res.status(404).json({ message: "Categories not found", success: false });
        return res.status(200).json({ categories });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to fetch categories', success: false });
    }
};

// Get category by ID
export const getCategoryById = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const category = await Category.findById(categoryId);
        if (!category) return res.status(404).json({ message: "Category not found!", success: false });
        return res.status(200).json({ category, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to fetch category', success: false });
    }
};

// Update category by ID
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { categoryName, imageBase64,rank,isParent, categoryDescription,userId ,others} = req.body;

        // Validate base64 image data
        if (imageBase64 && !imageBase64.startsWith('data:image')) {
            return res.status(400).json({ message: 'Invalid image data', success: false });
        }

       

        const updatedData = {
            categoryName:req.body.name,
            categoryDescription:req.body.description,
            userId:req.body.userId,
            rank,
            isParent,
            others,
            ...(imageBase64 && { categoryImage: imageBase64 }) // Only update image if new image is provided
        };

        const category = await Category.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });
        if (!category) return res.status(404).json({ message: "Category not found!", success: false });
        return res.status(200).json({ category, success: true });
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message, success: false });
    }
};

// Delete category by ID
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findByIdAndDelete(id);
        if (!category) return res.status(404).json({ message: "Category not found!", success: false });
        return res.status(200).json({ category, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to delete category', success: false });
    }
};


export const updateCategoryRank = async (req, res) => {
    try {
        const { id, direction } = req.body; // direction: 'up' or 'down'

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found', success: false });
        }

        // Determine the target rank for the move
        let targetRank;
        if (direction === 'up') {
            targetRank = Number(category.rank) - 1;
        } else if (direction === 'down') {
            targetRank = Number(category.rank) + 1;
        }

        // Get the category to swap ranks with based on the target rank
        const targetCategory = await Category.findOne({ rank: targetRank });

        // Log if no category is found for the target rank
        if (!targetCategory) {
            return res.status(400).json({ message: 'Cannot move further in the specified direction', success: false });
        }

        // Swap the ranks between the two categories
        [category.rank, targetCategory.rank] = [targetCategory.rank, category.rank];

        // Save both categories with the new ranks
        await category.save();
        await targetCategory.save();

        res.status(200).json({ message: 'Rank updated successfully', success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating rank', success: false, error: error.message });
    }
};

