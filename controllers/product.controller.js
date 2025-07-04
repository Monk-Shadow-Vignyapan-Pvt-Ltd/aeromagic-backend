import { Product } from '../models/product.model.js'; // Adjust the import to match your file structure
import { Category } from '../models/category.model.js';
import sharp from 'sharp';
import mongoose from "mongoose";
import { ProductSearch } from '../models/product_search.model.js';
import { create } from 'xmlbuilder2';
import fs from "fs";
import crc32 from "crc-32";
import ExcelJS from 'exceljs';

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
        const paginatedProducts = await Product.find(searchFilter).select("productName showOnHome categoryId productEnabled")
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

export const getPaginationProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const totalProducts = await Product.countDocuments();

    const paginatedProducts = await Product.find()
      .select("-multiImages")
      .sort({ _id: -1 })
      .skip(skip)
      .limit(Number(limit));

    const enrichedProducts = paginatedProducts.map((product) => {
      const plain = product.toObject();
      const shortId = Math.abs(crc32.str(product._id.toString()));
      const imageUrl = `https://api.aromagicperfume.com/api/v1/products/product-image/${product._id}`;
      const price = plain.finalSellingPrice || plain.price || 0;

      const tags = [
        ...(plain.occasions?.map(o => o.label) || []),
        plain.tone?.label,
        plain.gender
      ].filter(Boolean).join(", ");

      return {
        id: shortId,
        title: plain.productName,
        body_html: `<p>${plain.shortDescription || plain.productName}</p>`,
        vendor: "Aromagic",
        product_type: "Perfume",
        created_at: plain.createdAt,
        handle: plain.productUrl,
        updated_at: plain.updatedAt,
        tags,
        status: plain.inStock ? "active" : "draft",
        variants: plain.hasVariations ? plain.variationPrices.map((variation, index) => ({
          id: shortId + index + 1,
          title: `${plain.productName} - ${variation.value}` ,
          price: variation.finalSellingPrice?.toFixed(2) || variation.price.toFixed(2),
          sku: `${plain.productName.toUpperCase().replace(/\s+/g, '-')}-${variation.value || index + 1}`,
          created_at: plain.createdAt,
          updated_at: plain.updatedAt,
          taxable: true,
          grams: (variation.weight || plain.weight || 0),
          weight: variation.weight || plain.weight || 0,
          weight_unit: "g",
          image: {
            src: `https://api.aromagicperfume.com/api/v1/products/productVariations/${plain._id}/${index}` || imageUrl
          }
        })):[
          {
            id: shortId + 1,
            title: "Default",
            price: price.toFixed(2),
            sku: `${plain.productName.toUpperCase().replace(/\s+/g, '-')}-${plain.gender?.toUpperCase() || "GEN"}`,
            created_at: plain.createdAt,
            updated_at: plain.updatedAt,
            taxable: true,
            grams: (plain.weight || 0),
            weight: plain.weight || 0,
            weight_unit: "g",
            image: {
              src: imageUrl
            }
          }
        ],
        image: {
          src: imageUrl
        }
      };
    });

    res.status(200).json({
      data: {
        total: totalProducts,
        products: enrichedProducts
      },
      success: true
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Failed to fetch products", success: false });
  }
};

