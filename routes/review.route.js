import express from "express";
import { addReview, getReviews,getReviewImageUrl, getReviewById, deleteReview, updateReview,getReviewsByProduct} from "../controllers/review.controller.js";
import isAuthenticated from "../auth/isAuthenticated.js";
import { singleUpload } from "../middleware/multer.js";

const router = express.Router();

router.route("/addReview").post( addReview);
router.route("/getReviews").get( getReviews);
router.route("/review-image/:reviewId/:index").get( getReviewImageUrl);
router.route("/getReviewById/:id").put( getReviewById);
router.route("/updateReview/:id").post( updateReview);
router.route("/deleteReview/:id").delete(deleteReview);
router.route("/getReviewsByProduct/:productId").get( getReviewsByProduct);

export default router;