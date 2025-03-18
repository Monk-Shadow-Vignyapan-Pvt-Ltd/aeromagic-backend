import { Product } from '../models/product.model.js'; // Adjust the import to match your file structure
import sharp from 'sharp';
import mongoose from "mongoose";

// Add a new product
export const addProduct = async (req, res) => {
    try {
        const { 
            productName, 
            productImage, 
            imageAlt,
            gender,
            shortDescription, 
            longDescription,  
            categoryId, 
            multiImages, 
            hasVariations,
            inStock, 
            price, 
            discount,
            discountType, 
            finalSellingPrice,
            variationId, 
            variationPrices,
            uspIds,
            noteIds,
            caution, 
            userId,
            productUrl,seoTitle,seoDescription, 
        } = req.body;

        // Validate base64 image data for product image
        if (!productImage || !productImage.startsWith('data:image')) {
            return res.status(400).json({ message: 'Invalid image data', success: false });
        }

        // Resize and compress the product image using sharp
        let compressedBase64 = "";
        if (productImage) {
            const base64Data = productImage.split(';base64,').pop();
            const buffer = Buffer.from(base64Data, 'base64');

            const compressedBuffer = await sharp(buffer)
                .resize(800, 600, { fit: 'inside' }) // Resize to 800x600 max, maintaining aspect ratio
                .jpeg({ quality: 80 }) // Convert to JPEG with 80% quality
                .toBuffer();

            compressedBase64 = `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
        }

        // Create and save the product in MongoDB
        const product = new Product({
            productName,
            productImage: compressedBase64,
            imageAlt,
            gender,
            shortDescription,
            longDescription,
            productUrl,seoTitle,seoDescription,
            categoryId,
            multiImages,
            hasVariations,
            inStock,
            price,
            discount,
            discountType,
            finalSellingPrice,
            variationId,
            variationPrices,
            uspIds,
            noteIds,
            caution,
            userId,
        });

        await product.save();
        res.status(201).json({ product, success: true });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ message: 'Failed to add product', success: false });
    }
};

// Get all products
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        if (!products) return res.status(404).json({ message: "Products not found", success: false });
        return res.status(200).json({ products });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Failed to fetch products', success: false });
    }
};

// Get product by ID
export const getProductById = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found!", success: false });
        return res.status(200).json({ product, success: true });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Failed to fetch product', success: false });
    }
};

export const getProductByUrl = async (req, res) => {
    try {
        const productUrl = req.params.id;
        const product = await Product.findOne({productUrl})
        if (!product) return res.status(404).json({ message: "Product not found!", success: false });
        return res.status(200).json({ product, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to fetch product', success: false });
    }
};

// Update product by ID
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            productName, 
            productImage,
            imageAlt,
            gender, 
            shortDescription, 
            longDescription, 
            productUrl, seoTitle,seoDescription,
            categoryId, 
            multiImages, 
            hasVariations,
            inStock, 
            price, 
            discount,
            discountType, 
            finalSellingPrice,
            variationId, 
            variationPrices,
            uspIds,
            noteIds,
            caution, 
            userId 
        } = req.body;

        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            return res.status(404).json({ message: "Product not found!", success: false });
        }

        // Initialize oldUrls array and add the previous serviceUrl if it's different
        let oldUrls = existingProduct.oldUrls || [];
        if (existingProduct.productUrl && existingProduct.productUrl !== productUrl && !oldUrls.includes(existingProduct.productUrl)) {
            oldUrls.push(existingProduct.productUrl);
        }

        // Validate base64 image data if provided
        let compressedBase64 = "";
        if (productImage && productImage.startsWith('data:image')) {
            const base64Data = productImage.split(';base64,').pop();
            const buffer = Buffer.from(base64Data, 'base64');

            const compressedBuffer = await sharp(buffer)
                .resize(800, 600, { fit: 'inside' })
                .jpeg({ quality: 80 })
                .toBuffer();

            compressedBase64 = `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
        }

        const updatedData = {
            productName,
            productImage: productImage ? compressedBase64 : productImage,
            imageAlt,
            gender,
            shortDescription,
            longDescription,
            productUrl,oldUrls,seoTitle,seoDescription,
            categoryId,
            multiImages,
            hasVariations,
            inStock,
            price,
            discount,
            discountType,
            finalSellingPrice,
            variationId,
            variationPrices,
            uspIds,
            noteIds,
            caution,
            userId,
        };

        const product = await Product.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });
        if (!product) return res.status(404).json({ message: "Product not found!", success: false });
        return res.status(200).json({ product, success: true });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(400).json({ message: error.message, success: false });
    }
};

