import express from "express";
import { addOfferBanner, getOfferBanners, getOfferBannerById, deleteOfferBanner, updateOfferBanner,updateOfferBannerRank,getOfferBannerIds} from "../controllers/offerBanner.controller.js";
import isAuthenticated from "../auth/isAuthenticated.js";
import { singleUpload } from "../middleware/multer.js";

const router = express.Router();

router.route("/addOfferBanner").post( addOfferBanner);
router.route("/getOfferBanners").get( getOfferBanners);
router.route("/getOfferBannerById/:id").put( getOfferBannerById);
router.route("/updateOfferBanner/:id").post( updateOfferBanner);
router.route("/updateOfferBannerRank").post( updateOfferBannerRank);
router.route("/deleteOfferBanner/:id").delete(deleteOfferBanner);
router.route("/getOfferBannerIds").get( getOfferBannerIds);

export default router;