import mongoose from "mongoose";

export const globalSearch = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ msg: "Search query is required." });
    }

    const searchRegex = new RegExp(query, "i"); // Case-insensitive

    const collectionsToSearch = {
      products: {
        searchableFields: ["productName"],
        resultFields: [
          "_id",
          "productName",
          "productImage",
          "productUrl",
          "variationPrices",
          "hasVariations",
          "inStock",
          "price",
          "discount",
          "discountType",
          "finalSellingPrice",
          "categoryId"
        ],
        additionalFilter: { productEnabled: true } // 👈 Add this
      },
    };

    const searchResults = {};
    let totalResultsCount = 0;

    for (const [collectionName, { searchableFields, resultFields, additionalFilter = {} }] of Object.entries(collectionsToSearch)) {
      const collection = mongoose.connection.collection(collectionName);

      const searchConditions = searchableFields.map((field) => ({
        [field]: searchRegex,
      }));

      const queryFilter = {
        $and: [
          { $or: searchConditions },
          additionalFilter
        ],
      };

      const projection = resultFields.reduce((acc, field) => {
        acc[field] = 1;
        return acc;
      }, {});

      const results = await collection
        .find(queryFilter, { projection })
        .toArray();

      totalResultsCount += results.length;
      searchResults[collectionName] = results;
    }

    res.status(200).json({
      success: true,
      query,
      totalResultsCount,
      results: searchResults,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to perform global search.",
      error: error.message,
    });
  }
};
