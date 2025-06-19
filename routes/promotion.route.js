import express from "express";
import { addPromotion, getPromotions,getActivePromotions, getPromotionById, deletePromotion, updatePromotion,togglePromotionStatus} from "../controllers/promotion.controller.js";
import isAuthenticated from "../auth/isAuthenticated.js";
import { singleUpload } from "../middleware/multer.js";

const router = express.Router();

router.route("/addPromotion").post( addPromotion);
router.route("/getPromotions").get( getPromotions);
router.route("/getActivePromotions").get( getActivePromotions);
router.route("/getPromotionById/:id").put( getPromotionById);
router.route("/updatePromotion/:id").post( updatePromotion);
router.route("/deletePromotion/:id").delete(deletePromotion);
router.route("/togglePromotionStatus/:id").post( togglePromotionStatus);

export default router;