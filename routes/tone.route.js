import express from "express";
import { addTone, getTones, getToneById, deleteTone, updateTone,updateToneRank,getToneNames} from "../controllers/tone.controller.js";
import isAuthenticated from "../auth/isAuthenticated.js";
import { singleUpload } from "../middleware/multer.js";

const router = express.Router();

router.route("/addTone").post( addTone);
router.route("/getTones").get( getTones);
router.route("/getToneById/:id").put( getToneById);
router.route("/updateTone/:id").post( updateTone);
router.route("/updateToneRank").post( updateToneRank);
router.route("/deleteTone/:id").delete(deleteTone);
router.route("/getToneNames").get( getToneNames);

export default router;