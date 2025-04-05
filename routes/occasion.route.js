import express from "express";
import { addOccasion, getOccasions, getOccasionById, deleteOccasion, updateOccasion,updateOccasionRank,getOccasionNames} from "../controllers/occasion.controller.js";
import isAuthenticated from "../auth/isAuthenticated.js";
import { singleUpload } from "../middleware/multer.js";

const router = express.Router();

router.route("/addOccasion").post( addOccasion);
router.route("/getOccasions").get( getOccasions);
router.route("/getOccasionById/:id").put( getOccasionById);
router.route("/updateOccasion/:id").post( updateOccasion);
router.route("/deleteOccasion/:id").delete(deleteOccasion);
router.route("/updateOccasionRank").post( updateOccasionRank);
router.route("/getOccasionNames").get( getOccasionNames);

export default router;