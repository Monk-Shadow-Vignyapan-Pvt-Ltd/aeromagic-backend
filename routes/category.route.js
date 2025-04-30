import express from "express";
import { addCategory, getCategories, getCategoryById, deleteCategory, updateCategory,updateCategoryRank,getCategoriesIds,getCategoriesFrontend} from "../controllers/category.controller.js";
import isAuthenticated from "../auth/isAuthenticated.js";
import { singleUpload } from "../middleware/multer.js";

const router = express.Router();

router.route("/addCategory").post( addCategory);
router.route("/getCategories").get( getCategories);
router.route("/getCategoryById/:id").put( getCategoryById);
router.route("/updateCategory/:id").post( updateCategory);
router.route("/updateCategoryRank").post( updateCategoryRank);
router.route("/deleteCategory/:id").delete(deleteCategory);
router.route("/getCategoriesIds").get( getCategoriesIds);
router.route("/getCategoriesFrontend").get( getCategoriesFrontend);

export default router;