export const getPaginationProductsExcel = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const products = await Product.find()
      .select("-multiImages")
      .sort({ _id: -1 })
      .skip(skip)
      .limit(Number(limit));

   const categories= await Category.find().select("categoryName");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Products');

    // Define headers
    worksheet.columns = [
      { header: 'Product ID', key: 'id', width: 10 },
      { header: 'Barcode', key: 'barcode', width: 30 },
      { header: 'Category', key: 'category', width: 30 },
      { header: 'Product Name', key: 'title', width: 30 },
      { header: 'Variant Title', key: 'variant_title', width: 30 },
      { header: 'Price', key: 'price', width: 10 },
      { header: 'SKU', key: 'sku', width: 25 },
      { header: 'Weight (g)', key: 'weight', width: 15 },
      { header: 'Tags', key: 'tags', width: 30 },
      { header: 'In Stock', key: 'inStock', width: 10 },
      { header: 'Created At', key: 'created_at', width: 20 }
    ];

    // Add rows
    products.forEach(product => {
      const plain = product.toObject();
      const shortId = Math.abs(crc32.str(product._id.toString()));
      const barcode = `${product.productName}-${product._id?.toString().slice(0, 4)}`;
      const category = categories.find(cat => cat._id.toString() === product.categoryId.toString()).categoryName;
      const baseTitle = plain.productName;
      const tags = [
        ...(plain.occasions?.map(o => o.label) || []),
        plain.tone?.label,
        plain.gender
      ].filter(Boolean).join(", ");

      if (plain.hasVariations && Array.isArray(plain.variationPrices)) {
        plain.variationPrices.forEach((variation, index) => {
          worksheet.addRow({
            id: shortId,
            barcode:`${product.productName} - ${variation.value}-${product._id?.toString().slice(0, 4)}`,
            category:category,
            title: `${baseTitle} - ${variation.value}`,
            variant_title: `${baseTitle} - ${variation.value}`,
            price: variation.finalSellingPrice?.toFixed(2) || variation.price.toFixed(2),
            sku: `${baseTitle.toUpperCase().replace(/\s+/g, '-')}-${variation.value || index + 1}`,
            weight: (variation.weight || plain.weight || 0) ,
            tags,
            inStock: variation.checked ? 'Yes' : 'No',
            created_at: new Date(plain.createdAt).toLocaleString()
          });
        });
      } else {
        // No variation
        const price = plain.finalSellingPrice || plain.price || 0;
        worksheet.addRow({
          id: shortId,
          barcode:barcode,
          category:category,
          title: baseTitle,
          variant_title: "Default",
          price: price.toFixed(2),
          sku: `${baseTitle.toUpperCase().replace(/\s+/g, '-')}-${plain.gender?.toUpperCase() || "GEN"}`,
          weight: (plain.weight || 0),
          tags,
          inStock: plain.inStock ? 'Yes' : 'No',
          created_at: new Date(plain.createdAt).toLocaleString()
        });
      }
    });

    // Set headers for file download
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="products_with_variants_page_${page}.xlsx"`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error exporting products:", error);
    res.status(500).json({ message: "Failed to export products", success: false });
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
        const randomProducts = await Product.aggregate([
        { $match: { _id: { $ne: product._id }, productEnabled: true } },
        { $sample: { size: 6 } },
        {
                    $project: {
                        productName: 1,
                        hasVariations: 1,
                        price: 1,
                        showOnHome: 1,
                        productEnabled:1,
                        categoryId: 1,
                        discount: 1,
                        discountType: 1,
                        finalSellingPrice: 1,
                        variationPrices: 1,
                        productUrl: 1,
                        inStock: 1
                    }
                }
        ]);
        return res.status(200).json({ product,relatedProducts: randomProducts, success: true });
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
        // Step 1: Get only needed categories
        const categories = await Category.find({ rank: { $lt: 3 } }).select('categoryName rank');

        // Step 2: Get all products that belong to those categories
        const categoryIds = categories.map(cat => cat._id);
        const allProducts = await Product.find({ categoryId: { $in: categoryIds } })
            .select('productName productImage hasVariations price showOnHome productEnabled categoryId discount discountType finalSellingPrice variationPrices productUrl inStock');

        // Step 3: Group products by category and prepare response
        const productsByCategory = categories.map(category => {
            const categoryProducts = allProducts.filter(p => p.categoryId.toString() === category._id.toString());

            let homeProducts = categoryProducts.filter(p => p.showOnHome && p.productEnabled);

            if (homeProducts.length < 8) {
                const remainingCount = 8 - homeProducts.length;
                const additionalProducts = categoryProducts
                    .filter(p => !p.showOnHome && p.productEnabled)
                    .sort(() => 0.5 - Math.random())
                    .slice(0, remainingCount);
                homeProducts = [...homeProducts, ...additionalProducts];
            } else {
                homeProducts = homeProducts.slice(0, 8);
            }

            return {
                ...category.toObject(),
                products: homeProducts,
                reviews: "405",
                rating: "4"
            };
        });

        return res.status(200).json({ products: productsByCategory, success: true });

    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Failed to fetch products', success: false });
    }
};

export const getRank1HomeProducts = async (req, res) => {
    try {
        const category = await Category.findOne({ rank: 1 }).select('categoryName rank');

        if (!category) {
            return res.status(404).json({ message: 'Rank 1 category not found', success: false });
        }

       let homeProducts = await Product.find({
            categoryId: category._id,
            showOnHome: true,
            productEnabled:true,
        }).select('productName hasVariations price showOnHome productEnabled categoryId discount discountType finalSellingPrice variationPrices productUrl inStock');

        // Step 2: If less than 8, fetch random non-showOnHome products from the same category
        if (homeProducts.length < 8) {
            const remainingCount = 8 - homeProducts.length;

            const extraProducts = await Product.aggregate([
                { $match: { categoryId: category._id,productEnabled:true, showOnHome: { $ne: true } } },
                { $sample: { size: remainingCount } },
                {
                    $project: {
                        productName: 1,
                        hasVariations: 1,
                        price: 1,
                        showOnHome: 1,
                        productEnabled:1,
                        categoryId: 1,
                        discount: 1,
                        discountType: 1,
                        finalSellingPrice: 1,
                        productUrl: 1,
                        inStock: 1,
                        variationPrices: {
                            $map: {
                            input: "$variationPrices",
                            as: "vp",
                            in: {
                                id: "$$vp.id",
                                value: "$$vp.value",
                                price: "$$vp.price",
                                weight: "$$vp.weight",
                                discount: "$$vp.discount",
                                finalSellingPrice: "$$vp.finalSellingPrice",
                                checked: "$$vp.checked"
                                // You can include more fields if needed, but **not** "images"
                            }
                            }
                        }

                    }
                }
            ]);

            homeProducts = [...homeProducts, ...extraProducts];
        } else {
            homeProducts = homeProducts.slice(0, 8);
        }

        return res.status(200).json({
            category: category.categoryName,
            products: homeProducts,
            reviews: "405",
            rating: "4",
            success: true
        });

    } catch (error) {
        console.error('Error fetching rank 1 home products:', error);
        res.status(500).json({ message: 'Failed to fetch rank 1 home products', success: false });
    }
};

export const getRank2HomeProducts = async (req, res) => {
    try {
        const category = await Category.findOne({ rank: 2 }).select('categoryName rank');

        if (!category) {
            return res.status(404).json({ message: 'Rank 2 category not found', success: false });
        }

        let homeProducts = await Product.find({
            categoryId: category._id,
            showOnHome: true,
            productEnabled:true,
        }).select('productName hasVariations price showOnHome categoryId discount discountType finalSellingPrice variationPrices productUrl inStock');

        // Step 2: If less than 8, fetch random non-showOnHome products from the same category
        if (homeProducts.length < 8) {
            const remainingCount = 8 - homeProducts.length;

            const extraProducts = await Product.aggregate([
                { $match: { categoryId: category._id,productEnabled:true, showOnHome: { $ne: true } } },
                { $sample: { size: remainingCount } },
                {
                    $project: {
                        productName: 1,
                        hasVariations: 1,
                        price: 1,
                        showOnHome: 1,
                        productEnabled:1,
                        categoryId: 1,
                        discount: 1,
                        discountType: 1,
                        finalSellingPrice: 1,
                        productUrl: 1,
                        inStock: 1,
                        variationPrices: {
                            $map: {
                            input: "$variationPrices",
                            as: "vp",
                            in: {
                                id: "$$vp.id",
                                value: "$$vp.value",
                                price: "$$vp.price",
                                weight: "$$vp.weight",
                                discount: "$$vp.discount",
                                finalSellingPrice: "$$vp.finalSellingPrice",
                                checked: "$$vp.checked"
                                // You can include more fields if needed, but **not** "images"
                            }
                            }
                        }
                    }
                }
            ]);

            homeProducts = [...homeProducts, ...extraProducts];
        } else {
            homeProducts = homeProducts.slice(0, 8);
        }

        return res.status(200).json({
            category: category.categoryName,
            products: homeProducts,
            reviews: "405",
            rating: "4",
            success: true
        });

    } catch (error) {
        console.error('Error fetching rank 2 home products:', error);
        res.status(500).json({ message: 'Failed to fetch rank 2 home products', success: false });
    }
};


export const getProductsByCategory = async (req, res) => {
  try {
    let { id } = req.params;
    const {
      brand,
      tone,
      occasion,
      availability,
      price,
      gender,
      rating,
      page = 1,
      limit =12,
      sortOption,
    } = req.query;
    const numericLimit = parseInt(limit, 10);
  const numericPage = parseInt(page, 10);
  const skip = (numericPage - 1) * numericLimit;

    // Default category fallback
    if (!id || id === 'undefined') {
      const firstCategory = await Category.findOne().sort({ createdAt: 1 });
      if (!firstCategory) {
        return res.status(404).json({ message: 'No categories found', success: false });
      }
      id = firstCategory._id.toString();
    }

    const match = {
      productEnabled: true,
      categoryId: new mongoose.Types.ObjectId(id),
    };

    if (brand) match.brand = brand;
    if (tone) match['tone.label'] = { $in: tone.split(',') };
    //if (occasion) match.occasions = { $elemMatch: { label: { $in: occasion.split(',') } } };
    if (occasion) {
      const occasionArray = occasion.split(',');
      match.$or = [
        { 'occasions.label': { $in: occasionArray } },
        { occasions: { $in: occasionArray } },
      ];
    }

    if (gender) match.gender = { $in: gender.split(',') };
    if (rating) match.rating = { $gte: parseFloat(rating) };

    const pipeline = [{ $match: match }];

    // Availability check on first variation only
    if (availability) {
      const bools = availability.split(',').map(v => v === 'true');
      pipeline.push({
        $match: {
          $or: [
            { hasVariations: false, inStock: { $in: bools } },
            {
              hasVariations: true,
              $expr: {
                $in: [
                  {
                    $ifNull: [
                      { $arrayElemAt: ['$variationPrices.checked', 0] },
                      false,
                    ],
                  },
                  bools,
                ],
              },
            },
          ],
        },
      });
    }

    // Price filter using only first variation
    if (price) {
      const priceRanges = price.split(',').map(r => r.split('-').map(Number));
      pipeline.push({
        $match: {
          $or: priceRanges.map(([min, max]) => ({
            $or: [
              { hasVariations: false, finalSellingPrice: { $gte: min, $lte: max } },
              {
                hasVariations: true,
                $expr: {
                  $and: [
                    {
                      $gte: [
                        { $ifNull: [{ $arrayElemAt: ['$variationPrices.finalSellingPrice', 0] }, 0] },
                        min,
                      ],
                    },
                    {
                      $lte: [
                        { $ifNull: [{ $arrayElemAt: ['$variationPrices.finalSellingPrice', 0] }, 0] },
                        max,
                      ],
                    },
                  ],
                },
              },
            ],
          })),
        },
      });
    }

    // Compute price based on first variation only
    pipeline.push({
  $addFields: {
    computedPrice: {
      $cond: {
        if: { $eq: ['$hasVariations', true] },
        then: { $ifNull: [{ $arrayElemAt: ['$variationPrices.finalSellingPrice', 0] }, 0] },
        else: '$finalSellingPrice',
      },
    },
    numericRank: {
      $cond: {
        if: { $ne: ['$rank', null] },
        then: { $toInt: '$rank' },
        else: 9999
      }
    }
  }
});

// Sorting logic
let sort = {};
switch (sortOption) {
  case 'price-low-high':
    sort = { computedPrice: 1, _id: 1 };
    break;
  case 'price-high-low':
    sort = { computedPrice: -1, _id: 1 };
    break;
  case 'rating-high-low':
    sort = { rating: -1, _id: 1 };
    break;
  case 'rating-low-high':
    sort = { rating: 1, _id: 1 };
    break;
  default:
    sort = { numericRank: 1, _id: 1 };
    break;
}


    // Final aggregation
    pipeline.push({
      $facet: {
        products: [
          { $sort: sort },
          { $skip: skip },
          { $limit: numericLimit },
          {
            $project: {
              productName: 1,
              productUrl: 1,
              categoryId: 1,
              hasVariations: 1,
              discount: 1,
              discountType: 1,
              rating: 1,
              finalSellingPrice: 1,
              inStock: 1,
              showOnHome: 1,
              price:1,
              variationPrices: {
                $map: {
                  input: '$variationPrices',
                  as: 'vp',
                  in: {
                    id: '$$vp.id',
                    value: '$$vp.value',
                    price: '$$vp.price',
                    weight: '$$vp.weight',
                    discount: '$$vp.discount',
                    finalSellingPrice: '$$vp.finalSellingPrice',
                    checked: '$$vp.checked',
                  },
                },
              },
            },
          },
        ],
        total: [{ $count: 'count' }],
      },
    });

    const result = await Product.aggregate(pipeline);
    const products = result[0]?.products || [];
    const totalProducts = result[0]?.total[0]?.count || 0;
    const totalPages = Math.ceil(totalProducts / limit);

    return res.status(200).json({
      products,
      success: true,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts,
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ message: 'Failed to fetch products', success: false });
  }
};



export const getAllProducts = async (req, res) => {
  try {
    const {
      brand,
      tone,
      availability,
      price,
      occasion,
      gender,
      rating,
      page = 1,
      sortOption
    } = req.query;

    const limit = 12;
    const skip = (page - 1) * limit;

    const match = { productEnabled: true };

    // Base filters
    if (brand) match.brand = brand;
    if (tone) match["tone.label"] = { $in: tone.split(",") };
    if (occasion) {
      const occasionArray = occasion.split(',');
      match.$or = [
        { 'occasions.label': { $in: occasionArray } },
        { occasions: { $in: occasionArray } },
      ];
    }
    if (gender) match.gender = { $in: gender.split(",") };
    if (rating) match.rating = { $gte: parseFloat(rating) };

    const pipeline = [{ $match: match }];

    // Availability filter using first variation only
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

    // Price filter using first variation only
    if (price) {
      const priceRanges = price.split(",").map(range => range.split("-").map(Number));
      pipeline.push({
        $match: {
          $or: priceRanges.map(([min, max]) => ({
            $or: [
              { hasVariations: false, finalSellingPrice: { $gte: min, $lte: max } },
              {
                hasVariations: true,
                $expr: {
                  $and: [
                    {
                      $gte: [
                        { $ifNull: [{ $arrayElemAt: ["$variationPrices.finalSellingPrice", 0] }, 0] },
                        min
                      ]
                    },
                    {
                      $lte: [
                        { $ifNull: [{ $arrayElemAt: ["$variationPrices.finalSellingPrice", 0] }, 0] },
                        max
                      ]
                    }
                  ]
                }
              }
            ]
          }))
        }
      });
    }

    // Add computedPrice for sorting
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

    // Sorting logic
    let sort = {};
    switch (sortOption) {
      case 'price-low-high':
        sort = { computedPrice: 1, _id: 1 }; // add tie-breaker
        break;
      case 'price-high-low':
        sort = { computedPrice: -1, _id: 1 };
        break;
      case 'rating-high-low':
        sort = { rating: -1, _id: 1 };
        break;
      case 'rating-low-high':
        sort = { rating: 1, _id: 1 };
        break;
      default:
        sort = { createdAt: -1, _id: 1 }; // add tie-breaker here too
    }

    // Use $facet for paginated results + total count
    pipeline.push({
      $facet: {
        products: [
          { $sort: sort },
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              productName: 1,
              hasVariations: 1,
              price: 1,
              showOnHome: 1,
              categoryId: 1,
              discount: 1,
              discountType: 1,
              finalSellingPrice: 1,
              productUrl: 1,
              inStock: 1,
              rating: 1,
              variationPrices: {
                $map: {
                  input: "$variationPrices",
                  as: "vp",
                  in: {
                    id: "$$vp.id",
                    value: "$$vp.value",
                    price: "$$vp.price",
                    weight: "$$vp.weight",
                    discount: "$$vp.discount",
                    finalSellingPrice: "$$vp.finalSellingPrice",
                    checked: "$$vp.checked"
                  }
                }
              }
            }
          }
        ],
        total: [{ $count: "count" }]
      }
    });

    const result = await Product.aggregate(pipeline);
    const products = result[0]?.products || [];
    const totalProducts = result[0]?.total[0]?.count || 0;
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      products,
      success: true,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts
      }
    });

  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Failed to fetch products", success: false });
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
                        categoryId: new mongoose.Types.ObjectId(category._id),
                        productEnabled:true
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
        const productRanking = await ProductSearch.findOne().select('ranking');
        if (!productRanking || !productRanking.ranking || productRanking.ranking.length === 0) {
            return res.status(404).json({ message: "No ranked products found", success: false });
        }

        const rankedProductIds = productRanking.ranking.map(item => item.value);

        const products = await Product.find({ 
            _id: { $in: rankedProductIds }, 
            productEnabled: true 
        }).select('productName categoryId productUrl productImage variationPrices hasVariations inStock price discount discountType finalSellingPrice productEnabled');

        if (!products || products.length === 0) {
            return res.status(404).json({ message: "Ranked products not found", success: false });
        }

        // Build a Map for fast lookup and sort the products
        const productMap = new Map(products.map(p => [p._id.toString(), p]));
        const sortedProducts = rankedProductIds
            .map(id => productMap.get(id))
            .filter(p => p); // remove nulls

        return res.status(200).json({ products: sortedProducts, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to fetch ranked products', success: false });
    }
};


export const setProductOnOff = async (req, res) => {
    try {
        const { id } = req.params;
         const { 
            productEnabled
        } = req.body;

        // Then, set showOnSignUp to true for the specified coupon
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { productEnabled },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found', success: false });
        }

        res.status(200).json({ product: updatedProduct, success: true });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Failed to update product', success: false });
    }
};

export const getProductsByCollection = async (req, res) => {
  try {
    let { collection_id, page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    let realCategoryId;

    // ✅ Resolve short collection ID to real MongoDB ObjectId
    const categories = await Category.find().select("_id");

    for (const category of categories) {
      const shortId = Math.abs(crc32.str(category._id.toString()));
      if (shortId.toString() === collection_id) {
        realCategoryId = category._id;
        break;
      }
    }

    // 🔁 If not matched, fallback to first category
    if (!realCategoryId) {
      const fallback = await Category.findOne().sort({ createdAt: 1 });
      if (!fallback) {
        return res.status(404).json({ message: "No categories found", success: false });
      }
      realCategoryId = fallback._id;
    }

    const filter = {
      productEnabled: true,
      categoryId: new mongoose.Types.ObjectId(realCategoryId),
    };

    const skip = (page - 1) * limit;

    const pipeline = [
      { $match: filter },
      {
        $addFields: {
          computedPrice: {
            $cond: {
              if: { $eq: ["$hasVariations", true] },
              then: { $ifNull: [{ $arrayElemAt: ["$variationPrices.finalSellingPrice", 0] }, 0] },
              else: "$finalSellingPrice",
            },
          },
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          productName: 1,
          shortDescription: 1,
          gender: 1,
          tone: 1,
          occasions: 1,
          weight: 1,
          hasVariations: 1,
          variationPrices:1,
          price: 1,
          finalSellingPrice: 1,
          inStock: 1,
          productUrl: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ];

    const products = await Product.aggregate(pipeline);

    const totalProducts = await Product.countDocuments(filter);

    const enrichedProducts = products.map((product) => {
      const shortId = Math.abs(crc32.str(product._id.toString()));
      const imageUrl = `https://api.aromagicperfume.com/api/v1/products/product-image/${product._id}`;
      const price = product.finalSellingPrice || product.price || 0;

      const tags = [
        ...(product.occasions?.map((o) => o.label) || []),
        product.tone?.label,
        product.gender,
      ]
        .filter(Boolean)
        .join(", ");

      return {
        id: shortId,
        title: product.productName,
        body_html: `<p>${product.shortDescription || product.productName}</p>`,
        vendor: "Aromagic",
        product_type: "Perfume",
        created_at: product.createdAt,
        handle: product.productUrl,
        updated_at: product.updatedAt,
        tags,
        status: product.inStock ? "active" : "draft",
        variants: plain.hasVariations ? plain.variationPrices.map((variation, index) => ({
          id: shortId + index + 1,
          title: `${plain.productName} - ${variation.value}` ,
          price: variation.finalSellingPrice?.toFixed(2) || variation.price.toFixed(2),
          sku: `${plain.productName.toUpperCase().replace(/\s+/g, '-')}-${variation.value || index + 1}`,
          created_at: plain.createdAt,
          updated_at: plain.updatedAt,
          taxable: true,
          grams: (variation.weight || plain.weight || 0) * 1000,
          weight: variation.weight || plain.weight || 0,
          weight_unit: "g",
          image: {
            src: `https://api.aromagicperfume.com/api/v1/products/productVariations/${plain._id}/${index}` || imageUrl
          }
        })):[
          {
            id: shortId + 1,
            title: "Default",
            price: price.toFixed(2),
            sku: `${plain.productName.toUpperCase().replace(/\s+/g, '-')}-${plain.gender?.toUpperCase() || "GEN"}`,
            created_at: plain.createdAt,
            updated_at: plain.updatedAt,
            taxable: true,
            grams: (plain.weight || 0) * 1000,
            weight: plain.weight || 0,
            weight_unit: "g",
            image: {
              src: imageUrl
            }
          }
        ],
        image: {
          src: imageUrl,
        },
      };
    });

    res.status(200).json({
      data: {
        total: totalProducts,
        products: enrichedProducts,
      },
      success: true,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Failed to fetch products", success: false });
  }
};


