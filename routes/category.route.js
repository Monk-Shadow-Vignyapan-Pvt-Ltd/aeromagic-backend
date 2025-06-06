import express from "express";
import { addCategory, getCategories, getCategoryById,getCategoryByIdInProduct, deleteCategory,
     updateCategory,updateCategoryRank,getCategoriesIds,getCategoriesFrontend,
    getCategoryImageUrl,getCollections} from "../controllers/category.controller.js";
import isAuthenticated from "../auth/isAuthenticated.js";
import { singleUpload } from "../middleware/multer.js";

const router = express.Router();

router.route("/addCategory").post( addCategory);
router.route("/getCategories").get( getCategories);
router.route("/getCategoryById/:id").put( getCategoryById);
router.route("/getCategoryByIdInProduct/:id").put( getCategoryByIdInProduct);
router.route("/updateCategory/:id").post( updateCategory);
router.route("/updateCategoryRank").post( updateCategoryRank);
router.route("/deleteCategory/:id").delete(deleteCategory);
router.route("/getCategoriesIds").get( getCategoriesIds);
router.route("/getCategoriesFrontend").get( getCategoriesFrontend);
router.route("/getCategoryImageUrl/:id").get( getCategoryImageUrl);
router.route("/getCollections").get( getCollections);

export default router;