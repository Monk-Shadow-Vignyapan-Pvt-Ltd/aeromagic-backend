import { Review } from '../models/review.model.js';

// Add a new review
export const addReview = async (req, res) => {
  try {
    const { customer, product, rating, comment } = req.body;

    if (!customer || !product || !rating) {
      return res.status(400).json({ message: 'Customer, product, and rating are required', success: false });
    }

    // Check if a review already exists for this customer-product pair
    const existingReview = await Review.findOne({ customer, product });

    if (existingReview) {
      return res.status(200).json({
        message: 'You have already reviewed this product',
        review: existingReview,
        alreadyExists: true,
        success: true
      });
    }

    const review = new Review({ customer, product, rating, comment });
    await review.save();

    res.status(201).json({ review, success: true });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ message: 'Failed to add review', success: false });
  }
};


// Get all reviews
export const getReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    const searchFilter = search
      ? {
          $or: [
            { "customer.fullname": { $regex: search, $options: "i" } },
            { "product.productName": { $regex: search, $options: "i" } }
          ]
        }
      : {};

    // Count total
    const totalResult = await Review.aggregate([
      {
        $lookup: {
          from: "customers",
          localField: "customer",
          foreignField: "_id",
          as: "customer"
        }
      },
      { $unwind: "$customer" },
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      { $match: searchFilter },
      { $count: "count" }
    ]);
    const total = totalResult[0]?.count || 0;

    // Get paginated data
    const reviews = await Review.aggregate([
      {
        $lookup: {
          from: "customers",
          localField: "customer",
          foreignField: "_id",
          as: "customer"
        }
      },
      { $unwind: "$customer" },
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      { $match: searchFilter },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
            _id: 1,
            rating: 1,
            comment: 1,
            createdAt: 1,
            "customer._id": 1,
            "customer.fullname": 1,
            "product._id": 1,
            "product.productName": 1
        }
        }
    ]);

    res.status(200).json({
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch reviews", success: false });
  }
};



// Get review by ID
export const getReviewById = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findById(id).populate('customer product');
        if (!review) return res.status(404).json({ message: 'Review not found', success: false });
        res.status(200).json({ review, success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch review', success: false });
    }
};

// Update review by ID
export const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;

        const updatedData = {};
        if (rating !== undefined) updatedData.rating = rating;
        if (comment !== undefined) updatedData.comment = comment;

        const review = await Review.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });
        if (!review) return res.status(404).json({ message: 'Review not found', success: false });
        res.status(200).json({ review, success: true });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message, success: false });
    }
};

// Delete review by ID
export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findByIdAndDelete(id);
        if (!review) return res.status(404).json({ message: 'Review not found', success: false });
        res.status(200).json({ review, success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete review', success: false });
    }
};

// Get all reviews for a specific product
export const getReviewsByProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = await Review.find({ product: productId }).populate('customer');
        res.status(200).json({ reviews });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch product reviews', success: false });
    }
};
