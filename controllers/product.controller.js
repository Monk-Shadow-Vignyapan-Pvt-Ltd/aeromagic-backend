import { Product } from '../models/product.model.js'; // Adjust the import to match your file structure
import { Category } from '../models/category.model.js';
import sharp from 'sharp';
import mongoose from "mongoose";
import { ProductSearch } from '../models/product_search.model.js';

// Add a new product
export const addProduct = async (req, res) => {
    try {
        const { 
            productName, 
            productImage, 
            imageAlt,
            gender,
            weight,
            shortDescription, 
            longDescription,  
            categoryId, 
            multiImages, 
            hasVariations,
            inStock,
            showOnHome, 
            price, 
            discount,
            discountType, 
            finalSellingPrice,
            variationId, 
            variationPrices,
            uspIds,
            occasions,
            tone,
            caution, 
            userId,
            productUrl,seoTitle,seoDescription, schema
        } = req.body;

        // Validate base64 image data for product image
        if (!productImage || !productImage.startsWith('data:image')) {
            return res.status(400).json({ message: 'Invalid image data', success: false });
        }

        // Resize and compress the product image using sharp
        // let compressedBase64 = "";
        // if (productImage) {
        //     const base64Data = productImage.split(';base64,').pop();
        //     const buffer = Buffer.from(base64Data, 'base64');

        //     const compressedBuffer = await sharp(buffer)
        //         .resize(800, 600, { fit: 'inside' }) // Resize to 800x600 max, maintaining aspect ratio
        //         .jpeg({ quality: 80 }) // Convert to JPEG with 80% quality
        //         .toBuffer();

        //     compressedBase64 = `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
        // }

        // Create and save the product in MongoDB
        const product = new Product({
            productName,
            productImage: productImage,
            imageAlt,
            gender,
            weight,
            shortDescription,
            longDescription,
            productUrl,seoTitle,seoDescription,schema,
            categoryId,
            multiImages,
            hasVariations,
            inStock,
            showOnHome,
            price,
            discount,
            discountType,
            finalSellingPrice,
            variationId,
            variationPrices,
            uspIds,
            occasions,
            tone,
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
        const { page = 1, search = "", category = "" } = req.query;
        const limit = 10;
        const skip = (page - 1) * limit;

        // Create a search filter
        const searchFilter = {};

        // Apply search filter
        if (search) {
            searchFilter.$or = [
                { productName: { $regex: search, $options: "i" } },
                { shortDescription: { $regex: search, $options: "i" } },
                { longDescription: { $regex: search, $options: "i" } },
            ];
        }

        // Apply category filter if selected
        if (category) {
            searchFilter.categoryId = category;
        }

        // Fetch all matching products (without pagination)
        const allProducts = await Product.find(searchFilter);

        // Apply pagination
        const paginatedProducts = await Product.find(searchFilter)
            .sort({ _id: -1 }) // Sort newest first
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            products: paginatedProducts,
            success: true,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(allProducts.length / limit),
                totalProducts: allProducts.length,
            },
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Failed to fetch products", success: false });
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
            weight, 
            shortDescription, 
            longDescription, 
            productUrl, seoTitle,seoDescription,schema,
            categoryId, 
            multiImages, 
            hasVariations,
            inStock,
            showOnHome, 
            price, 
            discount,
            discountType, 
            finalSellingPrice,
            variationId, 
            variationPrices,
            uspIds,
            occasions,
            tone,
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
        // let compressedBase64 = "";
        // if (productImage && productImage.startsWith('data:image')) {
        //     const base64Data = productImage.split(';base64,').pop();
        //     const buffer = Buffer.from(base64Data, 'base64');

        //     const compressedBuffer = await sharp(buffer)
        //         .resize(800, 600, { fit: 'inside' })
        //         .jpeg({ quality: 80 })
        //         .toBuffer();

        //     compressedBase64 = `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
        // }

        const updatedData = {
            productName,
            productImage,
            imageAlt,
            gender,
            weight,
            shortDescription,
            longDescription,
            productUrl,oldUrls,seoTitle,seoDescription,schema,
            categoryId,
            multiImages,
            hasVariations,
            inStock,
            showOnHome,
            price,
            discount,
            discountType,
            finalSellingPrice,
            variationId,
            variationPrices,
            uspIds,
            occasions,
            tone,
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
        // Fetch products and categories
        const products = await Product.find().select('productName productImage hasVariations price showOnHome categoryId discount discountType finalSellingPrice variationPrices productUrl inStock');
        const categories = await Category.find().select('categoryName rank');

        if (!products.length) return res.status(404).json({ message: "Products not found", success: false });

        // Filter categories with rank < 6
        const filteredProducts = categories
            .filter(category => parseFloat(category.rank) < 3)
            .map(category => {
                let categoryProducts = products.filter(product => product.categoryId.toString() === category._id.toString());
                
                // Get products with showOnHome: true
                let homeProducts = categoryProducts.filter(product => product.showOnHome);

                // If homeProducts are less than 8, fill with random category products
                if (homeProducts.length < 8) {
                    const remainingCount = 8 - homeProducts.length;
                    const randomProducts = categoryProducts
                        .filter(product => !product.showOnHome) // Only take products that are not already in homeProducts
                        .sort(() => 0.5 - Math.random()) // Shuffle the remaining products
                        .slice(0, remainingCount); // Get only needed amount

                    homeProducts = [...homeProducts, ...randomProducts]; // Merge both lists
                } else {
                    homeProducts = homeProducts.slice(0, 8); // Ensure max 8 products
                }

                return {
                    ...category.toObject(), // Convert category document to plain object
                    products: homeProducts,
                    reviews: "405",
                    rating: "4"
                };
            });

        return res.status(200).json({ products: filteredProducts, success: true });

    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Failed to fetch products', success: false });
    }
};

export const getProductsByCategory = async (req, res) => {
    try {
        let { id } = req.params;
        const { brand, tone,occasion, availability, price, gender, rating, page = 1,sortOption } = req.query;

        if (!id || id === "undefined") {
            const firstCategory = await Category.findOne().sort({ createdAt: 1 });
            if (!firstCategory) {
                return res.status(404).json({ message: "No categories found", success: false });
            }
            id = firstCategory._id.toString();
        }


        let filter = { };

        // Apply filters dynamically
        filter.categoryId = new mongoose.Types.ObjectId(id);
        if (brand) filter.brand = brand;
        if (tone) {
            const toneIds = tone.split(",");
            filter["tone.label"] = { $in: toneIds };
          }
          if (occasion) {
            const occasionIds = occasion.split(",");
            filter.occasions = {
                $elemMatch: {
                    label: { $in: occasionIds }
                }
            };
        }        
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
        

        // Pagination
        const limit = 12;
        const skip = (page - 1) * limit;
        let sortQuery = { createdAt: -1 };

        const pipeline = [
            { $match: filter }
        ];

        // STEP 3: Push availability match logic (based on variationPrices[0].checked)
        if (availability) {
            const availabilityArray = availability.split(",").map(status => status === "true");

            pipeline.push({
                $match: {
                    $expr: {
                        $or: [
                            {
                                $and: [
                                    { $eq: ["$hasVariations", false] },
                                    { $in: ["$inStock", availabilityArray] }
                                ]
                            },
                            {
                                $and: [
                                    { $eq: ["$hasVariations", true] },
                                    {
                                        $in: [
                                            { $ifNull: [{ $arrayElemAt: ["$variationPrices.checked", 0] }, false] },
                                            availabilityArray
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                }
            });
        }

        // STEP 4: Add computedPrice field
        pipeline.push({
            $addFields: {
                computedPrice: {
                    $cond: {
                        if: { $eq: ["$hasVariations", true] },
                        then: { $ifNull: [{ $arrayElemAt: ["$variationPrices.finalSellingPrice", 0] }, 0] },
                        else: "$finalSellingPrice"
                    }
                }
            }
        });


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
       pipeline.push(
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    productName: 1,
                    productImage: 1,
                    hasVariations: 1,
                    price: 1,
                    showOnHome: 1,
                    categoryId: 1,
                    discount: 1,
                    discountType: 1,
                    finalSellingPrice: 1,
                    variationPrices: 1,
                    productUrl: 1,
                    inStock: 1
                }
            }
        );

        const products = await Product.aggregate(pipeline);

        if (!products.length) return res.status(200).json({
            products:[],
            success: true,
            pagination: {
                currentPage: parseInt(page),
                totalPages: 1,
                totalProducts:0,
            }
        });

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

export const getAllProducts = async (req, res) => {
    try {
        const { brand, tone, availability, price, occasion, gender, rating, page = 1,sortOption } = req.query;


        let filter = { };

        // Apply filters dynamically
        if (brand) filter.brand = brand;
        if (tone) {
            const toneIds = tone.split(",");
            filter["tone.label"] = { $in: toneIds };
          }
          if (occasion) {
            const occasionIds = occasion.split(",");
            filter.occasions = {
                $elemMatch: {
                    label: { $in: occasionIds }
                }
            };
        }
        
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
        

        // Pagination
        const limit = 12;
        const skip = (page - 1) * limit;
        let sortQuery = { createdAt: -1 };

         const pipeline = [
            { $match: filter }
        ];

        // STEP 3: Push availability match logic (based on variationPrices[0].checked)
        if (availability) {
            const availabilityArray = availability.split(",").map(status => status === "true");

            pipeline.push({
                $match: {
                    $expr: {
                        $or: [
                            {
                                $and: [
                                    { $eq: ["$hasVariations", false] },
                                    { $in: ["$inStock", availabilityArray] }
                                ]
                            },
                            {
                                $and: [
                                    { $eq: ["$hasVariations", true] },
                                    {
                                        $in: [
                                            { $ifNull: [{ $arrayElemAt: ["$variationPrices.checked", 0] }, false] },
                                            availabilityArray
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                }
            });
        }

        // STEP 4: Add computedPrice field
        pipeline.push({
            $addFields: {
                computedPrice: {
                    $cond: {
                        if: { $eq: ["$hasVariations", true] },
                        then: { $ifNull: [{ $arrayElemAt: ["$variationPrices.finalSellingPrice", 0] }, 0] },
                        else: "$finalSellingPrice"
                    }
                }
            }
        });


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
        pipeline.push(
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    productName: 1,
                    productImage: 1,
                    hasVariations: 1,
                    price: 1,
                    showOnHome: 1,
                    categoryId: 1,
                    discount: 1,
                    discountType: 1,
                    finalSellingPrice: 1,
                    variationPrices: 1,
                    productUrl: 1,
                    inStock: 1
                }
            }
        );

        const products = await Product.aggregate(pipeline);

        if (!products.length) return res.status(200).json({
            products:[],
            success: true,
            pagination: {
                currentPage: parseInt(page),
                totalPages: 1,
                totalProducts:0,
            }
        });

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

export const getProductsHeader = async (req, res) => {
    try {
        const categories = await Category.find().select("categoryName");
        let allRandomProducts = [];

        for (const category of categories) {
            const products = await Product.aggregate([
                {
                    $match: {
                        categoryId: new mongoose.Types.ObjectId(category._id)
                    }
                },
                { $sample: { size: 4 } },
                {
                    $project: { // Select only the required fields (image and name)
                        productImage: 1,
                        productName: 1,
                        productUrl:1,
                        categoryId:1,
                    }
                }
            ]);

            allRandomProducts = allRandomProducts.concat(products);
        }

        res.status(200).json({
            success: true,
            products: allRandomProducts
        });
    } catch (error) {
        console.error("Error fetching random products:", error);
        res.status(500).json({ success: false, message: "Failed to fetch products" });
    }
};

export const updateShowOnHomeProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { categoryId, showOnHome } = req.body;

        // Check if showOnHome is set to true
        if (showOnHome) {
            // Count how many products in this category have showOnHome: true
            const productsInCategory = await Product.find({ categoryId, showOnHome: true }).sort({ updatedAt: 1 });

            if (productsInCategory.length >= 8) {
                // If there are already 8, update the oldest one to false
                const productToUpdate = productsInCategory[0]; // Oldest product
                await Product.findByIdAndUpdate(productToUpdate._id, { showOnHome: false });
            }
        }

        // Update the requested product
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { showOnHome },
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found!", success: false });
        }

        return res.status(200).json({ product: updatedProduct, success: true });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(400).json({ message: error.message, success: false });
    }
};

export const getProductIds = async (req, res) => {
    try {
        const products = await Product.find().select("productName categoryId hasVariations variationPrices");
        if (!products) return res.status(404).json({ message: "products not found", success: false });
        return res.status(200).json({ products });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to fetch products', success: false });
    }
};

export const addProductInSearch = async (req, res) => {
    try {
        let { ranking,userId} = req.body;
        const productRanking = await ProductSearch.findOneAndUpdate(
                  {}, 
                  { ranking,userId}, 
                  { new: true, upsert: true }
                );

        //await ProductSearch.save();
        res.status(201).json({ productRanking, success: true });
    } catch (error) {
        console.error('Error uploading productRanking:', error);
        res.status(500).json({ message: 'Failed to upload productRanking', success: false });
    }
};

export const getProductInSearch = async (req, res) => {
  try {
      const productRankings = await ProductSearch.find();
      if (!productRankings) return res.status(404).json({ message: "Product Rankings not found", success: false });
      return res.status(200).json({ productRankings });
  } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Failed to fetch product Rankings', success: false });
  }
};

export const getProductsAfterInSearch = async (req, res) => {
    try {
        // Fetch the service ranking
        const productRanking = await ProductSearch.findOne().select('ranking');
        if (!productRanking || !productRanking.ranking || productRanking.ranking.length === 0) {
            return res.status(404).json({ message: "No ranked products found", success: false });
        }

        // Extract service IDs from the ranking
        const rankedProductIds = productRanking.ranking.map(item => item.value);

        // Fetch services that match the ranked IDs
        const products = await Product.find({ _id: { $in: rankedProductIds } })
        .select('productName productUrl  productImage variationPrices hasVariations inStock price discount discountType finalSellingPrice');

    

        if (!products || products.length === 0) {
            return res.status(404).json({ message: "Ranked products not found", success: false });
        }

        // Sort services based on their rank
        const sortedProducts = rankedProductIds.map(id => products.find(product => product._id.toString() === id));

        return res.status(200).json({ products: sortedProducts, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to fetch ranked products', success: false });
    }
};
