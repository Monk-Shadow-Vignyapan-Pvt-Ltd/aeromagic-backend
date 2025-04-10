import express from "express";
import { addProduct, getProducts, getProductById,getProductByUrl, deleteProduct, updateProduct,getProductsForHome, getProductsByCategory,updateShowOnHomeProduct,getProductIds} from "../controllers/product.controller.js";
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
router.route("/getProductsByCategory/:id").get( getProductsByCategory);
router.route("/updateShowOnHomeProduct/:id").post( updateShowOnHomeProduct);
router.route("/getProductIds").get( getProductIds);

export default router;