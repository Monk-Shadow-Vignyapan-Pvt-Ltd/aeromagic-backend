import express from "express";
import { addProduct, getProducts, getProductById,getProductByUrl, deleteProduct, updateProduct,getProductsForHome,
     getRank1HomeProducts,getRank2HomeProducts,
     getProductsByCategory,getAllProducts,getProductsHeader,updateShowOnHomeProduct,getProductIds,
     addProductInSearch,getProductInSearch,getProductsAfterInSearch,} from "../controllers/product.controller.js";
import isAuthenticated from "../auth/isAuthenticated.js";
import { singleUpload } from "../middleware/multer.js";

const router = express.Router();

router.route("/addProduct").post( addProduct);
router.route("/getProducts").get( getProducts);
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

export default router;