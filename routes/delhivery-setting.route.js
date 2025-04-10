import express from "express";
import { upsertDelhiverySetting,  getDelhiverySetting} from "../controllers/delhivery-setting.controller.js";
import isAuthenticated from "../auth/isAuthenticated.js";
import { singleUpload } from "../middleware/multer.js";

const router = express.Router();

router.route("/upsertDelhiverySetting").post( upsertDelhiverySetting);
router.route("/getDelhiverySetting").get( getDelhiverySetting);

export default router;