// Delete product by ID
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndDelete(id);
        if (!product) return res.status(404).json({ message: "Product not found!", success: false });
        return res.status(200).json({ product, success: true });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Failed to delete product', success: false });
    }
};

export const getProductsForHome = async (req, res) => {
    try {
        const products = await Product.find().select('productName  productImage hasVariations price categoryId discount discountType finalSellingPrice variationPrices productUrl');
        if (!products) return res.status(404).json({ message: "Products not found", success: false });
        return res.status(200).json({ products });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Failed to fetch products', success: false });
    }
};

export const getProductsByCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { brand, ingredient, availability, price, size, gender, rating, page = 1,sortOption } = req.query;

        let filter = { };

        // Apply filters dynamically
        filter.categoryId = new mongoose.Types.ObjectId(id);
        if (brand) filter.brand = brand;
        if (ingredient) filter.ingredients = { $in: ingredient.split(",") }; // If multiple, expect comma-separated
        if (size) filter.size = { $in: size.split(",") };
        if (gender) filter.gender = { $in: gender.split(",") };
        if (rating) filter.rating = { $gte: parseFloat(rating) }; // Minimum rating filter

        // Price filter (expects min-max format: "10-100")
        if (price) {
            const priceRanges = price.split(",").map(range => range.split("-").map(Number)); // Convert to number arrays
            filter.$or = priceRanges.map(([min, max]) => ({
                $or: [
                    // Case 1: Products without variations (filter by finalSellingPrice)
                    { hasVariations: false, finalSellingPrice: { $gte: min, $lte: max } },
        
                    // Case 2: Products with variations (filter by variationPrices array)
                    { hasVariations: true, variationPrices: { $elemMatch: { finalSellingPrice: { $gte: min, $lte: max } } } }
                ]
            }));
        }

        if (availability) {
            const availabilityArray = availability.split(",").map(status => status === "true"); // Convert "true" or "false" strings to actual booleans
        
            filter.$or = [
                { hasVariations: false, inStock: { $in: availabilityArray } }, // For products without variations
                { hasVariations: true, variationPrices: { $elemMatch: { checked: { $in: availabilityArray } } } } // For products with variations
            ];
        }
        

        // Pagination
        const limit = 12;
        const skip = (page - 1) * limit;
        let sortQuery = { createdAt: -1 };

        const pipeline = [
            { $match: filter },
            {
                $addFields: {
                    computedPrice: {
                        $cond: {
                            if: { $eq: ["$hasVariations", true] },
                            then: { $ifNull: [{ $arrayElemAt: ["$variationPrices.finalSellingPrice", 0] }, 0] },
                            else: "$finalSellingPrice"
                        }
                    }
                }
            }
        ];

        // Sorting Logic
        switch (sortOption) {
            case "price-low-high":
                pipeline.push({ $sort: { computedPrice: 1 } });
                break;
            case "price-high-low":
                pipeline.push({ $sort: { computedPrice: -1 } });
                break;
            case "rating-high-low":
                pipeline.push({ $sort: { rating: -1 } });
                break;
            case "rating-low-high":
                pipeline.push({ $sort: { rating: 1 } });
                break;
            default:
                pipeline.push({ $sort: { createdAt: -1 } });
                break;
        }

        // Pagination in aggregation
        pipeline.push({ $skip: skip }, { $limit: limit });

        const products = await Product.aggregate(pipeline);

        if (!products.length) return res.status(404).json({ message: "No products found", success: false });

        const totalProducts = await Product.countDocuments(filter);

        res.status(200).json({
            products,
            success: true,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalProducts / limit),
                totalProducts,
            }
        });

    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Failed to fetch products', success: false });
    }
};