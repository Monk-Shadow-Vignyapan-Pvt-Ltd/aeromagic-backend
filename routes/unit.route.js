import express from "express";
import { addUnit, getUnits, getUnitById, deleteUnit, updateUnit} from "../controllers/unit.controler.js";
import isAuthenticated from "../auth/isAuthenticated.js";
import { singleUpload } from "../middleware/multer.js";

const router = express.Router();

router.route("/addUnit").post( addUnit);
router.route("/getUnits").get( getUnits);
router.route("/getUnitById/:id").put( getUnitById);
router.route("/updateUnit/:id").post( updateUnit);
router.route("/deleteUnit/:id").delete(deleteUnit);

export default router;