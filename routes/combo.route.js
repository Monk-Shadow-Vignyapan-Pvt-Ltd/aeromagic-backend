import express from "express";
import { addCombo, getCombos, getComboById, deleteCombo, updateCombo} from "../controllers/combo.controller.js";
import {auth} from "../middleware/auth.js"
import isAuthenticated from "../auth/isAuthenticated.js";
import { singleUpload } from "../middleware/multer.js";

const router = express.Router();

router.route("/addCombo").post( addCombo);
router.route("/getCombos").get( getCombos);
router.route("/getComboById/:id").put( getComboById);
router.route("/updateCombo/:id").post( updateCombo);
router.route("/deleteCombo/:id").delete(deleteCombo);

export default router;