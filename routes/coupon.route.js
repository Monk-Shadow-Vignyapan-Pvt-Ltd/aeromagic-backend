import express from "express";
import { addCoupon, getCoupons, getCouponById, deleteCoupon, updateCoupon,validateCoupon} from "../controllers/coupon.controller.js";
import isAuthenticated from "../auth/isAuthenticated.js";
import { singleUpload } from "../middleware/multer.js";

const router = express.Router();

router.route("/addCoupon").post( addCoupon);
router.route("/getCoupons").get( getCoupons);
router.route("/getCouponById/:id").put( getCouponById);
router.route("/updateCoupon/:id").post( updateCoupon);
router.route("/deleteCoupon/:id").delete(deleteCoupon);
router.route("/validateCoupon").post( validateCoupon);

export default router;