export const getProductFeeds = async (req, res) => {
    try {
        const products = await Product.find({ productEnabled: true });

        const categoryMap = {};
            const categoryIds = [...new Set(products.map(p => p.categoryId.toString()))];
            const categories = await Category.find({ _id: { $in: categoryIds } }).select("categoryName");

            categories.forEach(cat => {
            categoryMap[cat._id.toString()] = cat.categoryName;
            });

            const items = products.map(p => {
            const categoryName = categoryMap[p.categoryId?.toString()] || 'uncategorized';
            const categorySlug = categoryName
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '') // remove non-alphanumeric characters
            .replace(/\s+/g, '-'); // replace spaces with hyphens

            return {
                'g:id': p._id.toString(),
                'g:title': p.productName,
                'g:description': p.productDescription,
                'g:link': `https://aromagicperfume.com/${categorySlug}/${p.productUrl}`,
                'g:image_link': `https://api.aromagicperfume.com/api/v1/products/product-image/${p._id}`, // see note below
                'g:price': `${p.finalSellingPrice} INR`,
                'g:availability': p.inStock ? 'in stock' : 'out of stock',
            };
            });

            const feedObj = {
            rss: {
                '@version': '2.0',
                '@xmlns:g': 'http://base.google.com/ns/1.0',
                channel: {
                title: 'Aromagic Perfume',
                link: 'https://aromagicperfume.com/',
                description: 'Product feed',
                item: items,
                },
            },
            };

            const xml = create(feedObj).end({ prettyPrint: true });

             const feedPath = "../../../public_html/dist/feed.xml" // Save in `public` folder
             fs.writeFileSync(feedPath, xml,'utf8');
             res.status(200).json({ message: 'Feed generated successfully', itemCount: items.length });
           
    } catch (error) {
        console.error('Error generating feed:', error);
          res.status(500).send('Error generating feed');
    }
};

