import express from "express";
import { addLogo, getLogos, getLogoById, deleteLogo, updateLogo} from "../controllers/logo.controller.js";
import isAuthenticated from "../auth/isAuthenticated.js";
import { singleUpload } from "../middleware/multer.js";

const router = express.Router();

router.route("/addLogo").post( addLogo);
router.route("/getLogos").get( getLogos);
router.route("/getLogoById/:id").put( getLogoById);
router.route("/updateLogo/:id").post( updateLogo);
router.route("/deleteLogo/:id").delete(deleteLogo);

export default router;