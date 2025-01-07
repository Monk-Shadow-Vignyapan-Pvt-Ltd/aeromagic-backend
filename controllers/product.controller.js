import { Product } from '../models/product.model.js'; // Adjust the import to match your file structure
import sharp from 'sharp';

// Add a new product
export const addProduct = async (req, res) => {
    try {
        const { 
            productName, 
            productImage, 
            imageAlt,
            shortDescription, 
            longDescription, 
            productUrl, 
            categoryId, 
            multiImages, 
            hasVariations, 
            price, 
            discount,
            discountType, 
            finalSellingPrice,
            variationId, 
            variationPrices,
            uspIds,
            noteIds, 
            userId 
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
            shortDescription,
            longDescription,
            productUrl,
            categoryId,
            multiImages,
            hasVariations,
            price,
            discount,
            discountType,
            finalSellingPrice,
            variationId,
            variationPrices,
            uspIds,
            noteIds,
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

// Update product by ID
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            productName, 
            productImage,
            imageAlt, 
            shortDescription, 
            longDescription, 
            productUrl, 
            categoryId, 
            multiImages, 
            hasVariations, 
            price, 
            discount,
            discountType, 
            finalSellingPrice,
            variationId, 
            variationPrices,
            uspIds,
            noteIds, 
            userId 
        } = req.body;

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
            shortDescription,
            longDescription,
            productUrl,
            categoryId,
            multiImages,
            hasVariations,
            price,
            discount,
            discountType,
            finalSellingPrice,
            variationId,
            variationPrices,
            uspIds,
            noteIds,
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
