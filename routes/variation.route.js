import express from "express";
import { addVariation, getVariations, getVariationById, deleteVariation, updateVariation} from "../controllers/variation.controller.js";
import isAuthenticated from "../auth/isAuthenticated.js";
import { singleUpload } from "../middleware/multer.js";

const router = express.Router();

router.route("/addVariation").post( addVariation);
router.route("/getVariations").get( getVariations);
router.route("/getVariationById/:id").put( getVariationById);
router.route("/updateVariation/:id").post( updateVariation);
router.route("/deleteVariation/:id").delete(deleteVariation);

export default router;