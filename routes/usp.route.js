import express from "express";
import { addUsp, getUsps, getUspById, deleteUsp, updateUsp} from "../controllers/usp.controller.js";
import isAuthenticated from "../auth/isAuthenticated.js";
import { singleUpload } from "../middleware/multer.js";

const router = express.Router();

router.route("/addUsp").post( addUsp);
router.route("/getUsps").get( getUsps);
router.route("/getUspById/:id").put( getUspById);
router.route("/updateUsp/:id").post( updateUsp);
router.route("/deleteUsp/:id").delete(deleteUsp);

export default router;