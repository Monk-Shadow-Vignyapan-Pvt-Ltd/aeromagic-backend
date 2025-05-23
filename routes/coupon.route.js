import express from "express";
import { addCoupon, getCoupons,getFilteredCoupons, getCouponById, deleteCoupon,
     updateCoupon,updateCouponUsage,validateCoupon,setCouponForSignUp,setCouponForSignUpFalse} from "../controllers/coupon.controller.js";
import isAuthenticated from "../auth/isAuthenticated.js";
import { singleUpload } from "../middleware/multer.js";

const router = express.Router();

router.route("/addCoupon").post( addCoupon);
router.route("/getCoupons").get( getCoupons);
router.route("/getFilteredCoupons").get( getFilteredCoupons);
router.route("/getCouponById/:id").put( getCouponById);
router.route("/updateCoupon/:id").post( updateCoupon);
router.route("/updateCouponUsage").post( updateCouponUsage);
router.route("/deleteCoupon/:id").delete(deleteCoupon);
router.route("/validateCoupon").post( validateCoupon);
router.route("/setCouponForSignUp/:id").post( setCouponForSignUp);
router.route("/setCouponForSignUpFalse/:id").post( setCouponForSignUpFalse);

export default router;