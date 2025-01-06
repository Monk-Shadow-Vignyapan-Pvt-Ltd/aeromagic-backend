import express from "express";
import { addProduct, getProducts, getProductById, deleteProduct, updateProduct} from "../controllers/product.controller.js";
import isAuthenticated from "../auth/isAuthenticated.js";
import { singleUpload } from "../middleware/multer.js";

const router = express.Router();

router.route("/addProduct").post( addProduct);
router.route("/getProducts").get( getProducts);
router.route("/getProductById/:id").put( getProductById);
router.route("/updateProduct/:id").post( updateProduct);
router.route("/deleteProduct/:id").delete(deleteProduct);

export default router;