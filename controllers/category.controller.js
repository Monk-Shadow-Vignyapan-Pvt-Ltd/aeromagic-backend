import { Category } from '../models/category.model.js';
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/datauri.js";
import sharp from 'sharp';
import crc32 from "crc-32";

// Add a new category
export const addCategory = async (req, res) => {
    try {
        let { categoryName, categoryDescription, rank, isParent, imageBase64,mobileImage,thumbnailCategoryImage,uspImage, howToUse, others, userId } = req.body;
        // Validate base64 image data
        if (!imageBase64 || !imageBase64.startsWith('data:image') || !mobileImage || !mobileImage.startsWith('data:image')
            || !thumbnailCategoryImage || !thumbnailCategoryImage.startsWith('data:image')) {
            return res.status(400).json({ message: 'Invalid image data', success: false });
        }

        

        // Save the category details in MongoDB
        const category = new Category({
            categoryName: req.body.name,
            categoryImage: imageBase64, // Store the base64 string in MongoDB
            mobileImage,
            thumbnailCategoryImage,
            uspImage,
            categoryDescription: req.body.description,
            userId: req.body.userId,
            rank,
            howToUse,
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
        const category = await Category.findById(categoryId).select("categoryName mobileImage categoryImage others");
        if (!category) return res.status(404).json({ message: "Category not found!", success: false });
        return res.status(200).json({ category, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to fetch category', success: false });
    }
};

export const getCategoryByIdInProduct = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const category = await Category.findById(categoryId).select("categoryName uspImage howToUse");
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
        let { categoryName, imageBase64,mobileImage,thumbnailCategoryImage,uspImage, rank, isParent, categoryDescription, userId, howToUse, others } = req.body;

        // Validate base64 image data
        if (!imageBase64 || !imageBase64.startsWith('data:image') || !mobileImage || !mobileImage.startsWith('data:image')
            || !thumbnailCategoryImage || !thumbnailCategoryImage.startsWith('data:image')) {
            return res.status(400).json({ message: 'Invalid image data', success: false });
        }

        



        const updatedData = {
            categoryName: req.body.name,
            categoryDescription: req.body.description,
            userId: req.body.userId,
            rank,
            isParent,
            howToUse,
            others,
            ...(imageBase64 && { categoryImage: imageBase64 }), // Only update image if new image is provided
            mobileImage,
            thumbnailCategoryImage,
            uspImage
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
        const { id, direction,newRank } = req.body; // direction: 'up' or 'down'

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found', success: false });
        }

        if (direction === 'set') {
            category.rank = newRank;
            await category.save();
            return res.status(200).json({ message: 'Rank set successfully', success: true });
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

export const getCategoriesIds = async (req, res) => {
    try {
        const categories = await Category.find().select("categoryName");
        if (!categories) return res.status(404).json({ message: "Categories not found", success: false });
        return res.status(200).json({ categories });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to fetch categories', success: false });
    }
};

export const getCategoriesFrontend = async (req, res) => {
    try {
        const categories = await Category.find().select("categoryName thumbnailCategoryImage");
        if (!categories) return res.status(404).json({ message: "Categories not found", success: false });
        return res.status(200).json({ categories });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to fetch categories', success: false });
    }
};

export const getCategoryImageUrl = async (req, res) => {
   try {
 const categoryId = req.params.id;
const category = await Category.findById(categoryId).select("categoryImage");
if (!category || !category.categoryImage) {
return res.status(404).send('Image not found');
}
const matches = category.categoryImage.match(/^data:(.+);base64,(.+)$/);
if (!matches) {
  return res.status(400).send('Invalid image format');
}

const mimeType = matches[1];
const base64Data = matches[2];
const buffer = Buffer.from(base64Data, 'base64');

res.set('Content-Type', mimeType);
res.send(buffer);

} catch (err) {
console.error('Image route error:', err);
res.status(500).send('Error loading image');
}

};

export const getCategoryThumbImageUrl = async (req, res) => {
   try {
 const categoryId = req.params.id;
const category = await Category.findById(categoryId).select("thumbnailCategoryImage");
if (!category || !category.thumbnailCategoryImage) {
return res.status(404).send('Image not found');
}
const matches = category.thumbnailCategoryImage.match(/^data:(.+);base64,(.+)$/);
if (!matches) {
  return res.status(400).send('Invalid image format');
}

const mimeType = matches[1];
const base64Data = matches[2];
const buffer = Buffer.from(base64Data, 'base64');

res.set('Content-Type', mimeType);
res.send(buffer);

} catch (err) {
console.error('Image route error:', err);
res.status(500).send('Error loading image');
}

};

export const getCollections = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const totalCollections = await Category.countDocuments();

    const paginatedCollections = await Category.find()
      .select("-mobileImage -thumbnailCategoryImage -uspImage -howToUse -others")
      .sort({ _id: -1 })
      .skip(skip)
      .limit(Number(limit));

    const enrichedCollections = paginatedCollections.map((category) => {
      const shortId = Math.abs(crc32.str(category._id.toString()));
      return {
        id: shortId,
        title: category.categoryName || "Untitled",
        handle: category.slug || category.categoryName.toLowerCase().replace(/\s+/g, "-"),
        body_html: `<p>${category.description || "Explore our curated collection."}</p>`,
        image: {
          src: `https://api.aromagicperfume.com/api/v1/categories/getCategoryImageUrl/${category._id}`,
        },
        created_at: category.createdAt,
        updated_at: category.updatedAt,
      };
    });

    res.status(200).json({
      data: {
        total: totalCollections,
        collections: enrichedCollections,
      }
    });
  } catch (error) {
    console.error("Error fetching collections:", error);
    res.status(500).json({ message: "Failed to fetch collections", success: false });
  }
};