export const getProductImageUrl = async (req, res) => {
   try {
 const productId = req.params.id;
const product = await Product.findById(productId).select("productImage");
if (!product || !product.productImage) {
return res.status(404).send('Image not found');
}
const matches = product.productImage.match(/^data:(.+);base64,(.+)$/);
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

export const getProductVariationsImageUrl = async (req, res) => {
   try {
 const { productId, index } = req.params;
 const product = await Product.findById(productId).select('variationPrices');

 if (!product || !product.variationPrices?.[index]) {
      return res.status(404).send('Image not found');
    }

const matches = product.variationPrices[index].images[0].match(/^data:(.+);base64,(.+)$/);
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


export const getProductsForRankByCategory = async (req, res) => {
    try {
        const {category = "" } = req.query;
        

        // Create a search filter
        const searchFilter = {};

        // Apply category filter if selected
       if (category && category.value) {
            searchFilter.categoryId = category.value;
        }


        // Fetch all matching products (without pagination)
        const allProducts= await Product.find(searchFilter).select("productName showOnHome rank finalSellingPrice categoryId productEnabled");

        res.status(200).json({
            products: allProducts,
            success: true,
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Failed to fetch products", success: false });
    }
};

export const updateProductRank = async (req, res) => {
    try {
        const { ranking } = req.body;

        if (!Array.isArray(ranking) || ranking.length === 0) {
            return res.status(400).json({ message: "Invalid or empty ranking data", success: false });
        }

        const updatePromises = ranking.map(item => {
            return Product.findByIdAndUpdate(
                item._id,
                {
                    rank: item.rank,
                },
                { new: true, runValidators: true }
            );
        });

        const updatedProducts = await Promise.all(updatePromises);

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error updating products ranks:", error);
        res.status(500).json({ message: "Server Error", success: false });
    }
};
