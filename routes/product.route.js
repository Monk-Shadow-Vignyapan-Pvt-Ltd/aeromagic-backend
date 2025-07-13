import express from "express";
import { addProduct, getProducts,getPaginationProducts,getPaginationProductsExcel, getProductById,getProductByUrl, deleteProduct, 
     updateProduct,
     getProductsForHome,getRank1HomeProducts,getRank2HomeProducts,getProductsByCategory,getAllProducts,getProductsHeader,
     updateShowOnHomeProduct,getProductIds,addProductInSearch,getProductInSearch,getProductsAfterInSearch,setProductOnOff,
     getProductsByCollection,getProductFeeds,getProductImageUrl,getProductVariationsImageUrl,getProductsForRankByCategory,
     updateProductRank,productsCheckInStock} from "../controllers/product.controller.js";
import isAuthenticated from "../auth/isAuthenticated.js";
import { singleUpload } from "../middleware/multer.js";

const router = express.Router();

router.route("/addProduct").post( addProduct);
router.route("/getProducts").get( getProducts);
router.route("/getPaginationProducts").get( getPaginationProducts);
router.route("/getPaginationProductsExcel").get( getPaginationProductsExcel);
router.route("/getProductById/:id").put( getProductById);
router.route("/getProductByUrl/:id").put( getProductByUrl);
router.route("/updateProduct/:id").post( updateProduct);
router.route("/deleteProduct/:id").delete(deleteProduct);
router.route("/getProductsForHome").get( getProductsForHome);
router.route("/getRank1HomeProducts").get( getRank1HomeProducts);
router.route("/getRank2HomeProducts").get( getRank2HomeProducts);
router.route("/getProductsByCategory/:id").get( getProductsByCategory);
router.route("/getAllProducts").get( getAllProducts);
router.route("/getProductsHeader").get( getProductsHeader);
router.route("/updateShowOnHomeProduct/:id").post( updateShowOnHomeProduct);
router.route("/getProductIds").get( getProductIds);
router.route("/addProductInSearch").post( addProductInSearch);
router.route("/getProductInSearch").get(getProductInSearch);
router.route("/getProductsAfterInSearch").get(getProductsAfterInSearch);
router.route("/setProductOnOff/:id").post( setProductOnOff);
router.route("/getProductsByCollection").get( getProductsByCollection);
router.route("/getProductFeeds").get( getProductFeeds);
router.route("/product-image/:id").get( getProductImageUrl);
router.route("/productVariations/:productId/:index").get( getProductVariationsImageUrl);
router.route("/getProductsForRankByCategory").get( getProductsForRankByCategory);
router.route("/updateProductRank").post( updateProductRank);
router.route("/productsCheckInStock").post( productsCheckInStock);

export default router;